package auth

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

// User represents a user in the system
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // Password is never returned in JSON
	CreatedAt time.Time `json:"created_at"`
}

// UserResponse is what we return from API calls
type UserResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// LoginRequest defines the login request body
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterRequest defines the register request body
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// TokenResponse represents the response for login/token requests
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	ExpiresIn    int    `json:"expires_in"`
}

// RefreshRequest defines the token refresh request
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// Claims represents the JWT claims
type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// Handler handles authentication requests
type Handler struct {
	DB           *sql.DB
	JWTSecret    []byte
	AccessExpiry time.Duration
}

// NewHandler creates a new auth handler
func NewHandler(db *sql.DB) *Handler {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key-change-in-production" // Default for development
	}

	return &Handler{
		DB:           db,
		JWTSecret:    []byte(jwtSecret),
		AccessExpiry: time.Hour * 24, // 24 hours
	}
}

// Register handles user registration
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	if len(req.Password) < 6 {
		http.Error(w, "Password must be at least 6 characters long", http.StatusBadRequest)
		return
	}

	// Check if user exists
	var exists bool
	err := h.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)", req.Email).Scan(&exists)
	if err != nil {
		log.Printf("Database error checking user existence: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if exists {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	// Hash the password with bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Password hashing error: %v", err)
		http.Error(w, "Could not hash password", http.StatusInternalServerError)
		return
	}

	// Insert user letting DB generate UUID
	_, err = h.DB.Exec(
		"INSERT INTO users (email, password, created_at) VALUES (?, ?, ?)",
		req.Email, string(hashedPassword), time.Now(),
	)
	if err != nil {
		log.Printf("User creation error: %v", err)
		http.Error(w, "Could not create user", http.StatusInternalServerError)
		return
	}

	// Retrieve generated ID
	var id string
	if err := h.DB.QueryRow("SELECT id FROM users WHERE email = ?", req.Email).Scan(&id); err != nil {
		log.Printf("Error retrieving user ID: %v", err)
		http.Error(w, "Could not get user ID", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      id,
		"email":   req.Email,
		"message": "User registered successfully",
	})
}

// Login handles user login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	// Get user from database
	var user User
	var hashedPassword string
	err := h.DB.QueryRow("SELECT id, email, password FROM users WHERE email = ?", req.Email).
		Scan(&user.ID, &user.Email, &hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}
		log.Printf("Database error retrieving user: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate access token
	accessToken, err := h.generateAccessToken(user.ID)
	if err != nil {
		log.Printf("Access token generation error: %v", err)
		http.Error(w, "Could not generate access token", http.StatusInternalServerError)
		return
	}

	// Generate refresh token
	refreshToken, err := h.generateRefreshToken(user.ID)
	if err != nil {
		log.Printf("Refresh token generation error: %v", err)
		http.Error(w, "Could not generate refresh token", http.StatusInternalServerError)
		return
	}

	// Return tokens
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int(h.AccessExpiry.Seconds()),
	})
}

// RefreshToken handles token refresh
func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.RefreshToken == "" {
		http.Error(w, "Refresh token is required", http.StatusBadRequest)
		return
	}

	// Parse the refresh token
	token, err := jwt.ParseWithClaims(req.RefreshToken, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return h.JWTSecret, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	// Check if user exists
	var exists bool
	err = h.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)", claims.UserID).Scan(&exists)
	if err != nil || !exists {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Generate new access token
	accessToken, err := h.generateAccessToken(claims.UserID)
	if err != nil {
		http.Error(w, "Could not generate access token", http.StatusInternalServerError)
		return
	}

	// Return new access token
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(TokenResponse{
		AccessToken: accessToken,
		ExpiresIn:   int(h.AccessExpiry.Seconds()),
	})
}

// Me returns the current user info
func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by AuthMiddleware)
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get user from database
	var user UserResponse
	err := h.DB.QueryRow("SELECT id, email FROM users WHERE id = ?", userID).
		Scan(&user.ID, &user.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		log.Printf("Database error retrieving user info: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Return user info
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// AuthMiddleware verifies the JWT token and sets user ID in context
func (h *Handler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Check if it's a Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Authorization header format must be Bearer {token}", http.StatusUnauthorized)
			return
		}

		// Parse the token
		tokenStr := parts[1]
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return h.JWTSecret, nil
		})

		// Check for token validity
		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Set user ID in request context
		ctx := r.Context()
		ctx = context.WithValue(ctx, "userID", claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Helper function to generate JWT access token
func (h *Handler) generateAccessToken(userID string) (string, error) {
	expirationTime := time.Now().Add(h.AccessExpiry)
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(h.JWTSecret)
}

// Helper function to generate refresh token (longer lived)
func (h *Handler) generateRefreshToken(userID string) (string, error) {
	expirationTime := time.Now().Add(time.Hour * 24 * 30) // 30 days
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(h.JWTSecret)
}
