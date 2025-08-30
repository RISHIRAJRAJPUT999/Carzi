import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Clock, Star } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import { useCarContext } from '../contexts/CarContext';
import Footer from '../components/Footer';

// Array of background images
const heroImages = [
  'https://res.cloudinary.com/dzxvihkjo/image/upload/v1756535762/pexels-imadclicks-8337436_yrcx7d.jpg',
  'https://res.cloudinary.com/dzxvihkjo/image/upload/v1756535761/sven-d-a4S6KUuLeoM-unsplash_kjo3xb.jpg',
 'https://res.cloudinary.com/dzxvihkjo/image/upload/v1756364786/1435030-1920x1275-desktop-hd-xpeng-g9-suv-background-image_qhrnej.jpg',
 'https://res.cloudinary.com/dzxvihkjo/image/upload/v1756364784/2685748-3840x2160-desktop-4k-suv-background_q9uclf.jpg',
'https://res.cloudinary.com/dzxvihkjo/image/upload/v1756364783/1430747-3840x2160-desktop-4k-lucid-motors-background-photo_qheea6.jpg',
'https://res.cloudinary.com/dzxvihkjo/image/upload/v1756363992/1757907-3840x2160-desktop-4k-lamborghini-urus-wallpaper-image_b4t68z.jpg',
'https://res.cloudinary.com/dzxvihkjo/image/upload/v1756363992/1758716-3840x2160-desktop-4k-lamborghini-urus-wallpaper-photo_enohfb.jpg'
];

const Homepage: React.FC = () => {
  const { cars, searchCars } = useCarContext();
  const [filteredCars, setFilteredCars] = useState(cars);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filters, setFilters] = useState({
    brand: '',
    priceRange: [0, 10000],
    sortBy: 'price-low'
  });

  useEffect(() => {
    setFilteredCars(cars);
  }, [cars]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(prevIndex => 
        (prevIndex + 1) % heroImages.length
      );
    }, 3000); // Change image every 3 seconds
    
    return () => clearInterval(timer); // Cleanup the timer
  }, []);

  const handleSearch = (searchFilters: any) => {
    const results = searchCars(searchFilters);
    setFilteredCars(results);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    const results = searchCars(newFilters);
    setFilteredCars(results);
  };

  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.pricePerDay - b.pricePerDay;
      case 'price-high':
        return b.pricePerDay - a.pricePerDay;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-screen Hero Section with dynamic background */}
      <section 
        className="text-white py-20 relative overflow-hidden min-h-screen flex flex-col justify-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${heroImages[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div 
          className="absolute inset-0 bg-black opacity-50"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 ">
            Find Your Perfect Car in Indore
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white">
            Rent cars from verified owners with hassle-free booking
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Carzi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Owners</h3>
              <p className="text-gray-600">All car owners are verified with Aadhaar and OTP verification for your safety</p>
            </div>
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-gray-600">Book your car instantly with our seamless booking process</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive rates with flexible payment options</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Cars Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                
                {/* Brand Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange({...filters, brand: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Brands</option>
                    <option value="Maruti Suzuki">Maruti Suzuki</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Tata">Tata</option>
                    <option value="Honda">Honda</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (per day)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange({
                        ...filters, 
                        priceRange: [0, parseInt(e.target.value)]
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹0</span>
                      <span>₹{filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({...filters, sortBy: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cars Grid */}
            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Available Cars</h2>
               </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCars.map(car => (
                  <CarCard key={car._id} car={car} />
                ))}
              </div>
              
              {sortedCars.length === 0 && (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No cars found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer /> {/* The new Footer component */}
    </div>
  );
};

export default Homepage;