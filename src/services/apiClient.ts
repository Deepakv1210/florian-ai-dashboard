
import config from '../config';
import { Alert } from '@/components/AlertCard';

/**
 * API Client for making HTTP requests to the backend
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.baseUrl;
  }

  /**
   * Get all alerts
   */
  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await fetch(`${this.baseUrl}${config.api.endpoints.alerts}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Create a new alert
   */
  async createAlert(alertData: any) {
    try {
      const response = await fetch(`${this.baseUrl}${config.api.endpoints.alerts}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Delete an alert
   */
  async deleteAlert(alertId: string) {
    try {
      const response = await fetch(`${this.baseUrl}${config.api.endpoints.alerts}/${alertId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  /**
   * Send messages to the API
   */
  async sendMessages(messages: any[]) {
    try {
      const response = await fetch(`${this.baseUrl}${config.api.endpoints.messages}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending messages:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new ApiClient();
