# A command line tool to generate restful api for database

We often need to write a restful API for database. This tool can generate the api code for you based on the configuration defined in the config yaml file.

> The design idea is to let you define how to access the database. This tool will not try to model operations for entities.

## Usage

```bash
npx create data-api-app [-c config.ymal] [source directory]
```
```

## Express app

The tool generates source code: _server.js_, _app-express.js, _and _model.js. You can run the app by running the following command:

```bash
npm install express body-parser mssql
node server.js
```
The app will listen on the port that you defined in the config file.

You can also bring the code of _app-express.js_ into your existing express app.

```javascript
require('./app-express')(app);
```

In the _model.js_ file, it uses _mssql_ package to connect to MS SQL Server.

## API Specification

The tool also generates the api specification in the _api.yaml_ file.

## Configuration Explained

The configuration file is the config.yaml file. It is located in the root folder of the project. See [this config.yaml](config.yaml) for example.

```yaml
name: My API app
port: 8080
public: public
path: /api
databases:
  - objects:
      - table: users
```


## Table

Table can use the following methods:

* GET - retrieve record(s)
* POST - create a new record
* PUT - upsert a record
* DELETE - delete a record
* PATCH - update a record

Each method has corresponding fields that you will need to provide.

```yaml
  - table: users
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
  - table: users
    get:
      - int id
      - varchar name
      - varchar email
    get /users:id:
      - int id PK
      - varchar name
      - varchar email
    post:
      - int id PK
      - varchar name
      - varchar email
    patch /uses/name:
      - int id PK
      - varchar name
    patch /uses/email:
      - int id PK
      - varchar email
    delete /users:id:
      - int id PK
```

## Views

Access to views are similar to tables. Only GET method is supported. You can define the fields that you want to retrieve. And the fields for search criteria.

```yaml
  - view: v_users
    get:
      - int id
      - varchar name
      - varchar email
    get /users:id:
      - int id
      - varchar name PK
      - varchar email
```

## Stored Procedures

Calls to the stored procedures are straight forward. You define the parameters.

```yaml
  - procedure: usp_update_user
    post:
      - int id
      - varchar name
      - varchar email
      - datetime created_at
      - datetime updated_at
```

## Custom Query

You can also define custom query that has joins to other tables. You can not define the fields that you want to retrieve. It is defined by the query. But, you still can define the fields for search criteria. And define the field names for api. E.g. the field name in the query is _u.id_, but you want to use _id_ in the api.

```yaml
  - query: users_posts
    select: select * from users u join posts p on u.id = p.user_id
    get:
    get /posts/:userid/:
      - int id FK "u.id"
```

## Fields

Each field is defined in one line. The format is as follows:

```yaml
# type name keys alias
- int id FK "u.id"
```

When the fields are PK (primary key), FK (foreign key), or SK (search key), they will be used to generate the SQL where clause. The alias is used in SQL if provided. For example, the following path:

```yaml
  - query: users_posts
    select: select * from users u join posts p on u.id = p.user_id
    get /posts/:user_id:
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

You can denine the authentication from the two types authentication: _jwtAuth_ and _apiKeyAuth_ in the config file.

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
    patch* /uses/name:
      - int id PK
      - varchar name
    patch* /uses/email:
      - int id PK
      - varchar email
    delete* /users:id:
      - int id PK
```

Fianlly, you need to implement the authentication middleware in the _server.js_ file.

```javascript
// TODO: implement authentication
app.authentication = (_, __, next) => next();
```

By default, if you use _jwtAuth_, you get the authentication as follows:

```javascript
const jwt = require('jsonwebtoken');
app.authentication = (req, res, next) => {
  const SECRET_KEY = procees.env.SECRET_KEY;
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send('Token not provided.');
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send('Failed to authenticate token.');
    }
    req.userId = decoded.userId; // Attach used id to the request object
    req.roles = decoded.roles;  // Attach roles to the request object
    next();
  });
}
```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Have fun!

(C) 2023 Yiyi Sun, All Rights Reserved.


