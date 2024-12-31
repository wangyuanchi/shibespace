package response

import (
	"log"
	"net/http"
)

type errorResponse struct {
	Error string `json:"error"`
}

/*
	This function helps send consistently formatted error responses.
	It also hides server errors from the client.
*/
func RespondWithError(w http.ResponseWriter, statusCode int, message string) {
	errResp := errorResponse{
		Error: message,
	}

	if statusCode >= 500 {
		log.Printf("(Error %d) %s", statusCode, message)

		errResp = errorResponse{
			Error: "Something went wrong, please try again later",
		}
	}

	RespondWithJSON(w, statusCode, errResp)
}