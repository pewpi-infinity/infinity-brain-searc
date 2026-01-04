import { SlideCoin } from './slideCoinSystem'
import { toast } from 'sonner'
import { localStorageUtils } from '@/hooks/useLocalStorage'

export interface Product {
  id: string
  name: string
  price: number
  source: 'ebay' | 'etsy' | 'marketplace'
  url: string
  image?: string
  relevance: number
}

export interface Service {
  id: string
  name: string
  description: string
  provider: string
  category: string
  relevance: number
}

export interface Opportunity {
  id: string
  title: string
  type: 'job' | 'resource' | 'benefit' | 'education'
  description: string
  value: number
  relevance: number
}

export interface QuantumMatch {
  user: string
  slideCoin: SlideCoin
  matches: {
    products: Product[]
    services: Service[]
    opportunities: Opportunity[]
    people: string[]
    benefits: string[]
  }
  confidence: number
  timestamp: number
}

export const findOptimalMatches = async (slideCoin: SlideCoin): Promise<QuantumMatch> => {
  const embedding = slideCoin.quantum.vectorEmbedding
  const intent = slideCoin.quantum.userIntent
  const context = slideCoin.research.context
  const tags = slideCoin.research.tags
  
  const products = await searchProducts(embedding, context, tags)
  const services = await searchServices(intent, context)
  const opportunities = await searchOpportunities(intent, tags)
  const people = await findSimilarUsers(embedding)
  const benefits = await findEligibleBenefits(slideCoin.owner, intent)
  
  const totalMatches = products.length + services.length + opportunities.length
  const confidence = Math.min((totalMatches / 10) * 0.8 + 0.2, 1.0)
  
  return {
    user: slideCoin.owner,
    slideCoin,
    matches: {
      products,
      services,
      opportunities,
      people,
      benefits
    },
    confidence,
    timestamp: Date.now()
  }
}

const searchProducts = async (
  embedding: number[],
  context: string,
  tags: string[]
): Promise<Product[]> => {
  const products: Product[] = []
  
  const keywords = extractKeywords(context, tags)
  
  if (keywords.includes('token') || keywords.includes('crypto')) {
    products.push({
      id: 'crypto-hardware-wallet',
      name: 'Hardware Crypto Wallet',
      price: 59.99,
      source: 'marketplace',
      url: '#',
      relevance: 0.95
    })
  }
  
  if (keywords.includes('food') || keywords.includes('grocery')) {
    products.push({
      id: 'grocery-voucher',
      name: 'Grocery Store Voucher',
      price: 50.00,
      source: 'marketplace',
      url: '#',
      relevance: 0.90
    })
  }
  
  if (keywords.includes('social') || keywords.includes('security')) {
    products.push({
      id: 'essential-supplies',
      name: 'Essential Supplies Bundle',
      price: 30.00,
      source: 'marketplace',
      url: '#',
      relevance: 0.88
    })
  }
  
  return products.sort((a, b) => b.relevance - a.relevance)
}

const searchServices = async (
  intent: string,
  context: string
): Promise<Service[]> => {
  const services: Service[] = []
  
  if (intent === 'seeking-benefits' || context.includes('social security')) {
    services.push({
      id: 'benefit-application',
      name: 'Social Security Application Assistance',
      description: 'Get help applying for benefits',
      provider: 'Infinity Brain Platform',
      category: 'social-services',
      relevance: 0.95
    })
  }
  
  if (intent === 'creating-value' || context.includes('token')) {
    services.push({
      id: 'token-consulting',
      name: 'Token Strategy Consultation',
      description: 'Maximize your token value',
      provider: 'Infinity Brain Experts',
      category: 'financial',
      relevance: 0.85
    })
  }
  
  return services.sort((a, b) => b.relevance - a.relevance)
}

const searchOpportunities = async (
  intent: string,
  tags: string[]
): Promise<Opportunity[]> => {
  const opportunities: Opportunity[] = []
  
  opportunities.push({
    id: 'social-security-program',
    title: 'Infinity Social Security Benefits',
    type: 'benefit',
    description: 'Apply for token-based universal basic income',
    value: 500,
    relevance: 0.92
  })
  
  if (tags.includes('research') || tags.includes('token')) {
    opportunities.push({
      id: 'research-grant',
      title: 'Research Token Creator Program',
      type: 'resource',
      description: 'Earn tokens by publishing research',
      value: 1000,
      relevance: 0.88
    })
  }
  
  opportunities.push({
    id: 'marketplace-seller',
    title: 'Become a Marketplace Seller',
    type: 'job',
    description: 'Sell products for INF tokens',
    value: 0,
    relevance: 0.75
  })
  
  return opportunities.sort((a, b) => b.relevance - a.relevance)
}

const findSimilarUsers = async (embedding: number[]): Promise<string[]> => {
  const allSlideCoins = localStorageUtils.get<string[]>('all-slide-coins', [])
  const similarUsers: Map<string, number> = new Map()
  
  for (const coinId of allSlideCoins.slice(0, 100)) {
    const coin = await window.spark.kv.get<SlideCoin>(`slide-${coinId}`)
    if (!coin) continue
    
    const similarity = calculateCosineSimilarity(embedding, coin.quantum.vectorEmbedding)
    
    if (similarity > 0.7) {
      const currentScore = similarUsers.get(coin.owner) || 0
      similarUsers.set(coin.owner, currentScore + similarity)
    }
  }
  
  return Array.from(similarUsers.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([username]) => username)
}

const findEligibleBenefits = async (
  username: string,
  intent: string
): Promise<string[]> => {
  const benefits: string[] = []
  
  benefits.push('Infinity Social Security (Universal Basic Income)')
  
  if (intent === 'seeking-benefits') {
    benefits.push('Emergency Support Fund')
    benefits.push('Mail Coins for Essential Purchases')
  }
  
  benefits.push('Research Token Creation Credits')
  benefits.push('Marketplace Fee Waivers')
  
  return benefits
}

const calculateCosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

const extractKeywords = (context: string, tags: string[]): string[] => {
  const words = context.toLowerCase().split(/\W+/)
  const allKeywords = [...words, ...tags]
  return Array.from(new Set(allKeywords.filter(w => w.length > 3)))
}

export const suggestMatchesForCoin = async (slideCoin: SlideCoin) => {
  const matches = await findOptimalMatches(slideCoin)
  
  if (matches.confidence > 0.7) {
    const totalMatches = 
      matches.matches.products.length +
      matches.matches.services.length +
      matches.matches.opportunities.length
    
    toast.success('🤖 AI Found Perfect Matches!', {
      description: `${totalMatches} relevant items found for you`,
      duration: 5000,
      action: {
        label: 'View Matches',
        onClick: () => displayMatches(matches)
      }
    })
  }
  
  localStorageUtils.set(`quantum-match-${slideCoin.id}`, matches)
  
  return matches
}

const displayMatches = (matches: QuantumMatch) => {
  console.log('Quantum Matches:', matches)
}

export const getMatchesForCoin = async (coinId: string): Promise<QuantumMatch | null> => {
  return await window.spark.kv.get<QuantumMatch>(`quantum-match-${coinId}`)
}