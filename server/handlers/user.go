package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/wangyuanchi/shibespace/server/internal/database"
	"github.com/wangyuanchi/shibespace/server/response"
	"golang.org/x/crypto/bcrypt"
)

type userData struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

/*
This handler parses the username and password from the request.
It conducts input validation, then it hashes the password,
and together with the username and a UUID, they are stored in the database.
There is an additional error handling for duplicate usernames.
The UUID and username is returned in the response.
*/
func (connection *DatabaseConnection) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	userData := userData{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&userData)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to parse from JSON: %v", err))
		return
	}

	err = userDataValidation(userData)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid input: %v", err))
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userData.Password), bcrypt.DefaultCost)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to hash password: %v", err))
		return
	}

	userInfo, err := connection.DB.CreateUser(r.Context(), database.CreateUserParams{
		ID:       uuid.New(),
		Username: userData.Username,
		Password: string(hashedPassword),
	})

	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			response.RespondWithError(w, http.StatusConflict, "Username is already taken")
		} else {
			response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to add user to database: %v", err))
		}
		return
	}

	response.RespondWithJSON(w, http.StatusOK, database.FormattedUserInfo(userInfo))
}

/*
TODO: Add JWT
*/
func (connection *DatabaseConnection) UserLoginHandler(w http.ResponseWriter, r *http.Request) {
	userData := userData{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&userData)
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to parse from JSON: %v", err))
		return
	}

	err = userDataValidation(userData)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "The username or password is incorrect")
		return
	}

	userPasswordHash, err := connection.DB.GetUserPasswordHash(r.Context(), userData.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			response.RespondWithError(w, http.StatusUnauthorized, "The username or password is incorrect")
		} else {
			response.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get user password hash: %v", err))
		}
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(userPasswordHash), []byte(userData.Password))
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "The username or password is incorrect")
		return
	}

	response.RespondWithJSON(w, http.StatusOK, userData.Username)
}

/*
This function checks if the length of the username is between 3 and 20 characters and
matches the conventional regex. It also checks if the password is at least 8 characters.
*/
func userDataValidation(userData userData) error {
	username := userData.Username
	password := userData.Password

	if len(username) < 3 || len(username) > 20 {
		return errors.New("username must be between 3 and 20 characters long")
	}

	if matching, _ := regexp.MatchString("^[a-zA-Z0-9_-]+$", username); !matching {
		return errors.New("username can only contain letters, numbers, underscores, and hyphens")
	}

	if len(password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}

	return nil
}
