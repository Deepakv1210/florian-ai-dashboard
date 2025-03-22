
// NOTE: This file is kept for type definitions, but the actual API calls are now
// made directly to the Python server in Index.tsx

import { Alert, AlertSeverity } from '@/components/AlertCard';

// Function to get all alerts (for type reference only)
export const getAlerts = (): Alert[] => {
  return [];
};

// Function to add a new alert (for type reference only)
export const addAlert = (alertData: any): Alert => {
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
  
  return newAlert;
};

// Function to delete an alert (for type reference only)
export const deleteAlert = (alertId: string): boolean => {
  return true;
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
