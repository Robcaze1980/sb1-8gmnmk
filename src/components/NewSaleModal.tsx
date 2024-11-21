import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SaleDetailsForm from './SaleDetailsForm';
import TradeInForm from './TradeInForm';
import SpiffForm from './SpiffForm';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleAdded: () => void;
  editItem?: any | null;
}

type TabType = 'sale' | 'trade-in' | 'spiff';

export default function NewSaleModal({ isOpen, onClose, onSaleAdded, editItem }: NewSaleModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sale');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editItem ? 'Edit Entry' : 'New Entry'}</h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex space-x-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('sale')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'sale'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sale Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trade-in')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'trade-in'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Trade-In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spiff')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'spiff'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Spiff Bonus
              </button>
            </div>

            {activeTab === 'sale' && (
              <SaleDetailsForm onClose={onClose} onSaleAdded={onSaleAdded} editSale={editItem} />
            )}
            {activeTab === 'trade-in' && (
              <TradeInForm onClose={onClose} onTradeInAdded={onSaleAdded} editSale={editItem} />
            )}
            {activeTab === 'spiff' && (
              <SpiffForm onClose={onClose} onSpiffAdded={onSaleAdded} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}