
import { Transaction } from '../types/transaction';
import { Edit, Trash2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { formatCurrency } from '../utils/formatters';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionTable = ({ transactions, onEdit, onDelete }: TransactionTableProps) => {
  const { user } = useUser();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-gray-700">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {transaction.description || '-'}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {transaction.category}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${
                  transaction.type === 'income' ? 'text-success' : 'text-danger'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, user?.currency_symbol || '$', user?.currency || 'USD')}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="text-primary-green hover:text-green-700 transition-colors"
                      title="Edit transaction"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="text-danger hover:text-red-700 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No transactions found. Start by adding your first transaction!
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
