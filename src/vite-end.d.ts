/// <reference types="vite/client" />

export interface User {
  avatarUrl: string
  email: string
  id: number
  isOwner: boolean
  login: string
}

interface Window {
  spark?: {
    user: () => Promise<User | null>
    kv: {
      keys: () => Promise<string[]>
      get: <T>(key: string) => Promise<T | undefined>
      set: <T>(key: string, value: T) => Promise<void>
      delete: (key: string) => Promise<void>
    }
  }
}

declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string