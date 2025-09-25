import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/lib/subscriptionService';

export const useCloudBuilds = () => {
  const { user } = useAuth();
  const [cloudBuildsUsed, setCloudBuildsUsed] = useState(0);
  const [cloudBuildsRemaining, setCloudBuildsRemaining] = useState(3);
  const [cloudBuildsTotal, setCloudBuildsTotal] = useState(3);
  const [canBuild, setCanBuild] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadCloudBuildData = async () => {
    if (!user) {
      setCloudBuildsUsed(0);
      setCloudBuildsRemaining(3);
      setCloudBuildsTotal(3);
      setCanBuild(false);
      setLoading(false);
      return;
    }

    try {
      const buildData = await subscriptionService.getCloudBuildUsage();
      setCloudBuildsUsed(buildData.used);
      setCloudBuildsRemaining(buildData.remaining);
      setCloudBuildsTotal(buildData.total);
      setCanBuild(buildData.remaining > 0);
    } catch (error) {
      console.error('Error loading cloud build data:', error);
      setCanBuild(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCloudBuildData();
  }, [user]);

  const incrementCloudBuild = async () => {
    try {
      const newData = await subscriptionService.incrementCloudBuildCount();
      setCloudBuildsUsed(newData.used);
      setCloudBuildsRemaining(newData.remaining);
      setCloudBuildsTotal(newData.total);
      setCanBuild(newData.remaining > 0);
      return newData;
    } catch (error) {
      console.error('Error incrementing cloud build count:', error);
      throw error;
    }
  };

  const purchaseBuildPack = async () => {
    try {
      const checkoutUrl = await subscriptionService.createCloudBuildCheckout();
      window.open(checkoutUrl, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  return {
    cloudBuildsUsed,
    cloudBuildsRemaining,
    cloudBuildsTotal,
    canBuild,
    loading,
    incrementCloudBuild,
    purchaseBuildPack,
    refresh: loadCloudBuildData,
  };
};
