
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Calendar, CreditCard, X } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
  onAddTransaction: () => void;
}

const Sidebar = ({ isCollapsed, isMobileOpen, onToggle, onCloseMobile }: SidebarProps) => {
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: FileText },
    { name: 'Budget', href: '/budget', icon: CreditCard },
    { name: 'Recurring', href: '/recurring', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleNavClick = () => {
    // Close mobile sidebar when navigating
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`border-b border-gray-200 flex items-center ${isCollapsed ? 'lg:p-3 lg:justify-center' : 'p-6'} p-6`}>
            {/* Close button for mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden ml-auto p-2 text-gray-600 hover:text-primary-green hover:bg-green-50 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* HUFI Logo - Stylized Text version for expanded state */}
            {!isCollapsed && (
              <NavLink to="/" className="lg:block hidden">
                <div className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
                    HUFI
                  </div>
                </div>
              </NavLink>
            )}

            {/* HUFI Logo - Compact version for collapsed state */}
            {isCollapsed && (
              <NavLink to="/" className="lg:block hidden">
                <div className="cursor-pointer hover:opacity-90 transition-opacity">
                  <div className="text-lg font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
                    H
                  </div>
                </div>
              </NavLink>
            )}

            {/* Brand for mobile - always visible */}
            <div className="lg:hidden block flex-1 mr-4">
              <NavLink to="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
                  HUFI
                </div>
              </NavLink>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 space-y-1 ${isCollapsed ? 'lg:p-2' : 'lg:p-4'} p-4`}>
            {navigationItems.map((item) => (
              <div key={item.name} className="relative group">
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-green to-green-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                    } ${
                      isCollapsed ? 'lg:p-3 lg:justify-center' : 'lg:px-4 lg:py-3'
                    } px-4 py-3`
                  }
                  onClick={handleNavClick}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'lg:mr-3'} mr-3`} />
                  <span className={`${isCollapsed ? 'lg:hidden' : 'lg:block'} block`}>
                    {item.name}
                  </span>
                </NavLink>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
