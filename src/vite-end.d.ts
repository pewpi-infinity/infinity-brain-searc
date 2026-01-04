/// <reference types="vite/client" />

// Spark API type definitions
interface SparkUser {
  id: number
  login: string
  email: string
  avatarUrl: string
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