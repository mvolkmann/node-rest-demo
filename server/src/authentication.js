// @flow

import expressSession from 'express-session';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import type {UsersType} from './types';

export function setupAuthentication(
  app: express$Application,
  users: UsersType
): void {
  //TODO: Change this to use Postgres to authenticate users.
  //TODO: Use some hashing algorithm to store and check passwords.
  const strategy = new LocalStrategy((username, password, done) => {
    const user = users[username];
    const valid = user && user.password === password;
    return valid ? done(null, user) : done(null, false);
  });

  passport.use(strategy);
  passport.serializeUser((user, done) => done(null, user.username));
  passport.deserializeUser((username, done) => done(null, users[username]));

  app.use(
    expressSession({
      secret: 'my session secret', //TODO: Need to hide this?
      resave: true, //TODO: What does this do?
      saveUninitialized: true //TODO: What does this do?
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/login-fail', (req: express$Request, res: express$Response) => {
    res.status(401);
    res.send('invalid username or password');
  });

  return passport.authenticate('local', {
    //TODO: Probably need to make these configurable.
    //successRedirect: '/home', // to go to page after successful login
    //failureRedirect: '/login' // to return to the login page
    failureRedirect: '/login-fail' // to customize error message;
    // otherwise says "Unauthorized"
  });
}
