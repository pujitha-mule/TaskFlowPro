# TaskFlow - Task Management Application

## Overview

TaskFlow is a full-stack task management web application that enables users to create, organize, and track tasks with priority-based organization. The application features a modern React frontend communicating with an Express.js backend, persisting data in PostgreSQL. Users authenticate via Replit Auth (OpenID Connect) to access their personal task lists with filtering, sorting, and completion tracking capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool providing fast development server and optimized production builds
- Wouter for lightweight client-side routing (replacing heavier alternatives like React Router)

**State Management Strategy**
- TanStack Query (React Query) handles all server state with automatic caching, background refetching, and query invalidation
- Local UI state managed through React hooks (useState, useContext)
- No global state management library - server state and local state separation keeps complexity low
- Custom `useAuth` hook provides authentication state across components

**UI Component System**
- shadcn/ui component library built on Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with extensive customization via CSS variables
- Bootstrap 5 integrated for additional layout utilities and responsive grid system
- Hybrid approach: shadcn/ui for modern components, Bootstrap for legacy compatibility and rapid layout

**Design System Implementation**
- Custom theme system supporting light/dark modes via CSS variables in `:root`
- Typography hierarchy: Inter font family with defined scales (display, heading, body, metadata)
- Color system: Primary blue (#2563EB), success green (#10B981), priority colors (red/amber/grey)
- Spacing: Tailwind spacing scale (units of 2, 4, 6, 8) for consistent visual rhythm
- Component patterns: Priority-indicated left borders on cards, pill-shaped badges, material design elevation

### Backend Architecture

**Server Framework & Middleware**
- Express.js REST API with TypeScript for type-safe route handlers
- Session-based authentication using express-session with PostgreSQL session store
- Custom middleware for request logging and JSON response capture
- Route organization: Resource-based separation (auth routes, task routes)

**Authentication & Session Management**
- Replit Auth integration via OpenID Connect (OIDC) supporting Google, GitHub, and other providers
- Passport.js strategy for OIDC authentication flow
- Session persistence in PostgreSQL via connect-pg-simple
- Secure HTTP-only cookies with 1-week TTL
- User data synchronized on login via upsert pattern

**Data Access Layer**
- Drizzle ORM provides type-safe database queries with TypeScript inference
- Schema-first approach: Single source of truth in `shared/schema.ts`
- Storage abstraction: `IStorage` interface enables testing and future database changes
- Query patterns: Explicit user filtering on all task operations to ensure data isolation

**API Design**
- RESTful endpoints: GET/POST/PATCH/DELETE for CRUD operations
- Authentication middleware: `isAuthenticated` guard protects all task routes
- Error handling: Consistent JSON error responses with appropriate HTTP status codes
- Request validation: Zod schemas validate input data before processing

### Database Schema

**Core Tables**
- `sessions`: Required for Replit Auth, stores Express session data
- `users`: Required for Replit Auth, stores user profile (id, email, name, profile image)
- `tasks`: User tasks with title, description, dueDate, priority, completed status

**Data Relationships**
- Tasks reference users via foreign key with cascade delete
- User ID comes from OIDC claims (`sub` field) ensuring consistency across sessions

**Schema Validation**
- Drizzle Zod integration generates runtime validators from database schema
- Insert/update schemas enforce data integrity at API boundary
- Default values: UUIDs for IDs, timestamps for creation/update tracking

### Type Safety & Shared Code

**Monorepo Structure**
- `/client`: Frontend React application
- `/server`: Backend Express application  
- `/shared`: Shared TypeScript types and schemas

**Type Sharing Strategy**
- Database schema types exported from `shared/schema.ts`
- Frontend and backend import same types ensuring contract consistency
- Zod schemas used for both validation and TypeScript type inference
- No type duplication or drift between layers

## External Dependencies

### Authentication Service
- **Replit Auth (OIDC)**: Provides user authentication via OpenID Connect protocol
- Configuration: Issuer URL from environment variable, client ID is Repl ID
- User data: Email, first name, last name, profile image URL from OIDC claims

### Database
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL database accessed via connection string
- WebSocket support: Uses `ws` library for Neon's serverless connection pooling
- Connection: `@neondatabase/serverless` driver with Drizzle ORM integration
- Schema management: Drizzle Kit handles migrations (push-based, no migration files)

### UI Component Libraries
- **Radix UI**: Headless accessible component primitives (dialogs, dropdowns, popovers, etc.)
- **Lucide React**: Icon library providing consistent iconography
- **Bootstrap 5**: CSS framework for responsive grid and utility classes
- **date-fns**: Date formatting and manipulation utilities

### Development Tools
- **Replit Development Plugins**: 
  - `@replit/vite-plugin-runtime-error-modal`: Enhanced error overlay in development
  - `@replit/vite-plugin-cartographer`: Code navigation assistance
  - `@replit/vite-plugin-dev-banner`: Development environment indicator

### Session Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- Automatically creates/manages sessions table in database
- TTL-based session expiration (1 week default)