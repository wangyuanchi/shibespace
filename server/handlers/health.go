package handlers

import (
	"net/http"

	"github.com/wangyuanchi/shibespace/server/response"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	response.RespondWithJSON(w, http.StatusOK, struct{}{})
}
