import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNotifications } from './useNotifications';
import { useUser } from '../contexts/UserContext';
import { 
  Transaction, 
  TransactionCreate, 
  TransactionUpdate, 
  TransactionFilter,
  TransactionStatistics,
  BulkTransactionOperation,
  DashboardStats,
  PaginatedTransactionResponse 
} from '../types/transaction';
import { API_BASE_URL } from '../config';
import { transactionEventBus } from '../utils/eventBus';

interface UseTransactionsOptions {
  autoFetch?: boolean;
  initialFilter?: TransactionFilter;
}

export const useTransactions = (options: UseTransactionsOptions = {}) => {
  const { autoFetch = true, initialFilter = {} } = options;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<TransactionStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  const { addNotification } = useNotifications();
  const { user } = useUser();

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  const fetchTransactions = useCallback(async (customFilter?: TransactionFilter) => {
    setLoading(true);
    try {
      const params: any = customFilter || filter;
      
      // Convert dates to ISO strings if they exist
      if (params.start_date) {
        params.start_date = new Date(params.start_date).toISOString();
      }
      if (params.end_date) {
        params.end_date = new Date(params.end_date).toISOString();
      }
      
      // Convert tags array to comma-separated string
      if (params.tags && Array.isArray(params.tags)) {
        params.tags = params.tags.join(',');
      }
      
      const response = await api.get('/transactions', { params });
      setTransactions(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      addNotification('error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchTransactionsPaginated = useCallback(async (page?: number, customFilter?: TransactionFilter) => {
    setLoading(true);
    try {
      const params: any = {
        ...(customFilter || filter),
        page: page || currentPage,
        page_size: pageSize
      };
      
      // Convert dates to ISO strings if they exist
      if (params.start_date) {
        params.start_date = new Date(params.start_date).toISOString();
      }
      if (params.end_date) {
        params.end_date = new Date(params.end_date).toISOString();
      }
      
      // Convert tags array to comma-separated string
      if (params.tags && Array.isArray(params.tags)) {
        params.tags = params.tags.join(',');
      }
      
      const response = await api.get<PaginatedTransactionResponse>('/transactions/paginated', { params });
      setTransactions(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotalTransactions(response.data.total);
      if (page) {
        setCurrentPage(page);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
      addNotification('error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, pageSize]);

  const searchTransactions = async (query: string): Promise<Transaction[]> => {
    try {
      const response = await api.get('/transactions/search', { params: { q: query } });
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Search failed');
      throw err;
    }
  };

  const fetchStatistics = async (startDate?: string, endDate?: string) => {
    try {
      const params: any = {};
      if (startDate) params.start_date = new Date(startDate).toISOString();
      if (endDate) params.end_date = new Date(endDate).toISOString();
      
      const response = await api.get('/transactions/statistics', { params });
      setStatistics(response.data);
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Failed to fetch statistics');
      throw err;
    }
  };

  const getTransaction = async (id: number): Promise<Transaction> => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Failed to fetch transaction');
      throw err;
    }
  };

  const addTransaction = async (transaction: TransactionCreate) => {
    try {
      const response = await api.post('/transactions', transaction);
      setTransactions([response.data, ...transactions]);
      addNotification('success', 'Transaction created successfully');
      // Emit event to refresh other components
      transactionEventBus.emit('transactionUpdated');
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Failed to create transaction');
      throw err;
    }
  };

  const updateTransaction = async (id: number, update: TransactionUpdate) => {
    try {
      const response = await api.put(`/transactions/${id}`, update);
      setTransactions(transactions.map(t => t.id === id ? response.data : t));
      addNotification('success', 'Transaction updated successfully');
      // Emit event to refresh other components
      transactionEventBus.emit('transactionUpdated');
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
      addNotification('success', 'Transaction deleted successfully');
      // Emit event to refresh other components
      transactionEventBus.emit('transactionUpdated');
    } catch (err: any) {
      addNotification('error', 'Failed to delete transaction');
      throw err;
    }
  };

  const bulkOperation = async (operation: BulkTransactionOperation) => {
    try {
      const response = await api.post('/transactions/bulk', operation);
      addNotification('success', response.data.message);
      // Refresh transactions after bulk operation
      await fetchTransactions();
      // Emit event to refresh other components
      transactionEventBus.emit('transactionUpdated');
      return response.data;
    } catch (err: any) {
      addNotification('error', err.response?.data?.detail || 'Bulk operation failed');
      throw err;
    }
  };

  const importTransactions = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/transactions/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.errors.length > 0) {
        addNotification('warning', `Imported ${response.data.imported} transactions with ${response.data.errors.length} errors`);
      } else {
        addNotification('success', response.data.message);
      }
      
      // Refresh transactions after import
      await fetchTransactions();
      // Emit event to refresh other components
      transactionEventBus.emit('transactionUpdated');
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Failed to import transactions');
      throw err;
    }
  };

  const exportTransactions = async (startDate?: string, endDate?: string): Promise<Blob> => {
    try {
      const params: any = {};
      if (startDate) params.start_date = new Date(startDate).toISOString();
      if (endDate) params.end_date = new Date(endDate).toISOString();
      
      const response = await api.get('/transactions/export/csv', {
        params,
        responseType: 'blob',
      });
      
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Failed to export transactions');
      throw err;
    }
  };

  const getRecurringTransactions = async (): Promise<Transaction[]> => {
    try {
      const response = await api.get('/transactions/recurring');
      return response.data;
    } catch (err: any) {
      addNotification('error', 'Failed to fetch recurring transactions');
      throw err;
    }
  };

  const updateFilter = (newFilter: TransactionFilter) => {
    setFilter(newFilter);
  };

  const getDashboardStats = useCallback((): DashboardStats => {
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
  }, [transactions]);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
  }, [autoFetch, fetchTransactions]);
  
  // Refresh transactions when user's currency changes
  useEffect(() => {
    if (user?.currency && autoFetch) {
      // Clear existing transactions to force fresh data
      setTransactions([]);
      fetchTransactions();
    }
  }, [user?.currency]);

  // Listen for transaction updates from other components
  useEffect(() => {
    const handleTransactionUpdate = () => {
      // Refresh using the paginated endpoint if page size is set
      if (pageSize > 0 && currentPage > 0) {
        fetchTransactionsPaginated(currentPage);
      } else {
        fetchTransactions();
      }
    };

    transactionEventBus.on('transactionUpdated', handleTransactionUpdate);

    return () => {
      transactionEventBus.off('transactionUpdated', handleTransactionUpdate);
    };
  }, [fetchTransactions, fetchTransactionsPaginated, currentPage, pageSize]);

  return {
    transactions,
    statistics,
    loading,
    error,
    filter,
    fetchTransactions,
    fetchTransactionsPaginated,
    searchTransactions,
    fetchStatistics,
    getTransaction,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkOperation,
    importTransactions,
    exportTransactions,
    getRecurringTransactions,
    updateFilter,
    getDashboardStats,
    // Pagination state and methods
    currentPage,
    pageSize,
    totalPages,
    totalTransactions,
    setPageSize,
    setCurrentPage,
  };
};