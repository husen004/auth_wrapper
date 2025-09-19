package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Minimal user representation — adjust fields as needed.
type User struct {
	ID        int64     `db:"id"`
	Email     string    `db:"email"`
	Password  string    `db:"password_hash"`
	CreatedAt time.Time `db:"created_at"`
	// add verified bool, roles, etc.
}

// Dependencies injected to handlers.
type Handler struct {
	DB        *sql.DB
	JWTSecret []byte
	// Optionally: Refresh token table access, mailer, logger, config
}

// Request payloads
type registerReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResp struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

// Helpers

func hashPassword(pw string) (string, error) {
	const cost = 12
	b, err := bcrypt.GenerateFromPassword([]byte(pw), cost)
	return string(b), err
}

func comparePassword(hash, pw string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw))
}

func randomToken(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// Store refresh tokens hashed to allow revocation
func hashTokenForStorage(token string) string {
	h := sha256.Sum256([]byte(token))
	return base64.RawURLEncoding.EncodeToString(h[:])
}

func (h *Handler) generateAccessToken(userID int64) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
		"iat": time.Now().Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString(h.JWTSecret)
}

// Handlers

// RegisterHandler: validate, check unique email, hash pw, insert user, send verification email (placeholder)
func (h *Handler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req registerReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	// Basic validation (expand in real app)
	if req.Email == "" || req.Password == "" || len(req.Password) < 8 {
		http.Error(w, "invalid input", http.StatusBadRequest)
		return
	}

	// Normalize email lower-case, trim (omitted)

	// Check uniqueness
	var exists int
	err := h.DB.QueryRowContext(r.Context(), "SELECT 1 FROM users WHERE email = $1", req.Email).Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		// if row exists Scan will nil; but QueryRow.Scan returns ErrNoRows when not exists.
		// Use a safer approach:
		row := h.DB.QueryRowContext(r.Context(), "SELECT id FROM users WHERE email = $1", req.Email)
		var id int64
		if err2 := row.Scan(&id); err2 == nil {
			http.Error(w, "email already in use", http.StatusConflict)
			return
		} else if err2 != sql.ErrNoRows {
			http.Error(w, "server error", http.StatusInternalServerError)
			return
		}
	}

	pwHash, err := hashPassword(req.Password)
	if err != nil {
		http.Error(w, "could not hash password", http.StatusInternalServerError)
		return
	}

	var newID int64
	err = h.DB.QueryRowContext(r.Context(),
		`INSERT INTO users (email, password_hash, created_at) VALUES ($1,$2,$3) RETURNING id`,
		req.Email, pwHash, time.Now()).Scan(&newID)
	if err != nil {
		http.Error(w, "could not create user", http.StatusInternalServerError)
		return
	}

	// TODO: create email verification token and send email
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"id": newID})
}

// LoginHandler: verify credentials, issue access + refresh tokens, persist refresh token hash
func (h *Handler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if req.Email == "" || req.Password == "" {
		http.Error(w, "missing credentials", http.StatusBadRequest)
		return
	}

	var user User
	err := h.DB.QueryRowContext(r.Context(), "SELECT id, password_hash FROM users WHERE email = $1", req.Email).
		Scan(&user.ID, &user.Password)
	if err != nil {
		// Do not reveal whether email exists
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := comparePassword(user.Password, req.Password); err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate access token
	accessToken, err := h.generateAccessToken(user.ID)
	if err != nil {
		http.Error(w, "could not generate token", http.StatusInternalServerError)
		return
	}

	// Generate refresh token
	refresh, err := randomToken(32)
	if err != nil {
		http.Error(w, "could not generate refresh token", http.StatusInternalServerError)
		return
	}
	hashedRefresh := hashTokenForStorage(refresh)

	// Store hashed refresh token with expiry (example table: refresh_tokens)
	_, err = h.DB.ExecContext(r.Context(),
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) VALUES ($1,$2,$3,$4)`,
		user.ID, hashedRefresh, time.Now().Add(30*24*time.Hour), time.Now())
	if err != nil {
		http.Error(w, "could not store refresh token", http.StatusInternalServerError)
		return
	}

	// Optionally set secure HttpOnly cookie instead of returning token in body:
	// http.SetCookie(w, &http.Cookie{ Name: "refresh_token", Value: refresh, HttpOnly: true, Secure:true, Path:"/", SameSite:http.SameSiteLaxMode, Expires:... })

	resp := authResp{AccessToken: accessToken, RefreshToken: refresh}
	json.NewEncoder(w).Encode(resp)
}

// RefreshHandler: accept refresh token, validate against DB, issue new access token (and rotated refresh token)
func (h *Handler) RefreshHandler(w http.ResponseWriter, r *http.Request) {
	// Token may come from cookie or body
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	token := body.RefreshToken
	if token == "" {
		// check cookie (if used)
		c, err := r.Cookie("refresh_token")
		if err == nil {
			token = c.Value
		}
	}
	if token == "" {
		http.Error(w, "no token provided", http.StatusBadRequest)
		return
	}

	hashed := hashTokenForStorage(token)
	var userID int64
	var expires time.Time
	err := h.DB.QueryRowContext(r.Context(),
		"SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = $1", hashed).
		Scan(&userID, &expires)
	if err != nil {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}
	if time.Now().After(expires) {
		http.Error(w, "token expired", http.StatusUnauthorized)
		return
	}

	accessToken, err := h.generateAccessToken(userID)
	if err != nil {
		http.Error(w, "could not generate access token", http.StatusInternalServerError)
		return
	}

	// Optionally rotate refresh token: delete old entry, insert new hashed token, return new token
	json.NewEncoder(w).Encode(map[string]string{"access_token": accessToken})
}

// Simple middleware example to protect endpoints
func (h *Handler) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if auth == "" {
			http.Error(w, "missing authorization header", http.StatusUnauthorized)
			return
		}
		// Expect "Bearer <token>"
		var tokenStr string
		_, err := fmt.Fscanf(strings.NewReader(auth), "Bearer %s", &tokenStr)
		if err != nil || tokenStr == "" {
			http.Error(w, "invalid auth header", http.StatusUnauthorized)
			return
		}
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, errors.New("unexpected signing method")
			}
			return h.JWTSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}
		// set user in context if needed
		next.ServeHTTP(w, r)
	})
}

// NewHandler helper to build handler with env/config
func NewHandler(db *sql.DB) *Handler {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-secret" // avoid in production
	}
	return &Handler{DB: db, JWTSecret: []byte(secret)}
}
