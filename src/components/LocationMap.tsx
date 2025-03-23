
import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationMapProps {
  location: string;
  className?: string;
  onClose?: () => void;
}

// This is a simplified component that now just displays the location as text
// We've removed the actual map integration as requested
const LocationMap: React.FC<LocationMapProps> = ({
  location,
  className,
}) => {
  return (
    <div className={cn(
      'relative rounded-md overflow-hidden border border-border bg-muted p-4',
      'flex items-center justify-center',
      className
    )}>
      <div className="flex items-center justify-center text-sm">
        <MapPin className="h-4 w-4 mr-2 text-maroon-600" />
        <span>{location || 'No location provided'}</span>
      </div>
    </div>
  );
};

export default LocationMap;
