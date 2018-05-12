// @flow

// This configures authentication using Passport and Postgres.

import expressSession from 'express-session';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {getUser} from './user-service';
import {compare} from './util/encrypt';

/**
 * This is used by Passport below in the authentication "strategy"
 * and for "deserializing" a user.
 */
/**
 * This configures user authentication using Passport.
 */
export function setupAuthentication(app: express$Application): void {
  app.use(
    expressSession({
      secret: 'my session secret', //TODO: Need to hide this?
      resave: true, //TODO: What does this do?
      saveUninitialized: true //TODO: What does this do?
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
    //TODO: Probably should make these configurable.
    //successRedirect: '/home', // go to some page after successful login
    //failureRedirect: '/login' // return to login page
    failureRedirect: '/login-fail' // customizes the error message;
    // otherwise says "Unauthorized"
  });

  app.post('/login', auth, (req: express$Request, res: express$Response) => {
    // This is called when authentication is successful.
    // `req.user` contains the authenticated user.

    //TODO: How does this differ from successRedirect above?
    //res.redirect('/home');

    //TODO: When called from a web UI, want redirect instead of this.
    res.send('success');
  });

  app.get('/login-fail', (req: express$Request, res: express$Response) => {
    res.status(401);
    res.send('invalid username or password');
  });

  app.post('/logout', (req: express$Request, res: express$Response) => {
    // $FlowFixMe - Passport adds the logout method to the request object.
    req.logout();

    //TODO: When called from a web UI, redirect to login page.
    //res.redirect('/login');
    res.send('success');
  });
}
