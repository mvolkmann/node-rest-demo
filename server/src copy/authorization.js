// @flow

import ConnectRoles from 'connect-roles';
import type {ActionToRolesMapType, UserType} from './types';

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

  const unrestrictedActions = [
    'create user',
    'delete user',
    'get all people',
    'login',
    'logout',
    'validate user'
  ];
  // Regardless of whether the user has authenticated,
  // they can perform unrestrictedActions.
  // Returning false stops any more rules from being considered,
  // so don't do that.
  user.use((req, action) => {
    if (unrestrictedActions.includes(action)) return true;
  });

  Object.entries(actions).forEach(([action, roles]) => {
    user.use(action, req => {
      const inUser: UserType = req.user;
      const userRoles = (inUser && inUser.roles) || [];
      const casted = ((roles: any): string[]);
      if (userRoles.some(userRole => casted.includes(userRole))) return true;
    });
  });

  // Caller should use this function in route configurations
  // to verify authorization to perform specific actions.
  return user.can.bind(user);
}
