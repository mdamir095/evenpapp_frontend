import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import { Button } from '../../../components/atoms/Button';
import { Textarea } from '../../../components/atoms/Textarea';
import { useToast } from '../../../components/atoms/Toast';
import { useBookingActions } from '../../booking/hooks/useBookingActions';
import { getUserDataFromStorage } from '../../../utils/permissions';

interface QuotationData {
  _id?: string;
  eventHall?: string;
  eventDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venueAddress?: string;
  photographerType?: string;
  specialRequirement?: string;
  expectedGuests?: number;
  coverageDuration?: number;
  numberOfPhotographers?: number;
  budgetRange?: number;
  referenceImages?: string[];
  status?: string;
  userId?: string;
  vendorId?: string;
  venueId?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const QuotationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = window.location.pathname;
  const isViewMode = location.includes('/quotation-management/') && !location.includes('/edit') && id;
  const { submitQuotation, getQuotationsList } = useBookingActions();
  const toast = useToast();
  
  const [quotationData, setQuotationData] = useState<QuotationData>({
    eventHall: '',
    eventDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venueAddress: '',
    photographerType: '',
    specialRequirement: '',
    expectedGuests: 0,
    coverageDuration: 0,
    numberOfPhotographers: 0,
    budgetRange: 0,
    referenceImages: [],
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);

  // Load quotation data if editing
  useEffect(() => {
    if (id) {
      loadQuotationData();
    }
  }, [id]);

  const loadQuotationData = async () => {
    try {
      setLoading(true);
      const response = await getQuotationsList(1, 100, '', {});
      
      let quotations: any[] = [];
      if (Array.isArray(response)) {
        quotations = response;
      } else if (response?.quotations) {
        quotations = response.quotations;
      } else if (response?.data) {
        quotations = Array.isArray(response.data) ? response.data : [];
      }

      const quotation = quotations.find(q => 
        q._id === id || 
        q.id === id || 
        (q._id && q._id.$oid === id) ||
        q.quotationId === id
      );
      if (quotation) {
        // Handle MongoDB date format
        const formatDate = (date: any) => {
          if (!date) return '';
          if (date.$date) {
            return new Date(date.$date).toISOString().split('T')[0];
          }
          if (date instanceof Date) {
            return date.toISOString().split('T')[0];
          }
          if (typeof date === 'string') {
            return date.split('T')[0];
          }
          return '';
        };

        setQuotationData({
          _id: quotation._id?.$oid || quotation._id || quotation.id,
          eventHall: quotation.eventHall || '',
          eventDate: formatDate(quotation.eventDate),
          endDate: formatDate(quotation.endDate),
          startTime: quotation.startTime || '',
          endTime: quotation.endTime || '',
          venueAddress: quotation.venueAddress || '',
          photographerType: quotation.photographerType || '',
          specialRequirement: quotation.specialRequirement || '',
          expectedGuests: quotation.expectedGuests || 0,
          coverageDuration: quotation.coverageDuration || 0,
          numberOfPhotographers: quotation.numberOfPhotographers || 0,
          budgetRange: quotation.budgetRange || 0,
          referenceImages: quotation.referenceImages || [],
          status: quotation.status || 'pending',
          userId: quotation.userId || '',
          vendorId: quotation.vendorId || '',
          venueId: quotation.venueId || '',
        });
      }
    } catch (error) {
      console.error('Error loading quotation:', error);
      toast.error('Failed to load quotation data');
    } finally {
      setLoading(false);
    }
  };

  // Handle quotation input changes
  const handleQuotationChange = (field: keyof QuotationData, value: string | number | string[]) => {
    setQuotationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save quotation
  const handleSaveQuotation = async () => {
    try {
      // Validate required fields
      if (!quotationData.eventHall?.trim()) {
        toast.error('Event Hall is required');
        return;
      }
      if (!quotationData.eventDate) {
        toast.error('Event Date is required');
        return;
      }
      if (!quotationData.venueAddress?.trim()) {
        toast.error('Venue Address is required');
        return;
      }
      if (quotationData.budgetRange && quotationData.budgetRange <= 0) {
        toast.error('Budget Range must be greater than 0');
        return;
      }

      // Get user data from storage
      const userData = getUserDataFromStorage();
      if (!userData) {
        toast.error('User data not found. Please login again.');
        return;
      }

      // Prepare quotation data for API
      const quotationPayload: any = {
        eventHall: quotationData.eventHall,
        eventDate: quotationData.eventDate,
        endDate: quotationData.endDate || quotationData.eventDate,
        startTime: quotationData.startTime || '',
        endTime: quotationData.endTime || '',
        venueAddress: quotationData.venueAddress,
        photographerType: quotationData.photographerType || '',
        specialRequirement: quotationData.specialRequirement || '',
        expectedGuests: quotationData.expectedGuests || 0,
        coverageDuration: quotationData.coverageDuration || 0,
        numberOfPhotographers: quotationData.numberOfPhotographers || 0,
        budgetRange: quotationData.budgetRange || 0,
        referenceImages: quotationData.referenceImages || [],
        status: quotationData.status || 'pending',
        userId: quotationData.userId || (userData as any).id || (userData as any)._id,
        vendorId: quotationData.vendorId || '',
        venueId: quotationData.venueId || '',
        ...(id && { _id: id }), // Include ID if editing
      };

      setLoading(true);
      // Call API to submit quotation
      await submitQuotation(quotationPayload);
      
      toast.success(id ? 'Quotation updated successfully!' : 'Quotation created successfully!');
      navigate('/quotation-management');
    } catch (error) {
      console.error('Error saving quotation:', error);
      // Error handling is done in the submitQuotation function
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/quotation-management');
  };

  if (loading && id) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quotation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {isViewMode ? 'View Quotation' : id ? 'Edit Quotation' : 'Create Quotation'}
            </h2>
            <Breadcrumbs />
          </div>
        </div>

        {/* Quotation Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Event Hall */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Hall <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={quotationData.eventHall || ''}
                onChange={(e) => handleQuotationChange('eventHall', e.target.value)}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., Rooftop Terrace"
              />
            </div>

            {/* Event Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={quotationData.eventDate || ''}
                  onChange={(e) => handleQuotationChange('eventDate', e.target.value)}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={quotationData.endDate || ''}
                  onChange={(e) => handleQuotationChange('endDate', e.target.value)}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={quotationData.startTime || ''}
                  onChange={(e) => handleQuotationChange('startTime', e.target.value)}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={quotationData.endTime || ''}
                  onChange={(e) => handleQuotationChange('endTime', e.target.value)}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Venue Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={quotationData.venueAddress || ''}
                onChange={(e) => handleQuotationChange('venueAddress', e.target.value)}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter venue address"
              />
            </div>

            {/* Photographer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photographer Type
              </label>
              <input
                type="text"
                value={quotationData.photographerType || ''}
                onChange={(e) => handleQuotationChange('photographerType', e.target.value)}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., Wedding, Corporate, etc."
              />
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements
              </label>
              <Textarea
                value={quotationData.specialRequirement || ''}
                onChange={(e) => handleQuotationChange('specialRequirement', e.target.value)}
                disabled={isViewMode}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter any special requirements..."
              />
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Guests
                </label>
                <input
                  type="number"
                  value={quotationData.expectedGuests || 0}
                  onChange={(e) => handleQuotationChange('expectedGuests', Number(e.target.value))}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coverage Duration (hours)
                </label>
                <input
                  type="number"
                  value={quotationData.coverageDuration || 0}
                  onChange={(e) => handleQuotationChange('coverageDuration', Number(e.target.value))}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Photographer Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Photographers
                </label>
                <input
                  type="number"
                  value={quotationData.numberOfPhotographers || 0}
                  onChange={(e) => handleQuotationChange('numberOfPhotographers', Number(e.target.value))}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Range (₹)
                </label>
                <input
                  type="number"
                  value={quotationData.budgetRange || 0}
                  onChange={(e) => handleQuotationChange('budgetRange', Number(e.target.value))}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={quotationData.status || 'pending'}
                onChange={(e) => handleQuotationChange('status', e.target.value)}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Reference Images */}
            {quotationData.referenceImages && quotationData.referenceImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Images
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {quotationData.referenceImages.map((image, index) => (
                    <div key={index} className="border border-gray-300 rounded-md p-2">
                      <img 
                        src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_BASE_URL || ''}${image}`}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Actions */}
            {!isViewMode && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="muted"
                  onClick={handleCancel}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveQuotation}
                  className="px-6 py-2"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : id ? 'Update Quotation' : 'Create Quotation'}
                </Button>
              </div>
            )}
            {isViewMode && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="muted"
                  onClick={handleCancel}
                  className="px-6 py-2"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/quotation-management/${id}/edit`)}
                  className="px-6 py-2"
                >
                  Edit Quotation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuotationForm;

