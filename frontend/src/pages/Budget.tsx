
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useTransactions } from '../hooks/useTransactions';

const Budget = () => {
  const { transactions, getDashboardStats } = useTransactions();
  const stats = getDashboardStats();
  
  const [overallBudget, setOverallBudget] = useState(5000);
  const [categoryBudgets, setCategoryBudgets] = useState({
    'Food & Dining': 800,
    'Shopping': 500,
    'Bills & Utilities': 1200,
    'Transportation': 400,
    'Entertainment': 300,
    'Healthcare': 200,
    'Other': 300
  });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const currentSpending = stats.monthlyExpenses;
  const remainingBudget = overallBudget - currentSpending;
  const spendingPercentage = Math.min((currentSpending / overallBudget) * 100, 100);

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-accent-yellow';
    return 'bg-primary-green';
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return 'Over Budget';
    if (percentage >= 80) return 'Approaching Limit';
    return 'On Track';
  };

  const getCategorySpending = (category: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === category &&
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleOverallBudgetSave = () => {
    setFeedback({ type: 'success', message: 'Overall budget updated successfully!' });
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  const handleCategoryBudgetSave = () => {
    setFeedback({ type: 'success', message: 'Category budgets saved successfully!' });
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  const updateCategoryBudget = (category: string, amount: number) => {
    setCategoryBudgets(prev => ({ ...prev, [category]: amount }));
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-green to-accent-yellow p-6 rounded-lg text-white">
        <h2 className="text-3xl font-bold">Budget</h2>
        <p className="mt-1 opacity-90">Set and monitor your spending goals</p>
      </div>

      {/* Feedback Alert */}
      {feedback.message && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {feedback.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Monthly Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Monthly Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="overallBudget">Monthly Budget Amount</Label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-gray-500">$</span>
                <Input
                  id="overallBudget"
                  type="number"
                  value={overallBudget}
                  onChange={(e) => setOverallBudget(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Button 
                onClick={handleOverallBudgetSave}
                className="mt-4 bg-primary-green hover:bg-green-700"
              >
                Set Budget
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  ${currentSpending.toFixed(2)} / ${overallBudget.toFixed(2)}
                </div>
                <div className={`text-sm font-medium ${
                  spendingPercentage >= 100 ? 'text-red-600' :
                  spendingPercentage >= 80 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {getBudgetStatus(spendingPercentage)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spending Progress</span>
                  <span>{spendingPercentage.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={spendingPercentage} 
                  className={`h-3 ${getBudgetColor(spendingPercentage)}`}
                />
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {remainingBudget >= 0 ? 'Remaining: ' : 'Over by: '}
                  ${Math.abs(remainingBudget).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {Object.entries(categoryBudgets).map(([category, budget]) => {
              const categorySpending = getCategorySpending(category);
              const categoryPercentage = budget > 0 ? Math.min((categorySpending / budget) * 100, 100) : 0;
              
              return (
                <div key={category} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{category}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">$</span>
                      <Input
                        type="number"
                        value={budget}
                        onChange={(e) => updateCategoryBudget(category, Number(e.target.value))}
                        className="w-24"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Spent: ${categorySpending.toFixed(2)}</span>
                      <span>Budget: ${budget.toFixed(2)}</span>
                    </div>
                    
                    {budget > 0 && (
                      <>
                        <Progress 
                          value={categoryPercentage} 
                          className={`h-2 ${getBudgetColor(categoryPercentage)}`}
                        />
                        <div className="flex justify-between text-xs">
                          <span className={`font-medium ${
                            categoryPercentage >= 100 ? 'text-red-600' :
                            categoryPercentage >= 80 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {getBudgetStatus(categoryPercentage)}
                          </span>
                          <span className="text-gray-500">
                            {categoryPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <Button 
            onClick={handleCategoryBudgetSave}
            className="w-full bg-primary-green hover:bg-green-700"
          >
            Save Category Budgets
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Budget;
