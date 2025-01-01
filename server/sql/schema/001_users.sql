-- +goose Up
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(16) NOT NULL CHECK (LENGTH(username) >= 1),
    password VARCHAR(60) NOT NULL
);

-- +goose Down
DROP TABLE users;