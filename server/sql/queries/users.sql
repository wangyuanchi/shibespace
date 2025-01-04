-- name: CreateUser :one
INSERT INTO users (id, username, password)
VALUES ($1, $2, $3)
RETURNING id, username;

-- name: GetUserID :one
SELECT id FROM users
WHERE id = $1;

-- name: GetUserIDAndPassHash :one
SELECT id, password FROM users
WHERE username = $1;

-- name: GetUserInfo :one
SELECT id, username FROM users
WHERE id = $1;