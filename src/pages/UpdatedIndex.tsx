import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle, ChevronDown, Bookmark, CheckCheck, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AlertCardWrapper from '@/components/AlertCardWrapper';
import { Alert, AlertSeverity } from '@/components/AlertCard';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { staggerContainer } from '@/components/animations';
import { useApi } from '@/hooks/useApi';

// Initial empty array for alerts
const INITIAL_ALERTS: Alert[] = [];

type ViewTab = 'all' | 'unread' | 'saved';

const Index = () => {
  const { alerts, isLoading, refetchAlerts, deleteAlert } = useApi();
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter alerts based on active tab, severity filter, and search term
  const filterAlerts = () => {
    let filtered = [...alerts];
    
    // Tab filtering
    if (activeTab === 'unread') {
      filtered = filtered.filter(alert => !alert.isRead);
    } else if (activeTab === 'saved') {
      // For this demo, we'll just show a subset as "saved"
      filtered = filtered.filter((_, index) => index % 3 === 0);
    }
    
    // Severity filtering
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }
    
    // Search term filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        alert => 
          alert.title.toLowerCase().includes(term) || 
          alert.message.toLowerCase().includes(term) ||
          alert.recipient.name.toLowerCase().includes(term)
      );
    }
    
    setFilteredAlerts(filtered);
  };

  // Apply filters when dependencies change
  React.useEffect(() => {
    filterAlerts();
  }, [activeTab, severityFilter, searchTerm, alerts]);

  // Handle connecting to a recipient
  const handleConnect = (alertId: string) => {
    // Find the alert by ID
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      // Check if we have a valid location
      if (!alert.location || alert.location === "Unknown") {
        toast.warning('No location data', {
          description: 'This alert does not have valid location information',
          duration: 3000,
        });
        return;
      }

      // Mark alert as read (in a real app, update via API)
      toast.success(`Connecting to ${alert.recipient.name}`, {
        description: `Establishing connection for alert: ${alert.title}`,
        duration: 3000,
      });
    }
  };
  
  // Handle deleting an alert
  const handleDelete = (alertId: string) => {
    deleteAlert(alertId);
  };

  // Handle search input
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Get count of unread alerts
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // Mark all as read
  const markAllAsRead = () => {
    // In a real app, we'd make an API call to update all alerts
    toast('All alerts marked as read', {
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        onSearch={handleSearch}
        onFilterClick={() => {
          // Toggle through severity filters
          const options: (AlertSeverity | 'all')[] = ['all', 'high', 'medium', 'low'];
          const currentIndex = options.indexOf(severityFilter);
          const nextIndex = (currentIndex + 1) % options.length;
          setSeverityFilter(options[nextIndex]);
          
          toast(`Filtering by ${options[nextIndex]} severity`, {
            duration: 2000,
          });
        }}
      />
      
      <main className="flex-1 container max-w-5xl py-6 px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ViewTab)}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="all" className="text-sm">
                  All Alerts
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-sm relative">
                  Unread
                  {unreadCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="saved" className="text-sm">
                  <Bookmark className="h-3.5 w-3.5 mr-1" />
                  Saved
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                {/* Manual Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => refetchAlerts()}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh Alerts'}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Filter className="h-3.5 w-3.5 mr-1.5" />
                      {severityFilter === 'all' ? 'All Severities' : `${severityFilter.charAt(0).toUpperCase() + severityFilter.slice(1)} Severity`}
                      <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSeverityFilter('all')}>
                      All Severities
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSeverityFilter('high')}>
                      <AlertTriangle className="h-3.5 w-3.5 mr-2 text-severity-high" />
                      High Severity
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSeverityFilter('medium')}>
                      <AlertTriangle className="h-3.5 w-3.5 mr-2 text-severity-medium" />
                      Medium Severity
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSeverityFilter('low')}>
                      <AlertTriangle className="h-3.5 w-3.5 mr-2 text-severity-low" />
                      Low Severity
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8"
                  onClick={markAllAsRead}
                  disabled={!unreadCount}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  Mark all read
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {renderAlertList(filteredAlerts, handleConnect, handleDelete)}
            </TabsContent>
            
            <TabsContent value="unread" className="mt-0">
              {renderAlertList(filteredAlerts, handleConnect, handleDelete)}
            </TabsContent>
            
            <TabsContent value="saved" className="mt-0">
              {renderAlertList(filteredAlerts, handleConnect, handleDelete)}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

// Helper function to render the alert list with proper animation
const renderAlertList = (alerts: Alert[], onConnect: (id: string) => void, onDelete: (id: string) => void) => {
  if (alerts.length === 0) {
    return <EmptyState />;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {alerts.map((alert, index) => (
        <AlertCardWrapper
          key={alert.id}
          alert={alert}
          index={index}
          onConnect={onConnect}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
};

export default Index;
