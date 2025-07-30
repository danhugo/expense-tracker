
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Annually';
  startDate: string;
  endDate?: string;
  nextDue: string;
  isActive: boolean;
}

interface RecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<RecurringTransaction, 'id' | 'nextDue'> & { endDate?: string; occurrences?: number }) => void;
  transaction?: RecurringTransaction;
}

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Other Income'],
  expense: ['Food & Dining', 'Shopping', 'Bills & Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Other']
};

const RecurringTransactionModal = ({ isOpen, onClose, onSave, transaction }: RecurringTransactionModalProps) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '',
    frequency: 'Monthly' as 'Daily' | 'Weekly' | 'Monthly' | 'Annually',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    endType: 'never' as 'never' | 'date' | 'occurrences',
    occurrences: 12,
    isActive: true
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        frequency: transaction.frequency,
        startDate: transaction.startDate,
        endDate: transaction.endDate || '',
        endType: transaction.endDate ? 'date' : 'never',
        occurrences: 12,
        isActive: transaction.isActive
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        type: 'expense',
        category: '',
        frequency: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        endType: 'never',
        occurrences: 12,
        isActive: true
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const transactionData = {
      description: formData.description,
      amount: formData.amount,
      type: formData.type,
      category: formData.category,
      frequency: formData.frequency,
      startDate: formData.startDate,
      endDate: formData.endType === 'date' ? formData.endDate : undefined,
      isActive: formData.isActive
    };

    onSave(transactionData);
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type,
      category: '' // Reset category when type changes
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Monthly rent payment"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  required
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label>Transaction Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleTypeChange(value as 'income' | 'expense')}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Income</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories[formData.type].map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as "Daily" | "Weekly" | "Monthly" | "Annually" }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label>End Date</Label>
              <RadioGroup
                value={formData.endType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, endType: value as "never" | "date" | "occurrences" }))}
                className="space-y-3 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never">Never ends</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="date" />
                  <Label htmlFor="date">End on date:</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    disabled={formData.endType !== 'date'}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="occurrences" id="occurrences" />
                  <Label htmlFor="occurrences">After</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.occurrences}
                    onChange={(e) => setFormData(prev => ({ ...prev, occurrences: Number(e.target.value) }))}
                    disabled={formData.endType !== 'occurrences'}
                    className="w-20"
                  />
                  <Label>occurrences</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary-green hover:bg-green-700">
              {transaction ? 'Update Transaction' : 'Save Recurring Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringTransactionModal;
