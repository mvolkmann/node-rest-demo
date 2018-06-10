// @flow

// This configures authorization using "connect-roles".

import ConnectRoles from 'connect-roles';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import type {ActionToRolesMapType} from './types';

const algorithm = 'RS256';
const expiresIn = 5 * 60; // seconds
const issuer = 'Node REST Demo';
const publicKey = fs.readFileSync('./jwt-rsa.key.pub');

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
  const connectRoles = new ConnectRoles({
    //async: true, // needed if the "use" method callback to return a Promise
    failureHandler(req, res, action) {
      // This is optional to customize what happens
      // when user authorization (not authentication) is denied.
      res.status(403);
      res.send(`Access Denied - cannot ${action}`);
    }
  });

  app.use(connectRoles.middleware());

  Object.entries(actions).forEach(([action, roles]) => {
    connectRoles.use(action, req => {
      // Verify the JWT token.
      const {token} = req.cookies;
      const verifyOptions = {
        algorithms: [algorithm],
        issuer,
        maxAge: expiresIn
      };

      try {
        // If the action has no specified roles,
        // allow any user to perform it,
        // even if there is no JWT token.
        const rolesArr = ((roles: any): string[]);
        if (rolesArr.length === 0) return true;

        // This throws if the token is expired.
        const payload = jwt.verify(token, publicKey, verifyOptions);

        // The roles of the user are in the JWT payload.
        // If they were not, we could get them from the database as follows.
        // But doing that on every request would be a bit slow.
        //const user: UserType = await getUser(payload.username);

        // Allow the action if the user has one of the required roles.
        const hasRequiredRole = payload.roles.some(userRole =>
          rolesArr.includes(userRole)
        );
        return hasRequiredRole;
      } catch (e) {
        let {message} = e;
        if (e instanceof jwt.TokenExpiredError) message = 'token expired';
        if (message === 'jwt must be provided') message = 'login required';
        console.error('authorization.js:', message);
      }
    });
  });

  // Callers should use the returned function in route configurations
  // to verify authorization to perform specific actions.
  return connectRoles.can.bind(connectRoles);
}
