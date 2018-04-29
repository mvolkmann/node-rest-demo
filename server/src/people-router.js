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
router.get('/', wrap(getAllPeople));
router.get('/disabled', wrap(getAllDisabled));
router.get('/enabled', wrap(getAllEnabled));
router.get('/:id', wrap(getPersonById));
router.post('/', wrap(postPerson));
//router.put('/:id', wrap(putPerson));
router.put('/:id/disable', wrap(disablePerson));
router.put('/:id/enable', wrap(enablePerson));

const requiredProperties = ['age', 'firstName', 'lastName'];

function deletePerson(req: express$Request): Promise<void> {
  pg.deleteById('people', req.params.id);
  return Promise.resolve(); // allows usage with wrap function
}

async function disablePerson(
  req: express$Request,
  res: express$Response
): Promise<void> {
  const {id} = req.params;

  const person = await pg.getById('people', id);
  if (!person.enabled) {
    res.status(400);
    throw new Error('disablePerson called on already disabled person');
  }

  return pg.updateById('people', id, {enabled: false});
}

async function enablePerson(
  req: express$Request,
  res: express$Response
): Promise<void> {
  const {id} = req.params;

  const person = await pg.getById('people', id);
  if (person.enabled) {
    res.status(400);
    throw new Error('enablePerson called on already enabled person');
  }

  return pg.updateById('people', id, {enabled: true});
}

async function getAllDisabled(): Promise<PersonType[]> {
  const people = await pg.query(
    'select * from people where enabled is not true'
  );
  return sortPeople(people);
}

async function getAllEnabled(): Promise<PersonType[]> {
  const people = await pg.query('select * from people where enabled is true');
  return sortPeople(people);
}

async function getAllPeople(): Promise<PersonType[]> {
  const people = await pg.getAll('people');
  return sortPeople(people);
}

function getPersonById(req: express$Request): Promise<PersonType> {
  const {id} = req.params;
  return pg.getById('people', id);
}

async function postPerson(req: express$Request): Promise<number> {
  const person = castObject(req.body);
  validatePerson(person);

  person.id = await pg.insert('people', person);
  return person;
}

/* Not needed yet
async function putPerson(req: express$Request): Promise<void> {
  const {id} = req.params;
  const person = ((req.body: any): PersonType);
  delete person.id;
  //TODO: Validate the new properties.
  await pg.updateById('people', id, person);
}
*/

function sortPeople(people: PersonType[]): PersonType[] {
  return sortBy(people, ['lastName', 'firstName']);
}

/**
 * Determines whether the first character in a string
 * is uppercase.
 */
function startsUpper(text: string): boolean {
  return /^[A-Z]/.test(text);
}

function validatePerson(person: PersonType): void {
  for (const property of requiredProperties) {
    const value = person[property];
    if (!value) {
      throw new Error(`postPerson requires body to have ${property} property`);
    }
  }

  if (!startsUpper(person.firstName)) {
    throw new Error('firstName must start with an uppercase letter');
  }

  if (!startsUpper(person.lastName)) {
    throw new Error('lastName must start with an uppercase letter');
  }

  if (person.age < 0) {
    throw new Error('age must be non-negative');
  }
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
      console.log('people-router.js wrap: result =', result);
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
