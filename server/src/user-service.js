// @flow

import PgConnection from 'postgresql-easy';
import {encrypt} from './util/encrypt';
import type {UserType} from './types';

const config = {database: 'demo'};
const pg = new PgConnection(config);

const TABLE = 'app_user';

export async function createUser(inUser: UserType): Promise<UserType> {
  const passwordHash = await encrypt(inUser.password);
  const outUser = {
    username: inUser.username,
    passwordHash,
    roles: inUser.roles
  };
  const id = await pg.insert(TABLE, outUser);
  return {id, ...inUser};
}

export async function deleteUser(username: string): Promise<void> {
  const sql = 'delete from app_user where username = $1';
  await pg.query(sql, username);
}

export async function getUser(username: string): Promise<UserType> {
  const sql = 'select * from app_user where username = $1';
  const [user] = await pg.query(sql, username);
  return user;
}
