import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Surname } from '../database/entities/surname.entity';
import { User } from '../database/entities/user.entity';
import { Language } from '../i18n/language.enum';

export interface AddSurnamesResult {
  added: string[];
  duplicates: string[];
  tooShort: string[];
  limitReached: boolean;
}

@Injectable()
export class UsersService {
  readonly minSurnameLength: number;
  readonly maxSurnamesPerUser: number;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Surname) private readonly surnames: Repository<Surname>,
    config: ConfigService,
  ) {
    this.minSurnameLength = Number(config.get('MIN_SURNAME_LENGTH', 2));
    this.maxSurnamesPerUser = Number(config.get('MAX_SURNAMES_PER_USER', 25));
  }

  async findOrCreate(telegramId: string | number): Promise<User> {
    const id = String(telegramId);
    const existing = await this.users.findOne({ where: { telegramId: id } });
    if (existing) {
      if (existing.isBlocked) {
        existing.isBlocked = false;
        await this.users.save(existing);
      }
      return existing;
    }

    const created = this.users.create({ telegramId: id, language: null });
    return this.users.save(created);
  }

  async setLanguage(user: User, language: Language): Promise<User> {
    user.language = language;
    return this.users.save(user);
  }

  async setNotifications(user: User, enabled: boolean): Promise<User> {
    user.notificationsEnabled = enabled;
    return this.users.save(user);
  }

  async markBlocked(userId: number): Promise<void> {
    await this.users.update({ id: userId }, { isBlocked: true, notificationsEnabled: false });
  }

  parseSurnames(raw: string): string[] {
    return raw
      .split(/[\n,;]+/)
      .map((part) => part.replace(/\s+/g, ' ').trim())
      .filter((part) => part.length > 0)
      .slice(0, this.maxSurnamesPerUser);
  }

  async addSurnames(user: User, raw: string): Promise<AddSurnamesResult> {
    const result: AddSurnamesResult = {
      added: [],
      duplicates: [],
      tooShort: [],
      limitReached: false,
    };

    const candidates = this.parseSurnames(raw);
    if (candidates.length === 0) {
      return result;
    }

    let stored = await this.surnames.count({ where: { userId: user.id } });
    const seen = new Set<string>();

    for (const candidate of candidates) {
      const value = candidate.toLowerCase();
      if (candidate.length < this.minSurnameLength) {
        result.tooShort.push(candidate);
        continue;
      }
      if (seen.has(value)) {
        continue;
      }
      seen.add(value);

      if (stored >= this.maxSurnamesPerUser) {
        result.limitReached = true;
        break;
      }

      const inserted = await this.surnames
        .createQueryBuilder()
        .insert()
        .values({ userId: user.id, value, displayValue: candidate.slice(0, 128) })
        .orIgnore()
        .execute();

      if (inserted.identifiers.filter(Boolean).length > 0) {
        result.added.push(candidate);
        stored += 1;
      } else {
        result.duplicates.push(candidate);
      }
    }

    return result;
  }

  listSurnames(userId: number): Promise<Surname[]> {
    return this.surnames.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }

  async removeSurname(userId: number, surnameId: number): Promise<Surname | null> {
    const surname = await this.surnames.findOne({ where: { id: surnameId, userId } });
    if (!surname) {
      return null;
    }
    await this.surnames.remove(surname);
    return surname;
  }

  watchers(): Promise<User[]> {
    return this.users
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.surnames', 'surname')
      .where('user.notifications_enabled = true')
      .andWhere('user.is_blocked = false')
      .getMany();
  }
}
