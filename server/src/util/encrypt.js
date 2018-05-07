// @flow

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 7;

export const compare = (text: string, hash: string): Promise<boolean> =>
  bcrypt.compare(text, hash);

export const encrypt = (text: string): Promise<string> =>
  bcrypt.hash(text, SALT_ROUNDS);
