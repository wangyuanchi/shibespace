package middleware

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/wangyuanchi/shibespace/server/internal/database"
)

/*
This function generates a JSON web token for the given user ID.
The jwt is returned with its expiration time.
*/
func GenerateJWT(userID uuid.UUID) (string, time.Time, error) {
	godotenv.Load(".env")

	key := os.Getenv("JWT_KEY")
	if key == "" {
		return "", time.Time{}, errors.New("JWT_KEY is not found in the environment")
	}

	expire := time.Now().Add(time.Hour * 1)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"sub": userID,
			"exp": expire.Unix(),
		})

	jwt, err := token.SignedString([]byte(key))
	if err != nil {
		expire = time.Time{}
	}

	return jwt, expire, err
}

/*
This function gets the JSON web token from cookies, parses it, then extracts the userID.
Then, it checks if the userID actually exists in the database.
If it does, it returns the userID and the 200 status code.
Otherwise, it returns a zero UUID, the relevant status code and the error that happened.
This should be used when an action requires user authentication.
*/
func JWTExtractUserID(connection *database.Queries, r *http.Request) (uuid.UUID, int, error) {
	var zeroUUID uuid.UUID
	godotenv.Load(".env")

	key := os.Getenv("JWT_KEY")
	if key == "" {
		return zeroUUID, http.StatusInternalServerError, errors.New("JWT_KEY is not found in the environment")
	}

	cookie, err := r.Cookie("jwt")
	if err != nil {
		return zeroUUID, http.StatusUnauthorized, errors.New("cookie 'jwt' is not found")
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(key), nil
	})
	if err != nil {
		return zeroUUID, http.StatusUnauthorized, fmt.Errorf("failed to parse jwt: %v", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userIDFromToken, err := uuid.Parse(claims["sub"].(string))
		if err != nil {
			return zeroUUID, http.StatusUnauthorized, errors.New("invalid token")
		}

		exist, err := checkUserIDExist(connection, r, userIDFromToken)
		if err != nil {
			return zeroUUID, http.StatusInternalServerError, err
		}
		if exist {
			return userIDFromToken, http.StatusOK, nil
		} else {
			return zeroUUID, http.StatusUnauthorized, errors.New("invalid token")
		}

	} else {
		return zeroUUID, http.StatusUnauthorized, errors.New("invalid token")
	}
}

/*
This function checks if the user is authorized to access a user's resource.
Specifically, it checks if the userID from jwt matches the 'user_id' path parameter.
If they match, it returns the userID and 200 status code.
Otherwise, it returns the zero UUID, relevant status code and the error that happened.
*/
func JWTCheckMatching(connection *database.Queries, r *http.Request) (uuid.UUID, int, error) {
	var zeroUUID uuid.UUID

	userIDFromToken, statusCode, err := JWTExtractUserID(connection, r)
	if err != nil {
		return zeroUUID, statusCode, err
	}

	userIDFromRequest := chi.URLParam(r, "user_id")
	if userIDFromRequest != userIDFromToken.String() {
		return zeroUUID, http.StatusUnauthorized, errors.New("mismatch between jwt and 'user_id' path parameter")
	} else {
		return userIDFromToken, http.StatusOK, nil
	}
}

/*
This function checks if the given userID exists in the database.
If it does, this function returns true. Otherwise, it returns false.
An error can be thrown even if the userID does not exist,
it should be marked as an internal server error.
*/
func checkUserIDExist(connection *database.Queries, r *http.Request, userID uuid.UUID) (bool, error) {
	_, err := connection.GetUserID(r.Context(), userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		} else {
			return false, fmt.Errorf("failed to get userID: %v", err)
		}
	}
	return true, nil
}
