-- name: CreateComment :one
INSERT INTO comments (content, thread_id, creator_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetCommentCreatorID :one
SELECT creator_id FROM comments
WHERE id = $1;

-- name: UpdateCommentContent :one
UPDATE comments
SET content = $2, updated_timestamp = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING content, updated_timestamp;

-- name: DeleteComment :one
DELETE FROM comments
WHERE id = $1
RETURNING *;

-- name: GetThreadCommentsPaginated :many
SELECT * FROM comments
WHERE thread_id = $1
ORDER BY created_timestamp ASC 
LIMIT $2 OFFSET $3;