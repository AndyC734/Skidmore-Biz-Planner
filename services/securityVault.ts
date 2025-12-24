
/**
 * Security Vault Utility
 * Uses Web Crypto API (AES-GCM) to protect local user data.
 */

const VAULT_KEY_NAME = 'skidmore_vault_key';

// Generate or retrieve a persistent key for this device
async function getEncryptionKey(): Promise<CryptoKey> {
  const existingKey = localStorage.getItem(VAULT_KEY_NAME);
  if (existingKey) {
    const rawKey = new Uint8Array(atob(existingKey).split('').map(c => c.charCodeAt(0)));
    return await crypto.subtle.importKey(
      'raw',
      rawKey,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    );
  }

  const newKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const exported = await crypto.subtle.exportKey('raw', newKey);
  const base64Key = btoa(String.fromCharCode(...new Uint8Array(exported)));
  localStorage.setItem(VAULT_KEY_NAME, base64Key);
  return newKey;
}

export const encryptData = async (data: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error("Encryption failed", e);
    return data; // Fallback
  }
};

export const decryptData = async (encrypted: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const combined = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.warn("Decryption failed - data may be unencrypted or corrupted", e);
    return encrypted;
  }
};
