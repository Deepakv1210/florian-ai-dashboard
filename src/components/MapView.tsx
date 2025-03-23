
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import config from '@/config';
import { Alert } from './AlertCard';

// Set Mapbox access token
mapboxgl.accessToken = config.map.apiKey;

interface MapViewProps {
  alert: Alert;
  onClose: () => void;
}

const MapView: React.FC<MapViewProps> = ({ alert, onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't initialize map if container isn't available yet
    if (!mapContainer.current) return;
    
    // Try to extract coordinates from location string
    let coordinates: [number, number] | null = null;
    
    try {
      // Try to parse location - this is a simple approach and may need refinement
      // based on your actual location data format
      if (alert.location && alert.location !== "Unknown") {
        // Check if it's already a lat/lng pair
        if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(alert.location)) {
          const [lat, lng] = alert.location.split(',').map(coord => parseFloat(coord.trim()));
          coordinates = [lng, lat]; // Mapbox uses [lng, lat] order
        } else {
          // For this demo, we'll generate random coordinates near a city
          // In a real app, you'd use a geocoding service
          const randomLat = 37.7749 + (Math.random() - 0.5) * 0.05;
          const randomLng = -122.4194 + (Math.random() - 0.5) * 0.05;
          coordinates = [randomLng, randomLat];
        }
      }
    } catch (err) {
      console.error("Error parsing location:", err);
      setError("Could not parse location data");
    }

    // If we couldn't get coordinates, show an error
    if (!coordinates) {
      setLoading(false);
      setError("No valid location data available");
      return;
    }

    // Initialize map
    const initializeMap = () => {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: coordinates as [number, number],
          zoom: 14
        });

        // Add navigation control
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add marker at incident location
        new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat(coordinates as [number, number])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${alert.title}</h3><p>${alert.message}</p>`))
          .addTo(map.current);

        // Map has finished loading
        map.current.on('load', () => {
          setLoading(false);
        });

        // Handle map error
        map.current.on('error', () => {
          setError("Error loading map");
          setLoading(false);
        });
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Error initializing map");
        setLoading(false);
      }
    };

    // Initialize the map
    initializeMap();

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [alert.location, alert.title, alert.message]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Emergency Location</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-destructive text-center p-4">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <div ref={mapContainer} className="w-full h-full" />
        </div>
        
        <div className="p-4 border-t">
          <div className="mb-2">
            <span className="font-semibold">Alert:</span> {alert.title}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Description:</span> {alert.message}
          </div>
          <div>
            <span className="font-semibold">Location:</span> {alert.location}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
