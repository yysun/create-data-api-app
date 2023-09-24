---
marp: true
theme: uncover
class: invert
paginate: true
---


# [The RealWorld API](https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints)
<br/>

for _create-data-api-app_
<br/>

---

### The Server

```yaml
name: My API app
port: 8080
path: /api

# Authorization: Token jwt.token.here
authentication: jwtAuth
databases:
```

---

### Authentication

```yaml
path: /api
databases:
  - name: mydb
    objects:
      table: users
        # POST /api/users/login
        post-login:
          - varchar username
          - varchar password
```

---

### Registration

```yaml
path: /api
databases:
  - name: mydb
    objects:
      table: users
        # POST /api/users
        post:
          - varchar username
          - varchar email
          - varchar password
```

---

### Get Current User, Update User

```yaml
path: /api
databases:
  - name: mydb
    objects:
      table: users => user

        # GET /api/user
        get*:
          - varchar username PK
          - varchar email
          - varchar bio
          - varchar image

        # PUT /api/user
        put*:
          - varchar username PK
          - varchar email
          - varchar bio
          - varchar image
```


---

### Get Profile, Follow User, Unfollow User

```yaml
path: /api
databases:
  - name: mydb
    objects:
      table: users => profiles/:username

        # GET /api/profiles/:username
        get:
          - varchar username PK
          - varchar bio
          - varchar image
          - boolean following

        # POST /api/profiles/:username/follow
        post-follow*:
          - varchar username PK

        # DELETE /api/profiles/:username/unfollow
        delete-unfollow*:
          - varchar username PK
```

---

### Get Articles and Feed

```yaml
path: /api
databases:
  - name: mydb
    objects:
      table: articles

        # GET /api/articles
        get:
          - varchar slug
          - varchar title
          - varchar descriptopn
          - varchar body
          - varchar tagList
          - boolean favorited
          - int favoritesCount
          - object author

        # GET /api/articles/feed
        get-feed*:
          - ...
```

---

### Get, Create, Update and Delete Article

```yaml
path: /api
databases:
  - name: mydb
    objects:
      table: articles
        # GET /api/articles/:slug
        get:
          - varchar slug PK
          - varchar title
          - ...

        # POST /api/articles
        post*:
          - varchar title
          - varchar description
          - varchar body
          - varchar tagList

        # PUT /api/articles/:slug
        put*:
          - varchar title
          - varchar description
          - varchar body
          - varchar tagList

        # DELETE /api/articles/:slug
        delete*:
          - varchar slug PK
```

### Add, Get ande Delete Comments

```yaml
path: /api
databases:
  - name: mydb
    objects:
      table: comments => articles/:slug/comments

        # POST /api/articles/:slug/comments
        post-add-comment*:
          - varchar slug PK
          - varchar body

        # GET /api/articles/:slug/comments
        get-comments*:
          - varchar slug PK
          - varchar id
          - varchar body
          - object author

        # DELETE /api/articles/:slug/comments/:id
        delete-comment*:
          - varchar slug PK
          - varchar id PK
```
---

### Favorite and Unfavorite Article

```yaml
path: /api
databases:
  - name: mydb
    objects:
      table: articles
        # POST /api/articles/:slug/favorite
        post-favorite*:
          - varchar username PK
          - varchar slug PK

        # DELETE /api/articles/:slug/favorite
        delete-favorite*:
          - varchar username PK
          - varchar slug PK
```
---
### Get Tags

```yaml
path: /api
databases:
  - name: mydb
    objects:
      table: tags
        # GET /api/tags
        get:
          - varchar tag
```