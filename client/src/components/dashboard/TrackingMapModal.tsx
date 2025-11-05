import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Car } from '../../../types/car';

// Custom Car Icon
const carIcon = new L.Icon({
  iconUrl: 'https://static.thenounproject.com/png/710491-200.png', // Google Maps-like car icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

interface TrackingMapModalProps {
  car: Car;
  token: string | null;
  onClose: () => void;
}

const TrackingMapModal: React.FC<TrackingMapModalProps> = ({ car, token, onClose }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (!token) {
          setError('You must be logged in to track the car.');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/cars/${car._id}/location`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch car location.');
        }

        const data = await response.json();
        setLocation(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLocation(); // Fetch immediately on mount

    const intervalId = setInterval(fetchLocation, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [car, token]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Track Car: {car.title}</h2>
        {error && <p className="text-red-500">{error}</p>}
        {location ? (
          <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[location.lat, location.lng]} icon={carIcon}>
              <Popup>{car.title}</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <p>Loading map...</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TrackingMapModal;