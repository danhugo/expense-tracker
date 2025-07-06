
import { useState, useEffect } from 'react';
import { Transaction, DashboardStats } from '../types/transaction';

const STORAGE_KEY = 'expense-manager-transactions';

// Sample data for demonstration
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 3500.00,
    type: 'income',
    category: 'Salary',
    description: 'Monthly salary',
    date: '2025-01-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    amount: 45.50,
    type: 'expense',
    category: 'Food & Dining',
    description: 'Lunch at cafe',
    date: '2025-01-05',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    amount: 120.00,
    type: 'expense',
    category: 'Shopping',
    description: 'Groceries',
    date: '2025-01-04',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    amount: 850.00,
    type: 'expense',
    category: 'Bills & Utilities',
    description: 'Rent payment',
    date: '2025-01-01',
    createdAt: new Date().toISOString(),
  }
];

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      // Initialize with sample data
      setTransactions(sampleTransactions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTransactions));
    }
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === id 
        ? { ...transaction, ...transactionData }
        : transaction
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const getDashboardStats = (): DashboardStats => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = transactions.reduce((sum, transaction) => {
      return transaction.type === 'income' 
        ? sum + transaction.amount 
        : sum - transaction.amount;
    }, 0);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      transactionCount: transactions.length,
    };
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getDashboardStats,
  };
};
