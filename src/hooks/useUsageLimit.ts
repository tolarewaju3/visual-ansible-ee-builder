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
      setCanExport(false);
      setLoading(false);
      return;
    }

    try {
      const [exportCount, canUserExport] = await Promise.all([
        subscriptionService.getTodayExportCount(),
        subscriptionService.canUserExport()
      ]);

      setTodayExports(exportCount);
      setCanExport(canUserExport);
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
    if (!canExport) {
      throw new Error('Export limit reached');
    }

    try {
      const newCount = await subscriptionService.incrementExportCount();
      setTodayExports(newCount);
      
      // Update canExport status for free users
      if (isFree && newCount >= 3) {
        setCanExport(false);
      }
      
      return newCount;
    } catch (error) {
      console.error('Error incrementing export count:', error);
      throw error;
    }
  };

  const remainingExports = isPro ? Infinity : Math.max(0, 3 - todayExports);

  return {
    todayExports,
    canExport,
    remainingExports,
    loading,
    incrementExport,
    refresh: loadUsageData,
  };
};