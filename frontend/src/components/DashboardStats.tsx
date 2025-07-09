
import { DashboardStats as StatsType } from '../types/transaction';

interface DashboardStatsProps {
  stats: StatsType;
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Balance */}
      <div className={`p-4 rounded-lg shadow-sm border transform hover:scale-105 transition-all duration-300 ${
        stats.totalBalance >= 0 
          ? 'bg-white border-green-200 hover:border-green-300' 
          : 'bg-white border-red-200 hover:border-red-300'
      }`}>
        <div className="text-sm font-medium text-gray-600 mb-2">Total Balance</div>
        <div className={`text-xl lg:text-2xl font-bold break-words ${stats.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {stats.totalBalance >= 0 ? '+' : '-'}${Math.abs(stats.totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        {stats.totalBalance >= 0 && (
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
        )}
        {stats.totalBalance < 0 && (
          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
        )}
      </div>

      {/* Monthly Income */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 hover:border-green-300 transform hover:scale-105 transition-all duration-300">
        <div className="text-sm font-medium text-gray-600 mb-2">Monthly Income</div>
        <div className="text-xl lg:text-2xl font-bold text-green-600 break-words">
          +${stats.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200 hover:border-yellow-300 transform hover:scale-105 transition-all duration-300">
        <div className="text-sm font-medium text-gray-600 mb-2">Monthly Expenses</div>
        <div className="text-xl lg:text-2xl font-bold text-yellow-600 break-words">
          -${stats.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
      </div>

      {/* Total Transactions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transform hover:scale-105 transition-all duration-300">
        <div className="text-sm font-medium text-gray-600 mb-2">Total Transactions</div>
        <div className="text-xl lg:text-2xl font-bold text-gray-700 break-words">
          {stats.transactionCount}
        </div>
        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
      </div>
    </div>
  );
};

export default DashboardStats;
