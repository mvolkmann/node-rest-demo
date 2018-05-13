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
To start the database server, enter `npm dbstart`.
To stop the database server, enter `npm dbstop`.
To create/recreate the tables with their initial data, enter `npm dbsetup`.

## Code Summary

## Tests