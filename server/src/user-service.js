// @flow

import PgConnection from 'postgresql-easy';
import {compare, encrypt} from './util/encrypt';
import type {UserType} from './types';

const config = {database: 'demo'};
const pg = new PgConnection(config);

const TABLE = 'app_user';

export async function createUser(inUser: UserType): Promise<UserType> {
  const passwordHash = await encrypt(inUser.password);
  const outUser: UserType = {
    id: '',
    password: passwordHash,
    roles: [],
    username: inUser.username
  };
  outUser.id = await pg.insert(TABLE, outUser);
  return outUser;
}

export const deleteUser = (userId: number): Promise<void> =>
  pg.deleteById(TABLE, userId);

export async function validatePassword(
  username: string,
  password: string
): Promise<boolean> {
  const sql = 'select passwordHash from user where username = $1';
  const passwordHash = await pg.query(sql, username);
  return compare(password, passwordHash);
}
