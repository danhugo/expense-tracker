
import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TransactionModal from '../components/TransactionModal';
import FloatingActionButton from '../components/FloatingActionButton';
import ChatPanel from '../components/ChatPanel';
import UserDropdown from '../components/UserDropdown';
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import Settings from './Settings';
import Budget from './Budget';
import RecurringTransactions from './RecurringTransactions';
import { useTransactions } from '../hooks/useTransactions';
import { useSidebarState } from '../hooks/useSidebarState';
import { Transaction } from '../types/transaction';

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const location = useLocation();
  
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { isCollapsed, isMobileOpen, toggleSidebar, openMobile, closeMobile } = useSidebarState();

  // Check if we're on the Dashboard page
  const isDashboardPage = location.pathname === '/';

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
    <div className="min-h-screen bg-gray-50 flex w-full overflow-x-hidden">
      {/* Fixed Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggle={toggleSidebar}
        onCloseMobile={closeMobile}
        onAddTransaction={handleAddTransaction}
        onToggleChat={() => setChatPanelOpen(!chatPanelOpen)}
      />

      {/* Main Content - Adjusted for fixed sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } ml-0`}>
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left Side - Mobile Hamburger & Logo */}
            <div className="flex items-center space-x-4">
              {/* Mobile Hamburger Menu - positioned on the far left */}
              <button
                onClick={openMobile}
                className="lg:hidden p-2 text-gray-600 hover:text-primary-green hover:bg-green-50 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* HUFI Logo - Stylized Text */}
              <NavLink to="/" className="flex items-center cursor-pointer hover:opacity-90 transition-opacity">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
                  HUFI
                </div>
              </NavLink>
            </div>
            
            {/* Right Side - User Dropdown only */}
            <div className="flex items-center">
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-full mx-auto">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onAddTransaction={handleAddTransaction}
                  />
                } 
              />
              <Route 
                path="/transactions" 
                element={
                  <Transactions 
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onAddTransaction={handleAddTransaction}
                  />
                } 
              />
              <Route path="/settings" element={<Settings />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/recurring" element={<RecurringTransactions />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Chat Panel */}
      <ChatPanel 
        isOpen={chatPanelOpen}
        onClose={() => setChatPanelOpen(false)}
      />

      {/* Enhanced Floating Action Button (Mobile) - Only show on Dashboard */}
      {isDashboardPage && <FloatingActionButton onClick={handleAddTransaction} />}

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
