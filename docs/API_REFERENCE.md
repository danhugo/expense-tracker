# API Reference

Complete API documentation for the HUFI Expense Tracker backend endpoints.

## Base Configuration

- **Base URL**: `http://localhost:8060`
- **Authentication**: JWT Bearer token in Authorization header
- **Content-Type**: `application/json` (unless specified otherwise)

## Authentication Headers

For protected endpoints, include:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Endpoints

#### Register New User
```http
POST /signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: 200 OK
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "profile_picture_url": null,
  "currency": "USD",
  "currency_symbol": "$"
}
```

#### User Login
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Google OAuth Login
```http
POST /google-login
Content-Type: application/json

{
  "id_token_str": "google-oauth-id-token"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### User Management Endpoints

#### Get Current User Profile
```http
GET /users/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "profile_picture_url": "http://localhost:8060/uploads/users/1/profile_123.jpg",
  "currency": "USD",
  "currency_symbol": "$"
}
```

#### Update User Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "currency": "EUR",
  "currency_symbol": "€"
}

Response: 200 OK
{
  "id": 1,
  "name": "John Updated",
  "email": "john.updated@example.com",
  "profile_picture_url": "...",
  "currency": "EUR",
  "currency_symbol": "€"
}
```

#### Upload Profile Picture
```http
POST /users/me/profile-picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary-image-data>

Response: 200 OK
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "profile_picture_url": "http://localhost:8060/uploads/users/1/profile_123.jpg",
  "currency": "USD",
  "currency_symbol": "$"
}
```

#### Delete Profile Picture
```http
DELETE /users/me/profile-picture
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "profile_picture_url": null,
  "currency": "USD",
  "currency_symbol": "$"
}
```

#### Get Supported Currencies
```http
GET /currencies

Response: 200 OK
[
  {
    "code": "USD",
    "symbol": "$",
    "name": "US Dollar",
    "position": "before"
  },
  {
    "code": "EUR",
    "symbol": "€",
    "name": "Euro",
    "position": "before"
  }
  // ... more currencies
]
```

### Transaction Endpoints

#### List Transactions
```http
GET /transactions
Authorization: Bearer <token>

Query Parameters:
- start_date: ISO date string (optional)
- end_date: ISO date string (optional)
- type: "income" or "expense" (optional)
- category: string (optional)
- min_amount: number (optional)
- max_amount: number (optional)
- payment_method: string (optional)
- search: string (optional)
- tags: comma-separated string (optional)

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "amount": 50.00,
    "type": "expense",
    "category": "Food & Dining",
    "category_id": 5,
    "description": "Lunch at restaurant",
    "date": "2024-01-15T12:00:00",
    "payment_method": "credit_card",
    "location": "Downtown Restaurant",
    "tags": ["lunch", "business"],
    "receipt_url": null,
    "is_recurring": false,
    "recurring_frequency": null,
    "created_at": "2024-01-15T12:00:00",
    "updated_at": "2024-01-15T12:00:00"
  }
]
```

#### Get Paginated Transactions
```http
GET /transactions/paginated
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- page_size: number (default: 10)
- (all filter parameters from List Transactions)

Response: 200 OK
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 10,
  "total_pages": 15
}
```

#### Get Single Transaction
```http
GET /transactions/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "amount": 50.00,
  "type": "expense",
  "category": "Food & Dining",
  "category_id": 5,
  "description": "Lunch at restaurant",
  "date": "2024-01-15T12:00:00",
  // ... other fields
}
```

#### Create Transaction
```http
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "type": "expense",
  "category": "Food & Dining",
  "description": "Lunch at restaurant",
  "date": "2024-01-15T12:00:00",
  "payment_method": "credit_card",
  "location": "Downtown Restaurant",
  "tags": ["lunch", "business"],
  "is_recurring": false
}

Response: 201 Created
{
  "id": 1,
  "user_id": 1,
  "amount": 50.00,
  // ... all transaction fields
}
```

#### Update Transaction
```http
PUT /transactions/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 55.00,
  "description": "Updated lunch description"
}

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "amount": 55.00,
  // ... all transaction fields
}
```

#### Delete Transaction
```http
DELETE /transactions/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Transaction deleted successfully"
}
```

#### Bulk Operations
```http
POST /transactions/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "transaction_ids": [1, 2, 3],
  "operation": "delete"  // or "update_category", "add_tags"
  "data": {
    "category": "New Category",  // for update_category
    "tags": ["tag1", "tag2"]     // for add_tags
  }
}

Response: 200 OK
{
  "message": "3 transactions updated successfully"
}
```

#### Get Transaction Statistics
```http
GET /transactions/statistics
Authorization: Bearer <token>

Query Parameters:
- start_date: ISO date string (optional)
- end_date: ISO date string (optional)

Response: 200 OK
{
  "total_income": 5000.00,
  "total_expenses": 3500.00,
  "balance": 1500.00,
  "transaction_count": 150,
  "average_transaction": 33.33,
  "largest_expense": {...},
  "largest_income": {...},
  "expenses_by_category": {
    "Food & Dining": 500.00,
    "Transportation": 300.00
  },
  "income_by_category": {
    "Salary": 4000.00,
    "Freelance": 1000.00
  },
  "daily_average": 116.67,
  "monthly_trend": [
    {
      "month": "2024-01",
      "income": 5000.00,
      "expenses": 3500.00,
      "balance": 1500.00
    }
  ]
}
```

#### Import Transactions (CSV)
```http
POST /transactions/import/csv
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <csv-file>

Response: 200 OK
{
  "message": "Successfully imported 50 transactions",
  "imported": 50,
  "errors": []
}
```

#### Export Transactions (CSV)
```http
GET /transactions/export/csv
Authorization: Bearer <token>

Query Parameters:
- start_date: ISO date string (optional)
- end_date: ISO date string (optional)

Response: 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="transactions_2024.csv"

<CSV data>
```

#### List Recurring Transactions
```http
GET /transactions/recurring
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "amount": 100.00,
    "type": "expense",
    "category": "Bills & Utilities",
    "description": "Monthly internet bill",
    "is_recurring": true,
    "recurring_frequency": "monthly",
    // ... other fields
  }
]
```

### Category Endpoints

#### List Categories
```http
GET /categories
Authorization: Bearer <token>

Query Parameters:
- category_type: "income" or "expense" (optional)

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Food & Dining",
    "type": "expense",
    "icon": "🍽️",
    "color": "#FF6B6B",
    "budget_limit": 500.00,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

#### Get Single Category
```http
GET /categories/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "name": "Food & Dining",
  "type": "expense",
  "icon": "🍽️",
  "color": "#FF6B6B",
  "budget_limit": 500.00,
  "created_at": "2024-01-01T00:00:00"
}
```

#### Create Category
```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Groceries",
  "type": "expense",
  "icon": "🛒",
  "color": "#4ECDC4",
  "budget_limit": 300.00
}

Response: 201 Created
{
  "id": 2,
  "user_id": 1,
  "name": "Groceries",
  "type": "expense",
  "icon": "🛒",
  "color": "#4ECDC4",
  "budget_limit": 300.00,
  "created_at": "2024-01-15T00:00:00"
}
```

#### Update Category
```http
PUT /categories/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Grocery Shopping",
  "budget_limit": 350.00
}

Response: 200 OK
{
  "id": 2,
  "user_id": 1,
  "name": "Grocery Shopping",
  "type": "expense",
  "icon": "🛒",
  "color": "#4ECDC4",
  "budget_limit": 350.00,
  "created_at": "2024-01-15T00:00:00"
}
```

#### Delete Category
```http
DELETE /categories/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Category deleted successfully"
}

Error Response: 400 Bad Request
{
  "detail": "Cannot delete category. It is used by 5 transactions."
}
```

#### Initialize Default Categories
```http
POST /categories/initialize-defaults
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Default categories created successfully",
  "count": 22
}
```

### Budget Endpoints

#### List Budgets
```http
GET /budgets
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Monthly Food Budget",
    "amount": 500.00,
    "period": "monthly",
    "category_id": 1,
    "start_date": "2024-01-01T00:00:00",
    "end_date": null,
    "is_active": true,
    "alert_threshold": 80.0,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "category": {...},
    "current_spent": 350.00,
    "percentage_used": 70.0
  }
]
```

#### Get Single Budget
```http
GET /budgets/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "name": "Monthly Food Budget",
  "amount": 500.00,
  "period": "monthly",
  "category_id": 1,
  // ... all budget fields
}
```

#### Create Budget
```http
POST /budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Monthly Food Budget",
  "amount": 500.00,
  "period": "monthly",
  "category_id": 1,
  "start_date": "2024-01-01T00:00:00",
  "alert_threshold": 80.0
}

Response: 201 Created
{
  "id": 1,
  "user_id": 1,
  "name": "Monthly Food Budget",
  // ... all budget fields
}
```

#### Update Budget
```http
PUT /budgets/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 600.00,
  "alert_threshold": 90.0
}

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "amount": 600.00,
  // ... all budget fields
}
```

#### Delete Budget
```http
DELETE /budgets/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Budget deleted successfully"
}
```

#### Get Budget Usage
```http
GET /budgets/usage
Authorization: Bearer <token>

Query Parameters:
- month: number (1-12)
- year: number

Response: 200 OK
[
  {
    "budget_id": 1,
    "budget_name": "Monthly Food Budget",
    "amount": 500.00,
    "spent": 350.00,
    "remaining": 150.00,
    "percentage_used": 70.0,
    "category": "Food & Dining",
    "is_over_budget": false
  }
]
```

### Currency Endpoints

#### Convert Currency
```http
GET /currency/convert
Authorization: Bearer <token>

Query Parameters:
- amount: number (required)
- from: string (currency code, required)
- to: string (currency code, required)

Response: 200 OK
{
  "amount": 100.00,
  "from": "USD",
  "to": "EUR",
  "converted_amount": 85.50,
  "exchange_rate": 0.855
}
```

#### Change User Currency
```http
POST /currency/change
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_currency": "EUR"
}

Response: 200 OK
{
  "message": "Currency changed successfully",
  "conversion_id": 1,
  "from_currency": "USD",
  "to_currency": "EUR",
  "status": "completed"
}
```

#### Preview Currency Change
```http
GET /currency/preview
Authorization: Bearer <token>

Query Parameters:
- new_currency: string (required)

Response: 200 OK
{
  "current_currency": "USD",
  "new_currency": "EUR",
  "exchange_rate": 0.855,
  "sample_conversions": [
    {
      "original": 100.00,
      "converted": 85.50
    },
    {
      "original": 1000.00,
      "converted": 855.00
    }
  ],
  "total_transactions": 150,
  "total_amount_current": 5000.00,
  "total_amount_new": 4275.00
}
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

## Versioning

The API is currently unversioned. Future versions may include versioning in the URL path (e.g., `/v1/transactions`).