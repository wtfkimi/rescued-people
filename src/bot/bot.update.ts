import { Logger } from '@nestjs/common';
import { Action, Command, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { User } from '../database/entities/user.entity';
import { I18nService } from '../i18n/i18n.service';
import { isLanguage, Language } from '../i18n/language.enum';
import { MonitorService } from '../monitor/monitor.service';
import { UsersService } from '../users/users.service';
import { languageKeyboard, removeKeyboard } from './keyboards';

type MatchContext = Context & { match: RegExpExecArray };

const HTML = { parse_mode: 'HTML' as const, link_preview_options: { is_disabled: true } };

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly monitorService: MonitorService,
    private readonly i18n: I18nService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    const user = await this.currentUser(ctx);
    if (!user) {
      return;
    }

    if (!isLanguage(user.language)) {
      await this.askLanguage(ctx);
      return;
    }

    await ctx.reply(this.i18n.t(user.language, 'welcome'), HTML);
  }

  @Command('language')
  async onLanguage(@Ctx() ctx: Context): Promise<void> {
    await this.askLanguage(ctx);
  }

  @Action(/^lang:(en|uk|ru)$/)
  async onLanguagePicked(@Ctx() ctx: MatchContext): Promise<void> {
    const picked = ctx.match[1] as Language;
    const user = await this.currentUser(ctx);
    if (!user) {
      return;
    }

    await this.usersService.setLanguage(user, picked);
    await ctx.answerCbQuery('✅');

    try {
      await ctx.editMessageReplyMarkup(undefined);
    } catch {
    }

    await ctx.reply(this.i18n.t(picked, 'languageChanged'), HTML);
    await ctx.reply(this.i18n.t(picked, 'welcome'), HTML);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context): Promise<void> {
    const user = await this.currentUser(ctx);
    await ctx.reply(this.i18n.t(user?.language, 'help'), HTML);
  }

  @Command('list')
  async onList(@Ctx() ctx: Context): Promise<void> {
    const user = await this.currentUser(ctx);
    if (!user) {
      return;
    }
    await this.replyWithList(ctx, user);
  }

  @Command('remove')
  async onRemove(@Ctx() ctx: Context): Promise<void> {
    const user = await this.currentUser(ctx);
    if (!user) {
      return;
    }

    const surnames = await this.usersService.listSurnames(user.id);
    if (surnames.length === 0) {
      await ctx.reply(this.i18n.t(user.language, 'listEmpty'), HTML);
      return;
    }

    await ctx.reply(this.i18n.t(user.language, 'removeChoose'), {
      ...HTML,
      ...removeKeyboard(surnames),
    });
  }

  @Action(/^del:(\d+)$/)
  async onRemovePicked(@Ctx() ctx: MatchContext): Promise<void> {
    const user = await this.currentUser(ctx);
    if (!user) {
      return;
    }

    const removed = await this.usersService.removeSurname(user.id, Number(ctx.match[1]));
    await ctx.answerCbQuery(removed ? '🗑' : '🤷');

    if (!removed) {
      await ctx.reply(this.i18n.t(user.language, 'removeNotFound'), HTML);
      return;
    }

    await ctx.reply(
      this.i18n.t(user.language, 'removed', { surname: removed.displayValue }),
      HTML,
    );

    const left = await this.usersService.listSurnames(user.id);
    if (left.length > 0) {
      await ctx.editMessageReplyMarkup(removeKeyboard(left).reply_markup).catch(() => undefined);
    } else {
      await ctx.editMessageReplyMarkup(undefined).catch(() => undefined);
    }
  }

  @Command('notifications')
  async onNotifications(@Ctx() ctx: Context): Promise<void> {
    const user = await this.currentUser(ctx);
    if (!user) {
      return;
    }

    const updated = await this.usersService.setNotifications(user, !user.notificationsEnabled);
    await ctx.reply(
      this.i18n.t(updated.language, updated.notificationsEnabled ? 'notificationsOn' : 'notificationsOff'),
      HTML,
    );
  }

  @Command('check')
  async onCheck(@Ctx() ctx: Context): Promise<void> {
    const user = await this.currentUser(ctx);
    if (!user) {
      return;
    }

    const surnames = await this.usersService.listSurnames(user.id);
    if (surnames.length === 0) {
      await ctx.reply(this.i18n.t(user.language, 'listEmpty'), HTML);
      return;
    }

    await ctx.reply(this.i18n.t(user.language, 'checkStarted'), HTML);

    try {
      const result = await this.monitorService.runForUser(user);
      if (result.matches === 0) {
        await ctx.reply(this.i18n.t(user.language, 'checkNoMatches'), HTML);
        return;
      }
      await ctx.reply(
        this.i18n.t(user.language, 'checkMatchesFound', { count: result.matches }),
        HTML,
      );
    } catch (error) {
      this.logger.error(`Manual check failed: ${(error as Error).message}`);
      await ctx.reply(this.i18n.t(user.language, 'checkFailed'), HTML);
    }
  }

  @On('text')
  async onText(@Ctx() ctx: Context): Promise<void> {
    const message = ctx.message;
    const text = message && 'text' in message ? message.text : '';
    const user = await this.currentUser(ctx);
    if (!user) {
      return;
    }

    if (!isLanguage(user.language)) {
      await this.askLanguage(ctx);
      return;
    }

    if (text.startsWith('/')) {
      await ctx.reply(this.i18n.t(user.language, 'help'), HTML);
      return;
    }

    const result = await this.usersService.addSurnames(user, text);

    if (result.added.length > 0) {
      await ctx.reply(
        this.i18n.t(user.language, 'surnameAdded', {
          surnames: result.added.map((value) => `«${value}»`).join(', '),
        }),
        HTML,
      );
    }
    if (result.duplicates.length > 0) {
      await ctx.reply(
        this.i18n.t(user.language, 'surnameDuplicate', {
          surnames: result.duplicates.map((value) => `«${value}»`).join(', '),
        }),
        HTML,
      );
    }
    if (result.tooShort.length > 0) {
      await ctx.reply(
        this.i18n.t(user.language, 'surnameTooShort', { min: this.usersService.minSurnameLength }),
        HTML,
      );
    }
    if (result.limitReached) {
      await ctx.reply(
        this.i18n.t(user.language, 'surnameLimitReached', {
          limit: this.usersService.maxSurnamesPerUser,
        }),
        HTML,
      );
    }
    if (
      result.added.length === 0 &&
      result.duplicates.length === 0 &&
      result.tooShort.length === 0 &&
      !result.limitReached
    ) {
      await ctx.reply(this.i18n.t(user.language, 'nothingAdded'), HTML);
      return;
    }

    if (result.added.length > 0) {
      await this.replyWithList(ctx, user);
    }
  }

  private async askLanguage(ctx: Context): Promise<void> {
    await ctx.reply(this.i18n.t(Language.EN, 'chooseLanguage'), {
      ...HTML,
      ...languageKeyboard(),
    });
  }

  private async replyWithList(ctx: Context, user: User): Promise<void> {
    const surnames = await this.usersService.listSurnames(user.id);
    if (surnames.length === 0) {
      await ctx.reply(this.i18n.t(user.language, 'listEmpty'), HTML);
      return;
    }

    const items = surnames
      .map((surname, index) => `${index + 1}. 👤 <b>${this.i18n.escape(surname.displayValue)}</b>`)
      .join('\n');

    await ctx.reply(
      this.i18n.t(user.language, 'listHeader', { count: surnames.length }).replace('{items}', items),
      HTML,
    );
  }

  private async currentUser(ctx: Context): Promise<User | null> {
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      return null;
    }
    return this.usersService.findOrCreate(telegramId);
  }
}
