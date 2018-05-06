// @flow

import PgConnection from 'postgresql-easy';
import {type PersonType, validatePerson} from './people';

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
  return pg.updateById('people', id, {enabled: false});
}

export async function enablePerson(id: string): Promise<void> {
  await validateEnabled(id, false);
  return pg.updateById('people', id, {enabled: true});
}

export const getAllDisabled = (): Promise<PersonType[]> =>
  pg.query('select * from people where enabled is not true');

export const getAllEnabled = (): Promise<PersonType[]> =>
  pg.query('select * from people where enabled is true');

export const getAllPeople = (): Promise<PersonType[]> => pg.getAll('people');

export const getPersonById = (id: string): Promise<PersonType> =>
  pg.getById('people', id);

async function validateEnabled(id: string, want: boolean) {
  const person = await pg.getById('people', id);
  if (person.enabled !== want) {
    const kind = want ? 'disable' : 'enable';
    throw new Error(`cannot ${kind} a person already ${kind}d`);
  }
}
