# Frontend Documentation 🎨

> Next.js 15 frontend application with TypeScript, Tailwind CSS, and JWT authentication.

[![Next.js](https://img.shields.io/badge/Next.js-15.0+-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-7.0+-EC5990?style=flat&logo=react-hook-form&logoColor=white)](https://react-hook-form.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Application Routes](#application-routes)
- [Components](#components)
- [Hooks](#hooks)
- [Context & State Management](#context--state-management)
- [Form Validation](#form-validation)
- [Authentication Flow](#authentication-flow)
- [Styling Guide](#styling-guide)
- [Development](#development)
- [Building for Production](#building-for-production)

---

## 🎯 Overview

This is a modern Next.js frontend application built with the App Router architecture. It provides a complete user authentication system and post management interface with a focus on user experience, type safety, and responsive design.

### Key Features

- ✅ **Next.js 15 App Router** - Modern routing with React Server Components
- ✅ **TypeScript** - Full type safety across the application
- ✅ **Tailwind CSS** - Utility-first styling with custom configuration
- ✅ **React Hook Form + Zod** - Powerful form handling with schema validation
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Framer Motion** - Smooth animations and transitions

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.0+ | React framework with App Router |
| **React** | 19.0+ | UI library |
| **TypeScript** | 5.0+ | Type safety |
| **Tailwind CSS** | 3.4+ | Styling |
| **React Hook Form** | 7.53+ | Form management |
| **Zod** | 3.23+ | Schema validation |
| **Framer Motion** | 11.11+ | Animations |

### Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.53.2",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.23.8",
    "framer-motion": "^11.11.17"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.18",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.3"
  }
}
```

---

## 📁 Project Structure

```
Frontend/
├── app/                        # Next.js App Router
│   ├── auth/                   # 🔐 Authentication pages
│   │   ├── sign-in/
│   │   │   └── page.tsx        # Login page
│   │   ├── sign-up/
│   │   │   └── page.tsx        # Registration page
│   │   └── forgot-password/
│   │       └── page.tsx        # Password reset page
│   │
│   ├── content/                # 📄 Static content pages
│   │   ├── home/
│   │   │   └── page.tsx
│   │   ├── features/
│   │   │   └── page.tsx
│   │   └── docs/
│   │       └── page.tsx
│   │
│   ├── posts/                  # 📝 Post management
│   │   ├── page.tsx            # All posts listing
│   │   ├── create/
│   │   │   └── page.tsx        # Create post form
│   │   ├── my-posts/
│   │   │   └── page.tsx        # User's posts
│   │   └── [id]/
│   │       ├── page.tsx        # Single post view
│   │       └── edit/
│   │           └── page.tsx    # Edit post form
│   │
│   ├── user/                   # 👤 User pages
│   │   └── profile/
│   │       └── page.tsx        # User profile
│   │
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   └── favicon.ico             # Favicon
│
├── components/                 # ♻️ Reusable components
│   ├── Navbar.tsx              # Navigation bar
│   ├── PostList.tsx            # Post listing component
│   └── Home.tsx                # Home page component
│
├── context/                    # 🔄 React Context
│   └── AuthContext.tsx         # Authentication context
│
├── hooks/                      # 🪝 Custom React hooks
│   └── useAuth.tsx             # Authentication hook
│
├── lib/                        # 📚 Libraries & utilities
│   └── validation.ts           # Zod validation schemas
│
├── utils/                      # 🛠️ Utility functions
│   └── auth.tsx                # Auth helper functions
│
├── public/                     # 📦 Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
├── postcss.config.mjs          # PostCSS config
├── next.config.ts              # Next.js config
└── eslint.config.mjs           # ESLint config
```

---

## 🚀 Installation

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Setup Steps

1. **Navigate to the Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   
   Create a `.env.local` file in the Frontend root:
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

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Optional: Analytics, etc.
# NEXT_PUBLIC_GA_ID=your-ga-id
```

### Next.js Configuration

The `next.config.ts` file contains Next.js configuration:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Add custom webpack config if needed
};

export default nextConfig;
```

### Tailwind Configuration

The `tailwind.config.ts` contains custom theme settings:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom colors, fonts, etc.
    },
  },
  plugins: [],
};

export default config;
```

---

## 🗺️ Application Routes

### Public Routes (No Authentication Required)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing/Home page |
| `/content/home` | `app/content/home/page.tsx` | Home content |
| `/content/features` | `app/content/features/page.tsx` | Features showcase |
| `/content/docs` | `app/content/docs/page.tsx` | Documentation |
| `/posts` | `app/posts/page.tsx` | All posts listing |
| `/posts/[id]` | `app/posts/[id]/page.tsx` | Single post view |
| `/auth/sign-in` | `app/auth/sign-in/page.tsx` | Login page |
| `/auth/sign-up` | `app/auth/sign-up/page.tsx` | Registration page |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | Password reset |

### Protected Routes (Authentication Required)

| Route | File | Description |
|-------|------|-------------|
| `/user/profile` | `app/user/profile/page.tsx` | User profile |
| `/posts/create` | `app/posts/create/page.tsx` | Create new post |
| `/posts/my-posts` | `app/posts/my-posts/page.tsx` | User's posts |
| `/posts/[id]/edit` | `app/posts/[id]/edit/page.tsx` | Edit post |

---

## 🧩 Components

### Navbar Component

**Location:** `components/Navbar.tsx`

Navigation bar that adapts based on authentication state.

```tsx
import { useAuth } from '@/hooks/useAuth';

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <nav className="w-full bg-white shadow sticky top-0 z-50">
      {/* Navigation content */}
    </nav>
  );
};
```

**Features:**
- Responsive design
- Conditional rendering based on auth state
- Sticky positioning
- Mobile menu support

### PostList Component

**Location:** `components/PostList.tsx`

Reusable component for displaying lists of posts.

```tsx
interface PostListProps {
  endpoint?: string;
  emptyMessage?: string;
  showActions?: boolean;
  onDeleteSuccess?: () => void;
}

export default function PostList({
  endpoint = '/api/posts',
  emptyMessage = 'No posts available',
  showActions = false,
  onDeleteSuccess,
}: PostListProps) {
  // Component logic
}
```

**Props:**
- `endpoint`: API endpoint to fetch posts from
- `emptyMessage`: Message shown when no posts exist
- `showActions`: Show edit/delete buttons
- `onDeleteSuccess`: Callback after successful deletion

**Features:**
- Customizable endpoint
- Loading states
- Error handling
- Empty state handling
- Post card layout
- Optional action buttons

---

## 🪝 Hooks

### useAuth Hook

**Location:** `hooks/useAuth.tsx`

Custom hook for managing authentication state.

```typescript
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    checkAuth();
    
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return { isAuthenticated };
}
```

**Features:**
- Reactive to auth changes
- Multi-tab synchronization
- localStorage monitoring
- Custom event handling

**Usage:**
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? <LoggedInView /> : <LoggedOutView />}
    </div>
  );
}
```

---

## 🔄 Context & State Management

### AuthContext

**Location:** `context/AuthContext.tsx`

React Context for global authentication state management.

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Usage:**
```tsx
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { isAuthenticated, login, logout } = useAuth();
  // Use auth methods
}
```

---

## ✅ Form Validation

### Validation Schemas

**Location:** `lib/validation.ts`

Zod schemas for form validation.

```typescript
import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Registration schema
export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Post schema
export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
});

export type PostFormValues = z.infer<typeof postSchema>;
```

### Using Validation with React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/lib/validation';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Form is validated automatically
    // Handle login logic
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      {/* More fields */}
    </form>
  );
}
```

---

## 🔐 Authentication Flow

### 1. User Registration

```typescript
// In sign-up page
const onSubmit = async (data: RegisterFormValues) => {
  const response = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: data.email,
      password: data.password,
    }),
  });

  const responseData = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', responseData.access_token);
  localStorage.setItem('refresh_token', responseData.refresh_token);
  
  // Dispatch auth change event
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  
  // Redirect to profile
  router.push('/user/profile');
};
```

### 2. User Login

```typescript
// In sign-in page
const onSubmit = async (data: LoginFormValues) => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: data.email,
      password: data.password,
    }),
  });

  const responseData = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', responseData.access_token);
  localStorage.setItem('refresh_token', responseData.refresh_token);
  
  // Trigger auth change
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  
  router.push('/user/profile');
};
```

### 3. Making Authenticated Requests

```typescript
const token = localStorage.getItem('access_token');

const response = await fetch(`${API_BASE_URL}/api/posts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(postData),
});
```

### 4. Logout

```typescript
import { logout } from '@/utils/auth';

const handleLogout = () => {
  logout(); // Clears tokens and dispatches event
  router.push('/auth/sign-in');
};
```

### 5. Route Protection

```typescript
// In protected pages
useEffect(() => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    router.push('/auth/sign-in');
  }
}, [router]);
```

---

## 🎨 Styling Guide

### Tailwind CSS Usage

This project uses Tailwind CSS for styling. Here are common patterns:

#### Layout
```tsx
<div className="container mx-auto px-4 py-8 max-w-4xl">
  {/* Content */}
</div>
```

#### Buttons
```tsx
// Primary button
<button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
  Click me
</button>

// Secondary button
<button className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-md">
  Click me
</button>
```

#### Forms
```tsx
<input
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
/>
```

#### Cards
```tsx
<div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
  {/* Card content */}
</div>
```

### Global Styles

**Location:** `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
body {
  @apply bg-gray-50 text-gray-900;
}
```

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check
```

### Development Tips

1. **Hot Reload**: Changes are automatically reflected in the browser
2. **TypeScript**: Use TypeScript for all new components
3. **Linting**: Run `npm run lint` before committing
4. **Component Structure**: Keep components small and focused
5. **State Management**: Use hooks for local state, Context for global state

### Debugging

```typescript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

---

## 🏗️ Building for Production

### Build the Application

```bash
npm run build
```

This creates an optimized production build in the `.next` folder.

### Test Production Build Locally

```bash
npm run build
npm start
```

### Environment Variables for Production

Create a `.env.production` file:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-production-api.com
```

### Deployment Options

#### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

#### Other Platforms

- **Netlify**: Supports Next.js
- **AWS Amplify**: Full AWS integration
- **Docker**: Use official Next.js Docker image
- **Custom Server**: Use `npm start` after build

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Protected routes redirect when not authenticated
- [ ] Navbar updates on login/logout
- [ ] Post creation works
- [ ] Post editing works (owner only)
- [ ] Post deletion works (owner only)
- [ ] Form validation shows errors
- [ ] Responsive design works on mobile
- [ ] Loading states display correctly

---

## 📝 Best Practices

### Code Organization

✅ **DO:**
- Keep components small and reusable
- Use TypeScript for type safety
- Extract common logic into custom hooks
- Use meaningful variable names

❌ **DON'T:**
- Put business logic in components
- Use `any` type in TypeScript
- Repeat code (DRY principle)
- Ignore TypeScript errors

### Performance

- Use `'use client'` only when needed
- Implement loading states
- Optimize images with Next.js Image component
- Lazy load heavy components

### Security

- Never store sensitive data in localStorage (only tokens)
- Always validate user input
- Use environment variables for API URLs
- Implement CSRF protection for forms

---

## 🤝 Contributing

When contributing to the frontend:

1. Follow the existing code style
2. Use TypeScript strictly
3. Add proper types for all functions/components
4. Test your changes thoroughly
5. Update documentation if needed

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

---

