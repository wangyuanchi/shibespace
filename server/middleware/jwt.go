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
	"github.com/joho/godotenv"
	"github.com/wangyuanchi/shibespace/server/internal/database"
)

/*
This function generates a JSON web token for the given user.
The jwt is returned with its expiration time.
*/
func GenerateJWT(username string) (string, time.Time, error) {
	godotenv.Load(".env")

	key := os.Getenv("JWT_KEY")
	if key == "" {
		return "", time.Time{}, errors.New("JWT_KEY is not found in the environment")
	}

	expire := time.Now().Add(time.Hour * 1)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"sub": username,
			"exp": expire.Unix(),
		})

	jwt, err := token.SignedString([]byte(key))
	if err != nil {
		expire = time.Time{}
	}

	return jwt, expire, err
}

/*
This function gets the JSON web token from cookies, parses it, then extracts the username.
Then, it checks if the username actually exists in the database.
If it does, it returns the username and the 200 status code.
Otherwise, it returns the relevant status code and the error that happened.
This should be used when an action requires user authentication.
*/
func JWTExtractUsername(connection *database.Queries, r *http.Request) (string, int, error) {
	godotenv.Load(".env")

	key := os.Getenv("JWT_KEY")
	if key == "" {
		return "", http.StatusInternalServerError, errors.New("JWT_KEY is not found in the environment")
	}

	cookie, err := r.Cookie("jwt")
	if err != nil {
		return "", http.StatusUnauthorized, errors.New("cookie 'jwt' is not found")
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(key), nil
	})
	if err != nil {
		return "", http.StatusUnauthorized, fmt.Errorf("failed to parse jwt: %v", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		usernameFromToken := claims["sub"].(string)

		exist, err := checkUserExistence(connection, r, usernameFromToken)
		if err != nil {
			return "", http.StatusInternalServerError, err
		}
		if exist {
			return usernameFromToken, http.StatusOK, nil
		} else {
			return "", http.StatusUnauthorized, errors.New("invalid token")
		}

	} else {
		return "", http.StatusUnauthorized, errors.New("invalid token")
	}
}

/*
This function checks if the user is authorized to access a user's resource.
Specifically, it checks if the username from jwt matches the 'username' path parameter.
If they match, it returns the 200 status code.
Otherwise, it returns the relevant status code and the error that happened.
*/
func JWTCheckMatching(connection *database.Queries, r *http.Request) (int, error) {
	usernameFromToken, statusCode, err := JWTExtractUsername(connection, r)
	if err != nil {
		return statusCode, err
	}

	usernameFromRequest := chi.URLParam(r, "username")
	if usernameFromRequest != usernameFromToken {
		return http.StatusUnauthorized, errors.New("username mismatch between jwt and 'username' path parameter")
	} else {
		return http.StatusOK, nil
	}
}

/*
This function checks if the given username exists in the database.
If it does, this function returns true. Otherwise, it returns false.
An error can be thrown even if the username does not exist,
it should be marked as an internal server error.
*/
func checkUserExistence(connection *database.Queries, r *http.Request, username string) (bool, error) {
	_, err := connection.GetUsername(r.Context(), username)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		} else {
			return false, fmt.Errorf("failed to get username: %v", err)
		}
	}
	return true, nil
}
