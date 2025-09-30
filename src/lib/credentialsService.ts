/**
 * Service for securely managing user credentials
 */
import { supabase } from "@/integrations/supabase/client";
import { encryptData, decryptData } from "./crypto";

export interface StoredCredentials {
  redhat?: {
    username: string;
    password: string;
  };
  registry?: {
    username: string;
    password: string;
  };
}

/**
 * Stores credentials securely in Supabase
 * For server-side access, we use base64 encoding
 * The security comes from RLS policies and service role access
 */
export async function storeCredentials(
  userId: string,
  credentialType: 'redhat' | 'registry',
  credentials: { username: string; password: string }
): Promise<void> {
  // Encode credentials for server-side access (not encryption, but better than plain text)
  // The real security is provided by RLS policies and HTTPS
  const encoded = btoa(JSON.stringify(credentials));

  // Store in Supabase
  const { error } = await supabase
    .from('user_credentials')
    .upsert({
      user_id: userId,
      credential_type: credentialType,
      encrypted_data: encoded,
    }, {
      onConflict: 'user_id,credential_type'
    });

  if (error) {
    console.error('Failed to store credentials:', error);
    throw new Error('Failed to securely store credentials');
  }
}

/**
 * Retrieves credentials from Supabase
 */
export async function retrieveCredentials(
  userId: string,
  credentialType: 'redhat' | 'registry'
): Promise<{ username: string; password: string } | null> {
  const { data, error } = await supabase
    .from('user_credentials')
    .select('encrypted_data')
    .eq('user_id', userId)
    .eq('credential_type', credentialType)
    .maybeSingle();

  if (error) {
    console.error('Failed to retrieve credentials:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  try {
    const decoded = atob(data.encrypted_data);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode credentials:', error);
    return null;
  }
}

/**
 * Deletes credentials from Supabase
 */
export async function deleteCredentials(
  userId: string,
  credentialType: 'redhat' | 'registry'
): Promise<void> {
  const { error } = await supabase
    .from('user_credentials')
    .delete()
    .eq('user_id', userId)
    .eq('credential_type', credentialType);

  if (error) {
    console.error('Failed to delete credentials:', error);
    throw new Error('Failed to delete credentials');
  }
}
