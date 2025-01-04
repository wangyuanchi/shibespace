-- name: CreateComment :one
INSERT INTO comments (content, thread_id, creator_id)
VALUES ($1, $2, $3)
RETURNING *;