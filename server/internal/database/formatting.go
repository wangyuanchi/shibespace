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
	CreatorID        uuid.UUID `json:"creator_id"`
	CreatedTimestamp time.Time `json:"created_timestamp"`
	UpdatedTimestamp time.Time `json:"updated_timestamp"`
}

type FormattedUpdatedThread struct {
	Content          string    `json:"content"`
	UpdatedTimestamp time.Time `json:"updated_timestamp"`
}

type FormattedComment struct {
	ID               int32     `json:"id"`
	Content          string    `json:"content"`
	ThreadID         int32     `json:"thread_id"`
	CreatorID        uuid.UUID `json:"creator_id"`
	CreatedTimestamp time.Time `json:"created_timestamp"`
	UpdatedTimestamp time.Time `json:"updated_timestamp"`
}
