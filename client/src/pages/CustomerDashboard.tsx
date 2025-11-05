import React, { useState } from 'react';
import { Calendar, Car, Clock, CreditCard, MapPin, Star, User, Phone, Mail, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBookingContext } from '../contexts/BookingContext';
import { useCarContext } from '../contexts/CarContext';
import RouteMapModal from '../components/RouteMapModal';

const CustomerDashboard: React.FC = () => {
  const { user, token } = useAuth(); // <-- GET TOKEN for API calls
  const { getBookingsByCustomer } = useBookingContext();
  const [activeTab, setActiveTab] = useState('bookings');
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedCarLocation, setSelectedCarLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    ); 
  }

  // --- NEW DOWNLOAD INVOICE FUNCTION ---
  const handleDownloadInvoice = async (bookingId: string) => {
    if (!token) {
        alert("You must be logged in to download an invoice.");
        return;
    }
    try {
        const res = await fetch(`http://localhost:5000/api/bookings/invoice/${bookingId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Failed to download invoice');
        }
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Invoice download error:", error);
        alert("Could not download the invoice.");
    }
  };

  const handleShowMap = async (carId: string) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const userLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(userLoc);

        try {
          const response = await fetch(`http://localhost:5000/api/cars/${carId}/location`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch car location.');
          }

          const data = await response.json();
          setSelectedCarLocation(data);
          setShowMapModal(true);
        } catch (err) {
          alert('Failed to fetch car location.');
        }
      });
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const userBookings = getBookingsByCustomer(user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Manage your bookings and account settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full"><Car className="h-6 w-6 text-blue-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{userBookings.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full"><Clock className="h-6 w-6 text-green-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{userBookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'ongoing').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full"><CreditCard className="h-6 w-6 text-orange-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{userBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button onClick={() => setActiveTab('bookings')} className={`py-4 px-1 border-b-2 font-medium text-sm ${ activeTab === 'bookings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700' }`}>My Bookings</button>
              <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm ${ activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700' }`}>Profile</button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Your Bookings</h2>
                {userBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring our cars and make your first booking!</p>
                    <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Browse Cars</a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userBookings.map((booking) => {
                      const car = booking.carId;
                      if (!car) return null;
                      return (
                        <div key={booking._id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                              <img src={car.images && car.images[0] ? car.images[0] : 'https://via.placeholder.com/150'} alt={car.title} className="w-20 h-20 object-cover rounded-lg" />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{car.title}</h3>
                                <div className="flex items-center text-sm text-gray-600 mt-1"><MapPin className="h-4 w-4 mr-1" />{car.location}</div>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>{booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}</span>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <div className="text-sm text-gray-600 mb-1">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</div>
                              <div className="text-lg font-bold text-gray-900">₹{booking.totalAmount}</div>
                              <div className="text-sm text-gray-600">{booking.paymentMethod === 'razorpay' ? 'Online Payment' : 'Pay Later'}</div>
                              
                              {/* --- THIS IS THE NEW BUTTON --- */}
                              <button 
                                onClick={() => handleDownloadInvoice(booking._id)}
                                className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                              >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Invoice
                              </button>
                              <button 
                                onClick={() => handleShowMap(car._id)}
                                className="mt-2 ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                              >
                                  <MapPin className="h-4 w-4 mr-2" />
                                  Show Pickup Location
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <div className="max-w-2xl">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-100 p-4 rounded-full"><User className="h-8 w-8 text-blue-600" /></div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600">Customer Account</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center"><Mail className="h-5 w-5 text-gray-400 mr-3" /><div><p className="text-sm font-medium text-gray-700">Email</p><p className="text-gray-900">{user.email}</p></div></div>
                      <div className="flex items-center"><Phone className="h-5 w-5 text-gray-400 mr-3" /><div><p className="text-sm font-medium text-gray-700">Phone</p><p className="text-gray-900">{user.phone}</p></div></div>
                      <div className="flex items-center"><Calendar className="h-5 w-5 text-gray-400 mr-3" /><div><p className="text-sm font-medium text-gray-700">Member Since</p><p className="text-gray-900">{formatDate(user.createdAt)}</p></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showMapModal && userLocation && selectedCarLocation && (
        <RouteMapModal
          userLocation={userLocation}
          carLocation={selectedCarLocation}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;