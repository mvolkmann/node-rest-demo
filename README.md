# node-rest-demo

This demonstrates implementing REST services using Node.js.

## Runtime Dependencies

- bcrypt - for creating an encrypted hash from a password
  and comparing a password to a hash
- body-parser - for parsing HTTP request bodies
  (ex. parsing to JavaScript objects when
  the `Content-Type` header is `application/json`)
- connect-roles - for user authorization to perform specific actions
- cors - for cross-origin resource sharing with web UI servers
- express - for implementing server for REST services
- express-healthcheck - for reporting Express server uptime
- express-session - for maintaining session data (such as user logins)
- jsonwebtoken - for creating and validating JWT tokens
- morgan - for Express server request logging
- nodemailer - for sending email
- pm2 - for running multiple server instances on the same machine
  and providing load balancing
- postgresql-easy - for querying and updating PostgreSQL databases

## Developer Dependencies

- babel-\* - for transpiling newer JavaScript to supported JavaScript
- eslint - for linting JavaScript code
- eslint-plugin-\* - for additional ESLint rules
- flow-bin - for JavaScript type checking
- got - for making REST calls from tests
- jest - for implementing unit tests
- npm-run-all - for running multiple npm scripts from a single npm script
- prettier - for formatting JavaScript code

## Database

This uses the PostgreSQL database.
The DDL for creating tables and providing initial data is in `server/ddl.sql`.
There are two tables.
The `people` table stores data about people.
The `app_user` table stores data about users of this application.
It is not named `user` because that is a reserved keyword in PostgreSQL.

To perform database operations, begin by cd'ing to the `server` directory.

To start the database server, enter `npm dbstart`.

To stop the database server, enter `npm dbstop`.

To create or recreate the tables with their initial data,
enter `npm dbsetup`.
The initial data consists of six people, but not users.
Users can be created by calling a REST service.

To inspect the database using PostgreSQL interactive mode,
enter `npm run dbi`.

## Server

This uses Express to implement a server for REST services.

To perform server operations, begin by cd'ing to the `server` directory.

To start the server, enter `npm run start`.

To start the server using load balancing across multiple instances
on the same machine, enter `npm run lb`.

To start the server in a way that causes it to
restart automatically when code changes are detected,
enter `npm run start-dev`.

## Developer Tasks

To perform developer tasks, begin by cd'ing to the `server` directory.

To lint all the JavaScript code, enter `npm run lint`.

To perform type checking on all the JavaScript code, enter `npm run flow`.

To format all the JavaScript code, enter `npm run format`.

To run all the tests, enter `npm test`.

## Use of JSON Web Token

- generated RSA private and public keys
  - private: `openssl genrsa -out jwt-rsa.key
  - public: `openssl rsa -in jwt-rsa.key -pubout > jwt-rsa.key.pub`
- code to create the JWT token is in `authentication.js`
  in the route for a POST to `/login`
- also see `server/jwt-demo.js`

## Google Cloud Platform

- to deploy
  - `cd server`
  - `npm run build`
  - `gcloud app deploy`

- to populate/reset the database
  - restart database instance from the GCP Console if it is stopped
  - `cd server`
  - `gcloud sql connect node-rest-demo-db --user=postgres < ddl.sql`

- to run the tests against the code in GCP
  - `cd server`
  - `gcloud sql connect node-rest-demo-db --user=postgres < ddl.sql`

## Code Summary

### `index.js`

This does many things including:

- creates an Express server instance
- configures logging
- configures the use of CORS
- requests setup of authentication
  (delegating to `authentication.js`)
- requests setup of authorization
  (delegating to `authorization.js`)
- configures all REST service routes
  (delegating to `people-router.js` and `user-router.js`)
- configures a REST service to get the server process id
  which is useful for verifying the use of load balancing
- configures a "healthcheck" REST service
  that outputs the server "uptime"
- starts listening for requests on port 3001

### `secrets.json`

This defines constants with sensitive values.
`emailPassword` is used to send emails.
`sessionSecret` is used sign the session ID cookie.
This file is not checked into version control.

### `auth.json`

This maps actions to the roles required to perform them.
Actions with no associated roles can be performed by any user.

### `types.json`

This defines several Flow types needed for type checking.

### `people-router.js`

This defines the Express routes for REST services related to people.
It delegates all database interactions to `people-service.js`.

### `people-service.js`

This defines functions for performing operations on people
that involve database interactions.

### `people.js`

This defines a function for validating objects that describe a person.

### `user-router.js`

This defines the Express routes for REST services related to users.
It delegates all database interactions to `user-service.js`.

### `user-service.js`

This defines functions for performing operations on users
that involve database interactions.

### `authentication.js`

This configures logins to perform user authentication and
add a JWT token to the "token" cookie which is used for authorization.
It uses the `app_user` database table.

### `authorization.js`

This configures the use of the npm package `connect-roles`
to perform user authorization required by some actions.
It uses the action-to-roles mappings defined in `actions.json`.

## Example REST Calls

### To create a user

`POST http://localhost:3001/user`
with header `Content-Type: application/json` and body

```json
{
  "username": "some-user",
  "password": "some-password",
  "roles": ["role1", "role2"]
}
```

The supported roles are "normal" and "admin".

### To delete a user

`DELETE http://localhost:3001/user/{username}`

### To login

`POST http://localhost:3001/login`
with header `Content-Type: application/json` and body

```json
{
  "username": "some-user",
  "password": "some-password"
}
```

### To logout

`POST http://localhost:3001/logout`

### To get the server process id

`GET http://localhost:3001/pid`

### To get the server uptime

`GET http://localhost:3001`

### To get all people

`GET http://localhost:3001/people`

### To get a specific person

`GET http://localhost:3001/people/{id}`

### To create a new person

`POST http://localhost:3001/people`
with header `Content-Type: application/json` and body

```json
{
  "age": some - age,
  "firstname": "some-first-name",
  "lastname": "some-last-name"
}
```

### To get all enabled people

`GET http://localhost:3001/people/enabled`

### To get all disabled people

`GET http://localhost:3001/people/disabled`

### To enable a specific person

`PUT http://localhost:3001/people/{id}/enable`

### To disable a specific person

`PUT http://localhost:3001/people/{id}/disable`