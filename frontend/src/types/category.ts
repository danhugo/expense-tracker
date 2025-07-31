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