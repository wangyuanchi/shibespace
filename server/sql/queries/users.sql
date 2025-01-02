-- name: CreateUser :one
INSERT INTO users (id, username, password)
VALUES ($1, $2, $3)
RETURNING id, username;

-- name: GetUserPasswordHash :one
SELECT password FROM users
WHERE username = $1;