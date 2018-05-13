// @flow

import PgConnection from 'postgresql-easy';
import {validatePerson} from './people';
import {NotFoundError, RequestError} from './util/error-util';
import type {PersonType} from './types';

const config = {database: 'demo'};
const pg = new PgConnection(config);

export async function createPerson(person: PersonType): Promise<PersonType> {
  validatePerson(person);
  person.id = await pg.insert('people', person);
  return person;
}

export const deletePerson = (id: string): Promise<void> =>
  pg.deleteById('people', id);

export async function disablePerson(id: string): Promise<void> {
  await validateEnabled(id, true);
  // await on next line instead of return avoids returning an empty JSON array.
  await pg.updateById('people', id, {enabled: false});
}

export async function enablePerson(id: string): Promise<void> {
  await validateEnabled(id, false);
  // await on next line instead of return avoids returning an empty JSON array.
  await pg.updateById('people', id, {enabled: true});
}

export const getAllDisabled = (): Promise<PersonType[]> =>
  pg.query('select * from people where enabled is not true');

export const getAllEnabled = (): Promise<PersonType[]> =>
  pg.query('select * from people where enabled is true');

export const getAllPeople = (): Promise<PersonType[]> => pg.getAll('people');

export const getPersonById = async (id: string): Promise<PersonType> => {
  const person = await pg.getById('people', id);
  if (!person) throw new NotFoundError(`no person with id ${id} found`);
  return person;
};

/**
 * This throws an error if the person with a given id
 * is currently enabled and "want" is false or
 * is currently disabled and "want" is false.
 * It also throws an error if no person with the given id is found.
 */
async function validateEnabled(id: string, want: boolean) {
  const person = await pg.getById('people', id);
  if (!person) throw new NotFoundError('no person with id ' + id);
  if (person.enabled !== want) {
    const kind = want ? 'disable' : 'enable';
    throw new RequestError(`cannot ${kind} a person already ${kind}d`);
  }
}
