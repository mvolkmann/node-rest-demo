// @flow

import express from 'express';
import {validatePerson} from './people';
import {wrap} from './util/error-util';
import {castObject} from './util/flow-util';
const PgConnection = require('postgresql-easy');

// eslint-disable-next-line no-duplicate-imports
import type {PersonType} from './people';

const config = {database: 'demo'};
const pg = new PgConnection(config);

const deletePerson = (req: express$Request): Promise<void> =>
  pg.deleteById('people', req.params.id);

async function disablePerson(
  req: express$Request,
  res: express$Response
): Promise<void> {
  const {id} = req.params;
  await validateEnabled(id, true, res);
  return pg.updateById('people', id, {enabled: false});
}

async function enablePerson(
  req: express$Request,
  res: express$Response
): Promise<void> {
  const {id} = req.params;
  await validateEnabled(id, false, res);
  return pg.updateById('people', id, {enabled: true});
}

const getAllDisabled = (): Promise<PersonType[]> =>
  pg.query('select * from people where enabled is not true');

const getAllEnabled = (): Promise<PersonType[]> =>
  pg.query('select * from people where enabled is true');

const getAllPeople = (): Promise<PersonType[]> => pg.getAll('people');

const getPersonById = (req: express$Request): Promise<PersonType> =>
  pg.getById('people', req.params.id);

async function postPerson(req: express$Request): Promise<number> {
  const person = castObject(req.body);
  validatePerson(person);
  person.id = await pg.insert('people', person);
  return person;
}

async function validateEnabled(
  id: string,
  want: boolean,
  res: express$Response
) {
  const person = await pg.getById('people', id);
  if (person.enabled !== want) {
    res.status(400);
    const kind = want ? 'disable' : 'enable';
    throw new Error(`cannot ${kind} a person already ${kind}d`);
  }
}

type UserType = {
  can(role: string): boolean
};

export function getRouter(user: UserType) {
  // This maps URLs to handler functions.
  const router = express.Router();

  function route(method: string, path: string, can: boolean, handler) {
    // $FlowFixMe - Doesn't like use of "can".
    router[method](path, can, handler);
  }

  // All authenticated users can do this.
  router.get('/', wrap(getAllPeople));

  route('get', '/disabled', user.can('get all disabled'), wrap(getAllDisabled));
  route('get', '/enabled', user.can('get all enabled'), wrap(getAllEnabled));
  route('delete', '/:id', user.can('delete person'), wrap(deletePerson));
  route('get', '/:id', user.can('get specific person'), wrap(getPersonById));
  route('post', '/', user.can('create new person'), wrap(postPerson));
  route('put', '/:id/disable', user.can('disable person'), wrap(disablePerson));
  route('put', '/:id/enable', user.can('enable person'), wrap(enablePerson));

  return router;
}
