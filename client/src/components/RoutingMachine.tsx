import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

interface RoutingMachineProps {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
      lineOptions: {
        styles: [{ color: '#6FA1EC', weight: 4 }],
      },
      show: false, // Hide the routing details panel
      addWaypoints: false,
      routeWhileDragging: true,
      draggableWaypoints: true,
      fitSelectedRoutes: true,
      showAlternatives: false,
      altLineOptions: {
        styles: [
          {
            color: 'black',
            opacity: 0.15,
            weight: 9,
          },
          {
            color: 'white',
            opacity: 0.8,
            weight: 6,
          },
          {
            color: '#6FA1EC',
            opacity: 0.5,
            weight: 2,
          },
        ],
      },
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]);

  return null;
};

export default RoutingMachine;