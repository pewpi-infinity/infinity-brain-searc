/**
 * Crypto helpers for AES-GCM encryption and ECDH key exchange
 * 
 * Provides:
 * - AES-GCM encryption/decryption
 * - Key generation and management
 * - ECDH key exchange stubs for P2P
 */

/**
 * Generate a random AES-GCM key
 */
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
 * AES-GCM Encryption Helpers and ECDH Key Exchange Stubs
 * Provides optional encryption for token data and P2P communication
 */

/**
 * Generate a random encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true, // extractable
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to base64 string
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import a CryptoKey from base64 string
 */
export async function importKey(keyData: string): Promise<CryptoKey> {
  const binaryString = atob(keyData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return await crypto.subtle.importKey(
    'raw',
    bytes,
    {
      name: 'AES-GCM',
      length: 256
    },
 * Export a key to raw format
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return await window.crypto.subtle.exportKey('raw', key);
}

/**
 * Import a key from raw format
 */
export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random IV (Initialization Vector)
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const iv = generateIV();
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encodedData
  );
  
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv))
  };
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    dataBuffer
  );

  return { encrypted, iv };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const binaryCiphertext = atob(ciphertext);
  const ciphertextBytes = new Uint8Array(binaryCiphertext.length);
  for (let i = 0; i < binaryCiphertext.length; i++) {
    ciphertextBytes[i] = binaryCiphertext.charCodeAt(i);
  }
  
  const binaryIV = atob(iv);
  const ivBytes = new Uint8Array(binaryIV.length);
  for (let i = 0; i < binaryIV.length; i++) {
    ivBytes[i] = binaryIV.charCodeAt(i);
  }
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes
    },
    key,
    ciphertextBytes
  );
  
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypt an object and return base64 string
 */
export async function encryptObject(
  obj: any,
  key: CryptoKey
): Promise<string> {
  const json = JSON.stringify(obj);
  const { ciphertext, iv } = await encrypt(json, key);
  
  // Combine ciphertext and IV
  return JSON.stringify({ ciphertext, iv });
}

/**
 * Decrypt a base64 string to an object
 */
export async function decryptObject<T = any>(
  encrypted: string,
  key: CryptoKey
): Promise<T> {
  const { ciphertext, iv } = JSON.parse(encrypted);
  const decrypted = await decrypt(ciphertext, iv, key);
  return JSON.parse(decrypted);
}

/**
 * ECDH Key Exchange Helpers (Stubs for P2P)
 * Convert ArrayBuffer to Base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt and encode data to string
 */
export async function encryptToString(data: string, key: CryptoKey): Promise<string> {
  const { encrypted, iv } = await encrypt(data, key);
  const combined = {
    data: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv)
  };
  return JSON.stringify(combined);
}

/**
 * Decrypt from encoded string
 */
export async function decryptFromString(encryptedString: string, key: CryptoKey): Promise<string> {
  const combined = JSON.parse(encryptedString);
  const encrypted = base64ToArrayBuffer(combined.data);
  const iv = new Uint8Array(base64ToArrayBuffer(combined.iv));
  return await decrypt(encrypted, key, iv);
}

/**
 * ECDH Key Exchange Stubs for P2P
 * These are placeholder implementations for future P2P encryption
 */

export interface ECDHKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

/**
 * Generate ECDH key pair
 */
export async function generateECDHKeyPair(): Promise<ECDHKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey', 'deriveBits']
  );
  
    ['deriveKey']
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey
  };
}

/**
 * Export ECDH public key to base64
 */
export async function exportECDHPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import ECDH public key from base64
 */
export async function importECDHPublicKey(keyData: string): Promise<CryptoKey> {
  const binaryString = atob(keyData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return await crypto.subtle.importKey(
    'spki',
    bytes,
 * Export ECDH public key
 */
export async function exportECDHPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import ECDH public key
 */
export async function importECDHPublicKey(keyString: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyString);
  return await window.crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    []
  );
}

/**
 * Derive a shared AES key from ECDH key exchange
 */
export async function deriveSharedKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  return await crypto.subtle.deriveKey(
 * Derive shared secret from ECDH key exchange
 */
export async function deriveSharedSecret(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Hash a string using SHA-256
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const hash = await crypto.subtle.digest('SHA-256', encodedData);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
 * Encrypt data for P2P using ECDH-derived key
 */
export async function encryptForPeer(
  data: string,
  myPrivateKey: CryptoKey,
  peerPublicKey: CryptoKey
): Promise<string> {
  const sharedSecret = await deriveSharedSecret(myPrivateKey, peerPublicKey);
  return await encryptToString(data, sharedSecret);
}

/**
 * Decrypt data from P2P using ECDH-derived key
 */
export async function decryptFromPeer(
  encryptedString: string,
  myPrivateKey: CryptoKey,
  peerPublicKey: CryptoKey
): Promise<string> {
  const sharedSecret = await deriveSharedSecret(myPrivateKey, peerPublicKey);
  return await decryptFromString(encryptedString, sharedSecret);
}

/**
 * Hash data using SHA-256
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = 'id'): string {
  const random = window.crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(random)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${Date.now()}_${hex}`;
}
