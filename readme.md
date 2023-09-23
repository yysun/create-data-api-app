# A command line tool to generate restful api for database

We often need to write a restful API for database. This tool can generate the api code for you based on the configuration defined in the config yaml file.

> The design idea is to let you define how to access the database. This tool will not try to model operations for entities.

## Usage

```bash
npx create api-app [path-to-config-file]
```

## Configuration Explained

The configuration file is the config.yaml file. It is located in the root folder of the project.

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

In real world, there could be multiple ways of creating records, retrieving records and updating records. Therefore, you can define multiple methods with different combinations of fields as you need.

```yaml
  - table: users
        get:
          - int id
          - varchar name
          - varchar email
        get-byId:
          - int id PK
          - varchar name
          - varchar email
        patch-name:
          - int id PK
          - varchar name
        patch-email:
          - int id PK
          - varchar email
```

## Views

Access to views are similar to tables. Only GET method is supported. You can define the fields that you want to retrieve. And the fields for search criteria.

```yaml
  - view: v_users
        get:
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
        get-byUser:
          - int id PK "u.id"
```

## Express app

The tool generates an express app for you. The app is located in the _app.js_ file. You can run the app by running the following command:

```bash
npm install express body-parser mssql
node app.js
```

The app will listen on the port that you defined in the config file.

## Data Model

The tool generates the data model in the _model.js_ file. It uses _mssql_ package to connect to MS SQL Server.


## Azure Functions App

The tool also generates the code for Azure Functions app (V4). The code is in the _app-azure.js_



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Have fun!

(C) 2023 Yiyi Sun, All Rights Reserved.


