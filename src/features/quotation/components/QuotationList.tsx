import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X } from 'lucide-react';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import { Button } from '../../../components/atoms/Button';
import { Textarea } from '../../../components/atoms/Textarea';
import { useBookingActions } from '../../booking/hooks/useBookingActions';
import { useToast } from '../../../components/atoms/Toast';
import { getUserDataFromStorage } from '../../../utils/permissions';

interface Quotation {
  _id?: string | { $oid: string };
  id?: string;
  quotationId?: string;
  eventHall?: string;
  eventDate?: string | { $date: string };
  endDate?: string | { $date: string };
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
  createdAt?: string | { $date: string };
  updatedAt?: string | { $date: string };
}

interface QuotationFormData {
  quotationTitle: string;
  description: string;
  price: number;
  breakdownOfCharges: string;
  discounts: number;
  taxes: number;
  totalAmount: number;
}

export const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const { getQuotationsList, submitQuotation } = useBookingActions();
  const toast = useToast();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [quotationFormData, setQuotationFormData] = useState<QuotationFormData>({
    quotationTitle: '',
    description: '',
    price: 0,
    breakdownOfCharges: '',
    discounts: 0,
    taxes: 0,
    totalAmount: 0
  });

  // Load quotations on component mount
  useEffect(() => {
    loadQuotations();
  }, []);

  // Reload quotations when navigating back to the page
  useEffect(() => {
    const handleFocus = () => {
      loadQuotations();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const response = await getQuotationsList(1, 100, searchQuery, {});
      
      // Handle different response structures
      if (Array.isArray(response)) {
        setQuotations(response);
      } else if (response?.quotations) {
        setQuotations(response.quotations);
      } else if (response?.data) {
        setQuotations(Array.isArray(response.data) ? response.data : []);
      } else {
        setQuotations([]);
      }
    } catch (error) {
      console.error('Error loading quotations:', error);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadQuotations();
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'approved':
      case 'accepted':
        return 'bg-green-100 text-green-600';
      case 'rejected':
      case 'declined':
        return 'bg-red-100 text-red-600';
      case 'sent':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Handle reply button click - open quotation modal
  const handleReplyQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    // Pre-fill form with quotation data if available
    setQuotationFormData({
      quotationTitle: quotation.eventHall ? `Quotation for ${quotation.eventHall}` : '',
      description: quotation.specialRequirement || '',
      price: quotation.budgetRange || 0,
      breakdownOfCharges: '',
      discounts: 0,
      taxes: 0,
      totalAmount: quotation.budgetRange || 0
    });
    setShowQuotationModal(true);
  };

  // Handle quotation form input changes
  const handleQuotationFormChange = (field: keyof QuotationFormData, value: string | number) => {
    setQuotationFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total when price, discounts, or taxes change
      if (field === 'price' || field === 'discounts' || field === 'taxes') {
        const subtotal = field === 'price' ? Number(value) : prev.price;
        const discountAmount = field === 'discounts' ? Number(value) : prev.discounts;
        const taxAmount = field === 'taxes' ? Number(value) : prev.taxes;
        updated.totalAmount = subtotal - discountAmount + taxAmount;
      }
      
      return updated;
    });
  };

  // Handle save quotation (reply)
  const handleSaveQuotationReply = async () => {
    try {
      // Validate required fields
      if (!quotationFormData.quotationTitle.trim()) {
        toast.error('Quotation title is required');
        return;
      }
      if (!quotationFormData.description.trim()) {
        toast.error('Description is required');
        return;
      }
      if (quotationFormData.price <= 0) {
        toast.error('Price must be greater than 0');
        return;
      }

      // Get user data from storage
      const userData = getUserDataFromStorage();
      if (!userData) {
        toast.error('User data not found. Please login again.');
        return;
      }

      if (!selectedQuotation) {
        toast.error('Quotation not found');
        return;
      }

      const quotationId = selectedQuotation._id?.$oid || selectedQuotation._id || selectedQuotation.id || selectedQuotation.quotationId;

      // Prepare quotation data for API
      const quotationPayload: any = {
        quotationTitle: quotationFormData.quotationTitle,
        description: quotationFormData.description,
        price: quotationFormData.price,
        breakdownOfCharges: quotationFormData.breakdownOfCharges,
        discounts: quotationFormData.discounts,
        taxes: quotationFormData.taxes,
        totalAmount: quotationFormData.totalAmount,
        userId: (userData as any).id || (userData as any)._id,
        enterpriseId: userData.enterpriseId,
        enterpriseName: userData.organizationName,
        status: 'approved', // Set as approved when replying
        // Link to original quotation if updating
        ...(quotationId && { _id: quotationId }),
        // Include original quotation fields
        eventHall: selectedQuotation.eventHall,
        eventDate: selectedQuotation.eventDate,
        endDate: selectedQuotation.endDate,
        venueAddress: selectedQuotation.venueAddress,
      };

      // Call API to submit quotation
      await submitQuotation(quotationPayload);
      
      setShowQuotationModal(false);
      setSelectedQuotation(null);
      // Reset form
      setQuotationFormData({
        quotationTitle: '',
        description: '',
        price: 0,
        breakdownOfCharges: '',
        discounts: 0,
        taxes: 0,
        totalAmount: 0
      });
      
      // Reload quotations list
      await loadQuotations();
      toast.success('Quotation reply sent successfully!');
    } catch (error) {
      console.error('Error saving quotation reply:', error);
      // Error handling is done in the submitQuotation function
    }
  };

  // Handle cancel quotation modal
  const handleCancelQuotationModal = () => {
    setShowQuotationModal(false);
    setSelectedQuotation(null);
    setQuotationFormData({
      quotationTitle: '',
      description: '',
      price: 0,
      breakdownOfCharges: '',
      discounts: 0,
      taxes: 0,
      totalAmount: 0
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Quotation Management</h2>
            <Breadcrumbs />
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search quotations by event hall, venue address..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
          <div className="w-full overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full table-fixed">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="bg-neutral-100">
                    <th className="px-4 py-3 whitespace-nowrap border-b border-neutral-300 text-sm font-semibold text-left w-[150px]">
                      Quotation ID
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap border-b border-neutral-300 text-sm font-semibold text-left w-[200px]">
                      Event Hall
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap border-b border-neutral-300 text-sm font-semibold text-left w-[150px]">
                      Event Date
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap border-b border-neutral-300 text-sm font-semibold text-left w-[150px]">
                      Venue Address
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap border-b border-neutral-300 text-sm font-semibold text-left w-[120px]">
                      Budget (₹)
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap border-b border-neutral-300 text-sm font-semibold text-left w-[120px]">
                      Status
                    </th>
                  <th className="px-4 py-3 whitespace-nowrap border-b border-neutral-300 text-sm font-semibold text-left w-[150px]">
                    Created Date
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap border-b border-neutral-300 text-sm font-semibold text-left w-[120px]">
                    Actions
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Loading quotations...</span>
                        </div>
                      </td>
                    </tr>
                  ) : quotations.length > 0 ? (
                    quotations.map((quotation, index) => {
                      const quotationId = quotation._id?.$oid || quotation._id || quotation.id || quotation.quotationId || `QUO-${index + 1}`;
                      const formatDate = (date: any) => {
                        if (!date) return 'N/A';
                        if (date.$date) {
                          return new Date(date.$date).toLocaleDateString();
                        }
                        if (date instanceof Date) {
                          return date.toLocaleDateString();
                        }
                        if (typeof date === 'string') {
                          return new Date(date).toLocaleDateString();
                        }
                        return 'N/A';
                      };
                      
                      return (
                      <tr key={quotationId} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {quotationId}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="max-w-[200px] truncate" title={quotation.eventHall || 'N/A'}>
                            {quotation.eventHall || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(quotation.eventDate)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="max-w-[150px] truncate" title={quotation.venueAddress || 'N/A'}>
                            {quotation.venueAddress || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{quotation.budgetRange?.toLocaleString() || '0'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              quotation.status || 'pending'
                            )}`}
                          >
                            {quotation.status ? 
                              quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1).toLowerCase() 
                              : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quotation.createdAt 
                            ? new Date(quotation.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Reply button - For responding to quotation requests (pending only) */}
                            {(quotation.status?.toLowerCase() === 'pending' || !quotation.status) && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleReplyQuotation(quotation)}
                                className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                                title="Reply to quotation request"
                              >
                                <MessageSquare className="w-3 h-3" />
                                Reply
                              </Button>
                            )}
                            {/* Edit button - Always available for editing quotation */}
                            <Button
                              variant="muted"
                              size="sm"
                              onClick={() => navigate(`/quotation-management/${quotationId}/edit`)}
                              className="text-xs px-3 py-1 border border-gray-300 hover:bg-gray-50"
                              title="Edit quotation"
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-gray-400">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-lg font-medium">No quotations found</span>
                          <span className="text-sm">Try adjusting your search or check back later</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Event Quotation Modal - Right Side Slide (Same as Booking Module) */}
        {showQuotationModal && (
          <div className="fixed inset-0 z-50">
            <div 
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Event Quotation</h3>
                <button
                  onClick={handleCancelQuotationModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Quotation Fields */}
                <div className="space-y-4">
                  {/* Quotation Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Title *</label>
                    <input
                      type="text"
                      value={quotationFormData.quotationTitle}
                      onChange={(e) => handleQuotationFormChange('quotationTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Wedding Photography Premium Package"
                    />
                  </div>

                  {/* Description / Proposal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description / Proposal *</label>
                    <Textarea
                      value={quotationFormData.description}
                      onChange={(e) => handleQuotationFormChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Explain your offer and services in detail..."
                    />
                  </div>

                  {/* Price / Estimated Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price / Estimated Cost *</label>
                    <input
                      type="number"
                      value={quotationFormData.price}
                      onChange={(e) => handleQuotationFormChange('price', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {/* Breakdown of Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breakdown of Charges (Optional)</label>
                    <Textarea
                      value={quotationFormData.breakdownOfCharges}
                      onChange={(e) => handleQuotationFormChange('breakdownOfCharges', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Item 1: ₹1000&#10;Item 2: ₹2000&#10;Item 3: ₹1500"
                    />
                  </div>

                  {/* Discounts / Offers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discounts / Offers (Optional)</label>
                    <input
                      type="number"
                      value={quotationFormData.discounts}
                      onChange={(e) => handleQuotationFormChange('discounts', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {/* Taxes & Fees */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxes & Fees (Optional)</label>
                    <input
                      type="number"
                      value={quotationFormData.taxes}
                      onChange={(e) => handleQuotationFormChange('taxes', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {/* Total Amount */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-lg font-bold text-blue-600">₹{quotationFormData.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
                <Button
                  variant="muted"
                  onClick={handleCancelQuotationModal}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveQuotationReply}
                  className="px-4 py-2"
                >
                  Save Quotation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuotationList;

