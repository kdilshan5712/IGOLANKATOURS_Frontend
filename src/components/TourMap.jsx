import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

// Custom premium marker icon with glowing ripple effects
const createCustomIcon = (color = '#c5a059') => {
  return L.divIcon({
    className: 'custom-premium-marker',
    html: `
      <div class="marker-glowing-wrapper">
        <div class="marker-pulse-ring" style="border-color: ${color}"></div>
        <div class="marker-pulse-ring-outer" style="border-color: ${color}"></div>
        <div class="marker-core" style="background-color: ${color}; box-shadow: 0 0 10px ${color}">
          <div class="marker-core-inner"></div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Component to automatically fit map bounds to route
const ChangeView = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      if (locations.length === 1) {
        map.setView([locations[0].lat, locations[0].lng], 10);
      } else {
        const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [locations, map]);

  return null;
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

  // Premium Luxury Jewel Tone Color Palette
  const colors = ['#c5a059', '#0f766e', '#047857', '#be123c', '#4338ca'];

  return (
    <div className="tour-map-wrapper" style={{ height }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={8}
        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ChangeView locations={tourLocations} />

        {/* Route line connecting locations */}
        {routePath && tourLocations.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#c5a059"
            weight={3.5}
            opacity={0.8}
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
