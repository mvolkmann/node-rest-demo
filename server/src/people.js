// @flow

import {throwIf} from './util/error-util';

export type PersonType = {
  age: number,
  enabled: boolean,
  id: number,
  firstName: string,
  lastName: string
};

const requiredProperties = ['age', 'firstName', 'lastName'];

function startsUpper(text: string): boolean {
  return /^[A-Z]/.test(text);
}

export function validatePerson(person: PersonType): void {
  for (const property of requiredProperties) {
    const value = person[property];
    throwIf(!value, property + ' is a required property');
  }

  throwIf(
    !startsUpper(person.firstName),
    'firstName must start with an uppercase letter'
  );

  throwIf(
    !startsUpper(person.lastName),
    'lastName must start with an uppercase letter'
  );

  throwIf(person.age < 0, 'age must be non-negative');
}
