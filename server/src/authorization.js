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

  // Users that haven't authenticated can only "get all people".
  // Returning false stops any more rules from being considered,
  // so don't do that.
  user.use((req, action) => {
    if (!req.isAuthenticated()) return action === 'get all people';
  });

  Object.entries(actions).forEach(([action: string, roles: string[]]): void => {
    user.use(action, req => {
      const userRoles: string = req.user.roles;
      if (userRoles.some(userRole => roles.includes(userRole))) return true;
    });
  });

  // Caller should use this function in route configurations
  // to verify authorization to perform specific actions.
  return user.can.bind(user);
}
