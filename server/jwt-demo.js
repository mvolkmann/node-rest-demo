// @flow

// I created private and public keys with
// ssh-keygen -t rsa -b 4096 -f jwtrs256.key
// which created the private key in jwtrs256.key
// and created the public key in jwtrs256.key.pub.

const fs = require('fs');
const jwt = require('jsonwebtoken');

const payload = {
  username: 'mvolkmann',
  roles: ['foo', 'bar']
};

const expiresIn = 5 * 60;
const algorithm = 'RS256';
const issuer = 'Node REST Demo';
const signOptions = {algorithm, expiresIn, issuer};
const privateKey = fs.readFileSync('./jwt-rsa.key');
const token = jwt.sign(payload, privateKey, signOptions);
console.log('token =', token); // works!

const publicKey = fs.readFileSync('./jwt-rsa.key.pub');
const verifyOptions = {algorithms: [algorithm], issuer, maxAge: expiresIn};
const decodedPayload = jwt.verify(token, publicKey, verifyOptions);
console.log('decodedPayload =', decodedPayload);
