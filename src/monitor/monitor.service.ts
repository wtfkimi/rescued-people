import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Repository } from 'typeorm';
import { NotifiedMatch } from '../database/entities/notified-match.entity';
import { User } from '../database/entities/user.entity';
import { I18nService } from '../i18n/i18n.service';
import { NdrrmaService } from '../ndrrma/ndrrma.service';
import { RescuedPerson } from '../ndrrma/ndrrma.types';
import { UsersService } from '../users/users.service';
import { matchPersons } from './matcher';

export interface UserCheckResult {
  matches: number;
  sent: number;
}

@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);

  private readonly checkUrl: string;
  private readonly cacheTtlMs: number;
  private readonly maxMessagesPerUser: number;

  private cache: { persons: RescuedPerson[]; fetchedAt: number } | null = null;
  private inFlight: Promise<RescuedPerson[]> | null = null;

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    @InjectRepository(NotifiedMatch)
    private readonly notified: Repository<NotifiedMatch>,
    private readonly ndrrma: NdrrmaService,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
    config: ConfigService,
  ) {
    this.checkUrl = config.get<string>('RASUWA_PAGE_URL', 'https://ndrrma.gov.np/en/rasuwa');
    this.cacheTtlMs = Number(config.get('PERSONS_CACHE_TTL_MS', 60000));
    this.maxMessagesPerUser = Number(config.get('MAX_MESSAGES_PER_USER_PER_RUN', 20));
  }

  @Cron(CronExpression.EVERY_30_MINUTES, { name: 'ndrrma-check' })
  async handleCron(): Promise<void> {
    try {
      const result = await this.runForAllUsers();
      this.logger.log(
        `Scheduled check done: ${result.persons} persons, ${result.notifications} notifications sent`,
      );
    } catch (error) {
      this.logger.error(`Scheduled check failed: ${(error as Error).message}`);
    }
  }

  async runForAllUsers(): Promise<{ persons: number; notifications: number }> {
    const users = await this.usersService.watchers();
    if (users.length === 0) {
      return { persons: 0, notifications: 0 };
    }

    const persons = await this.getPersons(true);
    let notifications = 0;

    for (const user of users) {
      const result = await this.checkUser(user, persons, false);
      notifications += result.sent;
    }

    return { persons: persons.length, notifications };
  }

  async runForUser(user: User): Promise<UserCheckResult> {
    const surnames = await this.usersService.listSurnames(user.id);
    if (surnames.length === 0) {
      return { matches: 0, sent: 0 };
    }

    const persons = await this.getPersons(false);
    return this.checkUser({ ...user, surnames } as User, persons, true);
  }

  private async checkUser(
    user: User,
    persons: RescuedPerson[],
    resendKnown: boolean,
  ): Promise<UserCheckResult> {
    const surnames = user.surnames ?? [];
    const matches = matchPersons(persons, surnames);
    let sent = 0;

    for (const match of matches) {
      const isNew = await this.recordMatch(user.id, match.person, match.surname.value);
      if (!isNew && !resendKnown) {
        continue;
      }
      if (sent >= this.maxMessagesPerUser) {
        this.logger.warn(
          `User ${user.telegramId}: ${matches.length} matches, capped at ${this.maxMessagesPerUser} messages`,
        );
        break;
      }

      const delivered = await this.sendMatch(user, match.person, match.surname.displayValue);
      if (!delivered) {
        break;
      }
      sent += 1;
    }

    return { matches: matches.length, sent };
  }

  private async recordMatch(
    userId: number,
    person: RescuedPerson,
    matchedSurname: string,
  ): Promise<boolean> {
    const inserted = await this.notified
      .createQueryBuilder()
      .insert()
      .values({
        userId,
        personId: person.id,
        matchedSurname,
        personName: (person.name ?? person.name_ne ?? '').slice(0, 255),
      })
      .orIgnore()
      .execute();

    return inserted.identifiers.filter(Boolean).length > 0;
  }

  private async sendMatch(
    user: User,
    person: RescuedPerson,
    surname: string,
  ): Promise<boolean> {
    const text = this.i18n.t(user.language, 'match', {
      surname,
      id: person.id,
      name: person.name?.trim() || person.name_ne?.trim() || this.i18n.t(user.language, 'unknown'),
      age: person.age ?? this.i18n.t(user.language, 'unknown'),
      gender: this.i18n.gender(user.language, person.gender),
      url: this.checkUrl,
    });

    try {
      await this.bot.telegram.sendMessage(user.telegramId, text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      });
      return true;
    } catch (error) {
      const err = error as { response?: { error_code?: number; description?: string } };
      const code = err.response?.error_code;
      if (code === 403 || code === 400) {
        this.logger.warn(
          `User ${user.telegramId} unreachable (${code}: ${err.response?.description}); disabling notifications`,
        );
        await this.usersService.markBlocked(user.id);
        return false;
      }
      this.logger.error(
        `Failed to notify ${user.telegramId}: ${(error as Error).message}`,
      );
      return false;
    }
  }

  private async getPersons(force: boolean): Promise<RescuedPerson[]> {
    const fresh =
      this.cache && Date.now() - this.cache.fetchedAt < this.cacheTtlMs && !force;
    if (fresh && this.cache) {
      return this.cache.persons;
    }
    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.ndrrma
      .fetchAllRescuedPersons()
      .then((persons) => {
        this.cache = { persons, fetchedAt: Date.now() };
        return persons;
      })
      .finally(() => {
        this.inFlight = null;
      });

    return this.inFlight;
  }
}
