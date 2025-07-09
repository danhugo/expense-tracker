
import DashboardStats from '../components/DashboardStats';
import TransactionTable from '../components/TransactionTable';
import MonthlyExpenseChart from '../components/MonthlyExpenseChart';
import YearlyExpenseChart from '../components/YearlyExpenseChart';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types/transaction';
import { Plus } from 'lucide-react';

interface DashboardProps {
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: () => void;
}

const Dashboard = ({ onEditTransaction, onDeleteTransaction, onAddTransaction }: DashboardProps) => {
  const { transactions, getDashboardStats } = useTransactions();
  const stats = getDashboardStats();
  
  // Show only recent transactions (last 10)
  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Dashboard Header with Gradient Background */}
      <div className="bg-gradient-to-r from-primary-green to-accent-yellow p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/90">Your financial overview at a glance</p>
          </div>
          <button
            onClick={onAddTransaction}
            className="flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transform hover:scale-105 transition-all duration-200 shadow-lg border border-white/20"
          >
            <Plus className="mr-2 h-5 w-5" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards with proper spacing */}
      <div className="mb-4">
        <DashboardStats stats={stats} />
      </div>

      {/* Charts Section with improved spacing and container constraints */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <MonthlyExpenseChart transactions={transactions} />
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <YearlyExpenseChart transactions={transactions} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Transactions
          </h2>
          {transactions.length > 10 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Showing {recentTransactions.length} of {transactions.length} transactions
            </span>
          )}
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No transactions yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your finances by adding your first transaction!</p>
            <button
              onClick={onAddTransaction}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-green to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <TransactionTable 
            transactions={recentTransactions}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
