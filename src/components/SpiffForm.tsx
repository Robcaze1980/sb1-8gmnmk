// src/components/SpiffForm.tsx
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface SpiffFormProps {
  onClose: () => void;
  onSpiffAdded: () => void;
}

export default function SpiffForm({ onClose, onSpiffAdded }: SpiffFormProps) {
  const { session } = useAuth();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `spiff-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('sales-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sales-documents')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !date) {
      toast.error('Amount and date are required');
      return;
    }

    if (note && note.split(' ').length > 40) {
      toast.error('Note cannot exceed 40 words');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('spiffs')
        .insert([{
          user_id: session?.user.id,
          amount: Number(amount),
          note,
          image_url: imageUrl,
          date
        }]);

      if (error) throw error;
      
      toast.success('Spiff bonus added successfully');
      onSpiffAdded();
      onClose();
    } catch (error: any) {
      console.error('Error adding spiff bonus:', error);
      toast.error(error.message || 'Error adding spiff bonus');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Note (max 40 words)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
        <p className="mt-1 text-sm text-gray-500">
          {note.split(' ').length}/40 words
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Proof Image
        </label>
        <div className="mt-1 flex items-center">
          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
            <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </span>
            <input
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Spiff proof"
              className="ml-4 h-16 w-16 object-cover rounded-md"
            />
          )}
        </div>
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
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Add Spiff Bonus'}
        </button>
      </div>
    </div>
  );
}
