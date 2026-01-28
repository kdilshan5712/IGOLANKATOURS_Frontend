import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TourMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (color = '#d97706') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); margin-top: 6px; margin-left: 8px; color: white; font-size: 16px;">📍</div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const TourMap = ({ locations, routePath = true, height = '400px' }) => {
  // Default Sri Lanka locations if none provided
  const defaultLocations = [
    { name: 'Colombo', lat: 6.9271, lng: 79.8612, description: 'Starting point - Capital city' },
    { name: 'Kandy', lat: 7.2906, lng: 80.6337, description: 'Cultural hub - Temple of the Tooth' },
    { name: 'Ella', lat: 6.8667, lng: 81.0467, description: 'Scenic mountains and tea plantations' },
    { name: 'Galle', lat: 6.0535, lng: 80.2210, description: 'Historic fort and coastal beauty' }
  ];

  const tourLocations = locations && locations.length > 0 ? locations : defaultLocations;

  // Calculate center point of all locations
  const centerLat = tourLocations.reduce((sum, loc) => sum + loc.lat, 0) / tourLocations.length;
  const centerLng = tourLocations.reduce((sum, loc) => sum + loc.lng, 0) / tourLocations.length;

  // Create route path coordinates
  const routeCoordinates = tourLocations.map(loc => [loc.lat, loc.lng]);

  // Color palette for markers
  const colors = ['#d97706', '#0891b2', '#16a34a', '#dc2626', '#7c3aed'];

  return (
    <div className="tour-map-wrapper" style={{ height }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={8}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route line connecting locations */}
        {routePath && tourLocations.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#d97706"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Markers for each location */}
        {tourLocations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(colors[index % colors.length])}
          >
            <Popup>
              <div className="map-popup">
                <h4>{location.name}</h4>
                {location.description && <p>{location.description}</p>}
                {location.duration && <small>Duration: {location.duration}</small>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TourMap;
