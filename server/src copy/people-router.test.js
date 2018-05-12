// @flow

import got from 'got';

const URL_PREFIX = 'http://localhost:3001/people';

describe('people-router', () => {
  test('get all', async () => {
    const url = URL_PREFIX;
    const result = await got(url, {json: true});
    const people = result.body;
    expect(people.length).toBe(6);
  });

  test('get one', async () => {
    const url = URL_PREFIX + '/3';
    const result = await got(url, {json: true});
    const person = result.body;
    expect(person.firstname).toBe('Calvin');
  });

  test('get all enabled', async () => {
    const url = URL_PREFIX + '/enabled';
    const result = await got(url, {json: true});
    const people = result.body;
    expect(people.length).toBe(3);
    for (const person of people) {
      expect(person.enabled).toBe(true);
    }
  });

  test('get all disabled', async () => {
    const url = URL_PREFIX + '/disabled';
    const result = await got(url, {json: true});
    const people = result.body;
    expect(people.length).toBe(3);
    for (const person of people) {
      expect(person.enabled).toBe(false);
    }
  });

  test('create person', async () => {
    const url = URL_PREFIX;
    const person = {
      age: 57,
      enabled: false,
      firstname: 'Mark',
      lastname: 'Volkmann'
    };
    const result = await got.post(url, {body: person, json: true});
    const newPerson = result.body;
    const id = parseInt(newPerson.id, 10);
    expect(id).toBeGreaterThan(0);
    expect(newPerson.age).toBe(person.age);
    expect(newPerson.enabled).toBe(person.enabled);
    expect(newPerson.firstname).toBe(person.firstname);
    expect(newPerson.lastname).toBe(person.lastname);
  });

  test('enable and disable person', async () => {
    await got.put(URL_PREFIX + '/2/enable');
    let result = await got(URL_PREFIX + '/2', {json: true});
    let person = result.body;
    expect(person.enabled).toBe(true);

    await got.put(URL_PREFIX + '/2/disable');
    result = await got(URL_PREFIX + '/2', {json: true});
    person = result.body;
    expect(person.enabled).toBe(false);
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
    duplicateEnableChange.bind(null, 2, 'disable')
  );

  test('create person with invalid age', async (done: Function) => {
    const url = URL_PREFIX;
    const person = {
      age: -57,
      enabled: false,
      firstname: 'Mark',
      lastname: 'Volkmann'
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
      firstname: 'mark',
      lastname: 'Volkmann'
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
      firstname: 'Mark',
      lastname: 'volkmann'
    };
    try {
      await got.post(url, {body: person, json: true});
      done.fail('expected error when creating person with invalid last name');
    } catch (e) {
      done(); // got expected error
    }
  });
});
