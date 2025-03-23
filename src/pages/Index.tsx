import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle, ChevronDown, Bookmark, CheckCheck, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AlertCard, { Alert, AlertSeverity } from '@/components/AlertCard';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { staggerContainer } from '@/components/animations';

const INITIAL_ALERTS: Alert[] = [];

const API_URL = 'http://localhost:5000/api';

type ViewTab = 'all' | 'unread' | 'saved';

const Index = () => {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/alerts`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch alerts', {
        description: 'Please make sure the Python server is running',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }
      
      setAlerts(alerts.filter(a => a.id !== alertId));
      
      toast('Alert deleted', {
        description: 'The alert has been removed',
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    const interval = setInterval(() => {
      fetchAlerts();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const filterAlerts = () => {
    let filtered = [...alerts];
    
    if (activeTab === 'unread') {
      filtered = filtered.filter(alert => !alert.isRead);
    } else if (activeTab === 'saved') {
      filtered = filtered.filter((_, index) => index % 3 === 0);
    }
    
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }
    
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

  React.useEffect(() => {
    filterAlerts();
  }, [activeTab, severityFilter, searchTerm, alerts]);

  const handleConnect = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      setAlerts(alerts.map(a => 
        a.id === alertId ? { ...a, isRead: true } : a
      ));
      
      toast(`Connecting to ${alert.recipient.name}`, {
        description: `Establishing connection for alert: ${alert.title}`,
        duration: 3000,
      });
    }
  };

  const handleDelete = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      deleteAlert(alertId);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
    toast('All alerts marked as read', {
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        onSearch={handleSearch}
        onFilterClick={() => {
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={fetchAlerts}
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
        <AlertCard
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
