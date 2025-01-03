// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: users.sql

package database

import (
	"context"

	"github.com/google/uuid"
)

const createUser = `-- name: CreateUser :one
INSERT INTO users (id, username, password)
VALUES ($1, $2, $3)
RETURNING id, username
`

type CreateUserParams struct {
	ID       uuid.UUID
	Username string
	Password string
}

type CreateUserRow struct {
	ID       uuid.UUID
	Username string
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (CreateUserRow, error) {
	row := q.db.QueryRowContext(ctx, createUser, arg.ID, arg.Username, arg.Password)
	var i CreateUserRow
	err := row.Scan(&i.ID, &i.Username)
	return i, err
}

const getUserID = `-- name: GetUserID :one
SELECT id FROM users
WHERE username = $1
`

func (q *Queries) GetUserID(ctx context.Context, username string) (uuid.UUID, error) {
	row := q.db.QueryRowContext(ctx, getUserID, username)
	var id uuid.UUID
	err := row.Scan(&id)
	return id, err
}

const getUserPasswordHash = `-- name: GetUserPasswordHash :one
SELECT password FROM users
WHERE username = $1
`

func (q *Queries) GetUserPasswordHash(ctx context.Context, username string) (string, error) {
	row := q.db.QueryRowContext(ctx, getUserPasswordHash, username)
	var password string
	err := row.Scan(&password)
	return password, err
}
