export enum Language {
  EN = 'en',
  UK = 'uk',
  RU = 'ru',
}

export const SUPPORTED_LANGUAGES: Language[] = [
  Language.EN,
  Language.UK,
  Language.RU,
];

export const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.EN]: '🇬🇧 English',
  [Language.UK]: '🇺🇦 Українська',
  [Language.RU]: '🇷🇺 Русский',
};

export const DEFAULT_LANGUAGE = Language.EN;

export function isLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language);
}
