package posts

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// Post structure for the API
type Post struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	UserID    int    `json:"user_id"`
	Username  string `json:"username,omitempty"`
	CreatedAt string `json:"created_at"`
}

func SetupPostsTable(db *sql.DB) error {
	_, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `)
	return err
}

// RegisterRoutes adds all post-related routes to the provided router
func RegisterRoutes(router *mux.Router, db *sql.DB, authMiddleware func(http.HandlerFunc) http.HandlerFunc) {
	// Public routes
	router.HandleFunc("/api/posts", createGetPostsHandler(db)).Methods("GET")
	router.HandleFunc("/api/posts/{id:[0-9]+}", createGetPostHandler(db)).Methods("GET")

	// Protected routes
	router.HandleFunc("/api/posts", authMiddleware(createCreatePostHandler(db))).Methods("POST")
	router.HandleFunc("/api/posts/{id:[0-9]+}", authMiddleware(createUpdatePostHandler(db))).Methods("PUT")
	router.HandleFunc("/api/posts/{id:[0-9]+}", authMiddleware(createDeletePostHandler(db))).Methods("DELETE")
}

// Handler factory functions

// createGetPostsHandler returns a handler for GET /api/posts
func createGetPostsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Query posts with user information
		rows, err := db.Query(`
            SELECT p.id, p.title, p.content, p.user_id, u.username, p.created_at 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `)

		if err != nil {
			log.Printf("Database error fetching posts: %v", err)
			http.Error(w, "Failed to fetch posts", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		posts := []Post{}

		for rows.Next() {
			var post Post
			if err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.UserID, &post.Username, &post.CreatedAt); err != nil {
				log.Printf("Error scanning post row: %v", err)
				continue
			}
			posts = append(posts, post)
		}

		json.NewEncoder(w).Encode(posts)
	}
}

// createGetPostHandler returns a handler for GET /api/posts/{id}
func createGetPostHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		vars := mux.Vars(r)
		postID, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		var post Post
		err = db.QueryRow(`
            SELECT p.id, p.title, p.content, p.user_id, u.username, p.created_at 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = $1
        `, postID).Scan(&post.ID, &post.Title, &post.Content, &post.UserID, &post.Username, &post.CreatedAt)

		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Post not found", http.StatusNotFound)
			} else {
				log.Printf("Database error fetching post: %v", err)
				http.Error(w, "Failed to fetch post", http.StatusInternalServerError)
			}
			return
		}

		json.NewEncoder(w).Encode(post)
	}
}

// createCreatePostHandler returns a handler for POST /api/posts
func createCreatePostHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get username from authenticated user
		username := r.Header.Get("X-User")

		// Get user ID from username
		var userID int
		err := db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&userID)
		if err != nil {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}

		// Decode post data
		var post Post
		if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate post data
		if post.Title == "" || post.Content == "" {
			http.Error(w, "Title and content are required", http.StatusBadRequest)
			return
		}

		// Insert post to database
		err = db.QueryRow(`
            INSERT INTO posts (title, content, user_id) 
            VALUES ($1, $2, $3) 
            RETURNING id, created_at
        `, post.Title, post.Content, userID).Scan(&post.ID, &post.CreatedAt)

		if err != nil {
			log.Printf("Database error creating post: %v", err)
			http.Error(w, "Failed to create post", http.StatusInternalServerError)
			return
		}

		// Set the user information in the response
		post.UserID = userID
		post.Username = username

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(post)
	}
}

// createUpdatePostHandler returns a handler for PUT /api/posts/{id}
func createUpdatePostHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get username from authenticated user
		username := r.Header.Get("X-User")

		// Get post ID from URL
		vars := mux.Vars(r)
		postID, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		// Get user ID from username
		var userID int
		err = db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&userID)
		if err != nil {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}

		// Check if post exists and belongs to the user
		var postOwnerID int
		err = db.QueryRow("SELECT user_id FROM posts WHERE id = $1", postID).Scan(&postOwnerID)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Post not found", http.StatusNotFound)
			} else {
				log.Printf("Database error checking post: %v", err)
				http.Error(w, "Failed to fetch post", http.StatusInternalServerError)
			}
			return
		}

		// Verify ownership
		if postOwnerID != userID {
			http.Error(w, "You can only update your own posts", http.StatusForbidden)
			return
		}

		// Decode updated post data
		var post Post
		if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate post data
		if post.Title == "" || post.Content == "" {
			http.Error(w, "Title and content are required", http.StatusBadRequest)
			return
		}

		// Update post
		_, err = db.Exec(`
            UPDATE posts 
            SET title = $1, content = $2 
            WHERE id = $3
        `, post.Title, post.Content, postID)

		if err != nil {
			log.Printf("Database error updating post: %v", err)
			http.Error(w, "Failed to update post", http.StatusInternalServerError)
			return
		}

		// Get updated post with all fields
		err = db.QueryRow(`
            SELECT p.id, p.title, p.content, p.user_id, u.username, p.created_at 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = $1
        `, postID).Scan(&post.ID, &post.Title, &post.Content, &post.UserID, &post.Username, &post.CreatedAt)

		if err != nil {
			log.Printf("Database error fetching updated post: %v", err)
			// Still return success even if we couldn't fetch the updated post
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"message": "Post updated successfully"})
			return
		}

		json.NewEncoder(w).Encode(post)
	}
}

// createDeletePostHandler returns a handler for DELETE /api/posts/{id}
func createDeletePostHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get username from authenticated user
		username := r.Header.Get("X-User")

		// Get post ID from URL
		vars := mux.Vars(r)
		postID, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		// Get user ID from username
		var userID int
		err = db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&userID)
		if err != nil {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}

		// Check if post exists and belongs to the user
		var postOwnerID int
		err = db.QueryRow("SELECT user_id FROM posts WHERE id = $1", postID).Scan(&postOwnerID)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Post not found", http.StatusNotFound)
			} else {
				log.Printf("Database error checking post: %v", err)
				http.Error(w, "Failed to fetch post", http.StatusInternalServerError)
			}
			return
		}

		// Verify ownership
		if postOwnerID != userID {
			http.Error(w, "You can only delete your own posts", http.StatusForbidden)
			return
		}

		// Delete post
		_, err = db.Exec("DELETE FROM posts WHERE id = $1", postID)
		if err != nil {
			log.Printf("Database error deleting post: %v", err)
			http.Error(w, "Failed to delete post", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"message": "Post deleted successfully"})
	}
}
