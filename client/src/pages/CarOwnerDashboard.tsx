import React, { useState } from 'react';
import {
  Plus,
  Car,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  MapPin,
  Users,
  Fuel,
  Settings,
  UploadCloud,
  Eye,
  CheckCircle,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCarContext } from '../contexts/CarContext';
import { useBookingContext } from '../contexts/BookingContext';

// ---- Types ----
interface ICar {
  _id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  transmission: string;
  fuel: string;
  seats: number;
  pricePerDay: number;
  location: string;
  images: string[];
  features: string[];
  description: string;
  available: boolean;
  carNumber?: string;
  hasInsurance?: boolean;
  insuranceExpiryDate?: string;
}

interface IBooking {
  _id: string;
  carId: { _id: string; title: string; images?: string[] } | ICar | null;
  customerId: { _id: string; name?: string; email?: string } | null;
  startDate: string;
  endDate: string;
  totalAmount: number;
  bookingStatus: string;
  paymentMethod?: 'pay-later' | 'online';
  paymentStatus?: 'pending' | 'completed' | 'failed';
}

type CarForm = {
  title: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  transmission: 'Manual' | 'Automatic';
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  seats: number;
  pricePerDay: number;
  location: string;
  features: string[];
  description: string;
  carNumber: string;
  hasInsurance: boolean;
  insuranceExpiryDate?: string;
};

const CarOwnerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { addCar, updateCar, deleteCar, getCarsByOwner } = useCarContext();
  const { getBookingsByCarOwner, markBookingAsPaid } = useBookingContext();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview');
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState<ICar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---- Form state ----
  const initialFormData: CarForm = {
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: '',
    transmission: 'Manual',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 0,
    location: 'Indore',
    features: [],
    description: '',
    carNumber: '',
    hasInsurance: false,
    insuranceExpiryDate: '',
  };
  const [carFormData, setCarFormData] = useState<CarForm>(initialFormData);

  // Image handling (add flow only)
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const ownerCars: ICar[] = user ? getCarsByOwner(user.id) : [];
  const ownerBookings: IBooking[] = user ? getBookingsByCarOwner(user.id) : [];

  // ---- Handlers ----
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ['year', 'seats', 'pricePerDay'];
    const nextValue: any = numericFields.includes(name) ? Number(value) : value;

    setCarFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCarFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > 5) {
        alert('You can only upload a maximum of 5 images.');
        return;
      }
      setImageFiles(e.target.files);
      const urls = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
      setImagePreviews(urls);
    }
  };

  const resetForm = () => {
    setCarFormData(initialFormData);
    setImageFiles(null);
    setImagePreviews([]);
    setEditingCar(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingCar) {
        await updateCar(editingCar._id, {
          ...carFormData,
          features: carFormData.features,
        });
        alert('Car updated successfully!');
      } else {
        if (!imageFiles || imageFiles.length === 0) {
          setError('Please upload at least one image.');
          setLoading(false);
          return;
        }
        await addCar(
          {
            ...carFormData,
          },
          imageFiles
        );
        alert('Car added successfully!');
      }
      setShowAddCarForm(false);
      resetForm();
    } catch (err) {
      console.error(err);
      setError('An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (car: ICar) => {
    setEditingCar(car);
    setCarFormData({
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: car.year,
      type: car.type,
      transmission: car.transmission as 'Manual' | 'Automatic',
      fuel: car.fuel as 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid',
      seats: car.seats,
      pricePerDay: car.pricePerDay,
      location: car.location,
      description: car.description || '',
      features: car.features || [],
      carNumber: car.carNumber || '',
      hasInsurance: !!car.hasInsurance,
      insuranceExpiryDate: car.insuranceExpiryDate || '',
    });
    setImagePreviews(car.images || []);
    setShowAddCarForm(true);
  };

  const handleDeleteCar = (carId: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      deleteCar(carId);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...carFormData.features];
    newFeatures[index] = value;
    setCarFormData({ ...carFormData, features: newFeatures });
  };

  const addFeature = () => {
    setCarFormData({ ...carFormData, features: [...carFormData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = carFormData.features.filter((_, i) => i !== index);
    setCarFormData({ ...carFormData, features: newFeatures });
  };

  // --- Bookings actions ---
  const handleMarkAsPaid = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to mark this booking as paid?')) {
      const success = await markBookingAsPaid(bookingId);
      if (success) {
        alert('Booking marked as paid!');
      } else {
        alert('Failed to update payment status.');
      }
    }
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    if (!token) {
      alert('You must be logged in to download an invoice.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/invoice/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download invoice');

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
      console.error('Invoice download error:', error);
      alert('Could not download the invoice.');
    }
  };

  const totalEarnings = ownerBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Owner Dashboard</h1>
            <p className="text-gray-600">Manage your cars and track your earnings</p>
          </div>
          <button
            onClick={() => {
              setShowAddCarForm(true);
              setEditingCar(null);
              resetForm();
            }}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Car</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cars</p>
                <p className="text-2xl font-bold text-gray-900">{ownerCars.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{ownerBookings.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalEarnings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Cars</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ownerCars.filter((car) => car.available).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Cars
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Bookings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Your Cars</h2>
                {ownerCars.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No cars listed yet</h3>
                    <p className="text-gray-600 mb-4">Add your first car to start earning!</p>
                    <button
                      onClick={() => {
                        setShowAddCarForm(true);
                        setEditingCar(null);
                        resetForm();
                      }}
                      className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
                    >
                      Add Your First Car
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownerCars.map((car) => (
                      <div key={car._id} className="bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={
                            car.images && car.images[0]
                              ? car.images[0]
                              : 'https://via.placeholder.com/300x200?text=No+Image'
                          }
                          alt={car.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{car.title}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                car.available
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {car.available ? 'Available' : 'Booked'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 mb-3">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{car.location}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-600">{car.seats}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Fuel className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-600">{car.fuel}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Settings className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-600">{car.transmission}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <span className="text-xl font-bold text-gray-900">₹{car.pricePerDay}</span>
                              <span className="text-sm text-gray-600">/day</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(car)}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCar(car._id)}
                              className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Recent Bookings</h2>
                {ownerBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600">
                      Your bookings will appear here once customers start renting your cars.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownerBookings.map((booking) => {
                      const car = booking.carId as ICar | { title: string; images?: string[] } | null;
                      const customer = booking.customerId;
                      if (!car || !customer) return null;

                      const carTitle = (car as any).title || 'Car';
                      const carImages = (car as any).images || [];
                      const imgSrc =
                        carImages?.[0] || 'https://via.placeholder.com/64x64?text=Car';

                      const paymentMethod = booking.paymentMethod || 'online';
                      const paymentStatus = booking.paymentStatus || 'pending';

                      return (
                        <div
                          key={booking._id}
                          className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={imgSrc}
                              alt={carTitle}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-800">{carTitle}</p>
                              <p className="text-sm text-gray-600">
                                Booked by: {customer.name || 'Customer'}
                              </p>
                              {customer.email && (
                                <p className="text-xs text-gray-500">Email: {customer.email}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end space-y-2">
                            <div>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.startDate).toLocaleDateString()} -{' '}
                                {new Date(booking.endDate).toLocaleDateString()}
                              </p>
                              <p className="font-semibold text-lg text-gray-800">
                                ₹{booking.totalAmount}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {paymentMethod === 'pay-later' && paymentStatus === 'pending' && (
                                <button
                                  onClick={() => handleMarkAsPaid(booking._id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Paid
                                </button>
                              )}
                              {paymentStatus === 'completed' && (
                                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-green-800 bg-green-100">
                                  <ShieldCheck className="h-4 w-4 mr-2" />
                                  Paid
                                </span>
                              )}
                              <button
                                onClick={() => handleDownloadInvoice(booking._id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Invoice
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
          </div>
        </div>

        {/* Add / Edit Car Modal */}
        {showAddCarForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingCar ? 'Edit Car' : 'Add New Car'}
                </h2>

                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Car Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={carFormData.title}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={carFormData.brand}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                      <input
                        type="text"
                        name="model"
                        value={carFormData.model}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="number"
                        name="year"
                        value={carFormData.year}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Car Type
                      </label>
                      <select
                        name="type"
                        value={carFormData.type}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transmission
                      </label>
                      <select
                        name="transmission"
                        value={carFormData.transmission}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuel Type
                      </label>
                      <select
                        name="fuel"
                        value={carFormData.fuel}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                      <input
                        type="number"
                        name="seats"
                        value={carFormData.seats}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        min={2}
                        max={8}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Day (₹)
                      </label>
                      <input
                        type="number"
                        name="pricePerDay"
                        value={carFormData.pricePerDay}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        min={0}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={carFormData.location}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    {/* Number plate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Car Number Plate
                      </label>
                      <input
                        name="carNumber"
                        value={carFormData.carNumber}
                        onChange={handleTextChange}
                        placeholder="e.g., MP09AB1234"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>

                    {/* Insurance */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Details
                      </label>
                      <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
                        <input
                          type="checkbox"
                          id="hasInsurance"
                          name="hasInsurance"
                          checked={carFormData.hasInsurance}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 rounded"
                        />
                        <label htmlFor="hasInsurance" className="text-sm font-medium">
                          Is the car insured?
                        </label>
                      </div>
                    </div>

                    {carFormData.hasInsurance && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Insurance Expiry Date
                        </label>
                        <input
                          type="date"
                          name="insuranceExpiryDate"
                          value={carFormData.insuranceExpiryDate}
                          onChange={handleTextChange}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Image upload (Add only) */}
                  {!editingCar && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Car Images (up to 5)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-teal-600"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="images"
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/*"
                              onChange={handleFileChange}
                              required={!editingCar}
                            />
                          </label>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>

                      {imagePreviews.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {imagePreviews.map((src, index) => (
                            <div key={index} className="relative">
                              <img
                                src={src}
                                alt={`Preview ${index + 1}`}
                                className="h-24 w-full object-cover rounded-md border"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description & Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={carFormData.description}
                      onChange={handleTextChange}
                      name="description"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features
                    </label>
                    {carFormData.features.map((feature, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="flex-1 p-2 border rounded-lg"
                          placeholder="e.g., AC, GPS, Bluetooth"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                    >
                      Add Feature
                    </button>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg"
                    >
                      {loading ? 'Saving...' : editingCar ? 'Update Car' : 'Add Car'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCarForm(false);
                        setEditingCar(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarOwnerDashboard;
