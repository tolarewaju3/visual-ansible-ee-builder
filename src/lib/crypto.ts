/**
 * Cryptographic utilities for secure credential storage
 * Uses Web Crypto API for client-side encryption
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

/**
 * Derives an encryption key from a user-specific value
 * In production, this should use a proper key derivation function
 */
async function getDerivedKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(userId.padEnd(32, '0')),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ansible-ee-builder-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM
 */
export async function encryptData(data: string, userId: string): Promise<string> {
  try {
    const key = await getDerivedKey(userId);
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoder.encode(data)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data using AES-GCM
 */
export async function decryptData(encryptedData: string, userId: string): Promise<string> {
  try {
    const key = await getDerivedKey(userId);
    
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);

    const decryptedData = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Securely stores encrypted credentials in localStorage
 */
export async function storeEncryptedCredentials(
  credentials: { username: string; password: string },
  userId: string
): Promise<void> {
  const serialized = JSON.stringify(credentials);
  const encrypted = await encryptData(serialized, userId);
  localStorage.setItem('ee-builder-credentials', encrypted);
}

/**
 * Retrieves and decrypts credentials from localStorage
 */
export async function retrieveEncryptedCredentials(
  userId: string
): Promise<{ username: string; password: string } | null> {
  try {
    const encrypted = localStorage.getItem('ee-builder-credentials');
    if (!encrypted) return null;

    const decrypted = await decryptData(encrypted, userId);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to retrieve credentials:', error);
    return null;
  }
}

/**
 * Removes stored credentials
 */
export function clearStoredCredentials(): void {
  localStorage.removeItem('ee-builder-credentials');
}
