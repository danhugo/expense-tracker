
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';
import { Transaction } from '../types/transaction';

interface YearlyExpenseChartProps {
  transactions: Transaction[];
}

const YearlyExpenseChart = ({ transactions }: YearlyExpenseChartProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const availableYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))]
    .sort((a, b) => b - a);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const getYearlyExpensesByMonth = () => {
    const year = parseInt(selectedYear);
    
    const monthlyTotals = Array.from({ length: 12 }, (_, index) => ({
      month: months[index],
      monthIndex: index,
      amount: 0
    }));

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transaction.type === 'expense' && transactionDate.getFullYear() === year;
    });

    filteredTransactions.forEach(transaction => {
      const month = new Date(transaction.date).getMonth();
      monthlyTotals[month].amount += transaction.amount;
    });

    return monthlyTotals.map(item => ({
      month: item.month,
      amount: Number(item.amount.toFixed(2))
    }));
  };

  const chartData = getYearlyExpensesByMonth();

  const chartConfig = {
    amount: {
      label: "Amount ($)",
      color: "#FBBF24", // accent yellow
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <div className="w-3 h-3 bg-accent-yellow rounded-full mr-3"></div>
          Yearly Expenses by Month
        </h3>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-24 border-gray-300 focus:border-accent-yellow">
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
      
      <ChartContainer config={chartConfig} className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [`$${value}`, 'Amount']}
            />
            <Bar 
              dataKey="amount" 
              fill="#FBBF24" 
              radius={[6, 6, 0, 0]}
              stroke="#F59E0B"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default YearlyExpenseChart;
