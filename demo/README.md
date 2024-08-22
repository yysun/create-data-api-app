# RealWorld API Demo

## Installation

```bash
npx create data-api-app app
node app/server.js
```

## Usage

[http://localhost:8080](http://localhost:8080)

## API

[api-spec](api-spec.yaml)

## Config.yaml

```yaml
name: RealWorld app
port: 8080
path: /api
authentication: jwtAuth
databases:
  - name: mydb
    objects:
      - table: users

        # authentication
        post /users/login:
          - varchar username
          - varchar password

        # registration
        post:
          - varchar username
          - varchar email
          - varchar password

        # get current user
        get* /user:
          - varchar username PK
          - varchar email
          - varchar bio
          - varchar image

        # update user
        put* /user:
          - varchar username PK
          - varchar email
          - varchar bio
          - varchar image

        # get profile
        get /api/profiles/:username:
          - varchar username PK
          - varchar bio
          - varchar image
          - boolean following

        # follow user
        post* /api/profiles/:username/follow:
          - varchar username PK

        # unfollow user
        delete* /api/profiles/:username/unfollow:
          - varchar username PK

      - table: articles

        # list articles
        get: /articles?
          - varchar slug
          - varchar title
          - varchar descriptopn
          - varchar body
          - varchar tagList
          - boolean favorited
          - int favoritesCount
          - object author

        # feed articles
        get*  /articles/feed:


        # get article
        get /articles/:slug:
          - varchar slug PK
          - varchar title
          - ...

        # create article
        post*:
          - varchar title
          - varchar description
          - varchar body
          - varchar tagList

        # update article
        put* /articles/:slug:
          - varchar title
          - varchar description
          - varchar body
          - varchar tagList

        # delete article
        delete*:
          - varchar slug PK

      - table: comments

        # add comment
        post* /articles/:slug/comments:
          - varchar slug PK
          - varchar body

        # get comments
        get /articles/:slug/comments:
          - varchar slug PK
          - varchar id
          - varchar body
          - object author

        # delete comment
        delete /articles/:slug/comments/:id:
          - varchar slug PK
          - varchar id PK


      - table: favorite

        # like an article
        post* /articles/:slug/favorite:
          - varchar username PK
          - varchar slug PK

        # unlike an article
        delete* /articles/:slug/favorite:
          - varchar username PK
          - varchar slug PK

      - table: tags

        # get tags
        get:
```
