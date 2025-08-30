import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// --- INTERFACES ARE CORRECT ---
interface Owner {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

// --- THIS IS THE UPDATED INTERFACE ---
interface Car {
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
  available: boolean;
  ownerId: Owner;
  rating: number;
  reviews: number;
  description: string;
  carNumber: string;            // <-- ADD THIS
  hasInsurance: boolean;        // <-- ADD THIS
  insuranceExpiryDate?: string; // <-- ADD THIS
}
// --- END OF UPDATES ---

type CarInputData = Omit<Car, '_id' | 'images' | 'available' | 'rating' | 'reviews' | 'ownerId'>;

interface CarContextType {
  cars: Car[];
  addCar: (carData: CarInputData, imageFiles: FileList) => Promise<void>;
  updateCar: (id: string, updates: Partial<Car>) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  getCarById: (id: string) => Car | undefined;
  getCarsByOwner: (ownerId: string) => Car[];
  searchCars: (filters: any) => Car[];
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export const useCarContext = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCarContext must be used within a CarProvider');
  }
  return context;
};

export const CarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const { token, user } = useAuth();

  const fetchCars = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/cars');
        const data = await response.json();
        setCars(data);
    } catch (error) {
        console.error("Failed to fetch cars:", error);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const getCarById = (id: string) => cars.find((c) => c._id === id);
  const getCarsByOwner = (ownerId: string) => cars.filter((c) => c.ownerId._id === ownerId);

  const addCar = async (carData: CarInputData, imageFiles: FileList) => {
    if (!token || !user) return;

    const formData = new FormData();
    Object.entries(carData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    formData.append('ownerId', user.id);
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('images', imageFiles[i]);
    }

    const response = await fetch('http://localhost:5000/api/cars', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (response.ok) {
      fetchCars();
    } else {
      console.error('Failed to add car:', await response.json());
    }
  };
  
  const updateCar = async (carId: string, carData: Partial<Car>) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cars/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(carData)
      });

      if (response.ok) {
        fetchCars();
      } else {
        console.error('Failed to update car:', await response.json());
      }
    } catch (error) {
      console.error('Error updating car:', error);
    }
  };
  
  const deleteCar = async (carId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        fetchCars();
      } else {
        console.error('Failed to delete car:', await response.json());
      }
    } catch (error) {
        console.error('Error deleting car:', error);
    }
  };
  
  const searchCars = (filters: any) => {
    return cars; // Placeholder
  };

  const value = {
    cars,
    addCar,
    updateCar,
    deleteCar,
    getCarById,
    getCarsByOwner,
    searchCars
  };

  return <CarContext.Provider value={value}>{children}</CarContext.Provider>;
};