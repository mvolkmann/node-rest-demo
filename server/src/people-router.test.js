// @flow

//import got from 'got';
const got = require('got');

const URL_PREFIX = 'localhost:3001/people';

describe('people-router', () => {
  test.only('get all', async (done: Function) => {
    const url = URL_PREFIX;
    console.log('people-router.test.js x: url =', url);
    const result = await got(url, {json: true});
    console.log('people-router.test.js x: result =', result);
    const people = result.body;
    console.log('people-router.test.js: people =', people);
    expect(people.length).toBe(6);
    done();
  });

  test('get one', async (done: Function) => {
    const url = URL_PREFIX + '/3';
    const result = await got(url, {json: true});
    const person = result.body;
    expect(person.firstName).toBe('Calvin');
    done();
  });

  test('get all enabled', async (done: Function) => {
    const url = URL_PREFIX;
    const result = await got(url, {json: true});
    const people = result.body;
    expect(people.length).toBe(3);
    for (const person of people) {
      expect(person.enabled).toBe(true);
    }
    done();
  });

  test('get all disabled', async (done: Function) => {
    const url = URL_PREFIX;
    const result = await got(url, {json: true});
    const people = result.body;
    expect(people.length).toBe(3);
    for (const person of people) {
      expect(person.enabled).toBe(false);
    }
    done();
  });

  test('create person', async (done: Function) => {
    const url = URL_PREFIX;
    const person = {
      age: 57,
      enabled: false,
      firstName: 'Mark',
      lastName: 'Volkmann'
    };
    const result = await got.post(url, {body: person, json: true});
    const newPerson = result.body;
    const id = parseInt(newPerson.id, 10);
    expect(id).toBeGreaterThan(0);
    expect(newPerson.age).toBe(person.age);
    expect(newPerson.enabled).toBe(person.enabled);
    expect(newPerson.firstName).toBe(person.firstName);
    expect(newPerson.lastName).toBe(person.lastName);
    done();
  });

  test('enable and disable person', async (done: Function) => {
    let url = URL_PREFIX + '/2/enable';
    await got.put(url);
    let result = await got(url, {json: true});
    let person = result.body;
    expect(person.enabled).toBe(true);

    url = URL_PREFIX + '/2/disable';
    await got.put(url);
    result = await got(url, {json: true});
    person = result.body;
    expect(person.enabled).toBe(false);

    done();
  });

  async function duplicateEnableChange(
    id: number,
    change: string,
    done: Function
  ): Promise<void> {
    const url = `${URL_PREFIX}/${id}/${change}`;
    try {
      await got.put(url);
      done.fail('expected error when changing enable to current value');
    } catch (e) {
      done(); // got expected error
    }
  }

  test(
    'enable already enabled person',
    duplicateEnableChange.bind(null, 1, 'enable')
  );

  test(
    'disable already disabled person',
    duplicateEnableChange.bind(null, 1, 'disable')
  );

  test('create person with invalid age', async (done: Function) => {
    const url = URL_PREFIX;
    const person = {
      age: -57,
      enabled: false,
      firstName: 'Mark',
      lastName: 'Volkmann'
    };
    try {
      await got.post(url, {body: person, json: true});
      done.fail('expected error when creating person with negative age');
    } catch (e) {
      done(); // got expected error
    }
  });

  test('create person with invalid first name', async (done: Function) => {
    const url = URL_PREFIX;
    const person = {
      age: 57,
      enabled: false,
      firstName: 'mark',
      lastName: 'Volkmann'
    };
    try {
      await got.post(url, {body: person, json: true});
      done.fail('expected error when creating person with invalid first name');
    } catch (e) {
      done(); // got expected error
    }
  });

  test('create person with invalid lirst name', async (done: Function) => {
    const url = URL_PREFIX;
    const person = {
      age: 57,
      enabled: false,
      firstName: 'Mark',
      lastName: 'volkmann'
    };
    try {
      await got.post(url, {body: person, json: true});
      done.fail('expected error when creating person with invalid last name');
    } catch (e) {
      done(); // got expected error
    }
  });
});
