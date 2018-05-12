// @flow

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 7;

/**
 * Returns a Promise that resolves to  boolean
 * that indicates whether the given text
 * matches the given hash value.
 */
export const compare = (text: string, hash: string): Promise<boolean> =>
  bcrypt.compare(text, hash);

/**
 * Returns a Promise that resolves to
 * the encrypted value of the given text.
 */
export const encrypt = (text: string): Promise<string> =>
  bcrypt.hash(text, SALT_ROUNDS);
