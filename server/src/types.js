// @flow

export type ActionToRolesMapType = {[action: string]: string[]};

export type UserType = {
  password: string,
  role: string,
  username: string
};

export type UsersType = {[username: string]: UserType};
