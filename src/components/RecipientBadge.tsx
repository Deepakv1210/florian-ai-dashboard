
import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RecipientBadgeProps {
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  className?: string;
}

const RecipientBadge: React.FC<RecipientBadgeProps> = ({
  name,
  avatarUrl,
  isOnline = false,
  className
}) => {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className={cn('flex items-center gap-2 group', className)}>
      <div className="relative">
        <Avatar className="h-8 w-8 border border-border shadow-sm transition-transform duration-300 group-hover:scale-105">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-secondary text-xs font-medium">
            {initials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <span 
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white dark:ring-black"
            aria-label="Online"
          />
        )}
      </div>
      <span className="text-sm font-medium truncate">{name}</span>
    </div>
  );
};

export default RecipientBadge;
