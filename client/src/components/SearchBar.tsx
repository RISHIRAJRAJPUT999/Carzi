import React, { useState } from 'react';
import { Search, MapPin, Calendar, Car } from 'lucide-react';

interface SearchFilters {
  location: string;
  pickupDate: string;
  returnDate: string;
  carType: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [carType, setCarType] = useState('');

  const handleSearch = () => {
    onSearch({ location, pickupDate, returnDate, carType });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 max-w-4xl mx-auto">
      {/* Location Input */}
      <div className="flex-1 w-full relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Indore"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-black"
        />
      </div>

      {/* Pickup Date Input */}
      <div className="flex-1 w-full relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="date"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-black"
        />
      </div>

      {/* Return Date Input */}
      <div className="flex-1 w-full relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-black"
        />
      </div>

      {/* Car Type Select */}
      <div className="flex-1 w-full relative">
        <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <select
          value={carType}
          onChange={(e) => setCarType(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 appearance-none cursor-pointer text-black"
        >
          <option value="">All Types</option>
          <option value="hatchback">Hatchback</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="luxury">Luxury</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
      >
        <Search size={20} />
        <span>Search</span>
      </button>
    </div>
  );
};

export default SearchBar;