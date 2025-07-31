import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotifications } from './useNotifications';
import { Category, CategoryCreate, CategoryUpdate, CategoryBudgetStatus } from '../types/transaction';
import { API_BASE_URL } from '../config';
import { transactionEventBus } from '../utils/eventBus';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  const fetchCategories = async (type?: 'income' | 'expense') => {
    setLoading(true);
    try {
      const params = type ? { type } : {};
      const response = await api.get('/categories', { params });
      setCategories(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      addNotification('error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: CategoryCreate) => {
    try {
      const response = await api.post('/categories', category);
      setCategories([...categories, response.data]);
      addNotification('success', 'Category created successfully');
      // Emit event to refresh transaction displays
      transactionEventBus.emit('transactionUpdated');
      return response.data;
    } catch (err: any) {
      addNotification('error', err.response?.data?.detail || 'Failed to create category');
      throw err;
    }
  };

  const updateCategory = async (id: number, update: CategoryUpdate) => {
    try {
      const response = await api.put(`/categories/${id}`, update);
      setCategories(categories.map(cat => cat.id === id ? response.data : cat));
      addNotification('success', 'Category updated successfully');
      // Emit event to refresh transaction displays
      transactionEventBus.emit('transactionUpdated');
      return response.data;
    } catch (err: any) {
      addNotification('error', err.response?.data?.detail || 'Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(cat => cat.id !== id));
      addNotification('success', 'Category deleted successfully');
      // Emit event to refresh transaction displays
      transactionEventBus.emit('transactionUpdated');
    } catch (err: any) {
      addNotification('error', err.response?.data?.detail || 'Failed to delete category');
      throw err;
    }
  };

  const getCategoryBudgetStatus = async (id: number, month?: number, year?: number): Promise<CategoryBudgetStatus> => {
    try {
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;
      
      const response = await api.get(`/categories/${id}/budget-status`, { params });
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Failed to fetch budget status');
      throw err;
    }
  };

  const createDefaultCategories = async () => {
    try {
      const response = await api.post('/categories/default');
      addNotification('success', response.data.message);
      await fetchCategories();
      // Emit event to refresh transaction displays
      transactionEventBus.emit('transactionUpdated');
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Failed to create default categories');
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Listen for transaction updates to refresh categories if needed
  useEffect(() => {
    const handleTransactionUpdate = () => {
      fetchCategories();
    };

    transactionEventBus.on('transactionUpdated', handleTransactionUpdate);

    return () => {
      transactionEventBus.off('transactionUpdated', handleTransactionUpdate);
    };
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryBudgetStatus,
    createDefaultCategories,
  };
};