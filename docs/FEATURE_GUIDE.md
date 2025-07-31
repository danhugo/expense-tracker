# Feature Development Guide

This guide provides detailed instructions for developing and modifying features in the HUFI Expense Tracker application.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Transaction Management](#transaction-management)
3. [Category System](#category-system)
4. [Multi-Currency Support](#multi-currency-support)
5. [Budget Management](#budget-management)
6. [File Storage System](#file-storage-system)
7. [Notification System](#notification-system)
8. [Adding New Features](#adding-new-features)

## Authentication System

### Overview
JWT-based authentication with Google OAuth support.

### Key Files
- Backend: `auth.py`, `routers/auth_router.py`
- Frontend: `contexts/UserContext.tsx`, `pages/Login.tsx`

### How to Modify

#### Adding a New OAuth Provider
1. Add provider credentials to `.env`
2. Create OAuth handler in `auth_router.py`
3. Update login UI in `Login.tsx`
4. Add provider button component

#### Changing Token Expiration
```python
# backend/auth.py
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Change this value
```

#### Adding Role-Based Access
1. Add `role` field to User model
2. Create role checking decorator
3. Apply to protected endpoints
4. Update frontend route guards

### Common Issues
- Token expiration: Check localStorage for expired tokens
- CORS errors: Verify allowed origins in `app.py`
- OAuth failures: Check provider credentials and redirect URLs

## Transaction Management

### Overview
Core feature for tracking income and expenses with advanced filtering.

### Key Files
- Backend: `routers/transactions.py`, `models.py` (Transaction model)
- Frontend: `hooks/useTransactions.tsx`, `pages/Transactions.tsx`

### How to Modify

#### Adding New Transaction Fields
1. **Update Database Model** (`models.py`):
```python
# Add to Transaction model
new_field = Column(String, nullable=True)
```

2. **Create Migration**:
```bash
alembic revision --autogenerate -m "Add new_field to transactions"
alembic upgrade head
```

3. **Update Pydantic Schemas**:
```python
# In models.py
class TransactionBase(BaseModel):
    new_field: Optional[str] = None
```

4. **Update Frontend Types** (`types/transaction.ts`):
```typescript
export interface Transaction {
  new_field?: string;
}
```

5. **Update UI Components**

#### Implementing Custom Filters
1. Add filter parameter to `TransactionFilter` schema
2. Update query logic in `get_transactions` endpoint
3. Add UI controls in filter component
4. Update `useTransactions` hook

#### Adding Bulk Operations
1. Define operation in `BulkTransactionOperation` enum
2. Implement logic in `bulk_transaction_operation` endpoint
3. Add UI for selection and action
4. Handle optimistic updates

### CSV Import/Export

#### Customizing CSV Format
```python
# backend/routers/transactions.py
CSV_HEADERS = ['Date', 'Amount', 'Type', 'Category', 'Description']
```

#### Adding Import Validation
```python
def validate_csv_row(row: dict) -> dict:
    # Add custom validation logic
    if float(row['amount']) < 0:
        raise ValueError("Amount must be positive")
    return row
```

## Category System

### Overview
User-specific categories with icons, colors, and budget limits.

### Key Files
- Backend: `routers/categories.py`
- Frontend: `pages/Categories.tsx`, `hooks/useCategories.ts`

### How to Modify

#### Adding Category Templates
1. Create template definitions:
```python
CATEGORY_TEMPLATES = {
    "freelancer": [
        {"name": "Client Work", "icon": "💼", "type": "income"},
        {"name": "Software", "icon": "💻", "type": "expense"}
    ]
}
```

2. Add endpoint to apply template
3. Create UI for template selection

#### Implementing Category Groups
1. Add `parent_id` field to Category model
2. Update queries to support hierarchy
3. Create tree view component
4. Handle nested category selection

#### Adding Category Analytics
1. Create statistics endpoint:
```python
@router.get("/categories/{id}/statistics")
async def get_category_statistics(id: int, ...):
    # Calculate spending trends, averages, etc.
```

2. Create visualization components
3. Add to category detail view

### Default Categories

#### Modifying Default Categories
Edit the lists in `create_default_categories()` function:
```python
expense_categories = [
    {"name": "Custom Category", "icon": "🆕", "color": "#000000"},
    # ... more categories
]
```

## Multi-Currency Support

### Overview
Support for 150+ currencies with real-time conversion.

### Key Files
- Backend: `currencies.py`, `currency_utils.py`, `routers/currency.py`
- Frontend: `components/CurrencyPreviewModal.tsx`

### How to Modify

#### Adding a New Currency
1. Add to `SUPPORTED_CURRENCIES` in `currencies.py`
2. Ensure exchange rate API supports it
3. Add flag icon if needed

#### Changing Exchange Rate Provider
1. Update `get_exchange_rates()` in `currency_utils.py`:
```python
async def get_exchange_rates():
    # Implement new provider API call
    response = await new_provider_api()
    return format_rates(response)
```

#### Implementing Historical Rates
1. Create exchange_rates table
2. Store rates periodically
3. Update conversion logic to use historical rates
4. Add date parameter to conversion endpoints

### Currency Conversion

#### Batch Conversion Process
1. Create conversion record
2. Process transactions in batches
3. Update progress periodically
4. Handle failures gracefully

#### Adding Conversion Rollback
```python
@router.post("/currency/rollback/{conversion_id}")
async def rollback_conversion(conversion_id: int, ...):
    # Restore original amounts
    # Update user currency
    # Mark conversion as rolled back
```

## Budget Management

### Overview
Flexible budgeting system with alerts and tracking.

### Key Files
- Backend: `routers/budgets.py`
- Frontend: `pages/Budget.tsx`, `hooks/useBudgets.ts`

### How to Modify

#### Adding Budget Templates
```typescript
const BUDGET_TEMPLATES = {
  "50/30/20": {
    needs: 0.5,
    wants: 0.3,
    savings: 0.2
  }
};
```

#### Implementing Budget Alerts
1. Create alert checking service
2. Run periodically or on transaction
3. Store alert preferences
4. Send notifications

#### Adding Budget Forecasting
1. Analyze spending patterns
2. Calculate projected spending
3. Create forecast endpoint
4. Build visualization component

### Budget Categories

#### Linking Budgets to Multiple Categories
1. Create budget_categories junction table
2. Update budget creation logic
3. Modify spending calculations
4. Update UI for multi-select

## File Storage System

### Overview
Abstracted storage supporting local and S3-compatible services.

### Key Files
- Backend: `storage/` directory
- Configuration: `.env.storage.example`

### How to Modify

#### Adding a New Storage Provider
1. Create provider class:
```python
# storage/provider.py
class ProviderStorage(StorageService):
    async def upload(self, file, key):
        # Implement upload logic
    
    async def delete(self, key):
        # Implement delete logic
```

2. Register in factory:
```python
# storage/factory.py
if storage_type == "provider":
    return ProviderStorage(config)
```

#### Implementing File Compression
```python
async def upload(self, file: UploadFile, key: str):
    # Compress image before upload
    compressed = await compress_image(file)
    return await super().upload(compressed, key)
```

#### Adding File Validation
```python
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_file(file: UploadFile):
    if not any(file.filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise ValueError("Invalid file type")
    if file.size > MAX_FILE_SIZE:
        raise ValueError("File too large")
```

## Notification System

### Overview
Toast-based notification system with queuing support.

### Key Files
- Frontend: `contexts/NotificationContext.tsx`, `hooks/useNotifications.tsx`

### How to Modify

#### Adding Notification Types
```typescript
type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'custom';

const notificationStyles = {
  custom: 'bg-purple-500 text-white'
};
```

#### Implementing Persistent Notifications
1. Add `persistent` flag to notification
2. Skip auto-dismiss for persistent
3. Require manual dismissal
4. Store in localStorage if needed

#### Adding Action Buttons
```typescript
interface Notification {
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}
```

## Adding New Features

### Planning Checklist
- [ ] Define feature requirements
- [ ] Plan database changes
- [ ] Design API endpoints
- [ ] Create UI mockups
- [ ] Consider mobile responsiveness
- [ ] Plan for testing

### Implementation Steps

1. **Database Layer**
   - Create/modify models
   - Generate migrations
   - Test migrations

2. **Backend API**
   - Create router file
   - Implement endpoints
   - Add validation
   - Write API tests

3. **Frontend Types**
   - Define TypeScript interfaces
   - Create type guards if needed

4. **Frontend Logic**
   - Create custom hook
   - Implement data fetching
   - Handle errors
   - Add loading states

5. **UI Components**
   - Build with shadcn/ui
   - Ensure accessibility
   - Make responsive
   - Add animations

6. **Integration**
   - Connect all parts
   - Test end-to-end
   - Handle edge cases
   - Optimize performance

### Example: Adding Tags Feature

1. **Database Changes**:
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR NOT NULL,
  color VARCHAR
);

CREATE TABLE transaction_tags (
  transaction_id INTEGER REFERENCES transactions(id),
  tag_id INTEGER REFERENCES tags(id),
  PRIMARY KEY (transaction_id, tag_id)
);
```

2. **Backend Endpoints**:
```python
@router.get("/tags")
async def get_tags(current_user: User = Depends(get_current_user)):
    # Return user's tags

@router.post("/tags")
async def create_tag(tag: TagCreate, ...):
    # Create new tag

@router.post("/transactions/{id}/tags")
async def add_transaction_tags(id: int, tag_ids: List[int], ...):
    # Associate tags with transaction
```

3. **Frontend Hook**:
```typescript
export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  
  const fetchTags = async () => {
    const response = await api.get('/tags');
    setTags(response.data);
  };
  
  return { tags, fetchTags, ... };
};
```

4. **UI Component**:
```typescript
const TagSelector = ({ selected, onChange }) => {
  const { tags } = useTags();
  
  return (
    <MultiSelect
      options={tags}
      selected={selected}
      onChange={onChange}
    />
  );
};
```

## Best Practices

### Code Organization
- Keep related code together
- Use consistent naming conventions
- Extract reusable logic to hooks/utils
- Document complex algorithms

### Performance
- Implement pagination for lists
- Use React.memo for expensive components
- Debounce search inputs
- Cache frequently accessed data

### Security
- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Audit sensitive operations

### Testing
- Write unit tests for utilities
- Test API endpoints
- Add integration tests
- Perform manual testing

### Documentation
- Update API docs
- Add inline comments
- Update type definitions
- Create user guides