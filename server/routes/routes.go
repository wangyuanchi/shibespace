package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/wangyuanchi/shibespace/server/handlers"
)

func RegisterRoutes(r *chi.Mux) {
	r.Get("/health", handlers.HealthHandler)
}