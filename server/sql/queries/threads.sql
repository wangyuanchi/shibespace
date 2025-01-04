-- name: CreateThread :one
INSERT INTO threads (title, content, creator_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetThread :one
SELECT * FROM threads
WHERE id = $1;

-- name: GetThreadCreatorID :one
SELECT creator_id FROM threads
WHERE id = $1;

-- name: UpdateThreadContent :one
UPDATE threads
SET content = $2, updated_timestamp = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING content, updated_timestamp;

-- name: DeleteThread :one
DELETE FROM threads
WHERE id = $1
RETURNING *;