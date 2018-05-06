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
  res.send(await createPerson(person));
}

const deletePerson2 = (req: express$Request): Promise<void> =>
  deletePerson(req.params.id);

const disablePerson2 = (req: express$Request): Promise<void> =>
  disablePerson(req.params.id);

const enablePerson2 = (req: express$Request): Promise<void> =>
  enablePerson(req.params.id);

const getPersonById2 = (req: express$Request): Promise<PersonType> =>
  getPersonById(req.params.id);

type CanFnType = (action: string) => boolean;

export function getRouter(can: CanFnType) {
  // This maps URLs to handler functions.
  const router = express.Router();

  function route(method: string, path: string, can: boolean, handler) {
    // $FlowFixMe - Doesn't like use of "can".
    router[method](path, can, handler);
  }

  // All authenticated users can do this.
  router.get('/', wrap(getAllPeople));

  route('delete', '/:id', can('delete person'), wrap(deletePerson2));

  route('get', '/disabled', can('get all disabled'), wrap(getAllDisabled));
  route('get', '/enabled', can('get all enabled'), wrap(getAllEnabled));
  // This route must follow the previous two or those won't work
  // because it will treat "disabled" and "enabled" as ids.
  route('get', '/:id', can('get specific person'), wrap(getPersonById2));

  route('post', '/', can('create new person'), wrap(createPerson2));

  route('put', '/:id/disable', can('disable person'), wrap(disablePerson2));
  route('put', '/:id/enable', can('enable person'), wrap(enablePerson2));

  return router;
}
