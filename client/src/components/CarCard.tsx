import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Fuel, Settings, MapPin } from 'lucide-react';

interface CarCardProps {
  car: {
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
    rating: number;
    reviews: number;
    available: boolean;
  };
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const thumbnailUrl = car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/300x200?text=No+Image';

  // --- START OF CHANGES ---
  // Define styles for an unavailable car
  const unavailableStyles = !car.available ? 'filter grayscale opacity-60 cursor-not-allowed' : 'hover:shadow-lg';
  
  const cardContent = (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 ${unavailableStyles}`}>
      <div className="relative">
        <img src={thumbnailUrl} alt={car.title} className="w-full h-48 object-cover" />
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
            {car.available ? 'Available' : 'Booked'}
          </span>
        </div>
        {!car.available && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <span className="text-white text-lg font-bold bg-gray-800 bg-opacity-70 px-4 py-2 rounded">UNAVAILABLE</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{car.title}</h3>
            <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{car.rating}</span>
                <span className="text-sm text-gray-500">({car.reviews})</span>
            </div>
        </div>
        
        <div className="flex items-center space-x-1 mb-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{car.location}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{car.seats} seats</span>
            </div>
            <div className="flex items-center space-x-1">
                <Fuel className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{car.fuel}</span>
            </div>
            <div className="flex items-center space-x-1">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{car.transmission}</span>
            </div>
        </div>
        
        <div className="flex justify-between items-center">
            <div>
                <span className="text-2xl font-bold text-gray-900">₹{car.pricePerDay}</span>
                <span className="text-sm text-gray-600">/day</span>
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                View Details
            </div>
        </div>
      </div>
    </div>
  );

  // If the car is not available, render a simple div. If it is available, wrap it in a Link.
  return car.available ? (
    <Link to={`/car/${car._id}`}>{cardContent}</Link>
  ) : (
    <div>{cardContent}</div>
  );
  // --- END OF CHANGES ---
};

export default CarCard;