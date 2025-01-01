package database

import (
	"github.com/google/uuid"
)

type FormattedUserInfo struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
}