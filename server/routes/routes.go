package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/wangyuanchi/shibespace/server/handlers"
	"github.com/wangyuanchi/shibespace/server/internal/database"
)

/*
This function registers the specified routes under the given router.
It also takes in a database connection so that the handlers have access to it.
*/
func RegisterRoutes(r *chi.Mux, c *database.Queries) {
	connection := handlers.DatabaseConnection{
		DB: c,
	}

	r.Get("/health", handlers.HealthHandler)

	r.Post("/users", connection.CreateUserHandler)
	r.Post("/users/auth", connection.AuthenticateUserHandler)
	r.Get("/users/{username}/id", connection.GetUserIDHandler)

	r.Post("/threads", connection.CreateThreadHandler)
}
