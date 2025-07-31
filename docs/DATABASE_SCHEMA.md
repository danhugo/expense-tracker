# Database Schema Documentation

This document provides a comprehensive overview of the database structure for the HUFI Expense Tracker application.

## Database Configuration

- **Database**: PostgreSQL
- **Port**: 5433
- **Database Name**: expense_tracker_db
- **Connection String**: `postgresql://expense_user:expense_password@localhost:5433/expense_tracker_db`

## Schema Overview

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : has
    USERS ||--o{ CATEGORIES : owns
    USERS ||--o{ BUDGETS : creates
    USERS ||--o{ CURRENCY_CONVERSIONS : performs
    CATEGORIES ||--o{ TRANSACTIONS : categorizes
    CATEGORIES ||--o{ BUDGETS : limits
```

## Table Definitions

### 1. Users Table (`users`)

Stores user account information and preferences.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique user identifier |
| name | VARCHAR | NOT NULL | User's display name |
| email | VARCHAR | UNIQUE, NOT NULL, INDEX | User's email address |
| google_id | VARCHAR | UNIQUE, INDEX | Google OAuth identifier |
| hashed_password | VARCHAR | NOT NULL | BCrypt hashed password |
| profile_picture_url | VARCHAR | NULLABLE | URL to profile picture |
| currency | VARCHAR | NOT NULL, DEFAULT 'USD' | User's preferred currency code |
| currency_symbol | VARCHAR | NOT NULL, DEFAULT '$' | Currency symbol for display |

**Indexes:**
- Primary Key: `id`
- Unique: `email`, `google_id`
- Index: `email`, `google_id`

**Relationships:**
- One-to-Many with `transactions`
- One-to-Many with `categories`
- One-to-Many with `budgets`
- One-to-Many with `currency_conversions`

### 2. Transactions Table (`transactions`)

Records all financial transactions for users.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique transaction identifier |
| user_id | INTEGER | FOREIGN KEY, NULLABLE* | Reference to user |
| amount | FLOAT | NOT NULL | Transaction amount in user's currency |
| original_amount | FLOAT | NULLABLE | Amount in original currency |
| original_currency | VARCHAR | NULLABLE | Original currency code |
| exchange_rate_to_usd | FLOAT | NULLABLE | Exchange rate to USD at time |
| type | VARCHAR | NOT NULL | 'income' or 'expense' |
| category | VARCHAR | NOT NULL | Category name (legacy) |
| category_id | INTEGER | FOREIGN KEY, NULLABLE | Reference to category |
| description | TEXT | NULLABLE | Transaction description |
| date | DATETIME | NOT NULL | Transaction date |
| payment_method | VARCHAR | NULLABLE | Payment method used |
| location | VARCHAR | NULLABLE | Transaction location |
| tags | TEXT | NULLABLE | JSON array of tags |
| receipt_url | VARCHAR | NULLABLE | URL to receipt image |
| is_recurring | BOOLEAN | DEFAULT FALSE | Recurring transaction flag |
| recurring_frequency | VARCHAR | NULLABLE | Frequency if recurring |
| created_at | DATETIME | DEFAULT NOW() | Record creation time |
| updated_at | DATETIME | DEFAULT NOW(), ON UPDATE | Last update time |

*Note: `user_id` is nullable for migration purposes but should be NOT NULL in production.

**Indexes:**
- Primary Key: `id`
- Foreign Keys: `user_id`, `category_id`
- Index: `user_id`, `date`, `type`

**Relationships:**
- Many-to-One with `users`
- Many-to-One with `categories`

### 3. Categories Table (`categories`)

Stores custom transaction categories for each user.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique category identifier |
| user_id | INTEGER | FOREIGN KEY, NOT NULL | Owner of the category |
| name | VARCHAR | NOT NULL | Category name |
| type | VARCHAR | NOT NULL | 'income' or 'expense' |
| icon | VARCHAR | NULLABLE | Emoji or icon identifier |
| color | VARCHAR | NULLABLE | Hex color code |
| budget_limit | FLOAT | NULLABLE | Monthly budget limit |
| created_at | DATETIME | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- Primary Key: `id`
- Foreign Key: `user_id`
- Composite Index: `user_id`, `name`, `type` (for uniqueness)

**Relationships:**
- Many-to-One with `users`
- One-to-Many with `transactions`
- One-to-Many with `budgets`

### 4. Budgets Table (`budgets`)

Manages budget configurations and tracking.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique budget identifier |
| user_id | INTEGER | FOREIGN KEY, NOT NULL | Budget owner |
| category_id | INTEGER | FOREIGN KEY, NULLABLE | Linked category |
| name | VARCHAR | NOT NULL | Budget name |
| amount | FLOAT | NOT NULL | Budget amount |
| period | VARCHAR | NOT NULL | 'monthly', 'quarterly', 'yearly' |
| start_date | DATETIME | NOT NULL | Budget start date |
| end_date | DATETIME | NULLABLE | Budget end date |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| alert_threshold | FLOAT | DEFAULT 80.0 | Alert percentage |
| created_at | DATETIME | DEFAULT NOW() | Creation timestamp |
| updated_at | DATETIME | DEFAULT NOW(), ON UPDATE | Last update |

**Indexes:**
- Primary Key: `id`
- Foreign Keys: `user_id`, `category_id`
- Index: `user_id`, `is_active`

**Relationships:**
- Many-to-One with `users`
- Many-to-One with `categories`

### 5. Currency Conversions Table (`currency_conversions`)

Tracks currency conversion operations for audit and rollback.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique conversion identifier |
| user_id | INTEGER | FOREIGN KEY, NOT NULL | User performing conversion |
| from_currency | VARCHAR | NOT NULL | Source currency code |
| to_currency | VARCHAR | NOT NULL | Target currency code |
| exchange_rate | FLOAT | NOT NULL | Applied exchange rate |
| status | VARCHAR | DEFAULT 'pending' | Conversion status |
| progress | INTEGER | DEFAULT 0 | Progress percentage |
| total_items | INTEGER | DEFAULT 0 | Total items to convert |
| items_converted | INTEGER | DEFAULT 0 | Items converted |
| error_message | TEXT | NULLABLE | Error details if failed |
| revertable_until | DATETIME | NULLABLE | Rollback deadline |
| created_at | DATETIME | DEFAULT NOW() | Start time |
| completed_at | DATETIME | NULLABLE | Completion time |

**Indexes:**
- Primary Key: `id`
- Foreign Key: `user_id`
- Index: `user_id`, `status`

**Relationships:**
- Many-to-One with `users`

## Migration History

### Applied Migrations

1. **Initial Schema** - Base tables creation
2. **5c54f7a292db** - Add user_id to transactions and create relationships
3. **4effc64aa2c3** - Add currency fields to users and create categories/budgets
4. **a1b2c3d4e5f6** - Add exchange_rate_to_usd to transactions
5. **35509d80f7cb** - Add original currency fields to transactions
6. **b2c3d4e5f6g7** - Create currency_conversions table
7. **13c4517bd6a5** - Add category_id to transactions

## Data Constraints and Business Rules

### User Constraints
- Email must be unique across the system
- Google ID must be unique if provided
- Password is required for non-OAuth users
- Currency code must be valid ISO 4217 code

### Transaction Constraints
- Amount must be positive
- Type must be either 'income' or 'expense'
- Date cannot be in the future
- Category is required (will migrate to category_id)
- User must own the referenced category

### Category Constraints
- Name must be unique per user and type
- Type must be either 'income' or 'expense'
- Cannot delete category if transactions reference it
- Budget limit must be positive if provided

### Budget Constraints
- Amount must be positive
- Period must be valid enum value
- End date must be after start date if provided
- Alert threshold must be between 0 and 100

## Default Data

### Default Categories (Created on User Signup)

**Expense Categories:**
- Food & Dining (🍽️, #FF6B6B)
- Transportation (🚗, #4ECDC4)
- Shopping (🛍️, #FFE66D)
- Entertainment (🎬, #A8E6CF)
- Bills & Utilities (📱, #C7CEEA)
- Healthcare (🏥, #FFDAB9)
- Education (📚, #98D8C8)
- Travel (✈️, #F7DC6F)
- Personal Care (💅, #BB8FCE)
- Gifts & Donations (🎁, #85C1E2)
- Investments (📈, #52BE80)
- Insurance (🛡️, #F8B739)
- Rent/Mortgage (🏠, #EC7063)
- Other (📌, #BDC3C7)

**Income Categories:**
- Salary (💰, #27AE60)
- Freelance (💼, #3498DB)
- Business (🏢, #9B59B6)
- Investments (📊, #F39C12)
- Rental Income (🏘️, #E74C3C)
- Gifts (🎁, #1ABC9C)
- Refunds (💵, #34495E)
- Other (💸, #95A5A6)

## Performance Considerations

### Recommended Indexes
1. `transactions(user_id, date)` - For date range queries
2. `transactions(user_id, type)` - For income/expense filtering
3. `transactions(user_id, category_id)` - For category filtering
4. `categories(user_id, type)` - For category listings
5. `budgets(user_id, is_active)` - For active budget queries

### Query Optimization Tips
1. Use pagination for transaction lists
2. Index frequently filtered columns
3. Consider partitioning transactions by date for large datasets
4. Use materialized views for complex statistics
5. Archive old transactions to separate table

## Future Schema Considerations

### Planned Enhancements
1. **Recurring Transactions Table** - Separate recurring logic
2. **Transaction Attachments** - Multiple receipts per transaction
3. **Budget History** - Track budget changes over time
4. **User Preferences** - Expanded settings storage
5. **Audit Log** - Track all data modifications

### Migration Strategy
1. Always use Alembic for schema changes
2. Test migrations on copy of production data
3. Plan for zero-downtime migrations
4. Keep migration files in version control
5. Document breaking changes

## Backup and Recovery

### Backup Strategy
```bash
# Daily backup
pg_dump -h localhost -p 5433 -U expense_user -d expense_tracker_db > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -p 5433 -U expense_user -d expense_tracker_db < backup_20240115.sql
```

### Data Retention Policy
- Transaction data: Indefinite
- User data: Until account deletion
- Audit logs: 1 year
- Backup files: 30 days