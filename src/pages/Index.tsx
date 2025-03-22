
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

// Initial empty array for alerts
const INITIAL_ALERTS: Alert[] = [];

// Dynamic API URL detection - FIXED to avoid incorrect paths
const getApiUrl = () => {
  // Check if we're running on deployed environments like Lovable
  if (window.location.hostname.includes('lovable.app') || 
      !window.location.hostname.includes('localhost')) {
    console.log('Running in demo mode - Python API not accessible in deployment');
    return 'demo';
  }
  
  // Local development - use the Python server
  return 'http://localhost:5000/api';
};

// API URL for the Python server
const API_URL = getApiUrl();
console.log(`API URL set to: ${API_URL}`);

// Sample demo data to show when API is unavailable
const DEMO_ALERTS: Alert[] = [
  {
    id: "demo-1",
    title: "Building fire reported",
    message: "Building fire reported in downtown area. Multiple people trapped inside.",
    severity: "high",
    timestamp: new Date().toISOString(),
    recipient: {
      id: "recipient-1",
      name: "Emergency Response Team",
      isOnline: true
    },
    isRead: false,
    possible_death: 3,
    false_alarm: 10,
    location: "123 Main St, Downtown",
    description: "Building fire reported in downtown area. Multiple people trapped inside."
  },
  {
    id: "demo-2",
    title: "Flooding in residential area",
    message: "Rising water levels in east side neighborhood. Evacuations may be necessary.",
    severity: "medium",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    recipient: {
      id: "recipient-2",
      name: "Flood Response Unit",
      isOnline: true
    },
    isRead: true,
    possible_death: 0,
    false_alarm: 25,
    location: "East Side Neighborhood",
    description: "Rising water levels in east side neighborhood. Evacuations may be necessary."
  }
];

type ViewTab = 'all' | 'unread' | 'saved';

const Index = () => {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch alerts from the Python API
  const fetchAlerts = async () => {
    // If we're in demo mode, use the demo data
    if (API_URL === 'demo') {
      console.log('Using demo data - Python API not available in this environment');
      setAlerts(DEMO_ALERTS);
      setApiUnavailable(true);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const apiEndpoint = `${API_URL}/alerts`;
      console.log(`Fetching alerts from: ${apiEndpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(apiEndpoint, {
        signal: controller.signal,
        mode: 'cors', // Explicitly request CORS
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched alerts:', data);
      setAlerts(data);
      setApiUnavailable(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      
      // If we've failed more than 2 times, load demo data
      if (retryCount > 2 && alerts.length === 0) {
        console.log('Loading demo data due to API unavailability');
        setAlerts(DEMO_ALERTS);
        setApiUnavailable(true);
        toast.error('Using demo data', {
          description: 'Could not connect to the API server. Showing demo data instead.',
        });
      } else {
        toast.error('Failed to fetch alerts', {
          description: 'Please make sure the Python server is running at http://localhost:5000',
        });
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an alert
  const deleteAlert = async (alertId: string) => {
    try {
      // If using demo data, just update the local state
      if (apiUnavailable || API_URL === 'demo') {
        setAlerts(alerts.filter(a => a.id !== alertId));
        toast('Alert deleted', {
          description: 'The alert has been removed (demo mode)',
        });
        return;
      }
      
      const response = await fetch(`${API_URL}/alerts/${alertId}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }
      
      // Update state to reflect the deletion
      setAlerts(alerts.filter(a => a.id !== alertId));
      
      toast('Alert deleted', {
        description: 'The alert has been removed',
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  // Set up polling to check for new alerts
  useEffect(() => {
    // Initial fetch
    fetchAlerts();
    
    // Set up polling only if not in demo mode
    if (API_URL !== 'demo') {
      const interval = setInterval(() => {
        fetchAlerts();
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [retryCount]);

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
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      // Mark alert as read
      setAlerts(alerts.map(a => 
        a.id === alertId ? { ...a, isRead: true } : a
      ));
      
      toast(`Connecting to ${alert.recipient.name}`, {
        description: `Establishing connection for alert: ${alert.title}`,
        duration: 3000,
      });
    }
  };
  
  // Handle deleting an alert
  const handleDelete = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      // Remove the alert using our API
      deleteAlert(alertId);
    }
  };

  // Handle search input
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Get count of unread alerts
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // Mark all as read
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
        {apiUnavailable && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">API Unavailable</span>
            </div>
            <p className="text-sm mt-1">
              {API_URL === 'demo' 
                ? 'Running in demo mode - Python API server is not available in this environment.'
                : 'Could not connect to the Python API server. Showing demo data instead. Make sure the server is running at http://localhost:5000'}
            </p>
          </div>
        )}
        
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
