import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Filter,
  Download,
  RefreshCw,
  X
} from 'lucide-react';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import { Button } from '../../../components/atoms/Button';
import { useBookingActions } from '../hooks/useBookingActions';
import { useNavigate } from 'react-router-dom';
import { RowActionMenu } from '../../../components/atoms/RowActionMenu';
import Table from '../../../components/atoms/Table';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { Textarea } from '../../../components/atoms/Textarea';
import { useToast } from '../../../components/atoms/Toast';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  todayBookings: number;
  upcomingBookings: number;
  revenueGrowth: number;
}

interface RecentBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  amount: number;
}


type TabType = 'all' | 'cancelled' | 'pending' | 'rejected';

export const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    revenueGrowth: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0], // Today
  });

  const { getBookingAnalytics, getBookingList, exportBookings } = useBookingActions();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load analytics
        const analytics = await getBookingAnalytics(dateRange);
        setStats(analytics);

        // Load recent bookings
        const bookings = await getBookingList({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        setRecentBookings(bookings.data || []);

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [dateRange, getBookingAnalytics, getBookingList]);

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      await exportBookings({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        page: 1,
        limit: 1000,
      }, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };


  const refreshData = () => {
    window.location.reload();
  };

  const tabs = [
    { id: 'all', label: 'All Bookings', count: stats.totalBookings },
    { id: 'cancelled', label: 'Cancelled', count: stats.cancelledBookings },
    { id: 'pending', label: 'Pending', count: stats.pendingBookings },
    { id: 'rejected', label: 'Rejected', count: stats.cancelledBookings },
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    // Here you can add logic to filter bookings based on the selected tab
    // For now, we'll just update the active tab state
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Booking Dashboard</h2>
            <Breadcrumbs />
          </div>
          
          
        </div>

       

        {/* Recent Bookings */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Bookings</h3>
              {/* <Button
                variant="muted"
                size="sm"
                onClick={() => navigate('/booking-management')}
              >
                View All
              </Button> */}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="px-2 py-0">
              <div className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as TabType)}
                    className={`flex items-center  cursor-pointer space-x-2 px-4 py-2 rounded-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      tab.id === 'cancelled' ? 'bg-gray-600' :
                      tab.id === 'pending' ? 'bg-gray-500' :
                      tab.id === 'rejected' ? 'bg-red-600' :
                      'bg-blue-600'
                    }`}></span>
                    <span className="font-medium">{tab.label}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-gray-300 mt-4">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full table-fixed">
                <thead className="sticky top-0 z-10 divide-y divide-gray-200 text-left text-md bg-white">
                <tr className='bg-neutral-100 font-norma'>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold uppercase tracking-wider w-[120px]">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold uppercase tracking-wider w-[150px]">
                    Event Type
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold uppercase tracking-wider w-[200px]">
                    Location
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold uppercase tracking-wider w-[150px]">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 cursor-pointer border-b border-neutral-300 text-sm font-semibold uppercase tracking-wider w-[200px]">
                    Specific Requirements
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold uppercase tracking-wider w-[120px]">
                    Status
                  </th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap border-b border-neutral-300 text-sm font-semibold uppercase tracking-wider w-[180px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {booking.bookingNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.customerName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-[200px] truncate" title={booking.serviceName}>
                        {booking.serviceName}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.date).toLocaleDateString()} {booking.time}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-[200px] truncate" title="Catering, Photography, Venue">
                        Catering, Photography, Venue
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-blue-50 border-b border-gray-100">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                     BOKID-2345
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                     Wedding
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-[200px] truncate" title="Mumbai">
                        Mumbai
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      10:00 AM
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-[200px] truncate" title="Catering, Photography, Venue">
                        Catering, Photography, Venue
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full text-green-600`}>
                        Complete
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <RowActionMenu />
                    </td>
                  </tr>
              </tbody>
            </table>
            </div>
          </div>

          
        </div>


       
      </div>
    </Layout>
  );
};

export default BookingManagement;
