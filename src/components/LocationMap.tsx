
import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// This will be a temporary API key - in production, use environment variables
// For demonstration purposes only
const GOOGLE_MAPS_API_KEY = "AIzaSyBGCql4idYRAlumnVAx4Cdg6_NzGN2hJA8";

interface LocationMapProps {
  location: string;
  className?: string;
  onClose?: () => void;
}

const LocationMap: React.FC<LocationMapProps> = ({
  location,
  className,
  onClose,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mapContainerStyle = {
    width: '100%',
    height: '180px',
  };
  
  const defaultCenter = {
    lat: 30.6188,  // Texas A&M University default coordinates
    lng: -96.3365,
  };
  
  // Geocode the location string to get coordinates
  const geocodeLocation = useCallback(async () => {
    try {
      setError(null);
      
      if (!location || location.trim() === '') {
        setError('No location provided');
        return;
      }
      
      console.log('Geocoding location:', location);
      
      // Clean the location string for better geocoding results
      const searchQuery = location.trim();
      
      // Add more specific location context for better results
      const enhancedQuery = searchQuery.includes('Texas A&M') 
        ? searchQuery 
        : `${searchQuery}, College Station, Texas`;
      
      console.log('Enhanced query:', enhancedQuery);
      
      // Use Google Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enhancedQuery)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Could not geocode location');
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        console.log('Found coordinates:', lat, lng);
        setCoordinates({ lat, lng });
      } else {
        console.error('Location not found in geocoding response');
        setError(`Unable to find location: ${location}`);
      }
    } catch (err) {
      console.error('Error geocoding location:', err);
      setError(`Error loading map for: ${location}`);
    }
  }, [location]);
  
  // Geocode the location when the component mounts
  React.useEffect(() => {
    geocodeLocation();
  }, [geocodeLocation]);
  
  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  return (
    <div className={cn(
      'relative rounded-md overflow-hidden border border-border bg-muted',
      'transition-all duration-300',
      mapLoaded && coordinates ? 'opacity-100' : 'opacity-70',
      className
    )}>
      {error ? (
        <div className="flex items-center justify-center p-4 h-[180px] text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-maroon-600" />
          {error}
        </div>
      ) : (
        <>
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Google Maps script loaded')}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={coordinates || defaultCenter}
              zoom={15}
              onLoad={handleMapLoad}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                styles: [
                  {
                    featureType: "all",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#7c7c7c" }]
                  },
                  {
                    featureType: "administrative",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#500000" }]  // Texas A&M maroon color
                  }
                ]
              }}
            >
              {coordinates && (
                <Marker
                  position={coordinates}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
          
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="animate-pulse">Loading map...</div>
            </div>
          )}
          
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-1 right-1 h-6 w-6 bg-background/80 hover:bg-background shadow-sm"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default LocationMap;
