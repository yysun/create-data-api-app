---
marp: true
theme: uncover
class: invert
paginate: true
---
<style>
  section :is(pre,marp-pre)>code { padding: 0.8em 5.8em; }
</style>

<!-- footer: Visit [create-data-api-app on Github](https://github.com/yysun/create-data-api-app/) -->

create-data-api-app
# Quick start tutorial

(No installation required)
<br/>

All we need is to create _config.yaml_.

---

### Step 1: describe your server and database

```yaml
name: My API app
port: 8080
path: /api
database: mysql
```

---

### Step 2: add models and objects

```yaml
name: My API app
port: 8080
path: /api
models:
  - users:
    - table users:
```

---

### Step 3: add paths and fields

```yaml
name: My API app
port: 8080
path: /api
models:
  - users:
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
          - varchar name
          - varchar email
```

---

### Step 3: generate code and run the app

```bash
npx create-data-api-app

node server.js
```
<br/>

That's it!

Download [config.yaml](config.yaml).

