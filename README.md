# CRUD Notes App

A complete, beginner-friendly full-stack web application demonstrating **CRUD operations**, **JWT Authentication**, and **MVC architecture** using Node.js, Express.js, PostgreSQL, and Sequelize ORM.

---

## Project Overview

This is an educational project that covers the full lifecycle of building a modern web application:

- **Backend API** using Node.js + Express.js (REST API)
- **Database** using PostgreSQL with Sequelize ORM
- **Authentication** using JWT (JSON Web Tokens) + bcrypt password hashing
- **Frontend** using plain HTML, CSS, and Vanilla JavaScript (fetch API)
- **Architecture** using the MVC (Model-View-Controller) pattern

Users can register, log in, and manage their own personal notes (create, read, update, delete). Each user only sees their own data.

---

## Features

-  User Registration with validation
-  User Login with JWT token generation
-  Password hashing with bcrypt
-  Protected API routes (JWT middleware)
-  Full CRUD for Notes: Create, Read, Update, Delete
-  User-scoped data (users only access their own notes)
-  Logout (clears token from localStorage)
-  Token persistence (stays logged in on page refresh)
-  Input validation (both client-side and server-side)
-  Clean error messages
-  MVC architecture

---

##  Folder Structure

```
project/
│
├── config/
│   └── database.js          # Sequelize PostgreSQL connection
│
├── controllers/
│   ├── authController.js    # Register, Login, GetMe logic
│   └── itemController.js    # CRUD operations for notes
│
├── middleware/
│   ├── authMiddleware.js    # JWT verification middleware
│   └── validationMiddleware.js  # Input validation middleware
│
├── models/
│   ├── User.js              # User Sequelize model (with bcrypt hooks)
│   └── Item.js              # Item Sequelize model (with userId FK)
│
├── routes/
│   ├── authRoutes.js        # Auth API routes (/api/auth/...)
│   └── itemRoutes.js        # Item API routes (/api/items/...)
│
├── public/
│   ├── css/
│   │   └── style.css        # All CSS styles
│   ├── js/
│   │   ├── login.js         # Login page JavaScript
│   │   ├── register.js      # Register page JavaScript
│   │   └── dashboard.js     # Dashboard JavaScript (CRUD)
│   └── index.html           # Root redirect
│
├── views/
│   ├── login.html           # Login page
│   ├── register.html        # Register page
│   └── dashboard.html       # Dashboard page
│
├── utils/
│   └── jwt.js               # JWT generate & verify helpers
│
├── .env                     # Environment variables (DO NOT COMMIT)
├── .gitignore
├── package.json
├── app.js                   # Express app configuration
├── server.js                # Entry point: DB connect + server start
└── README.md
```

---

##  Installation

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v13 or higher)
- npm (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd project-name
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`:
- `express` — Web framework
- `sequelize` — ORM for PostgreSQL
- `pg` + `pg-hstore` — PostgreSQL driver
- `jsonwebtoken` — JWT creation and verification
- `bcryptjs` — Password hashing
- `dotenv` — Environment variable loading
- `cors` — Cross-Origin Resource Sharing
- `nodemon` (dev) — Auto-restart on file changes

---

##  PostgreSQL Setup

### Step 1: Start PostgreSQL

```bash
# On Linux (Ubuntu/Debian):
sudo service postgresql start

# On macOS (using Homebrew):
brew services start postgresql

# On Windows:
# Start via Services or pgAdmin
```

### Step 2: Create the Database

```bash
# Option A: Using psql CLI
psql -U postgres
CREATE DATABASE crud_db;
\q

# Option B: Using the createdb command
createdb -U postgres crud_db
```

> **Note**: Sequelize will automatically create the `Users` and `Items` **tables** when you start the server (via `sequelize.sync()`). You only need to create the **database** manually.

---

##  Environment Configuration

Open the `.env` file and update the values to match your setup:

```env
# Server
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crud_db
DB_USER=postgres
DB_PASSWORD=your_actual_password_here   # ← CHANGE THIS

# JWT
JWT_SECRET=your_super_secret_key_here   # ← CHANGE THIS (use a long random string)
JWT_EXPIRES_IN=24h

# bcrypt
BCRYPT_SALT_ROUNDS=10
```

>  **Security**: Never commit the `.env` file to Git. It's already in `.gitignore`.

---

## Running the Project

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Once running, open your browser and visit:

```
http://localhost:3000
```

You'll be redirected to the **login page** automatically.

---

##  API Endpoints

### Authentication

| Method | Endpoint              | Access | Description                          |
|--------|-----------------------|--------|--------------------------------------|
| POST   | `/api/auth/register`  | Public | Register a new user                  |
| POST   | `/api/auth/login`     | Public | Login and receive a JWT token        |
| GET    | `/api/auth/me`        |    JWT | Get current logged-in user info      |

### Items (Notes/Tasks)

| Method | Endpoint          | Access | Description                          |
|--------|-------------------|--------|--------------------------------------|
| GET    | `/api/items`      |    JWT | Get all items for the logged-in user |
| GET    | `/api/items/:id`  |    JWT | Get a single item by ID              |
| POST   | `/api/items`      |    JWT | Create a new item                    |
| PUT    | `/api/items/:id`  |    JWT | Update an existing item              |
| DELETE | `/api/items/:id`  |    JWT | Delete an item                       |

> ** JWT** routes require the `Authorization: Bearer <token>` header.

### Example API Request (using curl)

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"John","email":"john@example.com","password":"pass1234"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass1234"}'

# Create a note (replace YOUR_TOKEN with the token from login response)
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"My First Note","description":"Hello world!"}'

# Get all notes
curl http://localhost:3000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

##  Authentication Flow

```
1. User fills Register form
        ↓
2. POST /api/auth/register (with username, email, password)
        ↓
3. Server validates input → hashes password → saves to DB
        ↓
4. Server generates JWT token (contains user.id)
        ↓
5. Frontend receives token → saves to localStorage
        ↓
6. Redirect to /dashboard
        ↓
7. Every API request includes: Authorization: Bearer <token>
        ↓
8. authMiddleware verifies token → extracts user.id → sets req.user
        ↓
9. Controller uses req.user.id to scope DB queries to that user only
        ↓
10. Logout: localStorage.removeItem('token') → redirect to /login
```

---

##  Database Schema

### Users Table

| Column    | Type         | Constraints              |
|-----------|--------------|--------------------------|
| id        | INTEGER      | Primary Key, Auto Increment |
| username  | VARCHAR(255) | NOT NULL                 |
| email     | VARCHAR(255) | NOT NULL, UNIQUE         |
| password  | VARCHAR(255) | NOT NULL (bcrypt hash)   |
| createdAt | TIMESTAMP    | Auto-managed             |
| updatedAt | TIMESTAMP    | Auto-managed             |

### Items Table

| Column      | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | INTEGER      | Primary Key, Auto Increment    |
| title       | VARCHAR(255) | NOT NULL                       |
| description | TEXT         | Nullable                       |
| userId      | INTEGER      | Foreign Key → Users.id         |
| createdAt   | TIMESTAMP    | Auto-managed                   |
| updatedAt   | TIMESTAMP    | Auto-managed                   |

**Relationship**: One User → Many Items (One-to-Many)

---

##  Common Errors & Solutions

###  `SequelizeConnectionRefusedError: connect ECONNREFUSED`
**Cause**: PostgreSQL is not running.  
**Fix**: Start PostgreSQL: `sudo service postgresql start`

###  `password authentication failed for user "postgres"`
**Cause**: Wrong password in `.env`.  
**Fix**: Update `DB_PASSWORD` in `.env` with your correct PostgreSQL password.

###  `database "crud_db" does not exist`
**Cause**: The database hasn't been created yet.  
**Fix**: Run `createdb -U postgres crud_db`

###  `Error: JWT_SECRET is not defined`
**Cause**: `.env` file is missing or not loaded.  
**Fix**: Make sure `.env` exists in the project root and has `JWT_SECRET` set.

###  `Cannot GET /api/items` returns 401
**Cause**: Missing or expired JWT token.  
**Fix**: Log in again to get a fresh token. Include `Authorization: Bearer <token>` in the request.

###  `nodemon` not found
**Cause**: Dev dependencies not installed.  
**Fix**: Run `npm install`

---

##  Key Concepts Covered

| Concept | Where to Look |
|---------|---------------|
| Sequelize ORM | `config/database.js`, `models/` |
| Model Hooks (bcrypt) | `models/User.js` - `beforeCreate` |
| JWT creation | `utils/jwt.js` - `generateToken` |
| JWT verification | `middleware/authMiddleware.js` |
| Protected routes | `routes/itemRoutes.js` |
| Controller pattern | `controllers/` |
| fetch() API | `public/js/login.js`, `dashboard.js` |
| localStorage | `public/js/login.js`, `dashboard.js` |
| One-to-Many relationship | `server.js` - `User.hasMany(Item)` |
| XSS prevention | `public/js/dashboard.js` - `escapeHtml()` |

---

