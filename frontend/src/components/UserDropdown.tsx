
import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import UserAvatar from './UserAvatar';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleSignOut = () => {
    setIsOpen(false);
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <UserAvatar 
          profilePictureUrl={user?.profile_picture_url} 
          name={user?.name} 
          size="sm" 
        />
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Account Information Section */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <UserAvatar 
                profilePictureUrl={user?.profile_picture_url} 
                name={user?.name} 
                size="sm" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Account Settings Link */}
            <button
              onClick={handleAccountSettings}
              className="mt-3 w-full flex items-center space-x-2 px-3 py-2 text-sm text-primary-green hover:bg-green-50 rounded-md transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </button>
          </div>

          {/* Session Management */}
          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
