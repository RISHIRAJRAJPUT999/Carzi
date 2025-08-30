import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, User, Car, MapPin, Clock } from 'lucide-react';
import { useCarContext } from '../contexts/CarContext';
import { useBookingContext } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCarById } = useCarContext();
  const { createBooking } = useBookingContext();
  const { user } = useAuth();

  // --- UPDATED: Default to 'pay-later' ---
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: 'pay-later' as 'razorpay' | 'pay-later'
  });

  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const car = getCarById(id!);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!car) {
      navigate('/');
      return;
    }
    if (user) {
      setCustomerDetails({
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    }
  }, [user, car, navigate]);

  if (!car || !user) {
    return null;
  }

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    if (end <= start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalDays = calculateDays();
  const subtotal = car.pricePerDay * totalDays;
  const serviceFee = 100;
  const totalAmount = subtotal + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (totalDays <= 0) {
        setError('Return date must be after the pickup date.');
        setLoading(false);
        return;
      }
      const success = await createBooking({
        carId: car._id,
        ownerId: car.ownerId._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalAmount,
        paymentMethod: bookingData.paymentMethod,
      });

      if (success) {
        alert('Booking successful! Redirecting to your dashboard.');
        navigate('/customer-dashboard');
      } else {
        setError('Booking failed. The car might already be booked for these dates.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name' || name === 'email' || name === 'phone') {
      setCustomerDetails(prev => ({ ...prev, [name]: value }));
    } else {
      setBookingData(prev => ({ ...prev, [name]: value as any }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your details and confirm your car rental</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center"><Calendar className="h-5 w-5 mr-2 text-blue-600" />Rental Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                    <input type="date" name="startDate" value={bookingData.startDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} required className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                    <input type="date" name="endDate" value={bookingData.endDate} onChange={handleInputChange} min={bookingData.startDate || new Date().toISOString().split('T')[0]} required className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center"><User className="h-5 w-5 mr-2 text-blue-600" />Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" name="name" value={customerDetails.name} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" name="email" value={customerDetails.email} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={customerDetails.phone} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center"><CreditCard className="h-5 w-5 mr-2 text-blue-600" />Payment Method</h3>
                <div className="space-y-3">
                  
                  {/* --- THIS IS THE UPDATED SECTION --- */}
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-not-allowed opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={false} // Always unchecked
                      onChange={handleInputChange}
                      className="mr-3"
                      disabled // Disable the radio button
                    />
                    <div>
                      <div className="font-medium">Pay Online (Razorpay)</div>
                      <div className="text-sm text-gray-600">Secure online payment with cards, UPI, wallets</div>
                      <div className="text-xs text-red-500 font-semibold mt-1">Currently unavailable</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pay-later"
                      checked={bookingData.paymentMethod === 'pay-later'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Pay Later</div>
                      <div className="text-sm text-gray-600">Pay cash when you pick up the car</div>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Processing...' : `Confirm Booking - ₹${totalAmount}`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <img src={car.images && car.images[0] ? car.images[0] : 'https://via.placeholder.com/150'} alt={car.title} className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <h4 className="font-semibold">{car.title}</h4>
                  <div className="flex items-center text-sm text-gray-600"><MapPin className="h-4 w-4 mr-1" />{car.location}</div>
                </div>
              </div>
              {totalDays > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2"><Clock className="h-4 w-4 mr-2 text-blue-600" /><span className="font-medium">Rental Period</span></div>
                  <div className="text-sm text-gray-700">
                    <div>Pickup: {new Date(bookingData.startDate).toLocaleDateString()}</div>
                    <div>Return: {new Date(bookingData.endDate).toLocaleDateString()}</div>
                    <div className="font-medium mt-1">{totalDays} day{totalDays > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between"><span className="text-gray-700">₹{car.pricePerDay} × {totalDays} day{totalDays > 1 ? 's' : ''}</span><span className="text-gray-900">₹{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-gray-700">Service fee</span><span className="text-gray-900">₹{serviceFee}</span></div>
                <hr />
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>₹{totalAmount}</span></div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Included Features</h4>
                <div className="space-y-1">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600"><Car className="h-3 w-3 mr-2 text-green-600" />{feature}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;