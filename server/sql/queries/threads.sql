-- name: CreateThread :one
INSERT INTO threads (title, content, creator_id)
VALUES ($1, $2, $3)
RETURNING *;