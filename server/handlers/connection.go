package handlers

import "github.com/wangyuanchi/shibespace/server/internal/database"

/*
	Wraps a database connection so that this can be used as a
	pointer receiver, allowing handlers to have the database connection.
*/
type DatabaseConnection struct {
	DB *database.Queries
}