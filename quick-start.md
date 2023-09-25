---
marp: true
theme: uncover
class: invert
paginate: true
---

_create-data-api-app_
# Quick start tutorial

<br/><br/>

No installation required
<br/>

We only need to create config.yaml.

---

### Step 1: describe your server

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

### Step 3: add paths

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
        get: /users:id:
          - int id PK
          - varchar name
          - varchar email
          - datetime created_at

```

---

### Step 3: generate code and run the app

```bash
npx create-data-api-app

node server.js
```

