package database

import (
	"time"

	"github.com/google/uuid"
)

type FormattedUserInfo struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
}

type FormattedThread struct {
	ID               int32     `json:"id"`
	Title            string    `json:"title"`
	Content          string    `json:"content"`
	Author           string    `json:"author"`
	CreatedTimestamp time.Time `json:"created_timestamp"`
	UpdatedTimestamp time.Time `json:"updated_timestamp"`
}
