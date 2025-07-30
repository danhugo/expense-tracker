
import { NavLink } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { LayoutDashboard, FileText, Settings, Calendar, CreditCard, X, Menu, MessageCircle } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
  onAddTransaction: () => void;
  onToggleChat: () => void;
}

const Sidebar = ({ isCollapsed, isMobileOpen, onToggle, onCloseMobile, onToggleChat }: SidebarProps) => {
  const { user } = useUser();
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
      
      {/* Sidebar - Now truly fixed */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header - aligned with top header */}
          <div className={`h-[73px] border-b border-gray-200 flex items-center ${isCollapsed ? 'lg:justify-center lg:px-2' : 'lg:justify-between lg:px-6'} px-6`}>
            {/* Toggle button - always visible on desktop, positioned on sidebar */}
            <button
              onClick={onToggle}
              className="hidden lg:block p-2 text-gray-600 hover:text-primary-green hover:bg-green-50 rounded-md transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Close button for mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden ml-auto p-2 text-gray-600 hover:text-primary-green hover:bg-green-50 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* HUFI Logo - only show when expanded on desktop */}
            {!isCollapsed && user && (
              <NavLink to="/" className="lg:block hidden">
                <div className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity">
                  {user.profile_picture_url ? (
                    <img src={user.profile_picture_url} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-black to-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">{user.name?.charAt(0).toUpperCase() || ''}</span>
                    </div>
                  )}
                  <div className="text-2xl font-bold bg-gradient-to-r from-black to-yellow-400 bg-clip-text text-transparent">
                    {user.name}
                  </div>
                </div>
              </NavLink>
            )}

            {/* Brand for mobile - always visible */}
            <div className="lg:hidden block flex-1 mr-4">
              <NavLink to="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity">
                {user?.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-black to-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">{user?.name?.charAt(0).toUpperCase() || ''}</span>
                  </div>
                )}
                <div className="text-2xl font-bold bg-gradient-to-r from-black to-yellow-400 bg-clip-text text-transparent">
                  {user?.name}
                </div>
              </NavLink>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 space-y-2 ${isCollapsed ? 'py-4 px-2' : 'p-4'}`}>
            {navigationItems.map((item) => (
              <div key={item.name} className="relative group">
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center text-sm font-medium rounded-lg transition-all duration-200 w-full h-12 ${
                      isActive
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                    } ${
                      isCollapsed ? 'justify-center px-0' : 'px-4'
                    }`
                  }
                  onClick={handleNavClick}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                  <span className={`${isCollapsed ? 'lg:hidden' : 'lg:block'} block truncate`}>
                    {item.name}
                  </span>
                </NavLink>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Chat Agent Icon - positioned at the bottom */}
          <div className={`border-t border-gray-200 ${isCollapsed ? 'lg:p-2' : 'lg:p-4'} p-4`}>
            <div className="relative group">
              <button
                onClick={onToggleChat}
                className={`w-full flex items-center text-sm font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-gray-800 h-12 ${
                  isCollapsed ? 'lg:justify-center lg:px-3' : 'lg:px-4'
                } px-4`}
                title="Chat Assistant"
              >
                <MessageCircle className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'lg:mr-3'} mr-3`} />
                <span className={`${isCollapsed ? 'lg:hidden' : 'lg:block'} block truncate`}>
                  Chat Assistant
                </span>
              </button>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Chat Assistant
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
