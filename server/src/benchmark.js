// @flow
import Benchmark from 'benchmark';
import got from 'got';

const URL_PREFIX = 'http://localhost:3001';
const gotOptions = {headers: {}, json: true};
//const suite = new Benchmark.Suite();

async function createUser() {
  const body = {username: 'jbrown', password: 'p2', roles: ['admin']};

  // Create a user.
  const res = await got.post(URL_PREFIX + '/user', {body, ...gotOptions});
  if (res.statusCode !== 200) throw new Error('create user failed');
}

async function login() {
  const body = {username: 'jbrown', password: 'p2', roles: ['admin']};
  const res = await got.post(URL_PREFIX + '/login', {body, ...gotOptions});
  if (res.statusCode !== 204) console.error('login failed');
}

async function doIt() {
  try {
    await createUser();
    console.time('login');
    let times = 100;
    while (times) {
      // eslint-disable-next-line no-await-in-loop
      await login();
      --times;
    }
    console.timeEnd('login');
    //await login();

    /*
    suite.add('login', login);

    suite.on('cycle', event => {
      console.log(String(event.target));
    });

    suite.on('complete', () => {
      console.log('benchmark.js complete');
    });

    //suite.run({async: true});
    suite.run();
    */
  } catch (e) {
    console.error(e.message);
  }
}
doIt();
