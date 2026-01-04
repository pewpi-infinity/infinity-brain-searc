import { useState, useEffect, useCallback } from 'react'
import { storage } from './storage'

/**
 * Custom hook for localStorage - NON-AUTH DATA ONLY
 * 
 * ⚠️ WARNING: DO NOT USE FOR AUTHENTICATION
 * - Authentication uses Spark's useKV hook from '@github/spark'
 * - This is only for business data like auctions, tokens, etc.
 * 
 * Provides reactive state management backed by localStorage
 * for components that need localStorage for non-critical business data.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error)
      return initialValue
    }
  })

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function like useState
        setStoredValue((prevValue) => {
          const valueToStore = value instanceof Function ? value(prevValue) : value
          
          // Save to localStorage
          localStorage.setItem(key, JSON.stringify(valueToStore))
          
          return valueToStore
        })
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error)
      }
    },
    [key]
  )

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Failed to parse storage event for ${key}:`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
