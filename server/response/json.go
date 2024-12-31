package response

import (
	"encoding/json"
	"fmt"
	"net/http"
)

/*
	This function attempts to marshal the given payload into JSON.
	If successful, it is sent as an HTTP response together with the status code.
*/
func RespondWithJSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	result, err := json.MarshalIndent(payload, "", "  ")

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, 
			fmt.Sprintf("Failed to marshal into JSON: %v", payload),
		)
		return
	}

	w.Header().Set("content-type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(result)
}