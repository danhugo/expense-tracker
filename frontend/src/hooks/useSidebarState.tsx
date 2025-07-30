
import { useState, useEffect } from 'react';

const SIDEBAR_STORAGE_KEY = 'expense-manager-sidebar-state';

export const useSidebarState = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Default to collapsed for better content focus
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  return {
    isCollapsed,
    isMobileOpen,
    toggleSidebar,
    openMobile,
    closeMobile,
  };
};
