package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/wangyuanchi/shibespace/server/internal/database"
	"github.com/wangyuanchi/shibespace/server/middleware"
	"github.com/wangyuanchi/shibespace/server/response"
)

type threadData struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

/*
This handler parses the title and content from the request.
It conducts input validation, then it gets the author through jwt.
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
