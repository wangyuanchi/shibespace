package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/lib/pq"
	"github.com/wangyuanchi/shibespace/server/internal/database"
	"github.com/wangyuanchi/shibespace/server/middleware"
	"github.com/wangyuanchi/shibespace/server/response"
)

type commentData struct {
	Content  string `json:"content"`
	ThreadID int32  `json:"thread_id"`
}

/*
This handler parses the content and thread ID from the request.
It conducts input validation, then it gets the creator through jwt.
The entire row for the comment is returned, which additionally includes the
ID of the comment and the timestamp it was created and last updated.
An error can be thrown if the thread does not actually exist.
*/
func (connection *DatabaseConnection) CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	commentData := commentData{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&commentData)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to parse from JSON: %v", err))
		return
	}

	err = commentDataValidation(commentData)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid input: %v", err))
		return
	}

	userID, statusCode, err := middleware.JWTExtractUserID(connection.DB, r)
	if err != nil {
		response.RespondWithError(w, statusCode, fmt.Sprintf("Failed to extract username: %v", err))
		return
	}

	comment, err := connection.DB.CreateComment(r.Context(), database.CreateCommentParams{
		Content:   commentData.Content,
		ThreadID:  commentData.ThreadID,
		CreatorID: userID,
	})
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23503" {
			response.RespondWithError(w, http.StatusBadRequest, "The thread does not exist")
		} else {
			response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to add comment to database: %v", err))
		}
		return
	}

	response.RespondWithJSON(w, http.StatusCreated, database.FormattedComment(comment))
}

/*
This function checks if the length of the content is at least 1 character.
*/
func commentDataValidation(commentData commentData) error {
	if len(commentData.Content) < 1 {
		return errors.New("content must be at least 1 character long")
	}

	return nil
}
