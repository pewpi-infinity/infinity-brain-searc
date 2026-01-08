/**
 * Test setup file
 */

import { beforeEach, afterEach } from 'vitest';

// Mock window.crypto for tests
if (typeof window !== 'undefined' && !window.crypto) {
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
      subtle: {
        generateKey: async () => ({}),
        exportKey: async () => new ArrayBuffer(32),
        importKey: async () => ({}),
        encrypt: async () => new ArrayBuffer(0),
        decrypt: async () => new ArrayBuffer(0),
        deriveKey: async () => ({}),
        digest: async () => new ArrayBuffer(32),
      },
    },
  });
}

// Clean up localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

// Clean up after each test
afterEach(() => {
  localStorage.clear();
});
