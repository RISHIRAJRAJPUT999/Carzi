import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// --- INTERFACES ---
interface BookedCar {
  _id: string;
  title: string;
  images: string[];
}
interface CustomerInfo {
    _id: string;
    name: string;
    email: string;
}
interface Booking {
  _id: string;
  carId: BookedCar;
  customerId: CustomerInfo;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
}

interface BookingContextType {
  customerBookings: Booking[];
  ownerBookings: Booking[];
  createBooking: (bookingData: any) => Promise<boolean>;
  getBookingsByCustomer: (customerId: string) => Booking[];
  getBookingsByCarOwner: (ownerId: string) => Booking[];
  markBookingAsPaid: (bookingId: string) => Promise<boolean>; // <-- NEW FUNCTION TYPE
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBookingContext must be used within a BookingProvider');
  return context;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const { token, user } = useAuth();

  const fetchAllBookings = async () => {
    if (!token) return;
    try {
      const [customerRes, ownerRes] = await Promise.all([
        fetch('http://localhost:5000/api/bookings/my-bookings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/bookings/owner-bookings', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (customerRes.ok) setCustomerBookings(await customerRes.json());
      if (ownerRes.ok) setOwnerBookings(await ownerRes.json());
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchAllBookings();
    }
  }, [user, token]);

  const createBooking = async (bookingData: any): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });
      if (response.ok) {
        fetchAllBookings();
        return true;
      }
      return false;
    } catch (error) {
        return false;
    }
  };

  // --- THIS IS THE NEWLY ADDED FUNCTION ---
  const markBookingAsPaid = async (bookingId: string): Promise<boolean> => {
    if (!token) return false;

    try {
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/pay`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            fetchAllBookings(); // Refresh bookings to show the updated status
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error marking booking as paid:", error);
        return false;
    }
  };

  const getBookingsByCustomer = (customerId: string) => customerBookings;
  const getBookingsByCarOwner = (ownerId: string) => ownerBookings;

  const value = { customerBookings, ownerBookings, createBooking, getBookingsByCustomer, getBookingsByCarOwner, markBookingAsPaid };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};