# Auth Wrapper 🔐

> A full-stack web application demonstrating secure JWT authentication and blog-like post management.

[![Go](https://img.shields.io/badge/Go-1.24+-00ADD8?style=flat&logo=go&logoColor=white)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0+-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)

---

## 🎯 Overview

Auth Wrapper is a production-ready authentication and content management system built with:

- **Backend**: Go API with PostgreSQL database
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Authentication**: JWT-based secure authentication system
- **Features**: User registration, login, post creation, and management

---

## ✨ Features

### 🔐 Authentication System

- ✅ User registration and login
- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Password hashing with bcrypt
- ✅ Protected routes and middleware
- ✅ Session management
- ✅ Password reset functionality

### 📝 Post Management

- ✅ Create, read, update, and delete posts
- ✅ Public post listings
- ✅ Personal post dashboard
- ✅ Post ownership verification
- ✅ Rich text content support

### 🎨 User Experience

- ✅ Responsive design (mobile & desktop)
- ✅ Form validation with Zod
- ✅ Loading states and animations
- ✅ Error handling and user feedback
- ✅ Clean and modern UI with Tailwind CSS

---

## 🛠️ Technology Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Go 1.24+** | Backend programming language |
| **Gorilla Mux** | HTTP router and URL matcher |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |

**Key Dependencies:**
```go
github.com/golang-jwt/jwt/v5
github.com/gorilla/mux
github.com/joho/godotenv
github.com/lib/pq
golang.org/x/crypto/bcrypt
```

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **React Hook Form** | Form management |
| **Zod** | Schema validation |
| **Framer Motion** | Animation library |

---

## 📁 Project Structure

## 📁 Project Structure

```
auth_wrapper/
├── Backend/                    # Go Backend API
│   ├── cmd/
│   │   └── server/
│   │       └── main.go         # 🚀 Main backend entry point
│   ├── internal/
│   │   ├── api/
│   │   │   └── posts/          # 📝 Posts API handlers
│   │   │       └── posts.go
│   │   └── database/
│   │       └── db.sql          # 🗄️ Database schema
│   └── go.mod                  # Go module dependencies
│
└── Frontend/                   # Next.js Frontend
    ├── app/                    # Next.js application routes
    │   ├── auth/               # 🔐 Authentication pages
    │   │   ├── sign-in/
    │   │   ├── sign-up/
    │   │   └── forgot-password/
    │   ├── content/            # 📄 Content pages
    │   │   ├── home/
    │   │   ├── features/
    │   │   └── docs/
    │   ├── posts/              # 📝 Post-related pages
    │   │   ├── create/
    │   │   ├── [id]/
    │   │   ├── [id]/edit/
    │   │   └── my-posts/
    │   ├── user/               # 👤 User-related pages
    │   │   └── profile/
    │   ├── layout.tsx          # Root layout component
    │   └── page.tsx            # Home page
    ├── components/             # ♻️ Reusable React components
    ├── context/                # 🔄 React context providers
    ├── hooks/                  # 🪝 Custom React hooks
    ├── lib/                    # 📚 Utility libraries
    │   └── validation.ts       # Form validation schemas
    └── utils/                  # 🛠️ Utility functions
        └── auth.tsx            # Authentication utilities
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Go 1.24+** - [Download](https://go.dev/dl/)
- ✅ **Node.js 20+** - [Download](https://nodejs.org/)
- ✅ **PostgreSQL** - [Download](https://www.postgresql.org/download/)
- ✅ **Git** - [Download](https://git-scm.com/)

### 🔧 Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/auth_wrapper.git
   cd auth_wrapper
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the `Backend` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=auth_wrapper
   JWT_SECRET=your_jwt_secret_here
   REFRESH_SECRET=your_refresh_secret_here
   PORT=8080
   ```

3. **Initialize the database**
   ```bash
   psql -U postgres -f Backend/internal/database/db.sql
   ```

4. **Install dependencies and run**
   ```bash
   cd Backend
   go mod tidy
   go run cmd/server/main.go
   ```

   You should see:
   ```
   ✅ Connected to PostgreSQL successfully!
   🚀 Server running on :8080
   ```

### 💻 Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📡 API Documentation

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/auth/register` | `POST` | Register a new user | ❌ |
| `/api/auth/login` | `POST` | Log in a user | ❌ |
| `/api/auth/refresh` | `POST` | Refresh access token | ❌ |
| `/api/auth/me` | `GET` | Get current user data | ✅ |

**Example: Register a user**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Posts Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/posts` | `GET` | Get all posts | ❌ |
| `/api/posts/{id}` | `GET` | Get a specific post | ❌ |
| `/api/posts/me` | `GET` | Get current user's posts | ✅ |
| `/api/posts` | `POST` | Create a new post | ✅ |
| `/api/posts/{id}` | `PUT` | Update a post | ✅ |
| `/api/posts/{id}` | `DELETE` | Delete a post | ✅ |

**Example: Create a post**
```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post."
  }'
```

---

## 🗺️ Frontend Routes

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/content/home` | Home content page |
| `/content/features` | Features page |
| `/content/docs` | Documentation page |
| `/posts` | All posts listing |
| `/posts/{id}` | Single post view |
| `/auth/sign-in` | Login page |
| `/auth/sign-up` | Registration page |
| `/auth/forgot-password` | Password reset request |

### Protected Routes (Require Authentication)

| Route | Description |
|-------|-------------|
| `/user/profile` | User profile page |
| `/posts/create` | Create post page |
| `/posts/my-posts` | Current user's posts |
| `/posts/{id}/edit` | Edit post page |

---

## 🔒 Security

### Password Security
- ✅ Passwords are hashed with **bcrypt** before storage
- ✅ Password requirements enforce strong passwords
- ✅ No plain-text passwords stored

### JWT Implementation
- ✅ Short-lived access tokens (15 minutes)
- ✅ Longer-lived refresh tokens (24 hours)
- ✅ Separate secrets for access and refresh tokens
- ✅ Token validation on all protected routes

### Authorization
- ✅ Users can only modify their own posts
- ✅ Ownership verification on update/delete operations
- ✅ Middleware-based route protection

---

## 🚢 Deployment

### Backend Deployment

1. **Build the application**
   ```bash
   cd Backend
   go build -o server cmd/server/main.go
   ```

2. **Run the server**
   ```bash
   ./server
   ```

### Frontend Deployment

Deploy to **Vercel** (recommended):

```bash
cd Frontend
npm run build
```

Or deploy to any platform that supports Next.js applications.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@husen004](https://github.com/husen004)

---

## 🙏 Acknowledgments

- [Go](https://go.dev/)
- [Next.js](https://nextjs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---