
import { useState } from 'react';
import TransactionTable from '../components/TransactionTable';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types/transaction';

interface TransactionsProps {
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const Transactions = ({ onEditTransaction, onDeleteTransaction }: TransactionsProps) => {
  const { transactions } = useTransactions();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort transactions
  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      if (filterType === 'all') return true;
      return transaction.type === filterType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">All Transactions</h1>
        <p className="text-gray-600 mt-1">Manage your income and expenses</p>
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
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
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
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="py-1 px-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="py-1 px-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Transaction Count */}
          <div className="text-sm text-gray-500">
            {filteredAndSortedTransactions.length} transaction{filteredAndSortedTransactions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionTable 
        transactions={filteredAndSortedTransactions}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
      />
    </div>
  );
};

export default Transactions;
