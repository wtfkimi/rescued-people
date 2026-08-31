import { Markup } from 'telegraf';
import { Surname } from '../database/entities/surname.entity';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '../i18n/language.enum';

export function languageKeyboard() {
  return Markup.inlineKeyboard(
    SUPPORTED_LANGUAGES.map((language) => [
      Markup.button.callback(LANGUAGE_LABELS[language], `lang:${language}`),
    ]),
  );
}

export function removeKeyboard(surnames: Surname[]) {
  return Markup.inlineKeyboard(
    surnames.map((surname) => [
      Markup.button.callback(`🗑 ${surname.displayValue}`, `del:${surname.id}`),
    ]),
  );
}
