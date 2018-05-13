// @flow

import {RequestError} from './util/error-util';
import type {PersonType} from './types';

const requiredProperties = ['age', 'firstname', 'lastname'];

function throwIf(condition: boolean, message: string) {
  if (condition) throw new RequestError(message);
}

function startsUpper(text: string): boolean {
  return /^[A-Z]/.test(text);
}

/**
 * This throws if there is anything invalid
 * in the data for a person.
 */
export function validatePerson(person: PersonType): void {
  // Verify that all required properties are present.
  for (const property of requiredProperties) {
    const value = person[property];
    throwIf(!value, property + ' is a required property');
  }

  // Verify that the first name starts uppercase.
  throwIf(
    !startsUpper(person.firstname),
    'firstname must start with an uppercase letter'
  );

  // Verify that the last name starts uppercase.
  throwIf(
    !startsUpper(person.lastname),
    'lastname must start with an uppercase letter'
  );

  // Verify that the age is not negative.
  throwIf(person.age < 0, 'age must be non-negative');
}
