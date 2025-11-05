import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Users, Fuel, Settings, MapPin, Calendar, Shield, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useCarContext } from '../contexts/CarContext';
import { useAuth } from '../contexts/AuthContext';

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCarById } = useCarContext();
  const { user, token } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const car = getCarById(id!);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/cars/${id}/reviews`);
        const data = await response.json();
        if (response.ok) {
          setReviews(data);
        } else {
          console.error('Failed to fetch reviews:', data.message);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    if (id) {
      fetchReviews();
    }
  }, [id]);

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Car not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${car._id}`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');

    if (!user || !token) {
      setReviewError('You must be logged in to submit a review.');
      setSubmittingReview(false);
      return;
    }

    if (newReview.rating === 0) {
      setReviewError('Please provide a rating.');
      setSubmittingReview(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/cars/${car._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();

      if (response.ok) {
        // Refetch reviews to update the list and car rating
        const updatedReviewsResponse = await fetch(`http://localhost:5000/api/cars/${car._id}/reviews`);
        const updatedReviewsData = await updatedReviewsResponse.json();
        setReviews(updatedReviewsData);

        // Optionally, refetch car details to update average rating and review count
        // This would require a method in useCarContext to refetch a single car
        // For now, we'll rely on the backend to update car.rating and car.reviews
        // and assume the next fetch of all cars will pick it up.

        setNewReview({ rating: 0, comment: '' }); // Clear form
      } else {
        setReviewError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError('An error occurred. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const images = car.images && car.images.length > 0 
    ? car.images 
    : ['https://via.placeholder.com/600x400?text=No+Image+Available'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-900">{car.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="relative">
                <img
                  src={images[selectedImage]}
                  alt={car.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${ car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
                    {car.available ? 'Available' : 'Booked'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${ selectedImage === index ? 'border-blue-500' : 'border-gray-200' }`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{car.title}</h1>
                  <div className="flex items-center space-x-1 mb-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-600">{car.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{car.rating}</span>
                  <span className="text-gray-600">({car.reviews} reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">{car.seats} Seats</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Fuel className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">{car.fuel}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Settings className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">{car.transmission}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">{car.year}</div>
                </div>
              </div>

              {/* --- THIS IS THE NEWLY ADDED SECTION --- */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Vehicle Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Registration No.</p>
                        <p className="font-semibold text-gray-800">{car.carNumber}</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Insurance</p>
                        <p className={`font-semibold ${car.hasInsurance ? 'text-green-600' : 'text-red-600'}`}>
                            {car.hasInsurance ? 'Active' : 'Not Available'}
                        </p>
                    </div>
                    {car.hasInsurance && car.insuranceExpiryDate && (
                         <div>
                            <p className="text-sm font-medium text-gray-500">Insurance Valid Upto</p>
                            <p className="font-semibold text-gray-800">
                                {new Date(car.insuranceExpiryDate).toLocaleDateString('en-IN')}
                            </p>
                        </div>
                    )}
                </div>
              </div>
              {/* --- END OF NEWLY ADDED SECTION --- */}
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{car.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Customer Reviews ({car.reviews})</h3>

              {user && user.type === 'customer' && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Write a Review</h4>
                  {reviewError && <div className="text-red-500 text-sm mb-2">{reviewError}</div>}
                  <form onSubmit={handleSubmitReview}>
                    <div className="flex items-center mb-3">
                      <span className="mr-2 text-gray-700">Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${newReview.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                        />
                      ))}
                    </div>
                    <textarea
                      className="w-full p-2 border rounded-lg mb-3 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Share your experience..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                    ></textarea>
                    <button
                      type="submit"
                      disabled={submittingReview || newReview.rating === 0 || newReview.comment.trim() === ''}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet. Be the first to review this car!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${review.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-800">{review.user.name}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-1">{review.comment}</p>
                      <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">₹{car.pricePerDay}</span>
                  <span className="text-gray-600">/day</span>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                  <input type="date" className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                  <input type="date" className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">₹{car.pricePerDay} x 2 days</span>
                  <span className="text-gray-900">₹{car.pricePerDay * 2}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Service fee</span>
                  <span className="text-gray-900">₹100</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{car.pricePerDay * 2 + 100}</span>
                </div>
              </div>
              <button
                onClick={handleBookNow}
                disabled={!car.available}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${ car.available ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed' }`}
              >
                {car.available ? 'Book Now' : 'Not Available'}
              </button>
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Contact Owner</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{car.ownerId?.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{car.ownerId?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;