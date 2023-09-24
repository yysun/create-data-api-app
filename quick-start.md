---
marp: true
theme: uncover
class: invert
paginate: true
---

# Quick start tutorial

of _create-data-api-app_
<br/>

### No installation required
<br/>

We only need to create config.yaml.

---

### Step 1: describe your API server

```yaml
name: My API app
port: 8080
path: /api
databases:
```

---

### Step 2: add database objects

```yaml
name: My API app
port: 8080
path: /api
databases:
  - name: mydb
    objects:
      table: users
```

---

### Step 3: add access methods

```yaml
name: My API app
port: 8080
path: /api
databases:
  - name: mydb
    objects:
      table: users
        get:
          - int id
          - varchar name
          - varchar email
        get-id:
          - int id PK
          - varchar name
          - varchar email
          - datetime created_at

```

---

### Step 3: generate code

```bash
npx create-data-api-app
```

---

### Step 4: run the app

1. add sql server connection string to .env file

```
SQL_CONNECTION_STRING=Server=SQL;Database=mydb;Integrated Security=true;
```

2. run the app

```bash
npm init -y
npm install express body-parser mssql
node server.js
```
