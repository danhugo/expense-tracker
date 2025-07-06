
import { DashboardStats as StatsType } from '../types/transaction';

interface DashboardStatsProps {
  stats: StatsType;
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Balance */}
      <div className={`p-6 rounded-lg shadow-lg border-l-4 transform hover:scale-105 transition-all duration-300 ${
        stats.totalBalance >= 0 
          ? 'bg-gradient-to-br from-white to-green-50 border-primary-green' 
          : 'bg-gradient-to-br from-white to-red-50 border-red-500'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Total Balance</div>
            <div className={`text-3xl font-bold ${stats.totalBalance >= 0 ? 'text-primary-green' : 'text-red-600'}`}>
              {stats.totalBalance >= 0 ? '+' : '-'}${Math.abs(stats.totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${
            stats.totalBalance >= 0 ? 'bg-primary-green' : 'bg-red-500'
          }`}>
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L12 2L3 7V9C3 10.1 3.9 11 5 11V13C5 15.2 6.8 17 9 17H15C17.2 17 19 15.2 19 13V11C20.1 11 21 10.1 21 9ZM11 15H9V13H11V15ZM15 15H13V13H15V15ZM19 9C19 9.6 18.6 10 18 10H6C5.4 10 5 9.6 5 9V7.5L12 3.5L19 7.5V9Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Monthly Income */}
      <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-lg shadow-lg border-l-4 border-green-500 transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Monthly Income</div>
            <div className="text-3xl font-bold text-green-600">
              +${stats.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14L12 9L17 14H7Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-gradient-to-br from-white to-yellow-50 p-6 rounded-lg shadow-lg border-l-4 border-accent-yellow transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Monthly Expenses</div>
            <div className="text-3xl font-bold text-yellow-600">
              -${stats.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-16 h-16 bg-accent-yellow rounded-full flex items-center justify-center shadow-md">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10L12 15L7 10H17Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-lg border-l-4 border-gray-400 transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Total Transactions</div>
            <div className="text-3xl font-bold text-gray-700">
              {stats.transactionCount}
            </div>
          </div>
          <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13H11V11H3V13ZM3 17H11V15H3V17ZM3 9H11V7H3V9ZM13 13H21V11H13V13ZM13 17H21V15H13V17ZM13 7V9H21V7H13Z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
