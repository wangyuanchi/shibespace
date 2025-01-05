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
	r.Get("/users/{user_id}", connection.GetUserInfoHandler)

	r.Post("/threads", connection.CreateThreadHandler)
	r.Get("/threads", connection.GetThreadsPaginatedHandler)
	r.Get("/threads/{thread_id}", connection.GetThreadHandler)
	r.Patch("/threads/{thread_id}/content", connection.UpdateThreadContentHandler)
	r.Delete("/threads/{thread_id}", connection.DeleteThreadHandler)

	r.Post("/comments", connection.CreateCommentHandler)
	r.Get("/comments", connection.GetCommentsPaginatedHandler)
	r.Patch("/comments/{comment_id}/content", connection.UpdateCommentContentHandler)
	r.Delete("/comments/{comment_id}", connection.DeleteCommentHandler)
}
