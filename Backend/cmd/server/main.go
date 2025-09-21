package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret []byte
var refreshSecret []byte

// Fake user storage (replace with DB in real app)
var users = map[string]string{} // username -> hashed password

// Structs
type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// Utility: generate access & refresh tokens
func GenerateTokens(username string) (string, string, error) {
	// Access token (short-lived)
	accessClaims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(15 * time.Minute).Unix(),
		"iat":      time.Now().Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessToken.SignedString(jwtSecret)
	if err != nil {
		return "", "", err
	}

	// Refresh token (longer-lived)
	refreshClaims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshStr, err := refreshToken.SignedString(refreshSecret)
	if err != nil {
		return "", "", err
	}

	return accessStr, refreshStr, nil
}

// Middleware to protect routes
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid Authorization format", http.StatusUnauthorized)
			return
		}

		tokenStr := parts[1]
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Attach username to context
		username := claims["username"].(string)
		r.Header.Set("X-User", username)

		next.ServeHTTP(w, r)
	}
}

// Handlers

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if _, exists := users[creds.Username]; exists {
		http.Error(w, "User already exists", http.StatusBadRequest)
		return
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	users[creds.Username] = string(hashed)

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	storedPwd, ok := users[creds.Username]
	if !ok || bcrypt.CompareHashAndPassword([]byte(storedPwd), []byte(creds.Password)) != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	access, refresh, err := GenerateTokens(creds.Username)
	if err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(TokenResponse{AccessToken: access, RefreshToken: refresh})
}

func RefreshHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(body.RefreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return refreshSecret, nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	username := claims["username"].(string)
	access, refresh, err := GenerateTokens(username)
	if err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(TokenResponse{AccessToken: access, RefreshToken: refresh})
}

func MeHandler(w http.ResponseWriter, r *http.Request) {
	username := r.Header.Get("X-User")
	resp := map[string]string{"username": username}
	json.NewEncoder(w).Encode(resp)
}

// Main
func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env vars")
	}

	jwtSecret = []byte(os.Getenv("JWT_SECRET"))
	refreshSecret = []byte(os.Getenv("REFRESH_SECRET"))

	if len(jwtSecret) == 0 || len(refreshSecret) == 0 {
		log.Fatal("JWT_SECRET and REFRESH_SECRET must be set")
	}

	http.HandleFunc("/api/auth/register", RegisterHandler)
	http.HandleFunc("/api/auth/login", LoginHandler)
	http.HandleFunc("/api/auth/refresh", RefreshHandler)
	http.HandleFunc("/api/auth/me", AuthMiddleware(MeHandler))

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
