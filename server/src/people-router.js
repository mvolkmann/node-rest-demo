// @flow

import express from 'express';
import {wrap} from './util/error-util';
import {castObject} from './util/flow-util';
import {
  createPerson,
  deletePerson,
  disablePerson,
  enablePerson,
  getAllDisabled,
  getAllEnabled,
  getAllPeople,
  getPersonById
} from './people-service';

// eslint-disable-next-line no-duplicate-imports
import type {PersonType} from './people';

async function createPerson2(
  req: express$Request,
  res: express$Response
): Promise<void> {
  const person = castObject(req.body);
  try {
    res.send(await createPerson(person));
  } catch (e) {
    res.status(400);
    res.send(e.message);
  }
}

const deletePerson2 = (req: express$Request): Promise<void> =>
  deletePerson(req.params.id);

async function disablePerson2(
  req: express$Request,
  res: express$Response
): Promise<void> {
  try {
    await disablePerson(req.params.id);
  } catch (e) {
    res.status(400);
    res.send(e.message);
  }
}

async function enablePerson2(
  req: express$Request,
  res: express$Response
): Promise<void> {
  try {
    await enablePerson(req.params.id);
  } catch (e) {
    res.status(400);
    res.send(e.message);
  }
}

const getPersonById2 = (req: express$Request): Promise<PersonType> =>
  getPersonById(req.params.id);

type UserAuthType = {
  can(role: string): boolean
};

export function getRouter(user: UserAuthType) {
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
  route('delete', '/:id', user.can('delete person'), wrap(deletePerson2));
  route('get', '/:id', user.can('get specific person'), wrap(getPersonById2));
  route('post', '/', user.can('create new person'), wrap(createPerson2));
  route(
    'put',
    '/:id/disable',
    user.can('disable person'),
    wrap(disablePerson2)
  );
  route('put', '/:id/enable', user.can('enable person'), wrap(enablePerson2));

  return router;
}
