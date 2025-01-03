-- name: CreateUser :one
INSERT INTO users (id, username, password)
VALUES ($1, $2, $3)
RETURNING id, username;

-- name: GetUserID :one
SELECT id FROM users
WHERE username = $1;

-- name: GetUsername :one
SELECT username FROM users
WHERE username = $1;

-- name: GetUserPasswordHash :one
SELECT password FROM users
WHERE username = $1;