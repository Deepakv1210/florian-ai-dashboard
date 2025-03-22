
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import SeverityIndicator from '@/components/SeverityIndicator';
import RecipientBadge from '@/components/RecipientBadge';
import { MessageSquare, ExternalLink, Clock, Bookmark } from 'lucide-react';
import { fadeInScale } from './animations';

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
}

interface AlertCardProps {
  alert: Alert;
  index: number;
  onConnect: (alertId: string) => void;
  className?: string;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  index,
  onConnect,
  className
}) => {
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
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span className="text-xs">{formattedTime}</span>
          </div>
        </CardHeader>
        <CardContent className="pb-3 pt-0 px-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {alert.message}
          </p>
        </CardContent>
        <CardFooter className="px-4 py-3 flex items-center justify-between bg-secondary/40 border-t border-border/50">
          <RecipientBadge 
            name={alert.recipient.name}
            avatarUrl={alert.recipient.avatarUrl}
            isOnline={alert.recipient.isOnline}
          />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 rounded-full text-xs border-border/70"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Message
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="h-7 px-3 rounded-full text-xs bg-primary/90 hover:bg-primary"
              onClick={() => onConnect(alert.id)}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Connect
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AlertCard;
