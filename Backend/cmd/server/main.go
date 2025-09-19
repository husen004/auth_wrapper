package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"backend/internal/auth"

	_ "github.com/go-sql-driver/mysql"
)

// CORS middleware to allow requests from frontend
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Pass to next handler
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Get database configuration from environment variables
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "root" // Default username
	}

	dbPass := os.Getenv("DB_PASS")
	if dbPass == "" {
		dbPass = "" // No password by default (change for production)
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "auth_wrapper" // Default database name
	}

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost" // Default host
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "3306" // Default MySQL port
	}

	// Build connection string
	dsn := dbUser + ":" + dbPass + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbName + "?parseTime=true"

	// Connect to database
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatal("Database connection failed:", err)
	}

	log.Println("Connected to database successfully")

	// Create auth handler
	authHandler := auth.NewHandler(db)

	// Create a mux for routing
	mux := http.NewServeMux()

	// Auth endpoints
	mux.HandleFunc("/api/auth/register", authHandler.Register)
	mux.HandleFunc("/api/auth/login", authHandler.Login)
	mux.HandleFunc("/api/auth/refresh", authHandler.RefreshToken)

	// Protected routes
	mux.Handle("/api/auth/me", authHandler.AuthMiddleware(http.HandlerFunc(authHandler.Me)))

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "healthy"}`))
	})

	// Apply CORS middleware to all routes
	handler := corsMiddleware(mux)

	// Get server port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server starting on port %s", port)
	log.Printf("Available endpoints:")
	log.Printf("  POST /api/auth/register - User registration")
	log.Printf("  POST /api/auth/login - User login")
	log.Printf("  POST /api/auth/refresh - Token refresh")
	log.Printf("  GET  /api/auth/me - Get current user info (protected)")
	log.Printf("  GET  /health - Health check")

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
