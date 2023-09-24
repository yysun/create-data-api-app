---
marp: true
theme: uncover
class: invert
paginate: true
---

Hi, developers!

## Read this spec first

```yaml
name: My API app
port: 8080
path: /api
databases:
  - type: mssql
    objects:
      - table: users
        get:
          - int id
          - varchar name
          - varchar email
```

---

Can you write a database API app in a few minutes?

## Let's get started!

---

### You will need code for database access.

>

```javascript
module.exports.mydb = {

  "users:get": async () => {

    const query = `SELECT
      id,
      name,
      email
    FROM users `;

    const result = await sql.query(query);
    return result.recordset;
  },
}
```

---

### You will also need code for API endpoint.

>

```javascript
const model = require('./model');
const express = require('express');
const app = express();

app.get('/api/users', async (req, res) => {
  const result = await model.mydb['users:get']();
  res.json(result);
});

const port = process.env.port || 8080;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
```

---

### What about so many to write?

```yaml
databases:
  - type: mssql
    objects:
      - table: users
        get:
        get-id:
        post:
        put:
        delete:
        patch-name:
        patch-email:
      - procedure: usp_update_user
        post:
      - query: users_posts
```

---

It certainly takes time to write all of them. What if you can

## Generate the Code

```bash
npx create-data-api-app
```

---

## And run code in a few seconds.

```bash
node server
```

---

Plus, you also get the specification of the API.

>

```yaml
openapi: '3.0.0'
info:
  title: My API app
  version: "1.0"
servers:
  - url: https://localhost:8080

paths:
  /api/users:

    get:
      tags:
        - users
      summary: users:get

      responses:
        '200':
          description: OK
```

---

And, some code for testing.

```
@host=http://localhost:8080

###
GET {{host}}/api/users

###
GET {{host}}/api/users/:id

###
POST {{host}}/api/users
Content-Type: application/json
{
  "name": "",
  "email": ""
}
```

---

Try it yourself!

# npx create-data-api-app

[https://github.com/yysun/create-data-api-app/](https://github.com/yysun/create-data-api-app/)
