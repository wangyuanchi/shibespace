package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/wangyuanchi/shibespace/server/internal/database"
	"github.com/wangyuanchi/shibespace/server/middleware"
	"github.com/wangyuanchi/shibespace/server/response"
)

type threadData struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type threadContent struct {
	Content string `json:"content"`
}

/*
This handler parses the title and content from the request.
It conducts input validation, then it gets the creator through jwt.
The entire row for the thread is returned, which additionally includes the
ID of the thread and the timestamp it was created and last updated.
*/
func (connection *DatabaseConnection) CreateThreadHandler(w http.ResponseWriter, r *http.Request) {
	threadData := threadData{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&threadData)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to parse from JSON: %v", err))
		return
	}

	err = threadDataValidation(threadData)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid input: %v", err))
		return
	}

	userID, statusCode, err := middleware.JWTExtractUserID(connection.DB, r)
	if err != nil {
		response.RespondWithError(w, statusCode, fmt.Sprintf("Failed to extract username: %v", err))
		return
	}

	thread, err := connection.DB.CreateThread(r.Context(), database.CreateThreadParams{
		Title:     threadData.Title,
		Content:   threadData.Content,
		CreatorID: userID,
	})
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to add thread to database: %v", err))
		return
	}

	response.RespondWithJSON(w, http.StatusCreated, database.FormattedThread(thread))
}

/*
This handler gets a thread based on the 'thread_id' path parameter.
*/
func (connection *DatabaseConnection) GetThreadHandler(w http.ResponseWriter, r *http.Request) {
	threadID := chi.URLParam(r, "thread_id")
	id, err := strconv.Atoi(threadID)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid thread ID: %v", err))
		return
	}

	thread, err := connection.DB.GetThread(r.Context(), int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			response.RespondWithError(w, http.StatusNotFound, "The thread does not exist")
		} else {
			response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get thread: %v", err))
		}
		return
	}

	response.RespondWithJSON(w, http.StatusOK, database.FormattedThread(thread))
}

/*
This handler updates a thread's content (and also updated_timestamp).
It gets the thread based on the 'thread_id' path parameter,
then parses and conducts input validation on the content.
Only the creator of the thread is allowed to do update the content.
*/
func (connection *DatabaseConnection) UpdateThreadContentHandler(w http.ResponseWriter, r *http.Request) {
	threadID := chi.URLParam(r, "thread_id")
	id, err := strconv.Atoi(threadID)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid thread ID: %v", err))
		return
	}

	creatorID, err := connection.DB.GetThreadCreatorID(r.Context(), int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			response.RespondWithError(w, http.StatusNotFound, "The thread does not exist")
		} else {
			response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get thread creator ID: %v", err))
		}
		return
	}

	threadContent := threadContent{}
	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&threadContent)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to parse from JSON: %v", err))
		return
	}

	err = threadDataValidation(threadData{
		Title:   "Valid Title",
		Content: threadContent.Content,
	})
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid input: %v", err))
		return
	}

	_, statusCode, err := middleware.JWTCheckMatching(connection.DB, r, creatorID.String())
	if err != nil {
		response.RespondWithError(w, statusCode, fmt.Sprintf("Failed jwt matching check: %v", err))
		return
	}

	updatedThread, err := connection.DB.UpdateThreadContent(r.Context(), database.UpdateThreadContentParams{
		ID:      int32(id),
		Content: threadContent.Content,
	})
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to update thread content: %v", err))
		return
	}

	response.RespondWithJSON(w, http.StatusOK, database.FormattedUpdatedThread(updatedThread))
}

/*
This handler deletes a thread based on the 'thread_id' path parameter.
Only the creator of the thread is allowed to do delete the thread.
*/
func (connection *DatabaseConnection) DeleteThreadHandler(w http.ResponseWriter, r *http.Request) {
	threadID := chi.URLParam(r, "thread_id")
	id, err := strconv.Atoi(threadID)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid thread ID: %v", err))
		return
	}

	creatorID, err := connection.DB.GetThreadCreatorID(r.Context(), int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			response.RespondWithError(w, http.StatusNotFound, "The thread does not exist")
		} else {
			response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get thread creator ID: %v", err))
		}
		return
	}

	_, statusCode, err := middleware.JWTCheckMatching(connection.DB, r, creatorID.String())
	if err != nil {
		response.RespondWithError(w, statusCode, fmt.Sprintf("Failed jwt matching check: %v", err))
		return
	}

	_, err = connection.DB.DeleteThread(r.Context(), int32(id))
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to delete thread: %v", err))
		return
	}

	response.RespondWithJSON(w, http.StatusNoContent, struct{}{})
}

/*
This function checks if the length of the title is between 1 and 255 characters.
It also checks if the length of the content is at least 1 character.
*/
func threadDataValidation(threadData threadData) error {
	title := threadData.Title
	content := threadData.Content

	if len(title) < 1 || len(title) > 255 {
		return errors.New("title must be between 1 and 255 characters long")
	}

	if len(content) < 1 {
		return errors.New("content must be at least 1 character long")
	}

	return nil
}
