import React from 'react';
import { Notification } from './Notification';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Notification
            id={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={removeNotification}
          />
        </div>
      ))}
    </div>
  );
};