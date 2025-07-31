export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  category_id?: number;
  category_details?: Category;
  description: string;
  date: string;
  payment_method?: string;
  location?: string;
  tags?: string[];
  receipt_url?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  payment_method?: string;
  location?: string;
  tags?: string[];
  receipt_url?: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
}

export interface TransactionUpdate {
  amount?: number;
  type?: 'income' | 'expense';
  category?: string;
  description?: string;
  date?: string;
  payment_method?: string;
  location?: string;
  tags?: string[];
  receipt_url?: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
}

export interface TransactionFilter {
  start_date?: string;
  end_date?: string;
  type?: 'income' | 'expense';
  category?: string;
  min_amount?: number;
  max_amount?: number;
  payment_method?: string;
  search?: string;
  tags?: string[];
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  budget_limit?: number;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  budget_limit?: number;
}

export interface CategoryUpdate {
  name?: string;
  icon?: string;
  color?: string;
  budget_limit?: number;
}

export interface CategoryBudgetStatus {
  category: string;
  budget_limit: number | null;
  spent: number;
  remaining: number | null;
  percentage: number;
  month: number;
  year: number;
  status: 'within' | 'over';
}

export interface TransactionStatistics {
  total_income: number;
  total_expenses: number;
  balance: number;
  transaction_count: number;
  average_transaction: number;
  largest_expense?: Transaction;
  largest_income?: Transaction;
  expenses_by_category: Record<string, number>;
  income_by_category: Record<string, number>;
  daily_average: number;
  monthly_trend: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface BulkTransactionOperation {
  transaction_ids: number[];
  operation: 'delete' | 'update_category' | 'add_tags';
  data?: {
    category?: string;
    tags?: string[];
  };
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  transactionCount: number;
}

export interface PaginatedTransactionResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'other', label: 'Other' }
];

export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];