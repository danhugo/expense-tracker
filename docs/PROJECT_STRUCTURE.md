# Project Structure Guide

This document provides a detailed overview of the HUFI Expense Tracker project structure to help developers quickly navigate and understand the codebase.

## Project Root Structure

```
expense-tracker/
├── backend/                    # Python FastAPI backend
├── frontend/                   # React TypeScript frontend
├── docs/                       # Project documentation
│   ├── README.md              # Documentation index
│   ├── PROJECT_STRUCTURE.md   # This file
│   ├── API_REFERENCE.md       # API documentation
│   ├── DATABASE_SCHEMA.md     # Database structure
│   ├── FEATURE_GUIDE.md       # Feature development guide
│   ├── FEATURES_ROADMAP.md    # Future features planning
│   └── MEDIA_STORAGE_GUIDE.md # File storage configuration
├── notes/                      # Development notes and summaries
├── docker-compose.yml          # Docker configuration
├── .gitignore                  # Git ignore rules
├── .mcp.json                   # MCP configuration
└── CLAUDE.md                   # AI assistant guidance (root level)
```

## Backend Structure (`/backend`)

### Root Files
```
backend/
├── app.py                      # FastAPI application entry point
├── auth.py                     # Authentication utilities (JWT, password hashing)
├── models.py                   # SQLAlchemy models and Pydantic schemas
├── currencies.py               # Currency data and supported currencies list
├── currency_utils.py           # Exchange rate functions and conversions
├── alembic.ini                # Database migration configuration
├── pyproject.toml             # Python project dependencies
├── uv.lock                    # Locked dependency versions
├── .env                       # Environment variables (not in git)
├── .env.example               # Example environment configuration
└── .env.storage.example       # Storage configuration example
```

### API Routers (`/backend/routers`)
```
routers/
├── auth_router.py             # Authentication endpoints (login, signup, OAuth)
├── users.py                   # User profile management
├── transactions.py            # Transaction CRUD and bulk operations
├── categories.py              # Category management
├── budgets.py                 # Budget tracking and alerts
└── currency.py                # Currency conversion endpoints
```

### Storage System (`/backend/storage`)
```
storage/
├── __init__.py               # Storage module initialization
├── base.py                   # Abstract storage interface
├── factory.py                # Storage service factory
├── local.py                  # Local filesystem implementation
├── s3.py                     # S3-compatible storage implementation
└── README.md                 # Storage system documentation
```

### Database Migrations (`/backend/migrations`)
```
migrations/
├── env.py                    # Migration environment setup
├── script.py.mako           # Migration script template
└── versions/                # Migration files
    ├── 13c4517bd6a5_*.py   # Add category_id to transactions
    ├── 35509d80f7cb_*.py   # Add currency fields
    ├── 4effc64aa2c3_*.py   # Add user currency support
    ├── 5c54f7a292db_*.py   # Add user_id to transactions
    ├── a1b2c3d4e5f6_*.py   # Add exchange rates
    └── b2c3d4e5f6g7_*.py   # Create currency conversions
```

### Scripts (`/backend/scripts`)
```
scripts/
└── migrate_storage.py        # Migrate files between storage systems
```

### Local Uploads (`/backend/uploads`)
```
uploads/
└── users/                    # User uploaded files
    └── {user_id}/           # User-specific directory
        └── profile_*.png    # Profile pictures
```

## Frontend Structure (`/frontend`)

### Root Configuration
```
frontend/
├── package.json              # NPM dependencies and scripts
├── package-lock.json        # Locked dependency versions
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── tailwind.config.js       # TailwindCSS configuration
├── postcss.config.js        # PostCSS configuration
├── index.html               # HTML entry point
└── .env                     # Environment variables (optional)
```

### Source Code (`/frontend/src`)

#### Core Application Files
```
src/
├── main.tsx                 # React app entry point
├── App.tsx                  # Main app component with providers
├── AppRoutes.tsx           # Route definitions and auth guards
├── config.ts               # Application configuration
├── index.css               # Global styles and Tailwind imports
└── vite-env.d.ts           # Vite type definitions
```

#### Components (`/src/components`)

##### UI Components (`/src/components/ui`)
```
ui/                          # shadcn/ui components
├── alert.tsx               # Alert notifications
├── button.tsx              # Button variants
├── card.tsx                # Card containers
├── dialog.tsx              # Modal dialogs
├── dropdown-menu.tsx       # Dropdown menus
├── input.tsx               # Form inputs
├── label.tsx               # Form labels
├── select.tsx              # Select dropdowns
├── separator.tsx           # Visual separators
├── sheet.tsx               # Side panels
├── skeleton.tsx            # Loading skeletons
├── table.tsx               # Data tables
├── tabs.tsx                # Tab navigation
├── toast.tsx               # Toast notifications
├── toaster.tsx             # Toast container
└── tooltip.tsx             # Hover tooltips
```

##### Feature Components
```
components/
├── ChatPanel.tsx           # AI chat assistant panel
├── CurrencyPreviewModal.tsx # Currency conversion preview
├── DashboardLoading.tsx    # Dashboard skeleton loader
├── DashboardStats.tsx      # Statistics cards
├── FloatingActionButton.tsx # Mobile FAB
├── Header.tsx              # App header (deprecated)
├── Notification.tsx        # Notification component
├── NotificationContainer.tsx # Notification manager
├── Pagination.tsx          # Table pagination
├── ProtectedRoute.tsx      # Auth route wrapper
├── Sidebar.tsx             # Navigation sidebar
├── TransactionModal.tsx    # Add/Edit transaction form
├── TransactionTable.tsx    # Transaction list table
├── UserAvatar.tsx          # User profile picture
└── UserDropdown.tsx        # User menu dropdown
```

#### Pages (`/src/pages`)
```
pages/
├── Dashboard.tsx           # Main dashboard page
├── Transactions.tsx        # Transaction list page
├── Categories.tsx          # Category management
├── Budget.tsx              # Budget tracking
├── RecurringTransactions.tsx # Recurring transactions
├── Settings.tsx            # User settings
├── Login.tsx               # Login/Signup page
├── SignUp.tsx              # Signup redirect
├── Index.tsx               # App layout wrapper
├── NotFound.tsx            # 404 page (authenticated)
├── PublicNotFound.tsx      # 404 page (public)
└── NotificationDemo.tsx    # Notification testing (dev)
```

#### Contexts (`/src/contexts`)
```
contexts/
├── UserContext.tsx         # Authentication state
└── NotificationContext.tsx # Notification system
```

#### Custom Hooks (`/src/hooks`)
```
hooks/
├── useTransactions.tsx     # Transaction data management
├── useCategories.ts        # Category operations
├── useBudgets.ts          # Budget management
├── useNotifications.tsx    # Notification helpers
├── useSidebarState.ts     # Sidebar toggle state
└── use-toast.ts           # Toast notifications
```

#### Type Definitions (`/src/types`)
```
types/
├── transaction.ts          # Transaction interfaces
├── category.ts            # Category interfaces
├── budget.ts              # Budget interfaces
└── user.ts                # User interfaces
```

#### Utilities (`/src/utils`)
```
utils/
├── eventBus.ts            # Event emitter for updates
└── formatters.ts          # Date/Currency formatters
```

## Notes Directory (`/notes`)

Development documentation and decision records:

```
notes/
├── BUDGET_CATEGORY_ASSOCIATION_FIX.md
├── BUDGET_SYSTEM_FIX.md
├── CURRENCY_CONVERSION_FIX.md
├── CURRENCY_CONVERSION_V2_SUMMARY.md
├── DEVELOPMENT_SUMMARY.md
├── HISTORICAL_EXCHANGE_RATES_IMPLEMENTATION.md
└── RECOMMENDED_CURRENCY_FLOW.md
```

## Key File Relationships

### Authentication Flow
1. `backend/auth.py` → JWT token creation
2. `backend/routers/auth_router.py` → Login endpoints
3. `frontend/src/contexts/UserContext.tsx` → Auth state
4. `frontend/src/AppRoutes.tsx` → Protected routes

### Transaction Management
1. `backend/models.py` → Transaction model
2. `backend/routers/transactions.py` → CRUD endpoints
3. `frontend/src/hooks/useTransactions.tsx` → Data fetching
4. `frontend/src/pages/Transactions.tsx` → UI display

### Category System
1. `backend/models.py` → Category model
2. `backend/routers/categories.py` → Category endpoints
3. `frontend/src/types/category.ts` → TypeScript types
4. `frontend/src/pages/Categories.tsx` → Management UI

### Budget Tracking
1. `backend/models.py` → Budget model
2. `backend/routers/budgets.py` → Budget endpoints
3. `frontend/src/hooks/useBudgets.ts` → Budget hooks
4. `frontend/src/pages/Budget.tsx` → Budget UI

### Currency Support
1. `backend/currencies.py` → Currency data
2. `backend/currency_utils.py` → Conversion logic
3. `backend/routers/currency.py` → API endpoints
4. `frontend/src/components/CurrencyPreviewModal.tsx` → Preview UI

## Import Patterns

### Backend Imports
```python
# Models and schemas
from models import User, Transaction, Category

# Authentication
from auth import get_current_user, verify_password

# Database
from models import SessionLocal, get_db

# Routers
from routers import auth_router, users, transactions
```

### Frontend Imports
```typescript
// React and routing
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Custom hooks
import { useTransactions } from '../hooks/useTransactions';
import { useUser } from '../contexts/UserContext';

// Types
import { Transaction, Category } from '../types/transaction';

// UI Components
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

// Utils
import { API_BASE_URL } from '../config';
```

## Development Workflow

### Adding a New Feature
1. Check existing patterns in similar features
2. Create/modify database models if needed
3. Generate and apply migrations
4. Create API endpoints in appropriate router
5. Add TypeScript types
6. Create React hooks if needed
7. Build UI components
8. Update navigation if new page
9. Test all parts together
10. Update documentation

### File Naming Conventions
- **Backend**: `snake_case.py` for Python files
- **Frontend**: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Database**: `snake_case` for tables and columns
- **API Routes**: `/kebab-case` for endpoints

### Code Organization Rules
1. Group related functionality together
2. Keep components small and focused
3. Use custom hooks for shared logic
4. Maintain consistent file structure
5. Document complex logic
6. Follow existing patterns