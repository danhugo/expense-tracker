
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import RecurringTransactionModal from '../components/RecurringTransactionModal';

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

const RecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([
    {
      id: '1',
      description: 'Monthly Salary',
      amount: 3500,
      type: 'income',
      category: 'Salary',
      frequency: 'Monthly',
      startDate: '2025-01-01',
      nextDue: '2025-02-01',
      isActive: true
    },
    {
      id: '2',
      description: 'Rent Payment',
      amount: 850,
      type: 'expense',
      category: 'Bills & Utilities',
      frequency: 'Monthly',
      startDate: '2025-01-01',
      nextDue: '2025-02-01',
      isActive: true
    },
    {
      id: '3',
      description: 'Netflix Subscription',
      amount: 15.99,
      type: 'expense',
      category: 'Entertainment',
      frequency: 'Monthly',
      startDate: '2025-01-15',
      nextDue: '2025-02-15',
      isActive: true
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | undefined>();

  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setModalOpen(true);
  };

  const handleEditTransaction = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring transaction?')) {
      setRecurringTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSaveTransaction = (transactionData: Omit<RecurringTransaction, 'id' | 'nextDue'>) => {
    if (editingTransaction) {
      // Update existing transaction
      setRecurringTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id 
          ? { ...t, ...transactionData, nextDue: calculateNextDue(transactionData.startDate, transactionData.frequency) }
          : t
      ));
    } else {
      // Add new transaction
      const newTransaction: RecurringTransaction = {
        ...transactionData,
        id: Date.now().toString(),
        nextDue: calculateNextDue(transactionData.startDate, transactionData.frequency)
      };
      setRecurringTransactions(prev => [newTransaction, ...prev]);
    }
    setModalOpen(false);
    setEditingTransaction(undefined);
  };

  const calculateNextDue = (startDate: string, frequency: string): string => {
    const start = new Date(startDate);
    const today = new Date();
    
    switch (frequency) {
      case 'Daily':
        start.setDate(today.getDate() + 1);
        break;
      case 'Weekly':
        start.setDate(today.getDate() + 7);
        break;
      case 'Monthly':
        start.setMonth(today.getMonth() + 1);
        break;
      case 'Annually':
        start.setFullYear(today.getFullYear() + 1);
        break;
    }
    
    return start.toISOString().split('T')[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-green to-accent-yellow p-6 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Recurring Transactions</h2>
            <p className="mt-1 opacity-90">Manage your recurring income and expenses</p>
          </div>
          <button 
            onClick={handleAddTransaction}
            className="flex items-center px-6 py-3 bg-black/40 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transform hover:scale-105 transition-all duration-200 shadow-lg border border-white/20 self-start sm:self-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Recurring Transaction
          </button>
        </div>
      </div>

      {/* Recurring Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Recurring Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recurringTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium text-gray-800">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {transaction.category}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {transaction.frequency}
                    </TableCell>
                    <TableCell className="text-gray-700 font-medium">
                      {formatDate(transaction.nextDue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                          className="text-primary-green hover:text-green-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg">No recurring transactions set up</p>
                <p className="text-sm">Get started by adding your first recurring transaction</p>
              </div>
              <Button 
                onClick={handleAddTransaction}
                className="bg-primary-green hover:bg-green-700"
              >
                Add Recurring Transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">i</span>
            </div>
            <div className="text-blue-800">
              <p className="font-medium">Automation Notice</p>
              <p className="text-sm text-blue-700 mt-1">
                Recurring transactions will be automatically added to your main transaction list on their due dates, 
                helping you stay on top of your regular income and expenses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Transaction Modal */}
      <RecurringTransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(undefined);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default RecurringTransactions;
