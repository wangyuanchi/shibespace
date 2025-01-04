// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: threads.sql

package database

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const createThread = `-- name: CreateThread :one
INSERT INTO threads (title, content, creator_id)
VALUES ($1, $2, $3)
RETURNING id, title, content, creator_id, created_timestamp, updated_timestamp
`

type CreateThreadParams struct {
	Title     string
	Content   string
	CreatorID uuid.UUID
}

func (q *Queries) CreateThread(ctx context.Context, arg CreateThreadParams) (Thread, error) {
	row := q.db.QueryRowContext(ctx, createThread, arg.Title, arg.Content, arg.CreatorID)
	var i Thread
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Content,
		&i.CreatorID,
		&i.CreatedTimestamp,
		&i.UpdatedTimestamp,
	)
	return i, err
}

const getThread = `-- name: GetThread :one
SELECT id, title, content, creator_id, created_timestamp, updated_timestamp FROM threads
WHERE id = $1
`

func (q *Queries) GetThread(ctx context.Context, id int32) (Thread, error) {
	row := q.db.QueryRowContext(ctx, getThread, id)
	var i Thread
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Content,
		&i.CreatorID,
		&i.CreatedTimestamp,
		&i.UpdatedTimestamp,
	)
	return i, err
}

const getThreadCreatorID = `-- name: GetThreadCreatorID :one
SELECT creator_id FROM threads
WHERE id = $1
`

func (q *Queries) GetThreadCreatorID(ctx context.Context, id int32) (uuid.UUID, error) {
	row := q.db.QueryRowContext(ctx, getThreadCreatorID, id)
	var creator_id uuid.UUID
	err := row.Scan(&creator_id)
	return creator_id, err
}

const updateThreadContent = `-- name: UpdateThreadContent :one
UPDATE threads
SET content = $2, updated_timestamp = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING content, updated_timestamp
`

type UpdateThreadContentParams struct {
	ID      int32
	Content string
}

type UpdateThreadContentRow struct {
	Content          string
	UpdatedTimestamp time.Time
}

func (q *Queries) UpdateThreadContent(ctx context.Context, arg UpdateThreadContentParams) (UpdateThreadContentRow, error) {
	row := q.db.QueryRowContext(ctx, updateThreadContent, arg.ID, arg.Content)
	var i UpdateThreadContentRow
	err := row.Scan(&i.Content, &i.UpdatedTimestamp)
	return i, err
}
