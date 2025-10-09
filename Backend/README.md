# Backend Documentation 🚀

> Go REST API with PostgreSQL database and JWT authentication.

[![Go](https://img.shields.io/badge/Go-1.24+-00ADD8?style=flat&logo=go&logoColor=white)](https://go.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Gorilla Mux](https://img.shields.io/badge/Gorilla-Mux-00ADD8?style=flat&logo=go&logoColor=white)](https://github.com/gorilla/mux)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)

---

## 🎯 Overview

This is a RESTful API server built with Go that provides authentication services and post management functionality. The backend uses PostgreSQL for data persistence and implements JWT-based authentication for secure access to protected endpoints.

### Key Features

- ✅ **RESTful API Design** - Clean and consistent API structure
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **PostgreSQL Database** - Reliable relational database
- ✅ **Password Security** - bcrypt hashing for passwords
- ✅ **CORS Support** - Cross-origin resource sharing enabled
- ✅ **Modular Architecture** - Separated concerns for maintainability
- ✅ **Error Handling** - Comprehensive error responses

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Go** | 1.24+ | Backend programming language |
| **PostgreSQL** | 15+ | Relational database |
| **Gorilla Mux** | Latest | HTTP router and URL matcher |
| **JWT** | v5 | JSON Web Tokens for auth |
| **bcrypt** | Latest | Password hashing |
| **godotenv** | Latest | Environment variable management |

### Dependencies

```go
module github.com/yourusername/auth_wrapper

go 1.24

require (
    github.com/golang-jwt/jwt/v5 v5.2.1
    github.com/gorilla/mux v1.8.1
    github.com/joho/godotenv v1.5.1
    github.com/lib/pq v1.10.9
    golang.org/x/crypto v0.27.0
)
```

---

## 📁 Project Structure

```
Backend/
├── cmd/
│   └── server/
│       └── main.go             # 🚀 Application entry point
│
├── internal/
│   ├── api/
│   │   └── posts/
│   │       └── posts.go        # 📝 Posts API handlers
│   │
│   └── database/
│       └── db.sql              # 🗄️ Database schema
│
├── .env                        # 🔒 Environment variables (gitignored)
├── go.mod                      # 📦 Go module definition
└── go.sum                      # 🔐 Dependency checksums
```

### File Descriptions

#### `cmd/server/main.go`
Main application file containing:
- Server initialization
- Database connection
- Route configuration
- Authentication handlers
- Middleware setup

#### `internal/api/posts/posts.go`
Posts API module containing:
- CRUD operations for posts
- Database queries
- Handler factories
- Route registration

#### `internal/database/db.sql`
Database schema including:
- Users table
- Posts table
- Comments table (optional)
- Indexes and relationships

---

## 🚀 Installation

### Prerequisites

- **Go 1.24+** - [Download](https://go.dev/dl/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/auth_wrapper.git
   cd auth_wrapper/Backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   go mod verify
   ```

3. **Create environment file**
   
   Create a `.env` file in the Backend directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=auth_wrapper
   
   # JWT Secrets (use strong random strings)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   
   # Server Configuration
   PORT=8080
   ```

4. **Set up the database**
   ```bash
   # Create database and tables
   psql -U postgres -f internal/database/db.sql
   ```

5. **Run the server**
   ```bash
   go run cmd/server/main.go
   ```

   You should see:
   ```
   2024/10/09 12:00:00 Connecting to PostgreSQL...
   2024/10/09 12:00:00 Connected to PostgreSQL successfully!
   2024/10/09 12:00:00 Server running on :8080
   ```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | `localhost` | ✅ |
| `DB_PORT` | PostgreSQL port | `5432` | ✅ |
| `DB_USER` | Database username | `postgres` | ✅ |
| `DB_PASSWORD` | Database password | - | ✅ |
| `DB_NAME` | Database name | `auth_wrapper` | ✅ |
| `JWT_SECRET` | Secret for access tokens | - | ✅ |
| `REFRESH_SECRET` | Secret for refresh tokens | - | ✅ |
| `PORT` | Server port | `8080` | ❌ |

### CORS Configuration

The server is configured to accept requests from the frontend:

```go
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        next.ServeHTTP(w, r)
    })
}
```

**For production**, update the `Access-Control-Allow-Origin` to your frontend domain.

---

## 🗄️ Database Setup

### Database Schema

#### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Posts Table

```sql
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Comments Table (Optional)

```sql
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
```

### Database Initialization

The application automatically:
1. Creates the database if it doesn't exist
2. Creates all required tables
3. Sets up indexes for performance

---

## 📡 API Endpoints

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200 OK` - User registered successfully
- `400 Bad Request` - Invalid input or user already exists
- `500 Internal Server Error` - Server error

---

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200 OK` - Token refreshed successfully
- `401 Unauthorized` - Invalid refresh token
- `500 Internal Server Error` - Server error

---

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "username": "user@example.com"
}
```

**Status Codes:**
- `200 OK` - User data retrieved
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### Posts Endpoints

#### Get All Posts

```http
GET /api/posts
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "user_id": 1,
    "username": "user@example.com",
    "created_at": "2024-10-09T12:00:00Z"
  }
]
```

**Status Codes:**
- `200 OK` - Posts retrieved successfully
- `500 Internal Server Error` - Server error

---

#### Get Single Post

```http
GET /api/posts/{id}
```

**Response:**
```json
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "user_id": 1,
  "username": "user@example.com",
  "created_at": "2024-10-09T12:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Post retrieved successfully
- `404 Not Found` - Post not found
- `500 Internal Server Error` - Server error

---

#### Get User's Posts

```http
GET /api/posts/me
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "user_id": 1,
    "username": "user@example.com",
    "created_at": "2024-10-09T12:00:00Z"
  }
]
```

**Status Codes:**
- `200 OK` - Posts retrieved successfully
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

#### Create Post

```http
POST /api/posts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "My New Post",
  "content": "This is the content of my new post."
}
```

**Response:**
```json
{
  "id": 2,
  "title": "My New Post",
  "content": "This is the content of my new post.",
  "user_id": 1,
  "username": "user@example.com",
  "created_at": "2024-10-09T12:05:00Z"
}
```

**Status Codes:**
- `201 Created` - Post created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

#### Update Post

```http
PUT /api/posts/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content."
}
```

**Response:**
```json
{
  "id": 2,
  "title": "Updated Title",
  "content": "Updated content.",
  "user_id": 1,
  "username": "user@example.com",
  "created_at": "2024-10-09T12:05:00Z"
}
```

**Status Codes:**
- `200 OK` - Post updated successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not the post owner
- `404 Not Found` - Post not found
- `500 Internal Server Error` - Server error

---

#### Delete Post

```http
DELETE /api/posts/{id}
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Post deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Post deleted successfully
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not the post owner
- `404 Not Found` - Post not found
- `500 Internal Server Error` - Server error

---

## 🔐 Authentication

### JWT Token Structure

#### Access Token
- **Lifetime**: 15 minutes
- **Purpose**: Authenticate API requests
- **Claims**:
  ```json
  {
    "username": "user@example.com",
    "exp": 1696857600,
    "iat": 1696856700
  }
  ```

#### Refresh Token
- **Lifetime**: 24 hours
- **Purpose**: Obtain new access tokens
- **Claims**:
  ```json
  {
    "username": "user@example.com",
    "exp": 1696943100
  }
  ```

### Token Generation

```go
func GenerateTokens(username string) (string, string, error) {
    // Access token (short-lived)
    accessClaims := jwt.MapClaims{
        "username": username,
        "exp":      time.Now().Add(15 * time.Minute).Unix(),
        "iat":      time.Now().Unix(),
    }
    accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
    accessStr, err := accessToken.SignedString(jwtSecret)
    
    // Refresh token (longer-lived)
    refreshClaims := jwt.MapClaims{
        "username": username,
        "exp":      time.Now().Add(24 * time.Hour).Unix(),
    }
    refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
    refreshStr, err := refreshToken.SignedString(refreshSecret)
    
    return accessStr, refreshStr, nil
}
```

### Password Security

```go
// Hashing password
hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

// Verifying password
err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
```

---

## 🛡️ Middleware

### Authentication Middleware

Protects routes by validating JWT tokens:

```go
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

        // Attach username to request header
        username := claims["username"].(string)
        r.Header.Set("X-User", username)

        next.ServeHTTP(w, r)
    }
}
```

**Usage:**
```go
router.HandleFunc("/api/posts", AuthMiddleware(CreatePostHandler)).Methods("POST")
```

### CORS Middleware

Handles cross-origin requests:

```go
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        next.ServeHTTP(w, r)
    })
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| `200 OK` | Success | Successful GET, PUT, DELETE |
| `201 Created` | Resource created | Successful POST |
| `400 Bad Request` | Invalid input | Validation errors |
| `401 Unauthorized` | Authentication failed | Invalid/missing token |
| `403 Forbidden` | Access denied | Not authorized for resource |
| `404 Not Found` | Resource not found | Resource doesn't exist |
| `500 Internal Server Error` | Server error | Database/server errors |

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Logging

```go
// Log errors to console
log.Printf("Database error: %v", err)

// Return error to client
http.Error(w, "Failed to create post", http.StatusInternalServerError)
```

---

## 💻 Development

### Available Commands

```bash
# Run the server
go run cmd/server/main.go

# Build the application
go build -o server cmd/server/main.go

# Run with hot reload (using air)
air

# Format code
go fmt ./...

# Run tests
go test ./...

# Check for errors
go vet ./...

# Update dependencies
go get -u
go mod tidy
```

### Development Tools

#### Air (Hot Reload)

Install Air for automatic reloading during development:

```bash
go install github.com/cosmtrek/air@latest
```

Create `.air.toml`:
```toml
root = "."
tmp_dir = "tmp"

[build]
cmd = "go build -o ./tmp/main ./cmd/server"
bin = "tmp/main"
include_ext = ["go"]
exclude_dir = ["tmp", "vendor"]
delay = 1000
```

Run with:
```bash
air
```

### Project Layout Guidelines

```
Backend/
├── cmd/                    # Main applications
│   └── server/            # Server application
├── internal/              # Private application code
│   ├── api/              # API handlers
│   ├── models/           # Data models
│   ├── database/         # Database code
│   └── middleware/       # HTTP middleware
├── pkg/                  # Public libraries
└── configs/              # Configuration files
```

---

## 🚢 Deployment

### Build for Production

```bash
# Build optimized binary
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server cmd/server/main.go
```

### Environment Setup

1. **Set production environment variables**
2. **Configure PostgreSQL connection**
3. **Update CORS origin**
4. **Use strong JWT secrets**

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=builder /app/server .
COPY --from=builder /app/.env .

EXPOSE 8080
CMD ["./server"]
```

Build and run:
```bash
docker build -t auth-wrapper-backend .
docker run -p 8080:8080 auth-wrapper-backend
```

### Cloud Deployment Options

- **Heroku**: Easy deployment with buildpacks
- **AWS EC2**: Full control over infrastructure
- **Google Cloud Run**: Serverless container deployment
- **DigitalOcean App Platform**: Simple PaaS deployment

---

## 🧪 Testing

### Manual Testing with curl

```bash
# Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"Test123!"}'

# Create post
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Post","content":"Test content"}'

# Get all posts
curl http://localhost:8080/api/posts
```

### Testing Checklist

- [ ] User registration works
- [ ] User login returns tokens
- [ ] Protected routes reject unauthenticated requests
- [ ] Token refresh works
- [ ] Post creation requires authentication
- [ ] Users can only edit/delete their own posts
- [ ] Database constraints work (unique usernames, etc.)
- [ ] CORS headers are correct
- [ ] Error messages are informative

---

## 📝 Best Practices

### Security

✅ **DO:**
- Use environment variables for secrets
- Hash passwords with bcrypt
- Validate all user input
- Use HTTPS in production
- Implement rate limiting
- Log security events

❌ **DON'T:**
- Store passwords in plain text
- Commit .env files to git
- Use weak JWT secrets
- Ignore SQL injection risks
- Return detailed error messages to clients

### Code Quality

✅ **DO:**
- Write clear, descriptive function names
- Add comments for complex logic
- Use consistent error handling
- Keep functions small and focused
- Follow Go conventions

❌ **DON'T:**
- Ignore errors
- Use global variables excessively
- Write deeply nested code
- Mix business logic with handlers

---

## 📚 Additional Resources

- [Go Documentation](https://go.dev/doc/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Gorilla Mux Documentation](https://github.com/gorilla/mux)
- [JWT.io](https://jwt.io/)
- [Go by Example](https://gobyexample.com/)

---

## 🤝 Contributing

When contributing to the backend:

1. Follow Go coding standards
2. Add appropriate error handling
3. Write unit tests for new features
4. Update API documentation
5. Test with PostgreSQL

---