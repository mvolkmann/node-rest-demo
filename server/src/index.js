// @flow

import bodyParser from 'body-parser';
import express from 'express';
import healthCheck from 'express-healthcheck';
import morgan from 'morgan';

import {setupAuthentication} from './authentication';
import {setupAuthorization} from './authorization';
import {getRouter as getPeopleRouter} from './people-router';
import {getRouter as getUserRouter} from './user-router';

// This defines a mapping from actions to required roles.
import actions from '../actions.json';

const app = express();

// This causes logging of all HTTP requests to be written to stdout.
// The provided options are combined, common, dev, short, and tiny.
// For more details, browse https://github.com/expressjs/morgan.
app.use(morgan('dev'));

// Enable cross-origin resource sharing
// so the web server on another port can send
// requests to this REST server on a different port.
//import cors from 'cors';
//app.use(cors());

// This is only needed to serve static files.
//app.use('/', express.static('public'));

// Parse JSON request bodies to JavaScript objects.
app.use(bodyParser.json());

// Parse text request bodies to JavaScript strings.
app.use(bodyParser.text());

setupAuthentication(app);

const can = setupAuthorization(app, actions);

const peopleRouter = getPeopleRouter(can);
app.use('/people', peopleRouter);

const userRouter = getUserRouter(can);
app.use('/user', userRouter);

// This route gets the server process id.
// It is useful to verify that local balancing is happening.
app.get('/pid', (req: express$Request, res: express$Response) =>
  res.send(String(process.pid))
);

// This route gets the uptime of the server.
// Browse localhost:3001.
app.use(/^\//, healthCheck());

const PORT = 3001;
app.listen(PORT, () => console.info('listening on', PORT));
