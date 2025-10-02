package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq" // PostgreSQL driver
	"golang.org/x/crypto/bcrypt"

	"path/to/your/project/internal/api/posts"
)

var jwtSecret []byte
var refreshSecret []byte
var db *sql.DB

// Structs
type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// Database setup
func initDB() error {
	// Get PostgreSQL connection details from environment variables
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}

	password := os.Getenv("DB_PASSWORD")

	// First connect to default 'postgres' database
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=disable",
		host, port, user, password)

	tempDB, err := sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("failed to connect to postgres database: %v", err)
	}
	defer tempDB.Close()

	// Test connection to postgres database
	if err = tempDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping postgres database: %v", err)
	}

	log.Println("Connected to postgres database")

	// Create auth_wrapper database if it doesn't exist
	_, err = tempDB.Exec("CREATE DATABASE auth_wrapper")
	if err != nil {
		// If database already exists, postgres will return an error
		// We can ignore this specific error
		if !strings.Contains(err.Error(), "already exists") {
			return fmt.Errorf("failed to create database: %v", err)
		}
		log.Println("Database auth_wrapper already exists")
	} else {
		log.Println("Database auth_wrapper created successfully")
	}

	// Now connect to the actual auth_wrapper database
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "auth_wrapper"
	}

	// Connect to the auth_wrapper database
	connStr = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return err
	}

	// Test connection
	err = db.Ping()
	if err != nil {
		return err
	}

	// Create users table if it doesn't exist
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `)
	return err
}

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
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

	// Check if user exists
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", creds.Username).Scan(&exists)
	if err != nil {
		log.Printf("Database error checking user: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if exists {
		http.Error(w, "User already exists", http.StatusBadRequest)
		return
	}

	// Hash password and create user
	hashed, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Password hashing error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	_, err = db.Exec("INSERT INTO users (username, password) VALUES ($1, $2)", creds.Username, string(hashed))
	if err != nil {
		log.Printf("Database error creating user: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get user from database
	var storedPwd string
	err := db.QueryRow("SELECT password FROM users WHERE username = $1", creds.Username).Scan(&storedPwd)
	if err != nil {
		if err == sql.ErrNoRows {
			// When user not found:
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
			return
		}
		log.Printf("Database error during login: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Verify password
	if bcrypt.CompareHashAndPassword([]byte(storedPwd), []byte(creds.Password)) != nil {
		// When password doesn't match:
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"message": "Incorrect password"})
		return
	}

	// Generate tokens
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

	// Verify user exists in database
	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", username).Scan(&exists)
	if err != nil || !exists {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	access, refresh, err := GenerateTokens(username)
	if err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(TokenResponse{AccessToken: access, RefreshToken: refresh})
}

func MeHandler(w http.ResponseWriter, r *http.Request) {
	username := r.Header.Get("X-User")

	// Get user details from database
	var id int
	err := db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		log.Printf("Database error fetching user: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"id":       id,
		"username": username,
	}
	json.NewEncoder(w).Encode(resp)
}

// Main
func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env vars")
	}

	// JWT secrets
	jwtSecret = []byte(os.Getenv("JWT_SECRET"))
	refreshSecret = []byte(os.Getenv("REFRESH_SECRET"))

	if len(jwtSecret) == 0 || len(refreshSecret) == 0 {
		log.Fatal("JWT_SECRET and REFRESH_SECRET must be set")
	}

	// Initialize database
	log.Println("Connecting to PostgreSQL...")
	if err := initDB(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Connected to PostgreSQL successfully!")
	defer db.Close()

	// Create a router instead of http.ServeMux
	router := mux.NewRouter()

	// Register auth routes
	router.HandleFunc("/api/auth/register", RegisterHandler).Methods("POST")
	router.HandleFunc("/api/auth/login", LoginHandler).Methods("POST")
	router.HandleFunc("/api/auth/refresh", RefreshHandler).Methods("POST")
	router.HandleFunc("/api/auth/me", AuthMiddleware(MeHandler)).Methods("GET")

	// Setup posts table & register post routes
	posts.SetupPostsTable(db)
	posts.RegisterRoutes(router, db, AuthMiddleware)

	// Add CORS middleware
	handler := corsMiddleware(http.Handler(router))

	log.Println("Server running on :8080")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
