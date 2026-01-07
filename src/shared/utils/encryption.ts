/**
 * Encryption Utilities - AES-GCM encryption and ECDH key exchange
 * Provides optional encryption for sensitive token data
 */

/**
 * Generate a random encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to raw format
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return await crypto.subtle.exportKey('raw', key);
}

/**
 * Import a raw key to CryptoKey
 */
export async function importKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  return { ciphertext, iv };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(
  ciphertext: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypt data and return as base64 string with IV
 */
export async function encryptToBase64(data: string, key: CryptoKey): Promise<string> {
  const { ciphertext, iv } = await encrypt(data, key);
  
  // Combine IV and ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt base64 string containing IV and ciphertext
 */
export async function decryptFromBase64(encryptedData: string, key: CryptoKey): Promise<string> {
  // Decode base64
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  // Extract IV (first 12 bytes) and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12).buffer;
  
  return await decrypt(ciphertext, key, iv);
}

/**
 * Generate ECDH key pair for P2P key exchange
 */
export async function generateECDHKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );
}

/**
 * Export ECDH public key for sharing
 */
export async function exportECDHPublicKey(publicKey: CryptoKey): Promise<ArrayBuffer> {
  return await crypto.subtle.exportKey('raw', publicKey);
}

/**
 * Import ECDH public key from peer
 */
export async function importECDHPublicKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

/**
 * Derive shared AES key from ECDH key exchange
 */
export async function deriveSharedKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  return await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Hash data using SHA-256
 */
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * ECDH Key Exchange Helper (Stub for P2P)
 * This is a placeholder for future P2P implementation
 */
export class ECDHKeyExchange {
  private keyPair: CryptoKeyPair | null = null;
  private sharedKey: CryptoKey | null = null;

  async initialize(): Promise<ArrayBuffer> {
    this.keyPair = await generateECDHKeyPair();
    return await exportECDHPublicKey(this.keyPair.publicKey);
  }

  async deriveSharedSecret(peerPublicKey: ArrayBuffer): Promise<void> {
    if (!this.keyPair) {
      throw new Error('Key exchange not initialized');
    }
    
    const peerKey = await importECDHPublicKey(peerPublicKey);
    this.sharedKey = await deriveSharedKey(this.keyPair.privateKey, peerKey);
  }

  getSharedKey(): CryptoKey {
    if (!this.sharedKey) {
      throw new Error('Shared key not derived');
    }
    return this.sharedKey;
  }

  async encryptMessage(message: string): Promise<string> {
    return await encryptToBase64(message, this.getSharedKey());
  }

  async decryptMessage(encryptedMessage: string): Promise<string> {
    return await decryptFromBase64(encryptedMessage, this.getSharedKey());
  }
}
