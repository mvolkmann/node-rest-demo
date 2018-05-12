// @flow

import express from 'express';
import {createUser, deleteUser} from './user-service';
import {wrap} from './util/error-util';
import {castObject} from './util/flow-util';

import type {CanFnType} from './authorization';

/**
 * This returns an Express Router that defines routes
 * for the "people" services.
 */
export function getRouter(can: CanFnType) {
  const router = express.Router();

  /**
   * This greatly simplifies route configuration.  It ensures that
   * all routes check for authorization using the "can" function
   * and handles errors consistently.
   */
  function route(method: string, path: string, action: string, handler) {
    // $FlowFixMe - doesn't like calling a computed method
    router[method](path, can(action), wrap(handler));
  }

  route('delete', '/:username', 'delete user', (req, res) => {
    deleteUser(req.params.username);
    res.send('success');
  });

  route('post', '/', 'create user', async (req, res) => {
    const inUser = castObject(req.body);
    const outUser = await createUser(inUser);
    res.send(outUser);
  });

  return router;
}
