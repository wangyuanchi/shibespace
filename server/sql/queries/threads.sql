-- name: CreateThread :one
INSERT INTO threads (title, content, tags, creator_id)
VALUES ($1, $2, $3, $4)
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

-- name: GetThreadsPaginated :many
SELECT * FROM threads
WHERE tags @> $1::VARCHAR(35)[]
ORDER BY updated_timestamp DESC 
LIMIT $2 OFFSET $3;

-- name: GetThreadsPaginatedCount :one
SELECT COUNT(*) FROM threads
WHERE tags @> $1::VARCHAR(35)[];