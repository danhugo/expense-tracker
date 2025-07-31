# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HUFI Expense Tracker - a full-stack personal finance management application with React frontend and Python FastAPI backend.

## Common Development Commands

### Frontend (from `/frontend` directory)
```bash
# Development server (port 8080)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

### Backend (from `/backend` directory)
```bash
# Install dependencies (using uv)
uv install

# Run development server (port 8060)
python app.py

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "description"
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Python FastAPI + SQLAlchemy + PostgreSQL
- **Database**: PostgreSQL on localhost:5433
- **Auth**: JWT tokens + Google OAuth

### Key Architectural Patterns

#### Frontend Architecture
- **State Management**: React Context API + Custom hooks pattern
  - `UserContext` for authentication state
  - `useTransactions` hook for transaction data management
  - Local state for UI components
- **Routing**: React Router with protected routes
- **API Communication**: Axios with centralized configuration in `config.ts`
- **Component Structure**: 
  - Pages in `/src/pages/`
  - Reusable components in `/src/components/`
  - UI primitives from shadcn/ui in `/src/components/ui/`

#### Backend Architecture
- **API Structure**: Route-based organization in `/routers/`
  - `auth_router.py`: Authentication endpoints
  - `transactions.py`: Transaction CRUD operations
  - `users.py`: User management
- **Database Models**: SQLAlchemy models in `models.py`
  - User model with password hashing
  - Transaction model with user relationships
- **Authentication**: JWT implementation in `auth.py`
  - Access token generation
  - Password hashing with bcrypt
  - Protected route decorators

### API Endpoints

Base URL: `http://localhost:8060`

Key endpoints:
- `POST /users/signup` - User registration
- `POST /users/login` - User login
- `GET /users/profile` - Get user profile (protected)
- `GET /transactions/` - List transactions (protected)
- `POST /transactions/` - Create transaction (protected)
- `PUT /transactions/{id}` - Update transaction (protected)
- `DELETE /transactions/{id}` - Delete transaction (protected)

### Database Schema

**Users Table**:
- id (UUID primary key)
- email (unique)
- password_hash
- full_name
- profile_picture

**Transactions Table**:
- id (UUID primary key)
- user_id (foreign key)
- description
- amount
- category
- date
- created_at
- updated_at

## Development Tips

1. **Frontend API Configuration**: Update `API_BASE_URL` in `/frontend/src/config.ts` based on environment

2. **Database Migrations**: Always create migrations when modifying models:
   ```bash
   cd backend
   alembic revision --autogenerate -m "your migration message"
   alembic upgrade head
   ```

3. **Type Safety**: Frontend uses TypeScript - maintain type definitions in `/frontend/src/types/`

4. **Component Development**: Use existing shadcn/ui components from `/frontend/src/components/ui/` before creating new ones

5. **Authentication Flow**: 
   - JWT tokens stored in localStorage
   - UserContext provides authentication state
   - Protected routes check authentication before rendering

6. **CORS Configuration**: Backend configured to accept requests from frontend development server

## Code Navigation Guide

### Backend File Structure (`/backend`)

#### Core Application Files
- **`app.py`**: Main FastAPI application entry point
  - CORS configuration
  - Router registration
  - Static file mounting
  - Server startup configuration

- **`models.py`**: Database models and Pydantic schemas
  - `User` model: User authentication and profile
  - `Transaction` model: Financial transaction records
  - Database connection setup
  - Pydantic validation models

- **`auth.py`**: Authentication utilities
  - JWT token generation/validation
  - Password hashing functions
  - User verification helpers
  - OAuth integration helpers

#### Routers Directory (`/routers`)
- **`auth_router.py`**: Authentication endpoints
  - `/auth/google` - Google OAuth login
  - Token refresh endpoints
  
- **`users.py`**: User management endpoints
  - `/users/signup` - User registration
  - `/users/login` - User login
  - `/users/profile` - Profile management
  - `/users/upload-profile-picture` - Profile picture upload

- **`transactions.py`**: Transaction CRUD endpoints
  - `/transactions/` - List all user transactions
  - `/transactions/create` - Create new transaction
  - `/transactions/{id}` - Update/Delete specific transaction

#### Database Migrations (`/migrations`)
- **`alembic.ini`**: Alembic configuration
- **`env.py`**: Migration environment setup (loads DATABASE_URL from .env)
- **`versions/`**: Individual migration files

#### Configuration Files
- **`.env`**: Environment variables (DATABASE_URL, SECRET_KEY, etc.)
- **`pyproject.toml`**: Python dependencies and project metadata
- **`uv.lock`**: Locked dependency versions

### Frontend File Structure (`/frontend`)

#### Source Directory (`/src`)

##### Core Application Files
- **`main.tsx`**: React application entry point
- **`App.tsx`**: Main application component with routing
- **`config.ts`**: API configuration and constants

##### Pages (`/src/pages`)
- **`Login.tsx`**: Login/signup page with Google OAuth
- **`Dashboard.tsx`**: Main dashboard with transaction list
- **`AddTransaction.tsx`**: Form for adding new transactions
- **`EditTransaction.tsx`**: Form for editing existing transactions

##### Components (`/src/components`)
- **`Header.tsx`**: Navigation header with user menu
- **`TransactionList.tsx`**: Reusable transaction list component
- **`ProtectedRoute.tsx`**: Route protection wrapper

##### UI Components (`/src/components/ui`)
- shadcn/ui components (Button, Card, Input, etc.)
- Pre-styled, accessible components
- Customizable with Tailwind classes

##### Context (`/src/context`)
- **`UserContext.tsx`**: Global authentication state
  - User info storage
  - Login/logout functions
  - Token management

##### Hooks (`/src/hooks`)
- **`useTransactions.ts`**: Transaction data management
  - Fetch transactions
  - Add/Edit/Delete operations
  - Optimistic updates

##### Types (`/src/types`)
- **`index.ts`**: TypeScript type definitions
  - User interface
  - Transaction interface
  - API response types

##### Utilities (`/src/utils`)
- **`api.ts`**: Axios instance with interceptors
- Helper functions for data formatting

#### Configuration Files
- **`package.json`**: Dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration
- **`vite.config.ts`**: Vite build configuration
- **`tailwind.config.js`**: TailwindCSS configuration
- **`postcss.config.js`**: PostCSS configuration

### Common Code Modification Scenarios

#### Adding a New API Endpoint
1. Create route handler in appropriate router file (`/backend/routers/`)
2. Add endpoint to router
3. Update frontend API calls (`/frontend/src/utils/api.ts`)
4. Add TypeScript types (`/frontend/src/types/index.ts`)

#### Adding a New Database Field
1. Update model in `/backend/models.py`
2. Create migration: `alembic revision --autogenerate -m "description"`
3. Run migration: `alembic upgrade head`
4. Update Pydantic schemas in `models.py`
5. Update frontend types in `/frontend/src/types/index.ts`
6. Update relevant components to use new field

#### Adding a New Page
1. Create component in `/frontend/src/pages/`
2. Add route in `/frontend/src/App.tsx`
3. Update navigation in `/frontend/src/components/Header.tsx`
4. Wrap with ProtectedRoute if authentication required

#### Modifying Authentication
1. Backend changes in `/backend/auth.py` and `/backend/routers/auth_router.py`
2. Update UserContext in `/frontend/src/context/UserContext.tsx`
3. Modify login flow in `/frontend/src/pages/Login.tsx`

#### Styling Changes
1. Component-specific: Modify Tailwind classes in component
2. Global styles: Update `/frontend/src/index.css`
3. Theme changes: Modify `/frontend/tailwind.config.js`
4. UI components: Customize in `/frontend/src/components/ui/`

### Testing and Debugging

#### Backend
- Check logs: `python app.py` output
- Test endpoints: Use tools like Postman or curl
- Database queries: Connect to PostgreSQL directly
- Migration issues: Check `alembic history` and `alembic current`

#### Frontend
- Browser DevTools: Network tab for API calls
- React DevTools: Component state inspection
- Console logs: Check for JavaScript errors
- Build issues: `npm run build` for production test

### Important Files for Different Tasks

#### Authentication Issues
- `/backend/auth.py`
- `/backend/routers/auth_router.py`
- `/frontend/src/context/UserContext.tsx`
- `/frontend/src/pages/Login.tsx`

#### Database Problems
- `/backend/models.py`
- `/backend/migrations/env.py`
- `/backend/.env`

#### UI/UX Changes
- `/frontend/src/pages/*`
- `/frontend/src/components/*`
- `/frontend/tailwind.config.js`

#### API Integration
- `/backend/routers/*`
- `/frontend/src/utils/api.ts`
- `/frontend/src/config.ts`


## Development Guidelines

- MUST ALWAYS WRITE SUMMARY OF DEVELOPMENT IN A NOTES FOLDER