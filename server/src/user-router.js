// @flow

import express from 'express';
import {wrap} from './util/error-util';
import {castNumber, castObject} from './util/flow-util';
import {createUser, deleteUser, validatePassword} from './user-service';

type CanFnType = (action: string) => boolean;

export function getRouter(can: CanFnType) {
  // This maps URLs to handler functions.
  const router = express.Router();

  function route(method: string, path: string, action: string, handler) {
    // $FlowFixMe - doesn't like calling a computed method
    router[method](path, can(action), wrap(handler));
  }

  route('get', '/', 'validate password', req =>
    validatePassword(req.params.username, req.params.password)
  );
  route('delete', '/:id', 'delete user', req =>
    deleteUser(castNumber(req.params.id))
  );
  route('post', '/', 'create user', async (req, res) => {
    const inUser = castObject(req.body);
    const outUser = await createUser(inUser);
    res.send(outUser);
  });

  return router;
}
