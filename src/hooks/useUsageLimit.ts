import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/lib/subscriptionService';
import { useSubscription } from './useSubscription';

export const useUsageLimit = () => {
  const { user } = useAuth();
  const { isPro, isFree } = useSubscription();
  const [todayExports, setTodayExports] = useState(0);
  const [canExport, setCanExport] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadUsageData = async () => {
    if (!user) {
      setTodayExports(0);
      setCanExport(true); // Everyone can export now
      setLoading(false);
      return;
    }

    try {
      const exportCount = await subscriptionService.getTodayExportCount();
      setTodayExports(exportCount);
      setCanExport(true); // Everyone can export now (unlimited)
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsageData();
  }, [user, isPro]);

  const incrementExport = async () => {
    try {
      const newCount = await subscriptionService.incrementExportCount();
      setTodayExports(newCount);
      return newCount;
    } catch (error) {
      console.error('Error incrementing export count:', error);
      // Don't throw error for unauthenticated users
      return 0;
    }
  };

  const remainingExports = Infinity; // Unlimited exports for everyone

  return {
    todayExports,
    canExport,
    remainingExports,
    loading,
    incrementExport,
    refresh: loadUsageData,
  };
};