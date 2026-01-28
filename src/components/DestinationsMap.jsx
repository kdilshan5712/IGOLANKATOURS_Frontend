import TourMap from '../components/TourMap';
import './DestinationsMap.css';

const DestinationsMap = () => {
  // Popular destinations in Sri Lanka with accurate coordinates
  const destinations = [
    { 
      name: 'Sigiriya Rock Fortress', 
      lat: 7.9570, 
      lng: 80.7603, 
      description: 'Ancient rock fortress - UNESCO World Heritage Site'
    },
    { 
      name: 'Kandy', 
      lat: 7.2906, 
      lng: 80.6337, 
      description: 'Cultural capital with Temple of the Tooth'
    },
    { 
      name: 'Ella', 
      lat: 6.8667, 
      lng: 81.0467, 
      description: 'Scenic hill country with tea plantations'
    },
    { 
      name: 'Galle Fort', 
      lat: 6.0328, 
      lng: 80.2169, 
      description: 'Dutch colonial fort by the sea'
    },
    { 
      name: 'Colombo', 
      lat: 6.9271, 
      lng: 79.8612, 
      description: 'Vibrant capital city'
    },
    { 
      name: 'Nuwara Eliya', 
      lat: 6.9497, 
      lng: 80.7891, 
      description: 'Hill station known as "Little England"'
    },
    { 
      name: 'Yala National Park', 
      lat: 6.3725, 
      lng: 81.5185, 
      description: 'Wildlife safari - leopards and elephants'
    },
    { 
      name: 'Mirissa', 
      lat: 5.9449, 
      lng: 80.4569, 
      description: 'Beach paradise for whale watching'
    },
    { 
      name: 'Anuradhapura', 
      lat: 8.3114, 
      lng: 80.4037, 
      description: 'Ancient capital with sacred ruins'
    },
    { 
      name: 'Polonnaruwa', 
      lat: 7.9403, 
      lng: 81.0188, 
      description: 'Medieval capital with ancient monuments'
    }
  ];

  return (
    <div className="destinations-map-section">
      <div className="destinations-map-header">
        <h2>Explore Sri Lanka's Top Destinations</h2>
        <p>Interactive map showing the most popular tourist attractions across the island</p>
      </div>
      <TourMap 
        locations={destinations}
        routePath={false}
        height="500px"
      />
      <div className="destinations-map-footer">
        <p className="destinations-map-note">
          <strong>💡 Tip:</strong> Click on any marker to view destination details and create a custom tour including your favorite locations.
        </p>
      </div>
    </div>
  );
};

export default DestinationsMap;
