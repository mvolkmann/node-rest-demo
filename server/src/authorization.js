// @flow

import ConnectRoles from 'connect-roles';
import type {ActionToRolesMapType} from './types';

export function setupAuthorization(
  app: express$Application,
  actions: ActionToRolesMapType
) {
  const user = new ConnectRoles({
    failureHandler(req, res, action) {
      // This is optional to customise what happens
      // when user authorization (not authentication) is denied.
      res.status(403);
      res.send(`Access Denied - cannot ${action}`);
    }
  });

  app.use(user.middleware());

  // Regardless of whether the user has authenticated,
  // they can "get all people".
  // Returning false stops any more rules from being considered,
  // so don't do that.
  user.use((req, action) => {
    if (action === 'get all people') return true;
  });

  Object.entries(actions).forEach(([action: string, roles: string[]]): void => {
    user.use(action, req => {
      console.log('authorization.js x: action =', action);
      console.log('authorization.js x: roles =', roles);
      const userRoles = req.user.roles;
      console.log('authorization.js x: userRoles =', userRoles);
      if (userRoles.some(userRole => roles.includes(userRole))) return true;
    });
  });

  // Caller should use this function in route configurations
  // to verify authorization to perform specific actions.
  return user.can.bind(user);
}
