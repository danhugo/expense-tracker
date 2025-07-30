// components/TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { useTransactions } from '../hooks/useTransactions'; // Import the hook

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction; // `transaction` prop for editing
}

const categories = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Travel',
  'Education',
  'Salary',
  'Investment',
  'Other'
];

const TransactionModal = ({ isOpen, onClose, transaction }: TransactionModalProps) => {
  const { addTransaction, updateTransaction } = useTransactions(); // Use the hook here
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const isEditing = !!transaction; // Determine if it's an edit operation

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || '', // Ensure description is not undefined
        date: transaction.date,
      });
    } else {
      // Reset form for new transaction
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setError(null); // Clear any previous errors when modal opens/changes context
  }, [transaction, isOpen]); // Reset on transaction change or modal open status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true);

    if (!formData.amount || !formData.category || !formData.date) {
      setError('Please fill in all required fields: Amount, Category, Date.');
      setLoading(false);
      return;
    }

    const transactionData = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      date: formData.date,
    };

    try {
      if (isEditing && transaction) {
        // Call update API
        await updateTransaction(transaction.id, transactionData);
        alert('Transaction updated successfully!');
      } else {
        // Call add API
        await addTransaction(transactionData);
        alert('Transaction added successfully!');
      }
      onClose(); // Close modal on successful save
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction. Please try again.');
      console.error("Transaction save error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
              className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              disabled={loading}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              required
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              placeholder="Optional description"
              disabled={loading}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              required
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-primary-green text-primary-green font-semibold rounded-md hover:bg-primary-green hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-primary-green text-white font-semibold rounded-md hover:bg-yellow-500 transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;