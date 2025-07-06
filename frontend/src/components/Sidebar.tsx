
import { NavLink } from 'react-router-dom';
import { Book, FileText, Plus, Settings, Calendar, CreditCard } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: () => void;
}

const Sidebar = ({ isOpen, onClose, onAddTransaction }: SidebarProps) => {
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Book },
    { name: 'Transactions', href: '/transactions', icon: FileText },
    { name: 'Budget', href: '/budget', icon: CreditCard },
    { name: 'Recurring', href: '/recurring', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Expense Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Clarity & Control</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-green text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                  }`
                }
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Add Transaction Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onAddTransaction}
              className="w-full flex items-center justify-center px-4 py-2 bg-accent-yellow text-gray-800 font-semibold rounded-md hover:bg-yellow-400 transition-colors"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
