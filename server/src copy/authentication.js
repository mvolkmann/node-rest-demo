// @flow

import expressSession from 'express-session';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import PgConnection from 'postgresql-easy';
import {compare} from './util/encrypt';

const config = {database: 'demo'};
const pg = new PgConnection(config);

async function getUser(username) {
  const sql = 'select * from app_user where username = $1';
  const [user] = await pg.query(sql, username);
  return user;
}

export function setupAuthentication(app: express$Application): void {
  app.use(
    expressSession({
      secret: 'my session secret', //TODO: Need to hide this?
      resave: true, //TODO: What does this do?
      saveUninitialized: true //TODO: What does this do?
    })
  );

  const strategy = new LocalStrategy(async (username, password, done) => {
    console.log('authentication.js strategy: username =', username);
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
    //TODO: Probably need to make these configurable.
    //successRedirect: '/home', // to go to page after successful login
    //failureRedirect: '/login' // to return to the login page
    //failureRedirect: '/login-fail' // to customize error message;
    // otherwise says "Unauthorized"
  });

  // $FlowFixMe
  app.post('/login', auth, (req: express$Request, res: express$Response) => {
    // This is called when authentication is successful.
    // `req.user` contains the authenticated user.

    //TODO: How does this differ from successRedirect above?
    //res.redirect('/pid');

    //TODO: Probably don't want redirect instead of this.
    res.send('success');
  });

  app.get('/login-fail', (req: express$Request, res: express$Response) => {
    res.status(401);
    res.send('invalid username or password');
  });

  app.post('/logout', (req: express$Request, res: express$Response) => {
    // $FlowFixMe - Passport adds the logout method to the request object.
    req.logout();
    //res.redirect('/');
    res.send('success');
  });
}
