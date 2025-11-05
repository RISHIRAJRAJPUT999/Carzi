import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ initialLat, initialLng, onLocationSelect }) => {
  const [position, setPosition] = useState<L.LatLngLiteral>({ lat: initialLat, lng: initialLng });
  const mapRef = useRef<L.Map | null>(null);

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  useEffect(() => {
    // Update map position if initialLat/Lng changes from parent (e.g., for editing car)
    setPosition({ lat: initialLat, lng: initialLng });
    if (mapRef.current) {
      mapRef.current.setView([initialLat, initialLng], mapRef.current.getZoom());
    }
  }, [initialLat, initialLng]);

  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '400px', width: '100%' }}
      whenCreated={(map) => (mapRef.current = map)}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents />
      {position.lat !== 0 && position.lng !== 0 && (
        <Marker position={[position.lat, position.lng]} />
      )}
    </MapContainer>
  );
};

export default LocationPickerMap;
