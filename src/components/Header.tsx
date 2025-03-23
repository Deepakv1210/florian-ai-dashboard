
import React from 'react';
import { cn } from '@/lib/utils';
import { Bell, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title?: string;
  className?: string;
  onFilterClick?: () => void;
  onSearch?: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  title = "Alert Center",
  className,
  onFilterClick,
  onSearch
}) => {
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
     <div className={cn(
      'sticky top-0 z-10 py-4 px-6 border-b bg-maroon rounded-bl-lg rounded-br-lg',
      className
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className='bg-gray-100 rounded-lg p-4 w-1/4'>
            <h1 className="text-xl font-medium">{title}</h1>
            <p className="text-sm text-muted-foreground">Manage and respond to alerts</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search alerts..."
              className="w-full pl-8 bg-background border-muted"
              onChange={handleSearchInput}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            className="h-9 w-9"
            onClick={onFilterClick}
          >
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className="h-9 w-9 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-severity-high"></span>
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
