# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HUFI Expense Tracker - a comprehensive personal finance management application with advanced features for expense tracking, budgeting, and financial insights.

### Key Features
- Multi-currency support with real-time conversion
- Category management with custom icons and colors
- Budget tracking and alerts
- Transaction analytics and insights
- Google OAuth integration
- Profile customization with avatar uploads
- Recurring transactions
- CSV import/export
- Dark mode support (planned)

## Quick Start Commands

### Frontend (from `/frontend` directory)
```bash
# Install dependencies
npm install

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

# Create .env file from example
cp .env.example .env
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Python FastAPI + SQLAlchemy + PostgreSQL
- **Database**: PostgreSQL on localhost:5433
- **Auth**: JWT tokens + Google OAuth
- **State Management**: React Context API + Custom hooks
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Notifications**: Custom notification system with toast support
- **File Storage**: Local/S3 compatible (configurable)

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://expense_user:expense_password@localhost:5433/expense_tracker_db
SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
BASE_URL=http://localhost:8060
UPLOAD_DIRECTORY=uploads
STORAGE_TYPE=local  # or 's3'
```

#### Frontend
- API URL configured in `/frontend/src/config.ts`

## Core Features Documentation

### 1. Authentication System
- **JWT-based authentication** with localStorage token storage
- **Google OAuth integration** for social login
- **Protected routes** using React Router
- **User context** for global auth state

### 2. Transaction Management
- **CRUD operations** for income/expense tracking
- **Advanced filtering** by date, category, amount, type
- **Bulk operations** for multiple transactions
- **CSV import/export** functionality
- **Pagination** support for large datasets
- **Real-time updates** using event bus pattern

### 3. Category System
- **Custom categories** with icons and colors
- **Default categories** auto-created for new users
- **Budget limits** per category
- **Type separation** (income vs expense categories)
- **Usage protection** (cannot delete categories in use)

### 4. Multi-Currency Support
- **150+ supported currencies**
- **Real-time exchange rates** via API
- **Automatic conversion** on currency change
- **Historical rate tracking**
- **IP-based currency detection** for new users

### 5. Budget Management
- **Monthly/Quarterly/Yearly** budget periods
- **Category-specific budgets**
- **Usage tracking** with percentage alerts
- **Visual progress indicators**
- **Budget vs actual comparisons**

### 6. User Profile
- **Avatar upload** with image optimization
- **Profile customization**
- **Currency preferences**
- **Storage migration** support (local to S3)

### 7. Notification System
- **Toast notifications** for user feedback
- **Success/Error/Warning/Info** types
- **Auto-dismiss** with configurable duration
- **Action buttons** support
- **Queue management** for multiple notifications

## File Structure Guide

### Backend Structure
```
backend/
├── app.py                 # FastAPI application entry
├── auth.py               # Authentication utilities
├── models.py             # SQLAlchemy models & Pydantic schemas
├── currencies.py         # Currency data and utilities
├── currency_utils.py     # Exchange rate functions
├── alembic.ini          # Migration configuration
├── routers/             # API route handlers
│   ├── auth_router.py   # Auth endpoints
│   ├── users.py         # User management
│   ├── transactions.py  # Transaction CRUD
│   ├── categories.py    # Category management
│   ├── budgets.py       # Budget tracking
│   └── currency.py      # Currency operations
├── storage/             # File storage abstraction
│   ├── base.py         # Storage interface
│   ├── local.py        # Local filesystem
│   └── s3.py           # S3-compatible storage
├── migrations/          # Database migrations
│   └── versions/       # Migration files
└── uploads/            # Local file storage
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── TransactionModal.tsx
│   │   ├── TransactionTable.tsx
│   │   ├── Sidebar.tsx
│   │   ├── UserAvatar.tsx
│   │   └── ...
│   ├── pages/          # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── Categories.tsx
│   │   ├── Budget.tsx
│   │   ├── Settings.tsx
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   │   ├── useTransactions.tsx
│   │   ├── useCategories.ts
│   │   ├── useBudgets.ts
│   │   └── useNotifications.tsx
│   ├── contexts/       # React contexts
│   │   ├── UserContext.tsx
│   │   └── NotificationContext.tsx
│   ├── types/          # TypeScript definitions
│   │   ├── transaction.ts
│   │   ├── category.ts
│   │   ├── budget.ts
│   │   └── user.ts
│   ├── utils/          # Utility functions
│   │   ├── eventBus.ts
│   │   └── formatters.ts
│   ├── config.ts       # App configuration
│   └── App.tsx         # Main app component
```

## Database Schema

### Core Tables

#### Users
- id (Integer, Primary Key)
- name (String, Required)
- email (String, Unique, Required)
- google_id (String, Unique, Optional)
- hashed_password (String)
- profile_picture_url (String, Optional)
- currency (String, Default: USD)
- currency_symbol (String, Default: $)

#### Transactions
- id (Integer, Primary Key)
- user_id (Integer, Foreign Key)
- amount (Float, Required)
- original_amount (Float, Optional)
- original_currency (String, Optional)
- exchange_rate_to_usd (Float, Optional)
- type (String: income/expense)
- category (String, Required)
- category_id (Integer, Foreign Key, Optional)
- description (Text, Optional)
- date (DateTime, Required)
- payment_method (String, Optional)
- location (String, Optional)
- tags (Text, JSON array)
- receipt_url (String, Optional)
- is_recurring (Boolean, Default: False)
- recurring_frequency (String, Optional)
- created_at (DateTime)
- updated_at (DateTime)

#### Categories
- id (Integer, Primary Key)
- user_id (Integer, Foreign Key)
- name (String, Required)
- type (String: income/expense)
- icon (String, Optional)
- color (String, Optional)
- budget_limit (Float, Optional)
- created_at (DateTime)

#### Budgets
- id (Integer, Primary Key)
- user_id (Integer, Foreign Key)
- category_id (Integer, Foreign Key, Optional)
- name (String, Required)
- amount (Float, Required)
- period (String: monthly/quarterly/yearly)
- start_date (DateTime, Required)
- end_date (DateTime, Optional)
- is_active (Boolean, Default: True)
- alert_threshold (Float, Default: 80.0)
- created_at (DateTime)
- updated_at (DateTime)

#### CurrencyConversions
- id (Integer, Primary Key)
- user_id (Integer, Foreign Key)
- from_currency (String, Required)
- to_currency (String, Required)
- exchange_rate (Float, Required)
- status (String: pending/completed/failed)
- created_at (DateTime)

## API Endpoints Reference

### Authentication
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /google-login` - Google OAuth login

### User Management
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile
- `POST /users/me/profile-picture` - Upload avatar
- `DELETE /users/me/profile-picture` - Remove avatar
- `GET /currencies` - Get supported currencies

### Transactions
- `GET /transactions` - List transactions (with filters)
- `GET /transactions/paginated` - Paginated list
- `GET /transactions/{id}` - Get single transaction
- `POST /transactions` - Create transaction
- `PUT /transactions/{id}` - Update transaction
- `DELETE /transactions/{id}` - Delete transaction
- `POST /transactions/bulk` - Bulk operations
- `GET /transactions/statistics` - Get statistics
- `POST /transactions/import/csv` - Import CSV
- `GET /transactions/export/csv` - Export CSV
- `GET /transactions/recurring` - List recurring

### Categories
- `GET /categories` - List categories (filter by type)
- `GET /categories/{id}` - Get single category
- `POST /categories` - Create category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category
- `POST /categories/initialize-defaults` - Create defaults

### Budgets
- `GET /budgets` - List budgets
- `GET /budgets/{id}` - Get single budget
- `POST /budgets` - Create budget
- `PUT /budgets/{id}` - Update budget
- `DELETE /budgets/{id}` - Delete budget
- `GET /budgets/usage` - Get usage statistics

### Currency
- `GET /currency/convert` - Convert amount
- `POST /currency/change` - Change user currency
- `GET /currency/preview` - Preview conversion impact

## Common Development Tasks

### Adding a New Feature
1. Plan database changes if needed
2. Create/update models in `backend/models.py`
3. Generate migration: `alembic revision --autogenerate -m "description"`
4. Apply migration: `alembic upgrade head`
5. Create API endpoints in appropriate router
6. Add TypeScript types in frontend
7. Create React hook if needed
8. Build UI components
9. Update navigation if new page
10. Test thoroughly
11. Update documentation

### Modifying Existing Features
1. Locate relevant files using project structure
2. Check for cascading effects
3. Update backend models/endpoints
4. Update frontend types/components
5. Test all affected areas
6. Update relevant documentation

### Debugging Tips
1. **Backend Issues**:
   - Check console output from `python app.py`
   - Verify database connection
   - Test endpoints with Postman/curl
   - Check migration status: `alembic current`

2. **Frontend Issues**:
   - Check browser console for errors
   - Verify API calls in Network tab
   - Check for TypeScript errors: `npm run build`
   - Verify environment configuration

3. **Common Problems**:
   - CORS errors: Check backend CORS configuration
   - Auth issues: Verify token in localStorage
   - 404 errors: Check route definitions
   - Database errors: Check migrations are applied

## Best Practices

1. **Code Organization**:
   - Keep components small and focused
   - Use custom hooks for data logic
   - Maintain TypeScript types
   - Follow existing patterns

2. **State Management**:
   - Use contexts for global state
   - Custom hooks for feature state
   - Local state for UI-only concerns

3. **Error Handling**:
   - Always handle API errors gracefully
   - Show user-friendly error messages
   - Log errors for debugging

4. **Performance**:
   - Use pagination for large lists
   - Implement proper loading states
   - Optimize images before upload
   - Cache data when appropriate

5. **Security**:
   - Never commit sensitive data
   - Validate all user inputs
   - Use prepared statements for queries
   - Keep dependencies updated

## Important Notes

1. **Always write development summaries in the notes/ folder**
2. **Test changes thoroughly before committing**
3. **Update types when changing API contracts**
4. **Follow existing code patterns and styles**
5. **Document complex logic with comments**
6. **Keep the UI responsive and accessible**

## Related Documentation

- `docs/PROJECT_STRUCTURE.md` - Detailed file organization
- `docs/API_REFERENCE.md` - Complete API documentation
- `docs/DATABASE_SCHEMA.md` - Full database structure
- `docs/FEATURE_GUIDE.md` - Feature-specific guides
- `docs/MEDIA_STORAGE_GUIDE.md` - File storage configuration
- `docs/FEATURES_ROADMAP.md` - Planned features and roadmap