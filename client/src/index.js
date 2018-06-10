// @flow

const got = require('got');
const URL_PREFIX = 'http://localhost:3001/';

async function doIt() {
  try {
    const res = await got(URL_PREFIX + 'people');
    console.log(res.body);
  } catch (e) {
    console.error(e);
  }
}

doIt();
