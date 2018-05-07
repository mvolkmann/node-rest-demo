// @flow

import express from 'express';
import {wrap} from './util/error-util';
import {castObject} from './util/flow-util';
import {createUser, deleteUser, validatePassword} from './people-service';

async function createUser2(
  req: express$Request,
  res: express$Response
): Promise<void> {
  const user = castObject(req.body);
  res.send(await createUser(user));
}

const deleteUser2 = (req: express$Request): Promise<void> =>
  deleteUser(req.params.id);

const validatePassword2 = (req: express$Request): Promise<PersonType> =>
  validatePassword(req.params.username, req.params.password);

type CanFnType = (action: string) => boolean;

export function getRouter(can: CanFnType) {
  // This maps URLs to handler functions.
  const router = express.Router();

  function route(method: string, path: string, can: boolean, handler) {
    router[method](path, can, handler);
  }

  // All users can do this.
  router.get('/', wrap(validatePassword2));

  route('delete', '/:id', can('delete user'), wrap(deleteUser2));
  route('post', '/', can('create user'), wrap(createUser2));

  return router;
}
