// @flow

import express from 'express';
import sortBy from 'lodash/sortBy';
const PgConnection = require('postgresql-easy');

const config = {
  database: 'demo'
};
const pg = new PgConnection(config);

import {errorHandler} from './util/error-util';
import {castObject} from './util/flow-util';

type HandlerType = (
  req: express$Request,
  res: express$Response,
  next: express$NextFunction
) => Promise<mixed>;

export type PersonType = {
  age: number,
  enabled: boolean,
  id: number,
  firstName: string,
  lastName: string
};

// This maps URLs to handler functions.
const router = express.Router();
router.delete('/:id', wrap(deletePerson));
router.get('/', wrap(getAllPersones));
router.get('/:id', wrap(getPersonById));
router.post('/', wrap(postPerson));
router.put('/:id', wrap(putPerson));

const requiredProperties = ['age', 'firstName', 'lastName'];

export function deletePerson(req: express$Request): Promise<void> {
  pg.deleteById('people', req.params.id);
  return Promise.resolve(); // allows usage with wrap function
}

export async function getAllPersones(): Promise<PersonType[]> {
  const people = await pg.getAll('people');
  return sortBy(people, ['lastName', 'firstName']);
}

export function getPersonById(req: express$Request): Promise<PersonType> {
  const {id} = req.params;
  return pg.getById('people', id);
}

export function postPerson(req: express$Request): Promise<number> {
  const person = castObject(req.body);
  for (const property of requiredProperties) {
    const value = person[property];
    if (!value) {
      throw new Error(`postPerson requires body to have ${property} property`);
    }
  }
  return pg.insert('people', person);
}

export async function putPerson(req: express$Request): Promise<void> {
  const {id} = req.params;
  const person = ((req.body: any): PersonType);
  delete person.id;
  await pg.updateById('people', id, person);
}

// This acquires a database connection
// and provides common error handling
// for all the REST services defined here.
function wrap(handler: HandlerType): HandlerType {
  return async (
    req: express$Request,
    res: express$Response,
    next: express$NextFunction
  ) => {
    try {
      let result = await handler(req, res, next);
      // Change numeric results to a string so
      // Express won't think it is an HTTP status code.
      if (typeof result === 'number') result = String(result);
      res.send(result);
    } catch (e) {
      // istanbul ignore next
      errorHandler(next, e);
    }
  };
}

export default router;
