
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';
import { Transaction } from '../types/transaction';
import { Plus } from 'lucide-react';

interface MonthlyExpenseChartProps {
  transactions: Transaction[];
}

const MonthlyExpenseChart = ({ transactions }: MonthlyExpenseChartProps) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const availableYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))]
    .sort((a, b) => b - a);

  const getMonthlyExpensesByCategory = () => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transaction.type === 'expense' && 
             transactionDate.getMonth() === month && 
             transactionDate.getFullYear() === year;
    });

    const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2))
    }));
  };

  const chartData = getMonthlyExpensesByCategory();

  const chartConfig = {
    amount: {
      label: "Amount ($)",
      color: "#059669", // primary green
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center flex-wrap">
          <div className="w-3 h-3 bg-primary-green rounded-full mr-3 flex-shrink-0"></div>
          <span className="break-words">Monthly Expenses by Category</span>
        </h3>
        <div className="flex gap-2 flex-shrink-0">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-28 border-gray-300 focus:border-primary-green text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-20 border-gray-300 focus:border-primary-green text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {chartData.length > 0 ? (
        <div className="w-full overflow-hidden">
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  fontSize={10}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" fontSize={11} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`$${value}`, 'Amount']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#059669" 
                  radius={[4, 4, 0, 0]}
                  stroke="#047857"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-700 text-lg font-medium mb-2">No expenses recorded for {months[parseInt(selectedMonth)]} {selectedYear}</p>
            <button className="text-primary-green hover:text-green-700 font-medium underline">
              Add your first transaction!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyExpenseChart;
