// @flow

import expressSession from 'express-session';
import passport from 'passport';
//import type {UsersType} from './types';
import {Strategy as LocalStrategy} from 'passport-local';

import users from '../users.json';

export function setupAuthentication(app: express$Application): void {
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
      secret: 'my session secret',
      resave: true,
      saveUninitialized: true
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  return passport.authenticate('local', {
    //successRedirect: '/home', // to go to page after successful login
    //failureRedirect: '/login' // to return to the login page
    failureRedirect: '/login-fail' // to customize error message;
    // otherwise says "Unauthorized"
  });
}
