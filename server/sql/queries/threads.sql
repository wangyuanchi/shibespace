-- name: CreateThread :one
INSERT INTO threads (title, content, author)
VALUES ($1, $2, $3)
RETURNING *;