# Sorteador Inteligente de Pelada

## Overview

This is a soccer team generator application that creates balanced teams using an intelligent "Snake Algorithm" for fair distribution. The system includes JWT-based authentication, player management with skill levels (1-5 stars), and persistent storage. Users can manage players, mark absences, and generate balanced team lineups. The application supports both authenticated mode (with PostgreSQL sync) and offline mode (localStorage) for unauthenticated users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with Vite as the build tool
- Pure CSS with gradient styling (no UI frameworks)
- JSX for component structure
- Native Fetch API for HTTP requests

**Design Decisions:**
- Single-page application (SPA) architecture
- Component-based structure using React functional components
- Client-side state management without external libraries
- Dual-mode operation: authenticated (syncs with backend) vs offline (localStorage)
- Visual design uses purple gradient theme (#667eea to #764ba2)

**Key Features:**
- Login modal/popup system (non-intrusive UI)
- Player level system (1-5 stars) for team balancing
- Snake Algorithm for intelligent team distribution
- Copy functionality that excludes star symbols from clipboard
- Presence management (mark absent vs permanent delete)

### Backend Architecture

**Technology Stack:**
- Vercel Serverless Functions (API routes)
- Node.js with ES modules
- Express.js framework dependencies
- JWT for authentication tokens
- bcryptjs for password hashing

**API Structure:**
```
/api/index.js          - Health check endpoint
/api/login.js          - POST: Authentication endpoint
/api/players/[userId].js - GET: Fetch user's players
/api/players/index.js    - POST: Create new player
/api/players/update/[id].js - PATCH: Update presence, DELETE: Remove player
```

**Authentication Flow:**
- JWT tokens with 7-day expiration
- Bearer token authentication on protected routes
- Middleware-based authorization (requireAuth wrapper)
- User ownership verification on player operations

**Design Decisions:**
- Serverless architecture chosen for scalability and zero-config deployment
- File-based routing using Vercel conventions
- Middleware pattern for authentication to avoid code duplication
- Session secret can be configured via environment variable (SESSION_SECRET)

### Data Storage

**Database:**
- PostgreSQL hosted on Neon
- Connection pooling via pg library
- SSL enabled with `rejectUnauthorized: false`

**Schema Structure:**

**Users Table:**
- id (primary key)
- email (unique)
- password (bcrypt hashed)

**Players Table:**
- id (primary key)
- user_id (foreign key to users)
- name (player name)
- level (integer, 1-5 skill rating)
- present (boolean, marks if player is available)

**Design Decisions:**
- User-player relationship is one-to-many
- Soft delete pattern using `present` flag for absence marking
- Hard delete available via DELETE endpoint for permanent removal
- Level-based system (1-5) allows for flexible team balancing algorithms
- Database connection uses environment variable for security

**Fallback Storage:**
- localStorage used when user is not authenticated
- Allows testing and usage without backend dependency
- Data not persisted across devices in offline mode

### External Dependencies

**Database Service:**
- Neon PostgreSQL (cloud-hosted)
- Connection via DATABASE_URL environment variable
- SSL/TLS encryption required
- Connection string format: `postgresql://user:pass@host/db?sslmode=require`

**Third-Party NPM Packages:**

**Production:**
- `bcryptjs` ^3.0.2 - Password hashing and verification
- `cookie` ^1.0.2 - Cookie parsing utilities
- `cors` ^2.8.5 - Cross-origin resource sharing
- `dotenv` ^17.2.3 - Environment variable management
- `express` ^5.1.0 - Web framework (for local dev, not used in Vercel functions directly)
- `jsonwebtoken` ^9.0.2 - JWT token generation and validation
- `pg` ^8.16.3 - PostgreSQL client

**Development:**
- `react` ^18.2.0 - UI library
- `react-dom` ^18.2.0 - React DOM renderer
- `vite` ^5.0.0 - Build tool and dev server
- `@vitejs/plugin-react` ^4.2.0 - React plugin for Vite
- `typescript` ^5.2.2 - Type definitions (project uses JSX, not full TypeScript)

**Deployment Platform:**
- Vercel (primary deployment target)
- Configured via vercel.json
- API routes automatically deployed as serverless functions
- Static frontend served from dist directory

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - JWT signing secret (optional, has default)

**Security Considerations:**
- Passwords never stored in plaintext (bcrypt with salt rounds)
- JWT tokens for stateless authentication
- Authorization checks verify user ownership of resources
- SQL queries use parameterized statements to prevent injection
- CORS configured for API security
- SSL/TLS required for database connections