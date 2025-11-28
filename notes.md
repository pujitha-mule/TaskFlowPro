# TaskFlow - Task Management Application

## Overview

TaskFlow is a modern task management web application built with a full-stack TypeScript architecture. The application enables users to create, organize, and track tasks with priority-based organization, drawing design inspiration from Todoist and Notion. It features authentication via Replit Auth, a clean React-based frontend with shadcn/ui components, and a PostgreSQL database for persistent storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Libraries**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- React Router (wouter) for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Bootstrap 5 integration for additional layout utilities
- Custom theming system supporting light/dark modes via CSS variables

**State Management Approach**
- Server state managed through React Query with query invalidation patterns
- Local UI state handled with React hooks (useState, useContext)
- Authentication state managed through a custom useAuth hook
- Form state managed with react-hook-form and zod validation

**Design System**
- Typography: Inter font family with defined hierarchy (headings, body text, metadata)
- Color palette: Primary blue (#2563EB), success green (#10B981), priority-based colors (red/amber/grey)
- Component patterns: Cards with priority-indicated left borders, pill-shaped badges, material design principles
- Responsive grid system: 1 column mobile, 2-3 columns tablet/desktop

### Backend Architecture

**Server Framework**
- Express.js REST API with TypeScript
- Session-based authentication using express-session with PostgreSQL session store
- Middleware pattern for request logging and error handling
- Route separation following resource-based organization

**Authentication & Authorization**
- Replit Auth (OpenID Connect) integration for user authentication
- Passport.js strategy for OIDC flow
- Session management with secure HTTP-only cookies
- User-scoped data access enforced at the storage layer

**API Design**
- RESTful endpoints following resource naming conventions
- `/api/auth/*` - Authentication routes (user info, login, logout)
- `/api/tasks/*` - Task CRUD operations with user isolation
- Consistent JSON response format
- Authentication middleware (isAuthenticated) protecting all task routes

**Error Handling**
- Centralized error handling with appropriate HTTP status codes
- Client-side error boundary pattern for graceful degradation
- 401 handling redirects to login flow

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database queries and migrations
- Schema-first approach with zod validation matching database constraints

**Database Schema**
- `users` table: OAuth user information (id, email, name, profile image)
- `tasks` table: Task data with foreign key to users (title, description, due date, priority, completion status)
- `sessions` table: Express session storage (required for authentication)

**Data Access Pattern**
- Repository pattern implemented via DatabaseStorage class
- All queries enforce user-scoped access control
- Drizzle ORM provides SQL query builder with TypeScript inference
- Shared types between frontend and backend via `/shared/schema.ts`

**Validation Strategy**
- Zod schemas generated from Drizzle table definitions
- Input validation on API endpoints before database operations
- Type safety enforced across the stack (database → API → client)

### External Dependencies

**Third-Party Services**
- **Replit Auth**: OAuth/OIDC authentication provider for user identity
- **Neon Database**: Serverless PostgreSQL database hosting
- **Google Fonts**: Inter and Roboto font families for typography

**Key NPM Packages**
- **@neondatabase/serverless**: PostgreSQL client with WebSocket pooling
- **drizzle-orm**: TypeScript ORM for database interactions
- **express-session + connect-pg-simple**: Session management with PostgreSQL storage
- **passport + openid-client**: OAuth authentication flow
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form + @hookform/resolvers**: Form handling with validation
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date formatting and manipulation
- **lucide-react**: Icon library for UI components

**Build & Development Tools**
- **Vite**: Frontend build tool and dev server with HMR
- **TypeScript**: Type checking across the entire codebase
- **esbuild**: Backend bundling for production
- **tsx**: TypeScript execution for development server
- **Tailwind CSS + PostCSS**: CSS processing and utility generation
- **drizzle-kit**: Database migration management