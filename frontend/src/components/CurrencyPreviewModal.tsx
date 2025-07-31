import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
// import { formatCurrency } from '../utils/formatters';

interface CurrencyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromCurrency: string;
  toCurrency: string;
  onConfirm: () => void;
}

interface PreviewData {
  from_currency: string;
  to_currency: string;
  exchange_rate: number;
  rate_timestamp: string;
  preview: {
    transactions: Array<{
      id: string;
      description: string;
      date: string;
      original_amount: number;
      converted_amount: number;
      type: string;
    }>;
    budgets: Array<{
      id: string;
      name: string;
      original_amount: number;
      converted_amount: number;
    }>;
    total_items: number;
  };
  impact: {
    total_balance: {
      before: number;
      after: number;
      currency_before: string;
      currency_after: string;
    };
    from_symbol: string;
    to_symbol: string;
  };
}

interface ConversionStatus {
  id: number;
  status: string;
  progress: number;
  items_converted: number;
  total_items: number;
  error_message?: string;
}

const CurrencyPreviewModal: React.FC<CurrencyPreviewModalProps> = ({
  isOpen,
  onClose,
  fromCurrency,
  toCurrency,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus | null>(null);
  const [conversionId, setConversionId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && toCurrency) {
      fetchPreview();
    }
  }, [isOpen, toCurrency]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (conversionId && converting) {
      intervalId = setInterval(() => {
        checkConversionStatus();
      }, 500);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [conversionId, converting]);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${API_BASE_URL}/currency/preview?to_currency=${toCurrency}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch preview');
      }
      
      const data = await response.json();
      setPreviewData(data);
    } catch (err) {
      setError('Unable to preview currency conversion. Please try again.');
      console.error('Preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmConversion = async () => {
    if (!previewData) return;
    
    setConverting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/currency/convert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_currency: toCurrency,
          confirm_rate: previewData.exchange_rate,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start conversion');
      }
      
      const data = await response.json();
      setConversionId(data.conversion_id);
    } catch (err) {
      setError('Failed to start currency conversion. Please try again.');
      console.error('Conversion error:', err);
      setConverting(false);
    }
  };

  const checkConversionStatus = async () => {
    if (!conversionId) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${API_BASE_URL}/currency/conversion-status/${conversionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to check status');
      }
      
      const status = await response.json();
      setConversionStatus(status);
      
      if (status.status === 'completed') {
        setConverting(false);
        setTimeout(() => {
          onConfirm();
          onClose();
        }, 1500);
      } else if (status.status === 'failed') {
        setError(status.error_message || 'Conversion failed');
        setConverting(false);
      }
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (converting && conversionStatus) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Converting Currency...</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <Progress value={conversionStatus.progress} className="h-3" />
            <div className="text-center">
              <p className="text-lg font-medium mb-2">
                {conversionStatus.progress}% Complete
              </p>
              <p className="text-sm text-gray-600">
                Converting items... ({conversionStatus.items_converted}/{conversionStatus.total_items})
              </p>
              {conversionStatus.status === 'completed' && (
                <div className="mt-4 flex items-center justify-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Conversion completed successfully!</span>
                </div>
              )}
            </div>
          </div>
          {conversionStatus.status !== 'completed' && (
            <DialogFooter>
              <Button variant="outline" disabled>
                Run in Background
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Currency Conversion Preview</DialogTitle>
          <DialogDescription>
            Review how your data will be converted from {fromCurrency} to {toCurrency}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {previewData && !loading && (
          <div className="space-y-6">
            {/* Exchange Rate Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Exchange Rate</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchPreview}
                  className="h-8"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
              <p className="text-2xl font-bold">
                1 {previewData.from_currency} = {previewData.exchange_rate.toFixed(4)} {previewData.to_currency}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Rate from: {new Date(previewData.rate_timestamp).toLocaleString()}
              </p>
            </div>

            {/* Impact Summary */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Conversion Impact</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Balance:</span>
                  <div className="text-right">
                    <span className="line-through text-gray-400 text-sm">
                      {previewData.impact.from_symbol}{Math.abs(previewData.impact.total_balance.before).toFixed(2)}
                    </span>
                    <span className="ml-2 font-medium">
                      → {previewData.impact.to_symbol}{Math.abs(previewData.impact.total_balance.after).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items to convert:</span>
                  <span className="font-medium">{previewData.preview.total_items} items</span>
                </div>
              </div>
            </div>

            {/* Sample Transactions */}
            {previewData.preview.transactions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Recent Transactions Preview</h3>
                <div className="space-y-2">
                  {previewData.preview.transactions.map((tx) => (
                    <div key={tx.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-gray-600">{formatDate(tx.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="line-through text-gray-400 text-sm">
                            {previewData.impact.from_symbol}{tx.original_amount.toFixed(2)}
                          </p>
                          <p className={`font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {previewData.impact.to_symbol}{tx.converted_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Budgets */}
            {previewData.preview.budgets.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Budget Preview</h3>
                <div className="space-y-2">
                  {previewData.preview.budgets.map((budget) => (
                    <div key={budget.id} className="flex justify-between items-center border rounded p-3 bg-gray-50">
                      <span className="font-medium">{budget.name}</span>
                      <div className="text-right">
                        <span className="line-through text-gray-400 text-sm mr-2">
                          {previewData.impact.from_symbol}{budget.original_amount.toFixed(2)}
                        </span>
                        <span className="font-medium">
                          → {previewData.impact.to_symbol}{budget.converted_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action will convert all your financial data to {toCurrency}. 
                Original values will be preserved for record-keeping. 
                You can revert this change within 24 hours.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={converting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmConversion} 
            disabled={loading || !previewData || converting}
            className="bg-primary-green hover:bg-primary-green/90"
          >
            {converting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Confirm & Convert'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyPreviewModal;