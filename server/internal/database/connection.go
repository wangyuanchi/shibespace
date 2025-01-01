package database

import (
	"database/sql"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

/*
	This function establishes a connection to the specified DB_URL in environment variables.
	It returns a pointer that holds the connection and a function to close the connection.
*/
func GetConnection() (*Queries, func()) {
	godotenv.Load(".env")

	databaseURL := os.Getenv("DB_URL")
	if databaseURL == "" {
		log.Fatal("DB_URL is not found in the environment")
	}

	connection, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatal("Cannot connect to database: ", err)
	}

	return New(connection), func() {
		connection.Close()
	}
}