
import { useState, useEffect, useCallback } from 'react';
import { Transaction, DashboardStats } from '../types/transaction';
import { API_BASE_URL } from '../config';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch transactions from the backend
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken'); // Assuming you store token in localStorage
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to fetch transactions: ${response.statusText}`);
      }
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching transactions.');
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Authentication token not found.");

      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to add transaction: ${response.statusText}`);
      }
      const addedTransaction: Transaction = await response.json();
      setTransactions(prev => [addedTransaction, ...prev]); // Add new transaction to the top
      return addedTransaction;
    } catch (err: any) {
      setError(err.message || 'Error adding transaction');
      throw err; // Re-throw to allow component to handle
    }
  };

  const updateTransaction = async (id: number, transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Authentication token not found.");

      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to update transaction: ${response.statusText}`);
      }
      const updatedTransaction: Transaction = await response.json();
      setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
      return updatedTransaction;
    } catch (err: any) {
      setError(err.message || 'Error updating transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Authentication token not found.");

      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to delete transaction: ${response.statusText}`);
      }
      setTransactions(prev => prev.filter(t => t.id !== String(id)));
    } catch (err: any) {
      setError(err.message || 'Error deleting transaction');
      throw err;
    }
  };

  const getDashboardStats = useCallback((): DashboardStats => {
    // You might need to adjust this if your backend provides aggregated stats
    const totalIncome = transactions
      .filter(t => t.type.toLowerCase() === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type.toLowerCase() === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = transactions.reduce((sum, transaction) => {
      return transaction.type.toLowerCase() === 'income'
        ? sum + transaction.amount
        : sum - transaction.amount;
    }, 0);

    // For monthly stats, you'd typically filter by month on the frontend
    // or request specific monthly stats from the backend.
    // For simplicity, this calculates based on all fetched transactions.
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type.toLowerCase() === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type.toLowerCase() === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  return {
    transactions,
    loading,
    error,
    getDashboardStats,
    fetchTransactions, // Exposed to allow manual refetching
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
