// @flow

import ConnectRoles from 'connect-roles';
import actions from '../actions.json';

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

  Object.entries(actions).forEach(([action: string, roles: string[]]): void => {
    user.use(action, req => {
      const theRole: string = req.user.role;
      // $FlowFixMe - What?
      if (roles.includes(theRole)) return true;
    });
  });

  return user;
}
