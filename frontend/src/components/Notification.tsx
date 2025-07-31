import React from 'react';
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export type NotificationType = 'warning' | 'info' | 'success' | 'error';

interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  onClose: (id: string) => void;
}

const notificationConfig = {
  warning: {
    bgColor: 'bg-orange-500',
    icon: AlertTriangle,
    text: 'Add warning message'
  },
  info: {
    bgColor: 'bg-blue-500',
    icon: Info,
    text: 'Add info message'
  },
  success: {
    bgColor: 'bg-green-600',
    icon: CheckCircle,
    text: 'Add success message'
  },
  error: {
    bgColor: 'bg-red-600',
    icon: XCircle,
    text: 'Add error message'
  }
};

export const Notification: React.FC<NotificationProps> = ({ id, type, message, onClose }) => {
  const config = notificationConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} text-white rounded-lg shadow-lg overflow-hidden animate-slide-in`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Icon className="w-6 h-6" />
          <span className="font-medium text-lg">
            {message || config.text}
          </span>
        </div>
        <button
          onClick={() => onClose(id)}
          className="ml-4 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};