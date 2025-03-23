
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { toast } from 'sonner';

/**
 * Hook for working with API data
 */
export function useApi() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Query for fetching alerts
  const alertsQuery = useQuery({
    queryKey: ['alerts'],
    queryFn: apiClient.getAlerts.bind(apiClient),
    refetchInterval: 5000, // Poll every 5 seconds
    onError: () => {
      toast.error('Failed to fetch alerts', {
        description: 'Please check your connection to the API server',
      });
    }
  });

  // Mutation for deleting an alert
  const deleteAlertMutation = useMutation({
    mutationFn: (alertId: string) => apiClient.deleteAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast('Alert deleted', {
        description: 'The alert has been removed',
      });
    },
    onError: () => {
      toast.error('Failed to delete alert');
    }
  });

  // Mutation for sending messages
  const sendMessagesMutation = useMutation({
    mutationFn: (messages: any[]) => apiClient.sendMessages(messages),
    onSuccess: () => {
      toast('Messages sent', {
        description: 'Your messages have been processed',
      });
      // After sending messages, we'll want to refresh our alerts in case new ones were created
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
      }, 2000);
    },
    onError: () => {
      toast.error('Failed to send messages');
    }
  });

  return {
    alerts: alertsQuery.data || [],
    isLoading: alertsQuery.isLoading || isLoading,
    error: alertsQuery.error,
    refetchAlerts: alertsQuery.refetch,
    deleteAlert: deleteAlertMutation.mutate,
    sendMessages: sendMessagesMutation.mutate
  };
}
