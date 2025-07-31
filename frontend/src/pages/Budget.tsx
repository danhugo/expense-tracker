import { useState } from 'react';
import { Plus, TrendingUp, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useBudgets } from '../hooks/useBudgets';
import { useUser } from '../contexts/UserContext';
import { useCategories } from '../hooks/useCategories';
import { BudgetCreate, BudgetUpdate } from '../types/budget';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';

const Budget = () => {
  const { user } = useUser();
  const { budgets, loading, error, createBudget, updateBudget, deleteBudget } = useBudgets();
  const { categories, loading: categoriesLoading, createDefaultCategories } = useCategories();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [creatingCategories, setCreatingCategories] = useState(false);
  const [formData, setFormData] = useState<BudgetCreate>({
    name: '',
    amount: 0,
    period: 'monthly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    alert_threshold: 80,
    category_id: undefined,
  });

  const handleCreateBudget = async () => {
    try {
      await createBudget(formData);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create budget:', err);
    }
  };

  const handleUpdateBudget = async () => {
    if (!selectedBudget) return;
    try {
      await updateBudget(selectedBudget.id, formData as BudgetUpdate);
      setIsEditModalOpen(false);
      setSelectedBudget(null);
      resetForm();
    } catch (err) {
      console.error('Failed to update budget:', err);
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
      } catch (err) {
        console.error('Failed to delete budget:', err);
      }
    }
  };

  const handleCreateDefaultCategories = async () => {
    try {
      setCreatingCategories(true);
      await createDefaultCategories();
      // Categories will be automatically refreshed by the hook
    } catch (err) {
      console.error('Failed to create default categories:', err);
    } finally {
      setCreatingCategories(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      period: 'monthly',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      alert_threshold: 80,
      category_id: undefined,
    });
  };

  const openEditModal = (budget: any) => {
    setSelectedBudget(budget);
    setFormData({
      name: budget.name,
      amount: budget.amount,
      period: budget.period,
      start_date: budget.start_date.split('T')[0], // Format date for input
      alert_threshold: budget.alert_threshold,
      category_id: budget.category_id || undefined,
    });
    setIsEditModalOpen(true);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPeriodLabel = (period: string) => {
    return period.charAt(0).toUpperCase() + period.slice(1);
  };

  if (loading || categoriesLoading) {
    return <div className="flex justify-center items-center h-64">Loading budgets...</div>;
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.current_spent ?? 0), 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-green to-accent-yellow p-6 rounded-lg text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Budgets</h2>
            <p className="mt-1 opacity-90">Track your spending limits and goals</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white text-black hover:bg-gray-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget, user?.currency_symbol || '$', user?.currency || 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">Across all budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpent, user?.currency_symbol || '$', user?.currency || 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallPercentage.toFixed(1)}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget - totalSpent, user?.currency_symbol || '$', user?.currency || 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Budgets</h3>
        {budgets.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">You haven't created any budgets yet.</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {budgets.map((budget) => (
              <Card key={budget.id} className={(budget.percentage_used ?? 0) > budget.alert_threshold ? 'border-yellow-300' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{budget.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{getPeriodLabel(budget.period)}</Badge>
                        {budget.category && (
                          <Badge variant="outline">{budget.category.name}</Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(budget.start_date).toLocaleDateString()} - {
                            budget.end_date 
                              ? new Date(budget.end_date).toLocaleDateString()
                              : 'Ongoing'
                          }
                        </span>
                        {budget.days_remaining !== undefined && budget.days_remaining > 0 && (
                          <span className="text-sm text-gray-500">
                            ({budget.days_remaining} days left)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(budget)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: {formatCurrency(budget.current_spent ?? 0, user?.currency_symbol || '$', user?.currency || 'USD')}</span>
                      <span>Budget: {formatCurrency(budget.amount, user?.currency_symbol || '$', user?.currency || 'USD')}</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div 
                        className={`h-full transition-all ${getProgressColor(budget.percentage_used ?? 0)}`}
                        style={{ width: `${Math.min(budget.percentage_used ?? 0, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{(budget.percentage_used ?? 0).toFixed(1)}% used</span>
                      <span className="text-gray-500">
                        {formatCurrency(budget.remaining_amount ?? (budget.amount - (budget.current_spent ?? 0)), user?.currency_symbol || '$', user?.currency || 'USD')} remaining
                      </span>
                    </div>
                  </div>

                  {(budget.percentage_used ?? 0) > budget.alert_threshold && (
                    <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-yellow-800">
                        You've used {(budget.percentage_used ?? 0).toFixed(1)}% of this budget. 
                        Alert threshold: {budget.alert_threshold}%
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Budget Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedBudget(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? 'Update your budget settings' : 'Set up a new spending limit'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Budget Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Monthly Groceries"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="period">Period</Label>
              <Select value={formData.period} onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => setFormData({ ...formData, period: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">
                When this budget period begins
              </p>
            </div>

            <div>
              <Label htmlFor="category">Category (Optional)</Label>
              <Select 
                value={formData.category_id?.toString() || 'none'} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  category_id: value === 'none' ? undefined : parseInt(value) 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category (All expenses)</SelectItem>
                  {(() => {
                    const expenseCategories = categories.filter(cat => cat.type === 'expense');
                    if (expenseCategories.length > 0) {
                      return expenseCategories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ));
                    } else {
                      return (
                        <div className="p-2">
                          <p className="text-sm text-gray-500 mb-2">No expense categories found.</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCreateDefaultCategories();
                            }}
                            disabled={creatingCategories}
                            className="w-full"
                            type="button"
                          >
                            {creatingCategories ? 'Creating...' : 'Create Default Categories'}
                          </Button>
                        </div>
                      );
                    }
                  })()}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Link this budget to a specific expense category
              </p>
            </div>

            <div>
              <Label htmlFor="alert_threshold">Alert Threshold (%)</Label>
              <Input
                id="alert_threshold"
                type="number"
                value={formData.alert_threshold}
                onChange={(e) => setFormData({ ...formData, alert_threshold: parseInt(e.target.value) || 80 })}
                placeholder="80"
                min="0"
                max="100"
              />
              <p className="text-sm text-gray-500 mt-1">
                You'll be alerted when spending exceeds this percentage
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedBudget(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={isEditModalOpen ? handleUpdateBudget : handleCreateBudget}>
              {isEditModalOpen ? 'Update Budget' : 'Create Budget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budget;