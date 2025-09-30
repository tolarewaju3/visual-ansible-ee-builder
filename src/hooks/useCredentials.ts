import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { retrieveCredentials } from '@/lib/credentialsService';
import { RedHatCredentials, RegistryCredentials } from '@/lib/storage';

export function useCredentials() {
  const { user } = useAuth();
  const [redhatCredentials, setRedhatCredentials] = useState<RedHatCredentials | null>(null);
  const [registryCredentials, setRegistryCredentials] = useState<RegistryCredentials | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCredentials = async () => {
      if (!user) {
        setRedhatCredentials(null);
        setRegistryCredentials(null);
        setLoading(false);
        return;
      }

      try {
        // Load both credentials in parallel
        const [redhatCreds, registryCreds] = await Promise.all([
          retrieveCredentials(user.id, 'redhat'),
          retrieveCredentials(user.id, 'registry')
        ]);

        setRedhatCredentials(redhatCreds);
        setRegistryCredentials(registryCreds);
      } catch (error) {
        console.error('Failed to load credentials:', error);
        setRedhatCredentials(null);
        setRegistryCredentials(null);
      } finally {
        setLoading(false);
      }
    };

    loadCredentials();
  }, [user]);

  return {
    redhatCredentials,
    registryCredentials,
    loading,
    hasRedhatCredentials: !!redhatCredentials,
    hasRegistryCredentials: !!registryCredentials
  };
}
