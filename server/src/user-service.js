// @flow

import PgConnection from 'postgresql-easy';
import {compare, encrypt} from './encrypt';

const config = {database: 'demo'};
const pg = new PgConnection(config);

const TABLE = 'app_user';

export async function createUser(
  username: string,
  password: string
): Promise<UserType> {
  const passwordHash = encrypt(password);
  const user = {username, passwordHash};
  user.id = await pg.insert(TABLE, user);
  return user;
}

export const deleteUser = (userId: number): Promise<void> =>
  pg.deleteById(TABLE, userId);

export const validatePassword = (
  username: string,
  password: string
): Promise<void> => {
  const sql = 'select passwordHash from user where username = $1';
  const passwordHash = pg.query(sql, username);
  return compare(password, passwordHash);
};
