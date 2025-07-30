
import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'success' | 'error' | 'pending';
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your expense assistant. I can help you manage your expenses and budgets using natural language. Try asking me something like 'Add an expense for $50 for groceries' or 'How much did I spend this month?'",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate agent response (placeholder for future AI integration)
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand you're asking about expenses. This feature is currently in development and will be available soon with full AI capabilities to help manage your transactions and budgets!",
        isUser: false,
        timestamp: new Date(),
        status: 'success'
      };
      setMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-3 bg-gray-100 rounded-2xl rounded-bl-sm max-w-xs">
      <Bot className="h-4 w-4 text-primary-green mr-2" />
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl border-r border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-black text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Expense Assistant</h3>
            <p className="text-sm text-yellow-100">AI-powered expense helper</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col max-w-xs">
              <div
                className={`p-3 rounded-2xl ${
                  message.isUser
                    ? 'bg-primary-green text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                }`}
              >
                {!message.isUser && (
                  <div className="flex items-start space-x-2">
                    <Bot className="h-4 w-4 text-primary-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}
                {message.isUser && (
                  <span className="text-sm">{message.text}</span>
                )}
                
                {message.status && (
                  <div className="flex items-center justify-end mt-1">
                    {message.status === 'success' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    {message.status === 'error' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-1 px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex flex-col">
              <TypingIndicator />
              <span className="text-xs text-gray-500 mt-1 px-1">
                typing...
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask me about your expenses..."
            className="flex-1 border-gray-200 focus:border-primary-green focus:ring-primary-green"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-primary-green hover:bg-green-600 text-white p-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Try: "Add $50 expense for groceries" or "How much did I spend this month?"
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
