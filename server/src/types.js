// @flow

export type ActionToRolesMapType = {[action: string]: string[]};

export type UserType = {
  id?: string,
  password: string,
  passwordhash: string,
  roles?: string[],
  username: string
};

export type UsersType = {[username: string]: UserType};
