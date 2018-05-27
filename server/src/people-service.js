// @flow

import PgConnection from 'postgresql-easy';
import {validatePerson} from './people';
import {sendEmail} from './util/email';
import {NotFoundError, RequestError} from './util/error-util';
import type {PersonType} from './types';

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE || 'demo'
};

if (
  process.env.INSTANCE_CONNECTION_NAME &&
  process.env.NODE_ENV === 'production'
) {
  config.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}

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

function reportSection(title: string, people: PersonType[]) {
  let section = `${title} (${people.length})`;
  for (const person of people) {
    section += `\n${person.lastname}, ${person.firstname}`;
  }
  return section;
}

export async function report() {
  const enabled = await getAllEnabled();
  const disabled = await getAllDisabled();
  const report =
    reportSection('Enabled People', enabled) +
    '\n' +
    reportSection('Disabled People', disabled);

  const to = ['mark@objectcomputing.com'];
  const subject = 'All People Report';
  sendEmail({to, subject, text: report});
}

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
