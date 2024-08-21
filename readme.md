# A command line tool to generate restful api for database

We often need to write a restful API for database. This tool can generate the api code for you based on the configuration defined in one config file.

You use the generated code as a start point for your projects. But don't expect it to generate everything. So, configuration was designed to be simple yet practical enough to get the initial code generated. Then, continue to develop your projects. It can save you a lot of repeatitive coding time and let you focus on the business logic.

> The design idea is to let you define the api paths and how to the access the database objects, such as tables, views, custom queries, and stored procedures.
>
> You can define the fields/columns you want to retrieve and update. You can also define the fields for search criteria. This tool will generate the code and SQL statements for you.
>
> This tool will not generate generic entity CRUD.

## Usage

```bash
npx create data-api-app [-c config.ymal] [source directory]
```

## Configuration

The configuration file is config.yaml by default. It is located in the root folder of your project. See [a simple config](config.yaml) or [the config](realworld-example.yaml) for the [RealWorld API](https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints/) for examples.

```yaml
name: My API app
port: 8080
path: /api
databases:
  - objects:
      - table: users
```


## Express app

The tool generates three source code files: _server.js_, _app-express.js_, and _model.js_. You can run the app by running the following command:

```bash
node server.js
```
The app will listen on the port that you defined in the config file.

You can also bring the code of _app-express.js_ into your existing express app.

```javascript
require('./app-express')(app);
```

In the _model.js_ file, it uses _mssql_ package to connect to MS SQL Server.

> More database types will be supported in the future.

## Database

### Table

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
    patch /name:
      - int id PK
      - varchar name
    patch /email:
      - int id PK
      - varchar email
    delete :id:
      - int id PK
```

### View

Access to views are similar to tables. Only GET method is supported. You can define the fields that you want to retrieve. And the fields for search criteria.

```yaml
  - view: v_users
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
  - procedure: usp_update_user
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
  - query: users_posts
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

You can modify and implement the authentication middleware in the _server.js_ file.

```javascript
// TODO: implement authentication
app.authentication = (_, __, next) => next();
```

## API Specification (Experimental)

The tool also generates the api specification in the _api-spec.yaml_ file.



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Have fun!

(C) 2023 Yiyi Sun, All Rights Reserved.


