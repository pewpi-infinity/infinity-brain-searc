/// <reference types="vite/client" />

// Spark API type definitions
/**
 * GitHub user information from Spark authentication
 */
interface SparkUser {
  /** GitHub user ID */
  id: number
  /** GitHub username/login */
  login: string
  /** User's email address */
  email: string
  /** URL to user's avatar image */
  avatarUrl: string
  /** True if user is the repository owner */
  isOwner: boolean
}

interface SparkKV {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
}

interface SparkAPI {
  user(): Promise<SparkUser>
  kv: SparkKV
  llm(prompt: string, model?: string, streaming?: boolean): Promise<any>
}

declare global {
  interface Window {
    spark: SparkAPI
  }
}

export {}
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string