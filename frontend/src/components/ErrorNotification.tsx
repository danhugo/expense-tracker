import { AlertCircle, TriangleAlert, Info } from 'lucide-react'; // Import all necessary icons

interface NotificationProps {
  message: string;
  type: 'error' | 'warning' | 'info'; // New prop for type
  title?: string; // Optional title for more context
  onDismiss?: () => void;
  // Specific props for the Google error case, keeping them here for now
  isGoogleError?: boolean;
  googleSignInId?: string;
}

const Notification = ({
  message,
  type,
  title,
  onDismiss,
  isGoogleError = false, // Keep for specific styling in error type
  googleSignInId,
}: NotificationProps) => {
  if (!message) return null;

  // Determine classes based on type
  let iconComponent;
  let bgColorClasses;
  let textColorClasses;
  let dismissButtonClasses;
  let defaultTitle;

  switch (type) {
    case 'error':
      iconComponent = AlertCircle;
      defaultTitle = "Error";
      if (isGoogleError) {
        bgColorClasses = 'bg-gradient-to-br from-red-500 to-orange-400 text-white'; // Slightly darker gradient for better contrast
        textColorClasses = 'text-white'; // Icon and main text color
      } else {
        bgColorClasses = 'bg-red-50 border border-red-300'; // Lighter background, subtle border
        textColorClasses = 'text-red-800'; // Darker red text for contrast
      }
      dismissButtonClasses = 'text-red-500 hover:text-red-700';
      break;
    case 'warning':
      iconComponent = TriangleAlert; // New icon for warning
      defaultTitle = "Warning";
      bgColorClasses = 'bg-yellow-50 border border-yellow-300';
      textColorClasses = 'text-yellow-800';
      dismissButtonClasses = 'text-yellow-500 hover:text-yellow-700';
      break;
    case 'info':
      iconComponent = Info; // New icon for info
      defaultTitle = "Information";
      bgColorClasses = 'bg-blue-50 border border-blue-300';
      textColorClasses = 'text-blue-800';
      dismissButtonClasses = 'text-blue-500 hover:text-blue-700';
      break;
    default:
      iconComponent = Info; // Fallback
      defaultTitle = "Notification";
      bgColorClasses = 'bg-gray-50 border border-gray-300';
      textColorClasses = 'text-gray-800';
      dismissButtonClasses = 'text-gray-500 hover:text-gray-700';
  }

  const Icon = iconComponent;

  return (
    <div
      className={`mb-4 p-4 rounded-lg flex items-start gap-4 shadow-lg animate-fade-in-down ${bgColorClasses}`}
      role="alert"
    >
      <Icon className={`h-6 w-6 mt-0.5 ${textColorClasses}`} />
      <div className="flex-1">
        <p className={`font-bold text-lg mb-1 ${isGoogleError && type === 'error' ? 'text-white' : textColorClasses}`}>
          {title || defaultTitle}
        </p>
        <p className={`text-sm ${isGoogleError && type === 'error' ? 'text-white' : textColorClasses}`}>{message}</p>
        {/* Google Error Specific Content (only applies to error type) */}
        {isGoogleError && type === 'error' && googleSignInId && (
          <div className="mt-4">
            <p className="text-sm mb-2 font-semibold text-white">Please use the button below to sign in.</p>
            {/* The actual Google button will be rendered here by the Google SDK */}
            <div id={googleSignInId} className="w-full max-w-xs mx-auto"></div>
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          className={`ml-2 text-2xl leading-none ${dismissButtonClasses}`}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Notification;