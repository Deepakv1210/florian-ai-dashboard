
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import SeverityIndicator from '@/components/SeverityIndicator';
import RecipientBadge from '@/components/RecipientBadge';
import { Clock, Skull, BellOff, MapPin, FileText, Trash, Map } from 'lucide-react';
import { fadeInScale } from './animations';
import LocationMap from './LocationMap';
export type AlertSeverity = 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  recipient: {
    id: string;
    name: string;
    avatarUrl?: string;
    isOnline: boolean;
  };
  isRead: boolean;
  possible_death?: number;
  false_alarm?: number;
  location?: string;
  description?: string;
}

interface AlertCardProps {
  alert: Alert;
  index: number;
  onConnect: (alertId: string) => void;
  onDelete: (alertId: string) => void;
  className?: string;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  index,
  onDelete,
  className
}) => {
  const [showMap, setShowMap] = useState(false);
  const formattedTime = new Date(alert.timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const severityStyles = {
    high: 'border-severity-high/10 bg-severity-high/5',
    medium: 'border-severity-medium/10 bg-severity-medium/5',
    low: 'border-severity-low/10 bg-severity-low/5'
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const hasLocation = !!alert.location && alert.location.trim() !== '';

  return (
    <motion.div
      variants={fadeInScale}
      initial="hidden"
      animate="visible"
      custom={index}
      className={cn(className)}
    >
      <Card 
        className={cn(
          'overflow-hidden transition-all duration-300 hover:card-shadow',
          alert.isRead ? 'opacity-90' : 'border-2',
          severityStyles[alert.severity]
        )}
      >
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between">
          <div className="flex items-center gap-2">
            <SeverityIndicator level={alert.severity} size="md" />
            <h3 className="font-medium text-sm text-balance">
              {alert.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span className="text-xs">{formattedTime}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(alert.id)}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 pt-0 px-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            {alert.possible_death !== undefined && (
              <div className="flex items-center gap-1.5">
                <Skull className="h-3 w-3 text-severity-high" />
                <span className="text-muted-foreground">Possible casualties: </span>
                <span className="font-medium">{alert.possible_death}</span>
              </div>
            )}
            
            {alert.false_alarm !== undefined && (
              <div className="flex items-center gap-1.5">
                <BellOff className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">False alarm rate: </span>
                <span className="font-medium">{alert.false_alarm}%</span>
              </div>
            )}
            
            {hasLocation && (
              <div className="flex items-center gap-1.5 col-span-2">
                <MapPin className="h-3 w-3 text-maroon-600" />
                <span className="text-muted-foreground">Location: </span>
                <span className="font-medium">{alert.location}</span>
              </div>
            )}
          
            {showMap && hasLocation && (
              <div className="col-span-2 mt-2">
                <LocationMap location={alert.location} onClose={() => setShowMap(false)} />
              </div>
            )}
            
            {alert.description && (
              <div className="flex items-center gap-1.5 col-span-2">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Details: </span>
                <span className="font-medium">{alert.description}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-3 flex items-center justify-between bg-secondary/40 border-t border-border/50">
          <RecipientBadge 
            name={alert.recipient.name}
            avatarUrl={alert.recipient.avatarUrl}
            isOnline={alert.recipient.isOnline}
          />
          
          {hasLocation && (
            <Button 
              variant="default" 
              size="sm" 
              className="h-8 px-3 rounded-full text-xs bg-purple-700 hover:bg-purple-800"
              onClick={toggleMap}
            >
              <Map className="h-3 w-3 mr-1" />
              {showMap ? 'Hide Map' : 'View Map'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AlertCard;
