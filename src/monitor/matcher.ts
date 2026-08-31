import { Surname } from '../database/entities/surname.entity';
import { RescuedPerson } from '../ndrrma/ndrrma.types';

export interface PersonMatch {
  person: RescuedPerson;
  surname: Surname;
}

const DEVANAGARI = /[ऀ-ॿ]/;

export function matchPersons(persons: RescuedPerson[], surnames: Surname[]): PersonMatch[] {
  const matches: PersonMatch[] = [];

  for (const person of persons) {
    const name = (person.name ?? '').toLowerCase();
    const nameNe = (person.name_ne ?? '').toLowerCase();

    for (const surname of surnames) {
      const needle = surname.value.toLowerCase();
      const haystack = DEVANAGARI.test(needle) ? nameNe : name;

      if (needle.length > 0 && haystack.includes(needle)) {
        matches.push({ person, surname });
        break;
      }
    }
  }

  return matches;
}
