export interface Budget {
  id: number;
  user_id: number;
  name: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  category_id?: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  current_spent?: number;
  percentage_used?: number;
}

export interface BudgetWithUsage extends Budget {
  current_spent: number;
  percentage_used: number;
  remaining_amount: number;
  days_remaining?: number;
}

export interface BudgetCreate {
  name: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  category_id?: number;
  start_date: string;
  end_date?: string;
  alert_threshold?: number;
}

export interface BudgetUpdate {
  name?: string;
  amount?: number;
  period?: string;
  category_id?: number;
  end_date?: string;
  is_active?: boolean;
  alert_threshold?: number;
}

export interface BudgetAlert {
  budget_id: number;
  budget_name: string;
  category?: string;
  amount: number;
  current_spent: number;
  percentage_used: number;
  alert_threshold: number;
  days_remaining?: number;
}

interface Category {
  id: number;
  name: string;
  type: string;
  icon?: string;
  color?: string;
}