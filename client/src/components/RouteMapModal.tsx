
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import RoutingMachine from './RoutingMachine';

// Custom Car Icon
const carIcon = new L.Icon({
  iconUrl: 'https://static.thenounproject.com/png/710491-200.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});



interface RouteMapModalProps {
  userLocation: { lat: number; lng: number };
  carLocation: { lat: number; lng: number };
  onClose: () => void;
}

const RouteMapModal: React.FC<RouteMapModalProps> = ({ userLocation, carLocation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Car Location</h2>
        <MapContainer center={[(userLocation.lat + carLocation.lat) / 2, (userLocation.lng + carLocation.lng) / 2]} zoom={12} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={12} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.7 }}>
            <Popup>Your Location</Popup>
          </CircleMarker>
          <Marker position={[carLocation.lat, carLocation.lng]} icon={carIcon} />
          <RoutingMachine start={userLocation} end={carLocation} />
        </MapContainer>
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

export default RouteMapModal;
