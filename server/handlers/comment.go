package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/lib/pq"
	"github.com/wangyuanchi/shibespace/server/internal/database"
	"github.com/wangyuanchi/shibespace/server/middleware"
	"github.com/wangyuanchi/shibespace/server/response"
)

type commentData struct {
	Content  string `json:"content"`
	ThreadID int32  `json:"thread_id"`
}

type commentContent struct {
	Content string `json:"content"`
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

	err = commentContentValidation(commentContent{
		Content: commentData.Content,
	})
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
This handler updates a comment's content (and also updated_timestamp).
It gets the comment based on the 'comment_id' path parameter,
then parses and conducts input validation on the content.
Only the creator of the comment is allowed to do update the content.
*/
func (connection *DatabaseConnection) UpdateCommentContentHandler(w http.ResponseWriter, r *http.Request) {
	commentID := chi.URLParam(r, "comment_id")
	id, err := strconv.Atoi(commentID)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid comment ID: %v", err))
		return
	}

	creatorID, err := connection.DB.GetCommentCreatorID(r.Context(), int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			response.RespondWithError(w, http.StatusNotFound, "The comment does not exist")
		} else {
			response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get comment creator ID: %v", err))
		}
		return
	}

	commentContent := commentContent{}
	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&commentContent)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to parse from JSON: %v", err))
		return
	}

	err = commentContentValidation(commentContent)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid input: %v", err))
		return
	}

	_, statusCode, err := middleware.JWTCheckMatching(connection.DB, r, creatorID.String())
	if err != nil {
		response.RespondWithError(w, statusCode, fmt.Sprintf("Failed jwt matching check: %v", err))
		return
	}

	updatedComment, err := connection.DB.UpdateCommentContent(r.Context(), database.UpdateCommentContentParams{
		ID:      int32(id),
		Content: commentContent.Content,
	})
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to update comment content: %v", err))
		return
	}

	response.RespondWithJSON(w, http.StatusOK, database.FormattedUpdatedComment(updatedComment))
}

/*
This handler deletes a comment based on the 'comment_id' path parameter.
Only the creator of the comment is allowed to do delete the comment.
*/
func (connection *DatabaseConnection) DeleteCommentHandler(w http.ResponseWriter, r *http.Request) {
	commentID := chi.URLParam(r, "comment_id")
	id, err := strconv.Atoi(commentID)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid comment ID: %v", err))
		return
	}

	creatorID, err := connection.DB.GetCommentCreatorID(r.Context(), int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			response.RespondWithError(w, http.StatusNotFound, "The comment does not exist")
		} else {
			response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get comment creator ID: %v", err))
		}
		return
	}

	_, statusCode, err := middleware.JWTCheckMatching(connection.DB, r, creatorID.String())
	if err != nil {
		response.RespondWithError(w, statusCode, fmt.Sprintf("Failed jwt matching check: %v", err))
		return
	}

	_, err = connection.DB.DeleteComment(r.Context(), int32(id))
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to delete comment: %v", err))
		return
	}

	response.RespondWithJSON(w, http.StatusNoContent, struct{}{})
}

/*
This function checks if the length of the content is at least 1 character.
*/
func commentContentValidation(commentContent commentContent) error {
	if len(commentContent.Content) < 1 {
		return errors.New("content must be at least 1 character long")
	}

	return nil
}
