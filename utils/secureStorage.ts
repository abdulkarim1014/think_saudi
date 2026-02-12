import CryptoJS from 'crypto-js';

// In-Memory Volatile Storage
// Data persists only for the duration of the page session (RAM).
// refreshing the page wipes this data completely.
const memoryStore = new Map<string, any>();

// Basic PII Sanitization pattern
const PII_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;

export const secureStorage = {
  /**
   * Save data to memory (Volatile)
   */
  setItem: (key: string, data: any) => {
    try {
      // 1. Sanitize string inputs before storage (Double safety)
      let safeData = data;
      if (typeof data === 'string') {
        safeData = data.replace(PII_REGEX, '[REDACTED]');
      } else if (typeof data === 'object' && data !== null) {
        // Shallow sanitization for objects
        const str = JSON.stringify(data).replace(PII_REGEX, '[REDACTED]');
        safeData = JSON.parse(str);
      }

      memoryStore.set(key, safeData);
    } catch (error) {
      console.error("Memory storage failed", error);
    }
  },

  /**
   * Retrieve data from memory
   */
  getItem: <T>(key: string): T | null => {
    return memoryStore.get(key) || null;
  },

  /**
   * Remove item from memory
   */
  removeItem: (key: string) => {
    memoryStore.delete(key);
  }
};