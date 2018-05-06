// @flow

const ConnectRoles = require('connect-roles');
import type {ActionToRolesMapType} from './types';

const actionToRolesMap: ActionToRolesMapType = {
  'create new person': ['admin'],
  'delete person': ['admin'],
  'disable person': ['admin'],
  'enable person': ['admin'],
  'get all disabled': ['normal', 'admin'],
  'get all enabled': ['normal', 'admin'],
  'get specific person': ['normal', 'admin']
};
// No specific role is needed to get all people.

export function setupAuthorization(app: express$Application) {
  const user = new ConnectRoles({
    failureHandler(req, res, action) {
      // This is optional to customise what happens
      // when user authorization (not authentication) is denied.
      console.log('index.js ConnectRoles: action =', action);
      res.status(403);
      res.send(`Access Denied - cannot ${action}`);
    }
  });

  app.use(user.middleware());

  // Anonymous users can only get a list of all people.
  // Returning false stops any more rules from being considered.
  user.use((req, action) => {
    console.log('index.js authorization: action =', action);
    if (!req.isAuthenticated()) return action === 'get all people';
  });

  Object.entries(actionToRolesMap).forEach(
    ([action: string, roles: string[]]): void => {
      user.use(action, req => {
        const theRole: string = req.user.role;
        // $FlowFixMe - What?
        if (roles.includes(theRole)) return true;
      });
    }
  );

  return user;
}
