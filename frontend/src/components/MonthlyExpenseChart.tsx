
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';
import { Transaction } from '../types/transaction';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <div className="w-3 h-3 bg-primary-green rounded-full mr-3"></div>
          Monthly Expenses by Category
        </h3>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32 border-gray-300 focus:border-primary-green">
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
            <SelectTrigger className="w-24 border-gray-300 focus:border-primary-green">
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
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`$${value}`, 'Amount']}
              />
              <Bar 
                dataKey="amount" 
                fill="#059669" 
                radius={[6, 6, 0, 0]}
                stroke="#047857"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No expense data for {months[parseInt(selectedMonth)]} {selectedYear}</p>
            <p className="text-gray-400 text-sm mt-1">Start adding transactions to see your spending patterns!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyExpenseChart;
