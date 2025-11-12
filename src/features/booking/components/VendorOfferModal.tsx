import React, { useState } from 'react';
import { X, DollarSign, Package } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { Textarea } from '../../../components/atoms/Textarea';
import { useToast } from '../../../components/atoms/Toast';
import { useBookingActions } from '../hooks/useBookingActions';

interface VendorOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingNumber?: string;
  onSuccess?: () => void;
}

interface OfferData {
  offerAmount: number;
  extraServices: string;
  notes?: string;
}

export const VendorOfferModal: React.FC<VendorOfferModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
  onSuccess,
}) => {
  const [offerData, setOfferData] = useState<OfferData>({
    offerAmount: 0,
    extraServices: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { submitVendorOffer } = useBookingActions();

  if (!isOpen) return null;

  const handleChange = (field: keyof OfferData, value: string | number) => {
    setOfferData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (offerData.offerAmount <= 0) {
      toast.error('Offer amount must be greater than 0');
      return;
    }

    if (!offerData.extraServices.trim()) {
      toast.error('Please describe the extra services');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitVendorOffer(bookingId, {
        offerAmount: offerData.offerAmount,
        extraServices: offerData.extraServices,
        notes: offerData.notes,
        status: 'pending',
      });

      toast.success('Offer submitted successfully!');
      setOfferData({
        offerAmount: 0,
        extraServices: '',
        notes: '',
      });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOfferData({
      offerAmount: 0,
      extraServices: '',
      notes: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Submit Offer</h3>
            {bookingNumber && (
              <p className="text-sm text-gray-500 mt-1">Booking: {bookingNumber}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Offer Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offer Amount (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={offerData.offerAmount || ''}
                onChange={(e) => handleChange('offerAmount', Number(e.target.value))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Extra Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extra Services *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Textarea
                value={offerData.extraServices}
                onChange={(e) => handleChange('extraServices', e.target.value)}
                rows={4}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the extra services you're offering..."
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <Textarea
              value={offerData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information or terms..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="muted"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Offer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

