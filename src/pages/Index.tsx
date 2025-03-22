
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

// Initial mock data for alerts
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    title: 'Critical system failure detected',
    message: 'The primary database cluster is experiencing high latency and potential data loss. Immediate intervention required.',
    severity: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    recipient: {
      id: 'r1',
      name: 'Sarah Chen',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      isOnline: true
    },
    isRead: false,
    possible_death: 12,
    false_alarm: 5,
    location: 'Database Cluster A-3',
    description: 'Multiple nodes reporting critical errors with potential for cascading failures across connected systems.'
  },
  {
    id: '2',
    title: 'Unusual user activity detected',
    message: 'Multiple failed login attempts from various IP addresses for user account admin@example.com. Possible brute force attack in progress.',
    severity: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    recipient: {
      id: 'r2',
      name: 'James Wilson',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      isOnline: false
    },
    isRead: true,
    possible_death: 0,
    false_alarm: 15,
    location: 'Authentication Service',
    description: 'IP addresses originate from 3 different countries and appear to be using a rotating proxy system to avoid rate limiting.'
  },
  {
    id: '3',
    title: 'API rate limit approaching threshold',
    message: 'The public API is currently at 85% of its rate limit. Consider implementing throttling or increasing capacity.',
    severity: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    recipient: {
      id: 'r3',
      name: 'Alex Morgan',
      avatarUrl: 'https://i.pravatar.cc/150?img=4',
      isOnline: true
    },
    isRead: false,
    false_alarm: 30,
    location: 'Public API Gateway',
    description: 'Traffic appears to be legitimate but sustained well above normal levels for this time period.'
  },
  {
    id: '4',
    title: 'Memory usage warning',
    message: 'Application server is experiencing elevated memory usage (87%). Consider investigating potential memory leaks.',
    severity: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    recipient: {
      id: 'r4',
      name: 'Leila Ahmed',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      isOnline: true
    },
    isRead: false,
    possible_death: 0,
    false_alarm: 45,
    location: 'App Server Node 7',
    description: 'Memory usage has been gradually increasing over the past 48 hours without corresponding traffic increases.'
  },
  {
    id: '5',
    title: 'New feature deployment completed',
    message: 'The user authentication system update has been successfully deployed to production. Monitor for any unexpected behavior.',
    severity: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    recipient: {
      id: 'r5',
      name: 'Marcus Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?img=7',
      isOnline: false
    },
    isRead: true,
    false_alarm: 70,
    location: 'Production Environment',
    description: 'Deployment completed in 4 minutes and 32 seconds. All post-deployment tests passed successfully.'
  },
  {
    id: '6',
    title: 'Scheduled maintenance reminder',
    message: 'Reminder: Database indexing maintenance is scheduled for tomorrow at 2 AM UTC. Expected downtime: 15-30 minutes.',
    severity: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    recipient: {
      id: 'r6',
      name: 'Elena Martinez',
      avatarUrl: 'https://i.pravatar.cc/150?img=9',
      isOnline: true
    },
    isRead: true,
    false_alarm: 0,
    location: 'Database Maintenance',
    description: 'This is a routine maintenance operation that occurs monthly. All systems will automatically fail over to secondary instances.'
  }
];

type ViewTab = 'all' | 'unread' | 'saved';

const Index = () => {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Function to add a new alert from server response
  const addNewAlert = (responseData: any) => {
    const { response } = responseData;
    
    // Generate a new alert from the response
    const newAlert: Alert = {
      id: `alert-${Date.now()}`, // Generate a unique ID
      title: "New Alert", // You might want to generate this based on response data
      message: "New alert received from the server", // Or extract from response
      severity: calculateSeverity(response), // Helper function to determine severity
      timestamp: new Date().toISOString(),
      recipient: {
        id: `recipient-${Date.now()}`,
        name: "Alert Recipient", // This should come from your user system
        isOnline: true
      },
      isRead: false,
      possible_death: response.possible_death,
      false_alarm: response.false_alarm,
      location: response.location,
      description: response.description
    };
    
    // Add the new alert to the state
    setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
    
    // Show a toast notification
    toast.info(`New alert received: ${newAlert.title}`, {
      description: newAlert.description || newAlert.message,
      duration: 4000,
    });
  };
  
  // Helper function to calculate severity based on response data
  const calculateSeverity = (response: any): AlertSeverity => {
    if (response.possible_death && response.possible_death > 0) {
      return 'high';
    } else if (response.false_alarm && response.false_alarm < 30) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  // Simulate receiving new alerts (this would be replaced with your actual API call)
  useEffect(() => {
    // This is just a simulation - replace with your actual API implementation
    const simulateIncomingAlert = () => {
      // Example server response format
      const mockServerResponse = {
        response: {
          possible_death: Math.floor(Math.random() * 10),
          false_alarm: Math.floor(Math.random() * 100),
          location: "System Zone " + Math.floor(Math.random() * 10),
          description: "Simulated alert with details about the situation."
        }
      };
      
      // Process the response as if it came from the server
      addNewAlert(mockServerResponse);
    };
    
    // For demo purposes - uncomment to test
    // const interval = setInterval(simulateIncomingAlert, 30000); // New alert every 30 seconds
    // return () => clearInterval(interval);
  }, []);

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
              {renderAlertList(filteredAlerts, handleConnect)}
            </TabsContent>
            
            <TabsContent value="unread" className="mt-0">
              {renderAlertList(filteredAlerts, handleConnect)}
            </TabsContent>
            
            <TabsContent value="saved" className="mt-0">
              {renderAlertList(filteredAlerts, handleConnect)}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

// Helper function to render the alert list with proper animation
const renderAlertList = (alerts: Alert[], onConnect: (id: string) => void) => {
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
        />
      ))}
    </motion.div>
  );
};

export default Index;
