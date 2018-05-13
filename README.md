# node-rest-demo

This demonstrates implementing REST services using Node.js.

## Runtime Dependencies

* bcrypt - for creating an encrypted hash from a password
    and comparing a password to a hash
* body-parser - for parsing HTTP request bodies
    when Content-Type is 'application/json'
* connect-roles - for authorization
* cors - for cross-origin resource sharing with web UI servers
* express - for implementing server for REST services
* express-healthcheck - for reporting Express server uptime
* express-session - for maintaining session data (just user login)
* morgan - for Express server request logging
* nodemailer - for sending email
* passport - for authenication
* passport-local - for custom authentication strategy
* pm2 - for running multiple server instances and providing load balancing
* postgresql-easy - for querying and updating PostgreSQL databases

## Developer Dependencies

* babel-* - for transpiling newer JavaScript to supported JavaScript
* eslint - for linting JavaScript code
* eslint-plugin-* - for additional ESLint rules
* flow-bin - for JavaScript type checking
* got - for making REST calls from tests
* jest - for implementing unit tests
* npm-run-all - for running multiple npm scripts from a single npm script
* prettier - for formatting JavaScript code

## Database

This uses the PostgreSQL database.
The DDL for creating tables and providing initial data is in server/ddl.sql.
There are two tables.
The "people" table stores data about people.
The "app_user" table stores data about users of this application.
It is not named "user" because that is a reserved keyword in PostgreSQL.

To perform database operations, begin by cd'ing to the `server` directory.
To start the database server, enter `npm dbstart`.
To stop the database server, enter `npm dbstop`.
To create/recreate the tables with their initial data,
enter `npm dbsetup`.
To inspect the database using PostgreSQL interactive mode,
enter `npm run dbi`.

## Server

This uses Express to implement a server for REST services.
To perform server operations, begin by cd'ing to the `server` directory.
To start the server, enter `npm run start`.
To start the server using load balancing across multiple instances,
enter `npm run lb`.
To start the server in a way that causes it to
restart automatically when code changes are detected,
enter `npm run start-dev`.

## Developer Tasks

To perform developer tasks, begin by cd'ing to the `server` directory.
To lint all the JavaScript code, enter `npm run lint`.
To perform type checking on all the JavaScript code, enter `npm run flow`.
To format all the JavaScript code, enter `npm run format`.
To run all the tests, enter `npm test`.

## Code Summary

### index.js

This does many things including:

* creates an Express server instance
* configures logging
* configures the use of CORS
* requests setup of authentication
  (delegating to `authentication.js`)
* requests setup of authorization
  (delegating to `authorization.js`)
* configures all REST service routes
  (delegating to `people-router.js` and `user-router.js`)
* configures a REST service to get the server process id
  (useful for verifying the use of load balancing)
* configures a "healthcheck" REST service
  that outputs the server "uptime"
* starts listening for requests on port 3001

## secrets.json

This defines values for constants with sensitive values.
`emailPassword` is used to send emails.
`sessionSecret` is used sign the session ID cookie.
This file is not checked into version control.

## auth.json

This maps actions to the roles required to perform them.
Actions with no associated roles can be performed by any user.

## types.json

This defines several Flow types needed for type checking.

## people-router.js

This defines the Express routes for REST services related to people.
It delegates all database interactions to `people-service.js`.

## people-service.js

This defines functions for performing operations on people
that involve database interactions.

## people.js

This defines a function for validating objects that describe a person.

## user-router.js

This defines the Express routes for REST services related to users.
It delegates all database interactions to `user-service.js`.

## user-service.js

This defines functions for performing operations on users
that involve database interactions.

## authentication.js

This configures the use of the npm package "Passport"
to perform user authentication.

## authorization.js

This configures the use of the npm package "connect-roles"
to perform user authorization required by some actions.