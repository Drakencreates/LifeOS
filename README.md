<<<<<<< HEAD
# LifeOS — Your Personal Life Operating System

> **Phase 1 & Phase 2 Complete:** Project foundation, modern SaaS design system, responsive shell layout, navigation, reusable UI library, 9 frontend pages, and **complete full-stack Authentication (Phase 2)** with Node.js, Express, Prisma, bcrypt, and JWT.

---

## 🚀 Overview

**LifeOS** is an intelligent personal operating system designed to log, organize, and visualize your life journey — including life events, academic milestones, memories, goals, documents, and credentials — connected through a chronological timeline.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (JavaScript / JSX)
- **Tooling**: Vite 8 & Node.js
- **Routing**: React Router (`react-router-dom` v7)
- **Styling**: Tailwind CSS (`@tailwindcss/vite` v4)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Visualizations**: Recharts
- **HTTP Client**: Axios

### Backend & Database (Phase 2)
- **Runtime**: Node.js & Express
- **ORM**: Prisma ORM (configured for PostgreSQL compatibility with seamless SQLite local development)
- **Security**: `bcryptjs` (password hashing with 10 salt rounds)
- **Session**: `jsonwebtoken` (JWT Bearer authentication)
- **CORS**: Configured with credentials & headers support

---

## 🔐 Authentication Architecture (Phase 2)

### Backend API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registers a new user with hashed password & returns JWT | No |
| `POST` | `/api/auth/login` | Authenticates user credentials & returns JWT (`rememberMe` supported) | No |
| `POST` | `/api/auth/logout` | Terminates session | No |
| `GET` | `/api/auth/me` | Validates JWT Bearer token and returns authenticated user | Yes (`Bearer <token>`) |
| `GET` | `/api/health` | Health check and server status | No |

### User Model Schema
```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  password     String   // Hashed with bcrypt, never returned in plaintext
  profileImage String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Frontend Authentication Flow
- **`AuthContext` & `useAuth()`**: Centralized reactive authentication state (`user`, `token`, `isAuthenticated`, `isLoading`, `error`).
- **`ProtectedRoute`**: Protects all 9 application pages (`/`, `/timeline`, `/events`, `/memories`, `/goals`, `/documents`, `/search`, `/profile`, `/settings`). Unauthenticated users are redirected to `/login` with return location state preserved.
- **`PublicRoute`**: Prevents authenticated users from viewing `/login` or `/register`, redirecting them to `/`.
- **`authService` & Axios Interceptors**:
  - Automatically attaches `Authorization: Bearer <token>` to outgoing requests.
  - Automatically catches 401 Unauthorized errors and cleans up expired sessions.
- **Persistent Sessions**: Refreshing the browser preserves authentication by verifying the stored JWT against `/api/auth/me`.

---

## 🏃 Running the Application

### 1. Start the Backend API Server
```bash
npm run server
# Starts Express server on http://localhost:5000
```

### 2. Start the Frontend Dev Server
```bash
npm run dev
# Starts Vite on http://localhost:5173 with automated /api proxy to port 5000
```

### 3. Run Automated Auth Test Suite
```bash
node server/test-auth.js
```

---

## 🔑 Demo Account Credentials
- **Email**: `alex.dev@lifeos.io`
- **Password**: `LifeOS2026!`
*(Or click the "Use Demo Account" button on the login screen for 1-click prefill)*
=======
# LifeOS
>>>>>>> 689b3e610d149b5ac76586851d3ed3d7520a247a
