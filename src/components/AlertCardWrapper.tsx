
import React, { useState } from 'react';
import AlertCard, { Alert } from './AlertCard';
import MapView from './MapView';

interface AlertCardWrapperProps {
  alert: Alert;
  index: number;
  onConnect: (id: string) => void;
  onDelete: (id: string) => void;
}

const AlertCardWrapper: React.FC<AlertCardWrapperProps> = ({
  alert,
  index,
  onConnect,
  onDelete
}) => {
  const [showMap, setShowMap] = useState(false);

  const handleConnect = () => {
    // Check if we have location data
    if (!alert.location || alert.location === "Unknown") {
      // If no location data, just call the original handler
      onConnect(alert.id);
      return;
    }
    
    // If we have location data, show the map
    setShowMap(true);
  };

  return (
    <>
      <AlertCard
        alert={alert}
        index={index}
        onConnect={handleConnect}
        onDelete={onDelete}
      />
      
      {showMap && (
        <MapView
          alert={alert}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
};

export default AlertCardWrapper;
