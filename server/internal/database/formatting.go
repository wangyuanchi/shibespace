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
	Tags             []string  `json:"tags"`
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

type FormattedUpdatedComment struct {
	Content          string    `json:"content"`
	UpdatedTimestamp time.Time `json:"updated_timestamp"`
}

/*
This function loops through the slice of threads and formats each thread element.
*/
func FormatThreads(threads []Thread) []FormattedThread {
	var formattedThreads []FormattedThread

	for _, thread := range threads {
		formattedThread := FormattedThread(thread)
		formattedThreads = append(formattedThreads, formattedThread)
	}

	return formattedThreads
}

/*
This function loops through the slice of comments and formats each comment element.
*/
func FormatComments(comments []Comment) []FormattedComment {
	var formattedComments []FormattedComment

	for _, comment := range comments {
		formattedComment := FormattedComment(comment)
		formattedComments = append(formattedComments, formattedComment)
	}

	return formattedComments
}
