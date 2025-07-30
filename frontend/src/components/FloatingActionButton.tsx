
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-accent-yellow to-yellow-400 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40 lg:hidden group"
      title="Add Transaction"
    >
      <Plus className="h-7 w-7 mx-auto group-hover:rotate-90 transition-transform duration-300" />
      
      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-full bg-accent-yellow opacity-20 animate-ping"></div>
    </button>
  );
};

export default FloatingActionButton;
