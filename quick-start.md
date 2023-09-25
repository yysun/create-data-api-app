---
marp: true
theme: uncover
class: invert
paginate: true
---
<style>
  section :is(pre,marp-pre)>code { padding: 0.8em 5.8em; }
</style>

create-data-api-app
# Quick start tutorial

(No installation required)
<br/>

All we need is to create _config.yaml_.

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
      - table: users
      - view: v_users
      - stored_procedure: sp_users
```

---

### Step 3: add paths and fields

```yaml
databases:
  - name: mydb
    objects:
     - table: users
        get:
          - int id
          - varchar name
          - varchar email
        get: /users:id:
          - int id PK
          - varchar name
          - varchar email
          - datetime created_at
          - datetime updated_at
          - ......
```

---

### Step 3: generate code and run the app

```bash
npx create-data-api-app

node server.js
```

