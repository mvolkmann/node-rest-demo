// @flow

// This configures authorization using "connect-roles".

import ConnectRoles from 'connect-roles';
import type {ActionToRolesMapType, UserType} from './types';

/**
 * This is the type of a function that determines
 * whether the logged in user is authorized
 * to perform a given action.
 */
export type CanFnType = (action: string) => boolean;

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

  Object.entries(actions).forEach(([action, roles]) => {
    user.use(action, req => {
      // Returning false stops any more rules from being considered,
      // so don't do that.

      // If the action has no specified roles,
      // allow any user to perform it.
      const rolesArr = ((roles: any): string[]);
      if (rolesArr.length === 0) return true;

      // Allow the action if the user has one of the required roles.
      const inUser: UserType = req.user;
      const userRoles = (inUser && inUser.roles) || [];
      if (userRoles.some(userRole => rolesArr.includes(userRole))) return true;
    });
  });

  // Callers should use the returned function in route configurations
  // to verify authorization to perform specific actions.
  return user.can.bind(user);
}
