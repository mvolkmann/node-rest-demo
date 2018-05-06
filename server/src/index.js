// @flow

import bodyParser from 'body-parser';
import express from 'express';
import healthCheck from 'express-healthcheck';
import morgan from 'morgan';

import {setupAuthentication} from './authentication';
import {setupAuthorization} from './authorization';
import {getRouter} from './people-router';

const app = express();

// This causes logging of all HTTP requests to be written to stdout.
// The provided options are combined, common, dev, short, and tiny.
// For more details, browse https://github.com/expressjs/morgan.
app.use(morgan('dev'));

// Enable cross-origin resource sharing
// so the web server on port 3000 can send
// requests to the REST server on port 3001.
//import cors from 'cors';
//app.use(cors());

const auth = setupAuthentication(app);
const user = setupAuthorization(app);

const peopleRouter = getRouter(user);

// This is only needed to serve static files.
//app.use('/', express.static('public'));

// Parse JSON request bodGies to JavaScript objects.
app.use(bodyParser.json());

// Parse text request bodies to JavaScript strings.
app.use(bodyParser.text());

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
