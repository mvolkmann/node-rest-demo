// @flow

import express from 'express';
const PgConnection = require('postgresql-easy');

const config = {database: 'demo'};
const pg = new PgConnection(config);

import {errorHandler} from './util/error-util';
import {castObject} from './util/flow-util';

type HandlerType = (
  req: express$Request,
  res: express$Response,
  next: express$NextFunction
) => Promise<mixed>;

type PersonType = {
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

function getAllDisabled(): Promise<PersonType[]> {
  return pg.query(
    'select * from people where enabled is not true'
  );
}

function getAllEnabled(): Promise<PersonType[]> {
  return pg.query('select * from people where enabled is true');
}

function getAllPeople(): Promise<PersonType[]> {
  return pg.getAll('people');
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

function startsUpper(text: string): boolean {
  return /^[A-Z]/.test(text);
}

function throwIf(condition: boolean, message: string) {
  if (condition) throw new Error(message);
}

function validatePerson(person: PersonType): void {
  for (const property of requiredProperties) {
    const value = person[property];
    throwIf(!value, property + ' is a required property');
  }

  throwIf(!startsUpper(person.firstName),
    'firstName must start with an uppercase letter');

  throwIf(!startsUpper(person.lastName),
    'lastName must start with an uppercase letter');

  throwIf(person.age < 0, 'age must be non-negative');
}

// This provides common error handling
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
      errorHandler(next, e);
    }
  };
}

export default router;
