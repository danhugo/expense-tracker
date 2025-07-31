import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const NotificationDemo: React.FC = () => {
  const { addNotification } = useNotifications();

  const showWarning = () => {
    addNotification('warning', 'This is a warning message!');
  };

  const showInfo = () => {
    addNotification('info', 'This is an info message!');
  };

  const showSuccess = () => {
    addNotification('success', 'Operation completed successfully!');
  };

  const showError = () => {
    addNotification('error', 'An error occurred!');
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Notification System Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={showWarning}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Show Warning
            </Button>
            <Button
              onClick={showInfo}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Show Info
            </Button>
            <Button
              onClick={showSuccess}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Show Success
            </Button>
            <Button
              onClick={showError}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Show Error
            </Button>
          </div>
          <div className="mt-8 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Usage Example:</h3>
            <pre className="text-sm overflow-x-auto">
{`import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const { addNotification } = useNotifications();
  
  const handleSuccess = () => {
    addNotification('success', 'Item saved successfully!');
  };
  
  const handleError = () => {
    addNotification('error', 'Failed to save item!');
  };
  
  // ...
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationDemo;