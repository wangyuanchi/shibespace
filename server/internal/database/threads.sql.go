// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: threads.sql

package database

import (
	"context"

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
