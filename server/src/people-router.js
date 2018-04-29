// @flow

import express from 'express';
const PgConnection = require('postgresql-easy');

import {wrap} from './util/error-util';
import {castObject} from './util/flow-util';

import {type PersonType, validatePerson} from './people';

const config = {database: 'demo'};
const pg = new PgConnection(config);

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

function deletePerson(req: express$Request): Promise<void> {
  return pg.deleteById('people', req.params.id);
}

async function disablePerson(
  req: express$Request,
  res: express$Response
): Promise<void> {
  const {id} = req.params;
  await validateEnabled(id, true, res);
  return pg.updateById('people', id, {enabled: false});
}

async function enablePerson(
  req: express$Request,
  res: express$Response
): Promise<void> {
  const {id} = req.params;
  await validateEnabled(id, false, res);
  return pg.updateById('people', id, {enabled: true});
}

function getAllDisabled(): Promise<PersonType[]> {
  return pg.query('select * from people where enabled is not true');
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

async function validateEnabled(
  id: string,
  want: boolean,
  res: express$Response
) {
  const person = await pg.getById('people', id);
  if (person.enabled !== want) {
    res.status(400);
    const kind = want ? 'disable' : 'enable';
    throw new Error(`cannot ${kind} a person already ${kind}d`);
  }
}

export default router;
