import React, { useEffect, useState } from 'react';
import { Filter, X, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import { useBooking } from '../hooks/useBooking';
import { useBookingActions } from '../hooks/useBookingActions';
import { RowActionMenu } from '../../../components/atoms/RowActionMenu';
import { DropDown } from '../../../components/atoms/DropDown';
import { Button } from '../../../components/atoms/Button';
import { Textarea } from '../../../components/atoms/Textarea';
import { useToast } from '../../../components/atoms/Toast';
import { getUserDataFromStorage } from '../../../utils/permissions';

// Define a more flexible booking interface for the component
interface BookingItem {
  bookingId?: string;
  bookingNumber?: string;
  status: string;
  type?: string;
  location?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  specialRequests?: string;
  vendorId?: string;
  venueId?: string;
  vendor?: {
    id?: string;
    name?: string;
  };
  venue?: {
    id?: string;
    title?: string;
  };
  customer?: {
    name?: string;
    email?: string;
  };
  services?: Array<{
    name?: string;
    price?: number;
  }>;
  payment?: {
    amount?: number;
  };
}


type TabType = 'all' | 'cancelled' | 'pending' | 'rejected';

interface Tab {
  id: TabType;
  label: string;
  count: number;
}

export const BookingIndex: React.FC = () => {
  const bookingState = useBooking();
  const { bookings = [] } = bookingState;
  const { getBookingList, acceptBooking, rejectBooking } = useBookingActions();
  
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [open, setOpen] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [filteredBookings, setFilteredBookings] = useState<BookingItem[]>([]);
  const toast = useToast();
  
  // Load basic stats on component mount
  useEffect(() => {
    console.log('📋 BookingIndex: Component mounted, loading bookings...');
    // Load all bookings to get proper counts using booking/all API
    getBookingList(1, 100, '', {});
  }, []);

  // Update filtered bookings when bookings data, active tab, or service type changes
  useEffect(() => {
    let filtered = [...bookings];
    
    // Helper function to get status (check both status and bookingStatus fields, case-insensitive)
    const getStatus = (booking: any) => {
      const status = booking.status || booking.bookingStatus || '';
      return status.toLowerCase();
    };
    
    // Filter by status tab
    switch (activeTab) {
      case 'cancelled':
        filtered = bookings.filter(b => {
          const status = getStatus(b);
          return status === 'cancelled' || status === 'CANCELLED';
        });
        break;
      case 'pending':
        filtered = bookings.filter(b => getStatus(b) === 'pending');
        break;
      case 'rejected':
        filtered = bookings.filter(b => {
          const status = getStatus(b);
          return status === 'cancelled';
        });
        break;
      case 'all':
      default:
        filtered = [...bookings];
        break;
    }
    
    // Filter by service type
    if (selectedServiceType !== 'all') {
      filtered = filtered.filter(booking => {
        // Check if booking has vendor services
        if (selectedServiceType === 'vendor') {
          return booking.bookingType === 'vendor' || 
                 booking.vendorId ||
                 booking.vendor || 
                 booking.services?.some((service: any) => service.type === 'vendor' || service.vendorId);
        }
        // Check if booking has venue services
        if (selectedServiceType === 'venue') {
          return booking.bookingType === 'venue' ||
                 booking.venueId ||
                 booking.services?.some((service: any) => service.type === 'venue' || service.venueId);
        }
        return true;
      });
    }
    
    setFilteredBookings(filtered);
  }, [bookings, activeTab, selectedServiceType]);

  // Helper function to get status (check both status and bookingStatus fields, case-insensitive)
  const getBookingStatus = (booking: any) => {
    const status = booking.status || booking.bookingStatus || '';
    return status.toLowerCase();
  };

  // Calculate counts for each tab
  const allCount = bookings.length;
  const cancelledCount = bookings.filter(b => {
    const status = getBookingStatus(b);
    return status === 'cancelled' || status === 'CANCELLED';
  }).length;
  const pendingCount = bookings.filter(b => getBookingStatus(b) === 'pending').length;
  const rejectedCount = bookings.filter(b => {
    const status = getBookingStatus(b);
    return status === 'cancelled';
  }).length;

  // Tab configuration
  const tabs: Tab[] = [
    { id: 'all', label: 'All Bookings', count: allCount },
    { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
    { id: 'pending', label: 'Pending', count: pendingCount },
    { id: 'rejected', label: 'Rejected', count: rejectedCount },
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    
    // Define filters based on selected tab
    let filters: any = {};
    switch (tabId) {
      case 'cancelled':
        filters = { status: 'CANCELLED' };
        break;
      case 'pending':
        filters = { status: 'pending' };
        break;
      case 'rejected':
        filters = { status: 'CANCELLED' };
        break;
      case 'all':
      default:
        filters = {};
        break;
    }
    
    // Add service type filter if selected
    if (selectedServiceType !== 'all') {
      filters.serviceType = selectedServiceType;
    }
    
    // Fetch bookings with the selected filter using booking/all API
    getBookingList(1, 100, '', filters);
  };

  // Handle service type filter change
  const handleServiceTypeChange = async (serviceType: string) => {
    setSelectedServiceType(serviceType);
    
    // Make API call with service type filter
    try {
      const filters: any = {};
      
      // Add service type filter if not 'all'
      if (serviceType !== 'all') {
        filters.serviceType = serviceType;
      }
      
      // Make API call to fetch filtered bookings
      await getBookingList(1, 100, '', filters);
    } catch (error) {
      console.error('Error fetching filtered bookings:', error);
      toast.error('Failed to fetch filtered bookings');
    }
  };


  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'confirmed':
        return 'bg-blue-100 text-blue-600';
      case 'rejected':
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Handle accept booking
  const handleAcceptBooking = async (booking: any) => {
    try {
      const bookingId = booking.bookingNumber || booking.bookingId;
      if (!bookingId) {
        toast.error('Booking ID not found');
        return;
      }

      if (window.confirm('Are you sure you want to accept this booking request?')) {
        const notes = window.prompt('Add notes (optional):') || undefined;
        await acceptBooking(bookingId, notes, () => {
          // Reload bookings after status update
          getBookingList(1, 100, '', {});
        });
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      // Error handling is done in the acceptBooking function
    }
  };

  // Handle reject booking
  const handleRejectBooking = async (booking: any) => {
    try {
      const bookingId = booking.bookingNumber || booking.bookingId;
      if (!bookingId) {
        toast.error('Booking ID not found');
        return;
      }

      const reason = window.prompt('Please provide a reason for rejecting this booking:');
      if (reason) {
        await rejectBooking(bookingId, reason, () => {
          // Reload bookings after status update
          getBookingList(1, 100, '', {});
        });
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      // Error handling is done in the rejectBooking function
    }
  };


  return (
    <Layout>
      <div className="space-y-6">
      
        {/* Recent Bookings */}
        <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-6 grid gap-4">
          <div className="py-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold mb-0">Bookings</h3>
              <div className="flex items-center space-x-4">
                {/* Service Type Filter Dropdown */}
                <DropDown 
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Venue', value: 'venue' },
                    { label: 'Vendor', value: 'vendor' }
                  ]}
                  value={selectedServiceType}
                  onChange={handleServiceTypeChange}
                />
              </div>
            </div>
          </div>
      
                {/* Tabs */}
         
          <div className=" mt-0">
            {/* Tabs */}
            <div className="border-gray-200 border-b-0 p-0 m-0">
              <div className="px-0 pt-0">
                <div className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      className={`pb-2 px-3  font-medium flex items-center cursor-pointer space-x-1 pt-2  ${
                        activeTab === tab.id
                          ? 'border-b-2 border-blue-500 text-black bg-blue-100 rounded-md  font-semibold rounded-b-none'
                          : 'text-gray-500 hover:text-black  hover:border-blue-500'
                      }`}
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tab.id === 'cancelled'
                            ? 'bg-gray-600'
                            : tab.id === 'pending'
                            ? 'bg-yellow-600'
                            : tab.id === 'rejected'
                            ? 'bg-red-600'
                            : 'bg-blue-600'
                        }`}
                      ></span>
                      <span className="font-medium">{tab.label}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto border border-gray-300 rounded-b-xl">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="min-w-full rounded-b-xl table-fixed">
                  <thead className="sticky top-0 z-10 divide-y divide-gray-200 text-left text-md bg-white">
                  <tr className="bg-neutral-100 font-normal cursor-pointer">
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold w-[120px]">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold w-[150px]">
                    Event Type
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold w-[200px]">
                    Location
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold w-[150px]">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 cursor-pointer border-b border-neutral-300 text-sm font-semibold w-[200px]">
                    Specific Requirements
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold w-[120px]">
                    Status
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold w-[250px]">
                    Action
                  </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 rounded-b-sm">
                  {/* Bookings Table */}
                  <>
                    {bookingState.loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Loading bookings...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredBookings.length > 0 ? (
                      filteredBookings.map((booking: any, index) => (
                        <tr key={booking.id || booking.bookingId || index} className="hover:bg-gray-50 cursor-default">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {booking.bookingNumber || booking.bookingId || `BOKID-${Math.floor(Math.random() * 9999)}`}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.bookingType || booking.type || booking.title || 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="max-w-[200px] truncate" title={booking.location?.address || booking.location || 'N/A'}>
                              {booking.location?.address || booking.location || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.startDateTime || booking.eventDate || booking.date
                              ? new Date(booking.startDateTime || booking.eventDate || booking.date).toLocaleDateString()
                              : 'N/A'}{' '}
                            {booking.startTime || ''}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="max-w-[200px] truncate" title={booking.specialRequirement || booking.specialRequests || 'N/A'}>
                              {booking.specialRequirement || booking.specialRequests || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                getBookingStatus(booking)
                              )}`}
                            >
                              {(() => {
                                const status = booking.status || booking.bookingStatus || 'pending';
                                return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                              })()}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2 flex-wrap">
                              {(getBookingStatus(booking) === 'pending') && (
                                <>
                                  <Button
                                    onClick={() => handleAcceptBooking(booking)}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs whitespace-nowrap flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Accept
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectBooking(booking)}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs whitespace-nowrap flex items-center gap-1"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // No bookings found message
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="text-gray-400">
                              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <span className="text-lg font-medium">No bookings found</span>
                            <span className="text-sm">Try adjusting your filters or check back later</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default BookingIndex;
