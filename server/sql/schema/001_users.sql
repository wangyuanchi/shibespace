-- +goose Up
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL
);

-- +goose Down
DROP TABLE users;