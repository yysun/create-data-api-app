# A command line tool to generate restful api for database

We often need to write a restful API for database. This tool can generate the api code for you  as a start point for your projects based on the configuration defined in one config file. Then, continue to develop your projects. It can save you a lot of repeatitive coding time and let you focus on the business logic.

The design idea is to let you define the api paths and how to the access the database objects, such as tables, views, custom queries, and stored procedures.

You can define the fields/columns you want to retrieve and update. You can also define the fields for search criteria. This tool will generate the code and SQL statements for you.

This tool will not generate generic entity CRUD.

## Usage

```bash
npx create data-api-app [-c config.ymal] [target directory]
```

## Configuration

The configuration file is config.yaml by default. It is located in the root folder of your project. See [a simple config](config.yaml) or [the config](demo/realworld-example.yaml) for the [RealWorld API](https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints/) for examples.

```yaml
name: My API app
port: 8080
path: /api
database: mysql
models:
  - users:
    - table users:
        get:
          - int id
          - varchar name
          - varchar email
```


## Express app

The tool generates three source code files: `server.js`. You can run the app by running the following command:

```bash
node server.js
```
The app will listen on the port that you defined in the config file.




## Models

A model has a collection of objects. Each object can be a table, view, stored procedure, or custom query. Each model will generate a router file under the `api` folder. And a model file under the `model` folder.

```
api
  - users.js
  - articles.js
  - tags.js
model
  - users.js
  - articles.js
  - tags.js
```

The  `server.js` will import the routes and models from the `api` folder dynamically.


### Table

Table can use the following methods:

* GET - retrieve record(s)
* POST - create a new record
* PUT - upsert a record
* DELETE - delete a record
* PATCH - update a record

Each method has corresponding fields that you will need to provide.

```yaml
  - table users:
      get:
        - int id
        - varchar name
        - varchar email
      post:
        - varchar name
        - varchar email

```

In real world, there could be multiple ways of creating records, retrieving records and updating records. Therefore, you can define multiple paths with different combinations of fields as you need.

```yaml
  - table users:
      get:
        - int id
        - varchar name
        - varchar email
      get /users/:id:
        - int id PK
        - varchar name
        - varchar email
      post:
        - int id PK
        - varchar name
        - varchar email
      patch users/name:
        - int id PK
        - varchar name
      patch users/email:
        - int id PK
        - varchar email
      delete :id:
        - int id PK
```

### View

Access to views are similar to tables. Only GET method is supported. You can define the fields that you want to retrieve. And the fields for search criteria.

```yaml
  - view v_users:
      get:
        - int id
        - varchar name
        - varchar email
      get /:id:
        - int id
        - varchar name PK
        - varchar email
```

### Stored Procedure

Calls to the stored procedures are straight forward. You define the parameters.

```yaml
  - procedure usp_update_user:
      post:
        - int id
        - varchar name
        - varchar email
        - datetime created_at
        - datetime updated_at
```

### Custom Query

You can also define custom query that has joins to other tables. You can not define the fields that you want to retrieve. It is defined by the query. But, you still can define the fields for search criteria. And define the field names for api. E.g. the field name in the query is _u.id_, but you want to use _id_ in the api.

```yaml
  - query users_posts:
      select: select * from users u join posts p on u.id = p.user_id
      get:
      get /posts/:userid/:
        - int id FK "u.id"
```

### Fields

Each field is defined in one line. The format is as follows:

```yaml
# type name keys alias
- int id FK "u.id"
```

When the fields are PK (primary key), FK (foreign key), or SK (search key), they will be used to generate the SQL where clause. The alias is used in SQL if provided. For example, the following path:

```yaml
  - query: users_posts
      select: select * from users u join posts p on u.id = p.user_id
      get /users_posts/:user_id:
        - int user_id FK "u.id"
```

will generate the following SQL statement:

```javascript
await sql.query`select * from users u join posts p on u.id = p.user_id WHERE u.id = ${id}`;
```

## Paths

Paths are generated as /{object name}. But you can also explictly define the path.

```yaml
  - table: users
    # default path is /users
      get:
        - int id
        - varchar name
        - varchar email

      # explicit path
      get /users:id:
        - int id PK
        - varchar name
        - varchar email
```

## Authentication

You can denine the authentication: _jwtAuth_ or _apiKeyAuth_ in the config file.

```yaml
authentication: jwtAuth
```
or
```yaml
authentication: apiKeyAuth
```

Then, you can appy the authentication to the routes by adding the '*' sign.

```yaml
  - table: users
      get:
        - int id
        - varchar name
        - varchar email
      get* /users:id:
        - int id PK
        - varchar name
        - varchar email
      post*:
        - varchar name
        - varchar email
      patch* /name:
        - int id PK
        - varchar name
      patch* /email:
        - int id PK
        - varchar email
      delete* /:id:
        - int id PK
```

By default, if you use _jwtAuth_, you get the authentication as follows:

```javascript
const jwt = require('jsonwebtoken');
app.authentication = (req, res, next) => {}
app.post('/auth/login', async (req, res) => {});
app.post('/auth/register', async (req, res) => {});
app.post('/auth/logout', async (req, res) => {});
app.post('/auth/refresh', async (req, res) => {});

```

You can modify and implement the authentication middleware in the `server.js` file.

```javascript
// TODO: implement authentication
app.authentication = (_, __, next) => next();
```

## API Specification (Experimental)

The tool also generates the api specification in the `api-spec.yaml` file.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Have fun!

(C) 2024 Yiyi Sun, All Rights Reserved.


