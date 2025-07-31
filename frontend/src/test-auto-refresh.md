# Auto-Refresh Test Checklist

## Test Scenarios

### 1. Transaction Operations
- [ ] Add a new transaction in TransactionModal
  - Dashboard should auto-refresh and show the new transaction
  - Transaction count in stats should update
  - Charts should update with new data
  
- [ ] Edit an existing transaction
  - All transaction lists should update immediately
  - Charts should reflect the changes
  
- [ ] Delete a transaction
  - Transaction should disappear from all views
  - Stats and charts should update

### 2. Bulk Operations
- [ ] Perform bulk delete
  - All affected transactions should be removed
  - Stats should update accordingly
  
- [ ] Perform bulk update
  - All affected transactions should show new values
  - Categories/amounts in charts should update

### 3. Import Operations  
- [ ] Import CSV file with transactions
  - New transactions should appear immediately
  - Stats and charts should update with imported data

### 4. Category Operations
- [ ] Create a new category
  - Should trigger refresh of transaction displays
  
- [ ] Update a category
  - Transactions using that category should reflect changes
  
- [ ] Delete a category
  - Affected transactions should update

## Event Flow

1. User performs action (add/edit/delete/import)
2. Hook function emits 'transactionUpdated' event
3. All instances of useTransactions hook receive event
4. Each instance calls fetchTransactions() to refresh data
5. Components re-render with updated data

## Components That Should Auto-Refresh

- Dashboard (recent transactions, stats, charts)
- Transactions page (full transaction list)
- Any other component using useTransactions hook