# Historical Exchange Rates Implementation

## Problem Statement
The previous implementation was applying current exchange rates to historical transactions, which is fundamentally wrong. For example:
- A transaction from 2010 in VND would be converted using 2025 exchange rates
- This distorts the actual value of historical transactions
- Makes financial history inaccurate and misleading

## Solution Implemented

### 1. Database Schema Update
Added `exchange_rate_to_usd` column to the `transactions` table:
```sql
ALTER TABLE transactions ADD COLUMN exchange_rate_to_usd FLOAT;
```

This stores the exchange rate from the transaction currency to USD at the time of the transaction.

### 2. Three Key Values Stored
Each transaction now stores:
```json
{
  "amount": 10000,               // Amount in user's display currency
  "original_amount": 10000,      // Amount in transaction currency
  "original_currency": "VND",    // Currency at time of transaction
  "exchange_rate_to_usd": 0.00004  // Historical rate to USD
}
```

### 3. Historical Rate Fetching
Implemented `get_historical_exchange_rate()` function that:
- Uses frankfurter.app API for free historical rates
- Falls back to current rates if historical data unavailable
- Caches results to minimize API calls

### 4. Currency Conversion Logic
When converting currencies:
1. **Historical Accuracy**: Use the stored `exchange_rate_to_usd` to convert to USD using historical rate
2. **Current Conversion**: Convert from USD to target currency using current rate
3. **Preserves Value**: The historical value is preserved accurately

Example:
- 2010 transaction: 100,000 VND (worth $5 USD in 2010)
- Stored: exchange_rate_to_usd = 0.00005
- Converting to EUR in 2025:
  - Step 1: 100,000 VND × 0.00005 = $5 USD (using 2010 rate)
  - Step 2: $5 USD × 0.92 = €4.60 EUR (using 2025 rate)

### 5. API Changes

#### Transaction Creation
```python
# Now fetches and stores historical rate
exchange_rate_to_usd = await get_historical_exchange_rate(
    transaction_currency, 
    "USD", 
    transaction_date
)
```

#### Transaction Update
When amount or date changes, the exchange rate is recalculated.

#### Currency Conversion
The conversion process now respects historical rates:
```python
if tx.exchange_rate_to_usd:
    # Convert using historical rate
    amount_in_usd = tx.original_amount * tx.exchange_rate_to_usd
    tx.amount = amount_in_usd * current_target_rate
```

## Benefits

1. **Historical Accuracy**: Past transactions maintain their true historical value
2. **Proper Accounting**: Financial records reflect actual exchange rates at time of transaction
3. **Audit Trail**: Complete record of exchange rates used
4. **Future-Proof**: Can handle multi-currency transactions properly

## Migration Strategy

For existing transactions without `exchange_rate_to_usd`:
1. Set to 1.0 for USD transactions
2. Use current rates as fallback for others
3. Allow users to manually correct if needed

## Testing

1. Create transaction in VND with date from 2010
2. Verify correct historical rate is fetched and stored
3. Change currency to EUR
4. Verify conversion uses historical VND→USD rate and current USD→EUR rate
5. Check that value reflects historical worth, not current exchange rate

## Important Notes

- Always store the exchange rate at time of transaction
- Never retroactively apply current rates to historical data
- The `amount` field shows value in user's current display currency
- The `original_amount` + `original_currency` + `exchange_rate_to_usd` preserve the historical record

This implementation ensures financial data integrity and accurate historical reporting.