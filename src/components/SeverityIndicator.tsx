
import React from 'react';
import { cn } from '@/lib/utils';

type SeverityLevel = 'high' | 'medium' | 'low';

interface SeverityIndicatorProps {
  level: SeverityLevel;
  className?: string;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({
  level,
  className,
  animate = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colors = {
    high: 'bg-severity-high',
    medium: 'bg-severity-medium',
    low: 'bg-severity-low'
  };

  return (
    <span 
      className={cn(
        'rounded-full inline-block',
        colors[level],
        sizeClasses[size],
        animate && 'animate-pulse-slow',
        className
      )}
      aria-label={`${level} severity`}
    />
  );
};

export default SeverityIndicator;
