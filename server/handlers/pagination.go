package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/wangyuanchi/shibespace/server/internal/database"
	"github.com/wangyuanchi/shibespace/server/response"
)

/*
This handler first validates the 'tags' (CSV), 'page' and 'limit' query.
Then, it gets the threads using the queries and sort based on the latest updated thread.
The response may be a 204 status code (no content).
The total count is included in the header as x-total-count
*/
func (connection *DatabaseConnection) GetThreadsPaginatedHandler(w http.ResponseWriter, r *http.Request) {
	tags, err := getAndValidateTags(r)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to get and validate tags: %v", err))
		return
	}

	p, l, err := getPageAndLimit(r)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to get page and limit: %v", err))
		return
	}

	err = validatePageAndLimit(p, l)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid page or limit: %v", err))
		return
	}

	threads, err := connection.DB.GetThreadsPaginated(r.Context(), database.GetThreadsPaginatedParams{
		Column1: tags,
		Limit:   int32(l),
		Offset:  int32((p - 1) * l),
	})
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get threads: %v", err))
		return
	}

	threadsCount, err := connection.DB.GetThreadsPaginatedCount(r.Context(), tags)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get threads count: %v", err))
		return
	}
	w.Header().Set("x-total-count", strconv.Itoa(int(threadsCount)))

	if threads == nil {
		response.RespondWithJSON(w, http.StatusNoContent, struct{}{})
	} else {
		response.RespondWithJSON(w, http.StatusOK, database.FormatThreads(threads))
	}
}

/*
This handler first validates the 'thread_id' (compulsory), 'page' and 'limit' query.
Next, it gets the comments using the queries and sorts based on the first created comment.
The response may be a 204 status code (no content).
The total count is included in the header as x-total-count
*/
func (connection *DatabaseConnection) GetCommentsPaginatedHandler(w http.ResponseWriter, r *http.Request) {
	id, statusCode, err := getAndValidateThread(connection, r)
	if err != nil {
		response.RespondWithError(w, statusCode, fmt.Sprintf("Failed to get or validate thread: %v", err))
		return
	}

	p, l, err := getPageAndLimit(r)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to get page and limit: %v", err))
		return
	}

	err = validatePageAndLimit(p, l)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid page or limit: %v", err))
		return
	}

	comments, err := connection.DB.GetCommentsPaginated(r.Context(), database.GetCommentsPaginatedParams{
		ThreadID: int32(id),
		Limit:    int32(l),
		Offset:   int32((p - 1) * l),
	})
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get comments: %v", err))
		return
	}

	commentsCount, err := connection.DB.GetCommentsPaginatedCount(r.Context(), int32(id))
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get comments count: %v", err))
		return
	}
	w.Header().Set("x-total-count", strconv.Itoa(int(commentsCount)))

	if comments == nil {
		response.RespondWithJSON(w, http.StatusNoContent, struct{}{})
	} else {
		response.RespondWithJSON(w, http.StatusOK, database.FormatComments(comments))
	}
}

/*
This function gets the 'page' and 'limit' query from the URL.
The default return values are 1 and 10 respectively.
*/
func getPageAndLimit(r *http.Request) (p, l int, err error) {
	page := r.URL.Query().Get("page")
	limit := r.URL.Query().Get("limit")

	if page == "" {
		page = "1"
	}
	if limit == "" {
		limit = "10"
	}

	p, err = strconv.Atoi(page)
	if err != nil {
		return 0, 0, errors.New("invalid page query")
	}
	l, err = strconv.Atoi(limit)
	if err != nil {
		return 0, 0, errors.New("invalid limit query")
	}

	return p, l, nil
}

/*
This function checks if the page and limit value is at least 1.
*/
func validatePageAndLimit(p, l int) error {
	if p < 1 {
		return errors.New("page value must be at least 1")
	}
	if l < 1 {
		return errors.New("limit value must be at least 1")
	}
	return nil
}

/*
This function gets the 'tags' query from the URL.
It will be treated as a CSV, and the values are split into a []string, then validated.
The default return value will be an empty string slice, i.e. no tags.
*/
func getAndValidateTags(r *http.Request) ([]string, error) {
	tags := r.URL.Query().Get("tags")
	t := strings.Split(tags, ",")

	if tags == "" {
		t = []string{}
	}

	err := threadDataValidation(threadData{
		Title:   "Valid Title",
		Content: "Valid Content",
		Tags:    t,
	})
	if err != nil {
		return nil, err
	}

	return t, nil
}

/*
This function gets the 'thread_id' query from the URL,
then checks if the thread actually exists.
If it does, it returns the thread ID and the 200 status code.
*/
func getAndValidateThread(connection *DatabaseConnection, r *http.Request) (id, statusCode int, err error) {
	threadID := r.URL.Query().Get("thread_id")
	id, err = strconv.Atoi(threadID)
	if err != nil {
		return 0, http.StatusBadRequest, fmt.Errorf("invalid thread ID: %v", err)
	}

	_, err = connection.DB.GetThread(r.Context(), int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, http.StatusNotFound, errors.New("the thread does not exist")
		} else {
			return 0, http.StatusInternalServerError, fmt.Errorf("failed to get thread: %v", err)
		}
	}

	return id, http.StatusOK, nil
}
