
import { Alert, AlertSeverity } from '@/components/AlertCard';

// Store alerts in memory (temporary solution for demo purposes)
let alertsStore: Alert[] = [];

// Function to get all alerts
export const getAlerts = (): Alert[] => {
  return [...alertsStore];
};

// Function to add a new alert from external API request
export const addAlert = (alertData: any): Alert => {
  // Calculate severity based on data
  const severity = calculateSeverity(alertData);
  
  // Create a new alert
  const newAlert: Alert = {
    id: `alert-${Date.now()}`,
    title: alertData.description?.split('.')[0] || "New Alert",
    message: alertData.description || "New alert received",
    severity,
    timestamp: new Date().toISOString(),
    recipient: {
      id: `recipient-${Date.now()}`,
      name: "Emergency Response Team",
      isOnline: true
    },
    isRead: false,
    possible_death: alertData.possible_death,
    false_alarm: alertData.false_alarm,
    location: alertData.location,
    description: alertData.description
  };
  
  // Add to our store
  alertsStore = [newAlert, ...alertsStore];
  
  return newAlert;
};

// Function to delete an alert
export const deleteAlert = (alertId: string): boolean => {
  const initialLength = alertsStore.length;
  alertsStore = alertsStore.filter(alert => alert.id !== alertId);
  return alertsStore.length < initialLength;
};

// Helper function to calculate severity
const calculateSeverity = (data: any): AlertSeverity => {
  if (data.possible_death && data.possible_death > 0) {
    return 'high';
  } else if (data.false_alarm && data.false_alarm < 30) {
    return 'medium';
  } else {
    return 'low';
  }
};
