import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Package, MessageSquare } from 'lucide-react';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import { Button } from '../../../components/atoms/Button';
import { useBookingActions } from '../hooks/useBookingActions';
import { useBooking } from '../hooks/useBooking';
import { OfferList, type VendorOffer } from './OfferList';
import { ChatInterface } from './ChatInterface';
import { useToast } from '../../../components/atoms/Toast';

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { fetchBookingById, getBookingOffers, acceptVendorOffer } = useBookingActions();
  const { selectedBooking, loading } = useBooking();
  const [offers, setOffers] = useState<VendorOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBookingDetails();
      loadOffers();
    }
  }, [id]);

  const loadBookingDetails = async () => {
    if (!id) return;
    try {
      await fetchBookingById(id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load booking details');
    }
  };

  const loadOffers = async () => {
    if (!id) return;
    setOffersLoading(true);
    try {
      const offersData = await getBookingOffers(id);
      const offersList = Array.isArray(offersData) ? offersData : offersData?.offers || [];
      setOffers(offersList);
      
      // Check if any offer is accepted
      const acceptedOffer = offersList.find((o: VendorOffer) => o.status === 'accepted');
      if (acceptedOffer) {
        setAcceptedOfferId(acceptedOffer.id);
        setShowChat(true);
      }
    } catch (error: any) {
      console.error('Failed to load offers:', error);
      // Don't show error toast if offers endpoint doesn't exist yet
    } finally {
      setOffersLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!id) return;
    try {
      await acceptVendorOffer(id, offerId);
      setAcceptedOfferId(offerId);
      setShowChat(true);
      // Reload offers to update status
      await loadOffers();
    } catch (error: any) {
      throw error;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading booking details...</span>
        </div>
      </Layout>
    );
  }

  if (!selectedBooking) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Booking not found</p>
          <Button
            variant="muted"
            onClick={() => navigate('/booking-management')}
            className="mt-4"
          >
            Back to Bookings
          </Button>
        </div>
      </Layout>
    );
  }

  const booking = selectedBooking;
  const acceptedOffer = offers.find(o => o.id === acceptedOfferId);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="muted"
              onClick={() => navigate('/booking-management')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Booking Details
              </h2>
              <Breadcrumbs />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking ID</label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {booking.bookingNumber || booking.bookingId || id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">
                      {booking.status || booking.bookingStatus || 'Pending'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Event Date & Time
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {booking.startDateTime || booking.eventDate || booking.date
                      ? new Date(booking.startDateTime || booking.eventDate || booking.date).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {booking.location?.address || booking.location || 'N/A'}
                  </p>
                </div>

                {booking.specialRequirement || booking.specialRequests ? (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Special Requirements</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {booking.specialRequirement || booking.specialRequests}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Vendor Offers */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Vendor Offers
                </h3>
                <Button
                  variant="muted"
                  size="sm"
                  onClick={loadOffers}
                  disabled={offersLoading}
                >
                  Refresh
                </Button>
              </div>
              <OfferList
                offers={offers}
                bookingId={id || ''}
                onAcceptOffer={handleAcceptOffer}
                loading={offersLoading}
              />
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-1">
            {showChat && acceptedOffer ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Chat with Vendor
                  </h3>
                  <Button
                    variant="muted"
                    size="sm"
                    onClick={() => setShowChat(false)}
                  >
                    Close
                  </Button>
                </div>
                <ChatInterface
                  bookingId={id || ''}
                  vendorId={acceptedOffer.vendorId}
                  vendorName={acceptedOffer.vendorName}
                />
              </div>
            ) : acceptedOfferId ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 mb-4">Chat interface will appear here</p>
                  <Button
                    variant="primary"
                    onClick={() => setShowChat(true)}
                  >
                    Open Chat
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Accept an offer to start chatting with the vendor</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingDetail;

