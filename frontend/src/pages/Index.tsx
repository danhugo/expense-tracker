
import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Menu, MessageCircle } from 'lucide-react';
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
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggle={toggleSidebar}
        onCloseMobile={closeMobile}
        onAddTransaction={handleAddTransaction}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isCollapsed ? 'lg:ml-8' : 'lg:ml-50'
      } ${chatPanelOpen ? 'lg:mr-80' : ''}`}>
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo & Hamburger */}
            <div className="flex items-center space-x-4">
              {/* HUFI Logo - Stylized Text */}
              <NavLink to="/" className="flex items-center cursor-pointer hover:opacity-90 transition-opacity">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
                  HUFI
                </div>
              </NavLink>

              {/* Hamburger Menu */}
              <button
                onClick={window.innerWidth < 1024 ? openMobile : toggleSidebar}
                className="p-2 text-gray-600 hover:text-primary-green hover:bg-green-50 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            
            {/* Right Side - Chat Agent & User Dropdown */}
            <div className="flex items-center space-x-2">
              {/* Chat Agent Icon */}
              <button
                onClick={() => setChatPanelOpen(!chatPanelOpen)}
                className="p-2 text-gray-600 hover:text-primary-green hover:bg-green-50 rounded-lg transition-colors"
                title="Chat Assistant"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Page Content - Reduced padding for better space utilization */}
        <main className={`flex-1 p-4 overflow-y-auto`}>
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
