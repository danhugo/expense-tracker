
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TransactionTable from '../components/TransactionTable';
import Pagination from '../components/Pagination';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types/transaction';

interface TransactionsProps {
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: () => void;
}

const Transactions = ({ onEditTransaction, onDeleteTransaction, onAddTransaction }: TransactionsProps) => {
  const { 
    transactions, 
    loading,
    fetchTransactionsPaginated,
    currentPage,
    pageSize,
    totalPages,
    totalTransactions,
    setPageSize,
    setCurrentPage
  } = useTransactions({ autoFetch: false });
  
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Reset to first page when filters change
  const handleFilterTypeChange = (value: 'all' | 'income' | 'expense') => {
    setFilterType(value);
    setCurrentPage(1);
  };
  
  const handleSortByChange = (value: 'date' | 'amount') => {
    setSortBy(value);
    setCurrentPage(1);
  };
  
  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  // Fetch transactions when filters or pagination changes
  useEffect(() => {
    const filter: any = {
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    
    if (filterType !== 'all') {
      filter.type = filterType;
    }
    
    fetchTransactionsPaginated(currentPage, filter);
  }, [filterType, sortBy, sortOrder, currentPage, pageSize, fetchTransactionsPaginated]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Gradient Background */}
      <div className="bg-gradient-to-r from-primary-green to-accent-yellow p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">All Transactions</h1>
            <p className="text-white/90 mt-1">Manage your income and expenses</p>
          </div>
          
          {/* Add Transaction Button - Primary action on this page */}
          <button
            onClick={onAddTransaction}
            className="flex items-center px-6 py-3 bg-black/40 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transform hover:scale-105 transition-all duration-200 shadow-lg border border-white/20 self-start sm:self-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Transaction
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter by Type */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterType}
                onChange={(e) => handleFilterTypeChange(e.target.value as 'all' | 'income' | 'expense')}
                className="py-1 px-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortByChange(e.target.value as 'date' | 'amount')}
                className="py-1 px-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
                className="py-1 px-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Transaction Count */}
          <div className="text-sm text-gray-500">
            {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
          </div>
        </div>
      ) : (
        <>
          <TransactionTable 
            transactions={transactions}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
          />
          
          {/* Pagination */}
          {totalTransactions > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              totalItems={totalTransactions}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;
