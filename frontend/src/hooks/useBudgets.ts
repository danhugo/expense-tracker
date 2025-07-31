import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { Budget, BudgetWithUsage, BudgetCreate, BudgetUpdate } from '../types/budget';
import { API_BASE_URL } from '../config';

export const useBudgets = () => {
  const { user } = useUser();
  const [budgets, setBudgets] = useState<BudgetWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/budgets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBudgets(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createBudget = async (budget: BudgetCreate) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_BASE_URL}/budgets`, budget, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBudgets(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error creating budget:', err);
      throw err;
    }
  };

  const updateBudget = async (id: number, budget: BudgetUpdate) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`${API_BASE_URL}/budgets/${id}`, budget, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBudgets(prev => prev.map(b => b.id === id ? response.data : b));
      return response.data;
    } catch (err) {
      console.error('Error updating budget:', err);
      throw err;
    }
  };

  const deleteBudget = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_BASE_URL}/budgets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting budget:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Refresh budgets when user's currency changes
  useEffect(() => {
    if (user?.currency) {
      fetchBudgets();
    }
  }, [user?.currency]);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  };
};