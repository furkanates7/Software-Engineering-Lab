import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L, { LatLngExpression, Map as LeafletMap } from 'leaflet'; // Aliased Map to LeafletMap
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationMapProps {
  address?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  isEditing: boolean;
}

const DEFAULT_CENTER: LatLngExpression = [51.505, -0.09]; // Default to London
const DEFAULT_ZOOM = 13;

interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
}

// Component to handle map updates when center or zoom changes
const ChangeView: React.FC<{ center: LatLngExpression; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { // Use useEffect to ensure map is ready
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
};

const LocationUpdater: React.FC<{
  onLocationChange: (lat: number, lng: number) => void;
  isEditing: boolean;
  setMarkerPosition: React.Dispatch<React.SetStateAction<LatLngExpression | null>>;
}> = ({ onLocationChange, isEditing, setMarkerPosition }) => {
  useMapEvents({
    click(e) {
      if (isEditing) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        onLocationChange(lat, lng);
      }
    },
  });
  return null;
};

const LocationMap: React.FC<LocationMapProps> = ({
  address,
  initialLatitude,
  initialLongitude,
  onLocationChange,
  isEditing,
}) => {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(DEFAULT_CENTER);
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(null);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null); // Correctly typed ref

  useEffect(() => {
    console.log("Initial Latitude:", initialLatitude);
    console.log("Initial Longitude:", initialLongitude);
    if (initialLatitude && initialLongitude) {
      const newPos: LatLngExpression = [initialLatitude, initialLongitude];
      setMapCenter(newPos);
      setMarkerPosition(newPos);
      setMapZoom(15);
    } else if (address) {
      geocodeAddress(address);
    } else {
      setMapCenter(DEFAULT_CENTER);
      setMarkerPosition(null);
      setMapZoom(DEFAULT_ZOOM);
    }
  }, [initialLatitude, initialLongitude]); // Removed address from dep array here to avoid re-geocoding if only coords change

  // Separate effect for geocoding when address changes and no initial lat/lng
  useEffect(() => {
    if (address && !(initialLatitude && initialLongitude)) {
        geocodeAddress(address);
    }
  }, [address]);


  const geocodeAddress = async (addr: string) => {
    setGeocodingError(null);
    if (!addr) return;
    try {
      const response = await axios.get<GeocodeResult[]>(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`
      );
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const newPos: LatLngExpression = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newPos);
        setMarkerPosition(newPos);
        onLocationChange(parseFloat(lat), parseFloat(lon));
        setMapZoom(15);
        if (mapRef.current) {
          mapRef.current.flyTo(newPos, 15);
        }
      } else {
        setGeocodingError('Address not found. Please refine or select on map.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodingError('Failed to geocode address. Check console.');
    }
  };

  const handleUseDeviceLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos: LatLngExpression = [latitude, longitude];
          setMapCenter(newPos);
          setMarkerPosition(newPos);
          onLocationChange(latitude, longitude);
          setMapZoom(16);
          if (mapRef.current) {
            mapRef.current.flyTo(newPos, 16);
          }
        },
        (err) => {
          console.error('Error getting device location:', err);
          alert('Could not get device location. Please ensure location services are enabled.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Callback for whenReady, can be used for initialization if needed
  const handleMapReady = () => {
    console.log("Map is ready!");
    if (mapRef.current) {
      // Now mapRef.current is guaranteed to be set
    }
  };

  return (
    <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col">
      {isEditing && (
        <button
          type="button"
          onClick={handleUseDeviceLocation}
          className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Use My Current Location
        </button>
      )}
       {geocodingError && <p className="text-red-500 text-xs mb-2">{geocodingError}</p>}
      <div className="flex-grow">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef} // Use the ref prop here
          whenReady={handleMapReady} // Alternatively, use whenReady for a callback
          key={`${mapCenter.toString()}-${mapZoom}`}
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {markerPosition && (
            <Marker position={markerPosition}>
              <Popup>Location</Popup>
            </Marker>
          )}
          <LocationUpdater
            onLocationChange={onLocationChange}
            isEditing={isEditing}
            setMarkerPosition={setMarkerPosition}
          />
        </MapContainer>
      </div>
      {isEditing && (
         <p className="text-xs text-gray-600 mt-1">Click on the map to set location.</p>
      )}
    </div>
  );
};

export default LocationMap;