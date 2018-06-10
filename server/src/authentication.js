// @flow

import fs from 'fs';
import jwt from 'jsonwebtoken';

import {getUser} from './user-service';
import {compare} from './util/encrypt';

const algorithm = 'RS256';
const expiresIn = 5 * 60; // seconds
const issuer = 'Node REST Demo';
const signOptions = {algorithm, expiresIn, issuer};
const privateKey = fs.readFileSync('./jwt-rsa.key');

export function setupAuthentication(app: express$Application): void {
  app.post('/login', async (req: express$Request, res: express$Response) => {
    const {username, password} = req.body;
    const user = await getUser(username);
    const valid = user && (await compare(password, user.passwordhash));
    if (valid) {
      // Create a JWT token and place it in the "token" cookie.
      const payload = {username, roles: user.roles};
      const token = jwt.sign(payload, privateKey, signOptions);
      res.setHeader(
        'Set-Cookie',
        `token=${token}; Path=/; HttpOnly; MaxAge=${expiresIn}`
      );
    }
    const message = valid
      ? 'successful login'
      : 'incorrect username or password';
    const status = valid ? 204 : 400;
    res.status(status).send(message);
  });

  app.post('/logout', (req: express$Request, res: express$Response) => {
    // Clear the "token" cookie.
    res.setHeader(
      'Set-Cookie',
      'token=; Path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );
    res.status(204).send('successful logout');
  });
}
