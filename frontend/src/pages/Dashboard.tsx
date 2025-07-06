
import DashboardStats from '../components/DashboardStats';
import TransactionTable from '../components/TransactionTable';
import MonthlyExpenseChart from '../components/MonthlyExpenseChart';
import YearlyExpenseChart from '../components/YearlyExpenseChart';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types/transaction';

interface DashboardProps {
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const Dashboard = ({ onEditTransaction, onDeleteTransaction }: DashboardProps) => {
  const { transactions, getDashboardStats } = useTransactions();
  const stats = getDashboardStats();
  
  // Show only recent transactions (last 10)
  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Enhanced Page Header */}
      <div className="relative bg-gradient-to-r from-primary-green via-green-600 to-accent-yellow p-8 rounded-lg text-white overflow-hidden">
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-lg opacity-90">Your financial overview at a glance</p>
          
          {/* Floating accent elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <MonthlyExpenseChart transactions={transactions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <YearlyExpenseChart transactions={transactions} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <svg className="w-6 h-6 text-primary-green mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13H11V11H3V13ZM3 17H11V15H3V17ZM3 9H11V7H3V9ZM13 13H21V11H13V13ZM13 17H21V15H13V17ZM13 7V9H21V7H13Z"/>
            </svg>
            Recent Transactions
          </h2>
          {transactions.length > 10 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Showing {recentTransactions.length} of {transactions.length} transactions
            </span>
          )}
        </div>
        <TransactionTable 
          transactions={recentTransactions}
          onEdit={onEditTransaction}
          onDelete={onDeleteTransaction}
        />
      </div>
    </div>
  );
};

export default Dashboard;
