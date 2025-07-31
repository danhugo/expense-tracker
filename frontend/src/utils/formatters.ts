export const formatCurrency = (
  amount: number | undefined | null,
  symbol: string = '$',
  currencyCode: string = 'USD',
  position: 'before' | 'after' = 'before'
): string => {
  // Handle undefined or null amounts
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${symbol}0.00`;
  }
  
  const formattedAmount = amount.toFixed(2);
  
  // For now, always place symbol before amount
  // TODO: Implement proper position handling based on currency settings
  return `${symbol}${formattedAmount}`;
};