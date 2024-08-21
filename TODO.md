# TODO for V2

V2 yaml spec to allow multiple models. Each model will save to a separate file.

```yaml
version: "1.0"
name: My API app
port: 8080
public: public
path: /api
authentication: jwtAuth # or apiKeyAuth
database: mssql
models:
    - name: users
      paths:
      - table: users
        get:
          - int id
          - varchar name
          - varchar email
    - name: posts
      paths:
      - query: users_posts
        select: select * from users u join posts p on u.id = p.user_id
        get:
        post users_posts/:user_id/:post_id:
          - int user_id FK "u.id"
          - int post_id FK "p.id"
```