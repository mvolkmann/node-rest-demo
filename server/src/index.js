// @flow

import bodyParser from 'body-parser';
import express from 'express';
import expressSession from 'express-session';
import healthCheck from 'express-healthcheck';
import morgan from 'morgan';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {getRouter} from './people-router';
const ConnectRoles = require('connect-roles');

const app = express();

// Is this needed by Passport to return authorization issues?
app.set('view engine', 'html');

// This causes logging of all HTTP requests to be written to stdout.
// The provided options are combined, common, dev, short, and tiny.
// For more details, browse https://github.com/expressjs/morgan.
app.use(morgan('dev'));

// Enable cross-origin resource sharing
// so the web server on port 3000 can send
// requests to the REST server on port 3001.
//import cors from 'cors';
//app.use(cors());

//TODO: How are user roles supposed to be specified?
const users = {
  mvolkmann: {username: 'mvolkmann', password: 'p1', role: 'normal'},
  jbrown: {username: 'jbrown', password: 'p2', role: 'admin'}
};

const strategy = new LocalStrategy((username, password, done) => {
  const user = users[username];
  const valid = user && user.password === password;
  return valid ? done(null, user) : done(null, false);
});

passport.use(strategy);
passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => done(null, users[username]));

const user = new ConnectRoles({
  failureHandler(req, res, action) {
    // This is optional to customise what happens
    // when user authorization (not authentication) is denied.
    const accept = req.headers.accept || '';
    res.status(403);
    if (accept.includes('html')) {
      res.send("Access Denied - You don't have permission to: " + action);
    } else {
      res.render('access-denied', {action});
    }
  }
});

const peopleRouter = getRouter(user);

app.use(
  expressSession({
    secret: 'what is this?',
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(user.middleware());

// Anonymous users can only get a list of all people.
// Returning false stops any more rules from being considered.
user.use((req, action) => {
  console.log('index.js authorization: action =', action);
  if (!req.isAuthenticated()) return action === 'get all people';
});

// "normal" role users can access all services
// except those reserved for "admin" role users.
// To support other roles, don't return false
// for other kinds of users.
user.use('normal', req => {
  if (req.user.role === 'normal') return true;
});

// admin users can access all pages.
user.use('admin', req => {
  if (req.user.role === 'admin') return true;
});

// This is only needed to serve static files.
//app.use('/', express.static('public'));

// Parse JSON request bodGies to JavaScript objects.
app.use(bodyParser.json());

// Parse text request bodies to JavaScript strings.
app.use(bodyParser.text());

const auth = passport.authenticate('local', {
  //successRedirect: '/home', // to go to page after successful login
  //failureRedirect: '/login' // to return to the login page
  failureRedirect: '/login-fail' // to customize error message;
  // otherwise says "Unauthorized"
});

// $FlowFixMe
app.post('/login', auth, (req: express$Request, res: express$Response) => {
  // This is called when authentication is successful.
  console.log('index.js login: req.body =', req.body);

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

// This route is not protected.
app.get('/pid', (req: express$Request, res: express$Response) =>
  res.send(String(process.pid))
);

// Authorization checks are inside this router.
app.use('/people', peopleRouter);

// This route is not protected.
// To get uptime of server, browse localhost:3001.
app.use(/^\//, healthCheck());

const PORT = 3001;
app.listen(PORT, () => console.info('listening on', PORT));
