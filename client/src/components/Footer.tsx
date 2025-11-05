import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Facebook, Instagram, Linkedin, Mail } from 'lucide-react';
 
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <Link 
              to="/" 
              className="flex items-center space-x-2" 
            >
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Carzi</span>
            </Link>
            <p className="mt-4 text-gray-400">
              Rent cars from verified owners with hassle-free booking.
            </p>
          </div>
          
          {/* Main Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/cars" className="text-gray-400 hover:text-white">Car Listings</Link></li>
              <li><Link to="/booking" className="text-gray-400 hover:text-white">Bookings</Link></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><Link to="/terms-and-conditions" className="text-gray-400 hover:text-white">Terms & Conditions</Link></li>
              <li><Link to="/career" className="text-gray-400 hover:text-white">Career</Link></li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/share/14y8jueYFe/" 
                target="_blank" 
                rel="noreferrer noopener" 
                className="text-gray-400 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://instagram.com/rishirajsinghmourya_" 
                target="_blank" 
                rel="noreferrer noopener" 
                className="text-gray-400 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://linkedin.com/in/rishirajrajput" 
                target="_blank" 
                rel="noreferrer noopener" 
                className="text-gray-400 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a 
                href="rishirajsinghrajput291@gmail.com" 
                className="text-gray-400 hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Carzi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;