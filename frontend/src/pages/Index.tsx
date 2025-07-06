
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TransactionModal from '../components/TransactionModal';
import FloatingActionButton from '../components/FloatingActionButton';
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import Settings from './Settings';
import Budget from './Budget';
import RecurringTransactions from './RecurringTransactions';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types/transaction';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    setModalOpen(false);
    setEditingTransaction(undefined);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-primary-green hover:bg-green-50 rounded-md transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-green rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">Welcome back!</span>
              </div>
              <button
                onClick={handleAddTransaction}
                className="hidden lg:flex items-center px-6 py-2 bg-gradient-to-r from-primary-green to-green-600 text-white font-semibold rounded-md hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full bg-gray-50">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <Transactions 
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              } 
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/recurring" element={<RecurringTransactions />} />
          </Routes>
        </main>
      </div>

      {/* Enhanced Floating Action Button (Mobile) */}
      <FloatingActionButton onClick={handleAddTransaction} />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(undefined);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default Index;
