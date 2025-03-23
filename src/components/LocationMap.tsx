
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Use a temporary Mapbox public token - in production, this should come from environment variables
// This is a public token, fine for client-side code
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsczQ3OGl1ZTBldXIya3F2ZmV2eGR0N24ifQ.g5QN6pxrN_JH83y5zwkMzQ';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const geocodeLocation = async () => {
      try {
        // Geocode the location string to get coordinates
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            location
          )}.json?access_token=${mapboxgl.accessToken}&limit=1`
        );
        
        if (!response.ok) {
          throw new Error('Could not geocode location');
        }
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          
          if (map.current) {
            map.current.remove();
          }
          
          // Initialize map centered on the geocoded location
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: 14,
          });
          
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          // Add a marker at the location
          new mapboxgl.Marker({ color: '#500000' })
            .setLngLat([lng, lat])
            .addTo(map.current);
          
          map.current.on('load', () => {
            setMapLoaded(true);
          });
        } else {
          setError('Location not found');
        }
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Error loading map');
      }
    };

    geocodeLocation();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [location]);

  return (
    <div className={cn(
      'relative rounded-md overflow-hidden border border-border bg-muted',
      'transition-all duration-300',
      mapLoaded ? 'opacity-100' : 'opacity-70',
      className
    )}>
      {error ? (
        <div className="flex items-center justify-center p-4 h-[180px] text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-maroon-600" />
          Unable to display map for: {location}
        </div>
      ) : (
        <>
          <div ref={mapContainer} className="h-[180px] w-full" />
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
