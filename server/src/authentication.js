// @flow

// This configures authentication using Passport and Postgres.

import expressSession from 'express-session';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {sessionSecret} from './secrets.json';
import {getUser} from './user-service';
import {compare} from './util/encrypt';

/**
 * This configures user authentication using Passport.
 */
export function setupAuthentication(app: express$Application): void {
  // For details on express-session, see https://github.com/expressjs/session.
  app.use(
    expressSession({
      // If a request doesn't modify the session, don't save it to the store.
      resave: false,
      // Don't save new, unmodified sessions to the store.
      saveUninitialized: false,
      // This is used to sign the session ID cookie.
      secret: sessionSecret
    })
  );

  const strategy = new LocalStrategy(async (username, password, done) => {
    const user = await getUser(username);
    const valid = user && (await compare(password, user.passwordhash));
    return valid ? done(null, user) : done(null, false);
  });
  passport.use(strategy);

  passport.serializeUser((user, done) => done(null, user.username));

  passport.deserializeUser(async (username, done) => {
    const user = await getUser(username);
    done(null, user);
  });

  app.use(passport.initialize());

  app.use(passport.session());

  const auth = passport.authenticate('local', {
    // Go to the "home" page after successful authentications.
    //successRedirect: '/home',

    // Return to the "login" page after failed authentications.
    //failureRedirect: '/login'

    // Customize the error message for failed authentications
    // so the default of "Unauthorized" is not used.
    failureRedirect: '/login-fail'
  });

  app.post('/login', auth, (req: express$Request, res: express$Response) => {
    // This is called when authentication is successful.
    // `req.user` contains the authenticated user.
    res.send('success');
  });

  app.get('/login-fail', (req: express$Request, res: express$Response) => {
    res.status(401);
    res.send('invalid username or password');
  });

  app.post('/logout', (req: express$Request, res: express$Response) => {
    // $FlowFixMe - Passport adds the logout method to the request object.
    req.logout();

    // When called from a web UI,
    // redirect to login page instead of sending a response.
    //res.redirect('/login');
    res.send('success');
  });
}
