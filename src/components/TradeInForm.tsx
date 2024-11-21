// src/components/TradeInForm.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface TradeInFormProps {
  onClose: () => void;
  onTradeInAdded: () => void;
  editSale?: any;
}

export default function TradeInForm({ onClose, onTradeInAdded, editSale }: TradeInFormProps) {
  const { session } = useAuth();
  const [amount, setAmount] = useState(editSale?.trade_in_commission?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editSale) {
      setAmount(editSale.trade_in_commission?.toString() || '');
    }
  }, [editSale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('sales')
        .update({ trade_in_commission: Number(amount) })
        .eq('id', editSale.id);

      if (error) throw error;
      
      toast.success('Trade-in commission updated successfully');
      onTradeInAdded();
      onClose();
    } catch (error: any) {
      console.error('Error updating trade-in commission:', error);
      toast.error(error.message || 'Error updating trade-in commission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Trade-In Commission Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter negotiated amount"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Enter the trade-in commission amount as negotiated with the sales manager
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Trade-In Commission'}
        </button>
      </div>
    </form>
  );
}
