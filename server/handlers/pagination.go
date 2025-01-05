package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/wangyuanchi/shibespace/server/internal/database"
	"github.com/wangyuanchi/shibespace/server/response"
)

/*
This handler gets and validates the 'page' and 'limit' query.
Then, it gets the threads using the queries and sort based on the latest updated thread.
The response may be a 204 status code (no content).
*/
func (connection *DatabaseConnection) GetThreadsPaginatedHandler(w http.ResponseWriter, r *http.Request) {
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
		Limit:  int32(l),
		Offset: int32((p - 1) * l),
	})
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get threads: %v", err))
		return
	}

	if threads == nil {
		response.RespondWithJSON(w, http.StatusNoContent, struct{}{})
	} else {
		response.RespondWithJSON(w, http.StatusOK, database.FormatThreads(threads))
	}
}

/*
This handler first checks if the thread exists based on the 'thread_id' path parameter.
Then, it gets and validates the 'page' and 'limit' query.
Next, it gets the comments using the queries and 'thread_id'
and sorts based on the first created comment.
The response may be a 204 status code (no content).
*/
func (connection *DatabaseConnection) GetThreadCommentsPaginatedHandler(w http.ResponseWriter, r *http.Request) {
	threadID := chi.URLParam(r, "thread_id")
	id, err := strconv.Atoi(threadID)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid thread ID: %v", err))
		return
	}

	_, err = connection.DB.GetThread(r.Context(), int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			response.RespondWithError(w, http.StatusNotFound, "The thread does not exist")
		} else {
			response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get thread: %v", err))
		}
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

	comments, err := connection.DB.GetThreadCommentsPaginated(r.Context(), database.GetThreadCommentsPaginatedParams{
		ThreadID: int32(id),
		Limit:    int32(l),
		Offset:   int32((p - 1) * l),
	})
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get comments: %v", err))
		return
	}

	if comments == nil {
		response.RespondWithJSON(w, http.StatusNoContent, struct{}{})
	} else {
		response.RespondWithJSON(w, http.StatusOK, database.FormatComments(comments))
	}
}

/*
This function gets the 'page' and 'limit' query from the URL.
The default values are 1 and 10 respectively.
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
