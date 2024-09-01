DROP TABLE IF EXISTS users;
CREATE TABLE users
(
    -- With MySQL, we'll store UUIDs as bytes, using the UUID Go type to map them into structs
    id         INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(255)  NOT NULL,
    email      VARCHAR(255)  NOT NULL,
    password   VARCHAR(255)  NOT NULL,
    image      VARCHAR(4096) NOT NULL DEFAULT '',
    bio        VARCHAR(4096) NOT NULL DEFAULT '',
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_users_username_email (username, email)
);

DROP TABLE IF EXISTS user_follows;
CREATE TABLE user_follows
(
    id          INT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    follower_id INT        NOT NULL,
    followee_id INT        NOT NULL,
    created_at  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS user_favorites;
CREATE TABLE user_favorites
(
    id         INT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    INT        NOT NULL,
    article_id INT        NOT NULL,
    created_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS articles;
CREATE TABLE articles
(
    id          INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    author_id   INT           NOT NULL,
    slug        VARCHAR(255)  NOT NULL,
    title       VARCHAR(255)  NOT NULL,
    description VARCHAR(255)  NOT NULL,
    body        VARCHAR(4096) NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_articles_slug (slug)
);

DROP TABLE IF EXISTS comments;
CREATE TABLE comments
(
    id         INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    author_id  INT           NOT NULL,
    article_id INT           NOT NULL,
    body       VARCHAR(4096) NOT NULL,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS tags;
CREATE TABLE tags
(
    id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_tag_slug (description)
);

DROP TABLE IF EXISTS article_tags;
CREATE TABLE article_tags
(
    id         INT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    article_id INT        NOT NULL,
    tag_id     INT        NOT NULL,
    created_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_article_tags_article_tag (article_id, tag_id)
);
