/**
 * Test setup file for Vitest
 */

// Mock IndexedDB
import 'fake-indexeddb/auto';

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
        generateKey: async () => ({ type: 'secret' }),
        exportKey: async () => new ArrayBuffer(32),
        importKey: async () => ({ type: 'secret' }),
        encrypt: async (algorithm: any, key: any, data: any) => new ArrayBuffer(data.byteLength),
        decrypt: async (algorithm: any, key: any, data: any) => new ArrayBuffer(data.byteLength),
        digest: async (algorithm: string, data: BufferSource) => new ArrayBuffer(32)
      }
    }
  });
}

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {}
};

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
}
