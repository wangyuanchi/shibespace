package handlers

import (
	"net/http"

	"github.com/wangyuanchi/shibespace/server/response"
)

func (connection *DatabaseConnection) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	response.RespondWithJSON(w, 200, struct{}{})
}