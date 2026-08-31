import { Injectable } from '@nestjs/common';
import { DEFAULT_LANGUAGE, isLanguage, Language } from './language.enum';
import { TRANSLATIONS, TranslationKey } from './translations';

type Params = Record<string, string | number>;

@Injectable()
export class I18nService {
  escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  t(language: Language | null | undefined, key: TranslationKey, params: Params = {}): string {
    const lang = isLanguage(language) ? language : DEFAULT_LANGUAGE;
    const template = TRANSLATIONS[lang][key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key];

    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
      const value = params[name];
      return value === undefined ? match : this.escape(String(value));
    });
  }

  gender(language: Language | null | undefined, gender: string | null): string {
    switch ((gender ?? '').toLowerCase()) {
      case 'male':
        return this.t(language, 'genderMale');
      case 'female':
        return this.t(language, 'genderFemale');
      case '':
        return this.t(language, 'unknown');
      default:
        return this.t(language, 'genderOther');
    }
  }
}
