// Admin protection utilities for Infinity Brain

// Admin GitHub usernames (case-insensitive)
const ADMIN_GITHUB_USERNAMES = ['pewpi', 'buotuner', 'pewpi-infinity']

export interface AdminProtection {
  isAdmin: (userId: string, username: string) => boolean
  canSyncWallet: (userId: string, username: string) => boolean
  canModifyAuctions: (userId: string, username: string) => boolean
  canAccessAdminFeatures: (userId: string, username: string) => boolean
}

export const adminProtection: AdminProtection = {
  isAdmin: (userId: string, username: string): boolean => {
    return ADMIN_GITHUB_USERNAMES.some(
      admin => admin.toLowerCase() === username.toLowerCase()
    )
  },

  canSyncWallet: (userId: string, username: string): boolean => {
    return adminProtection.isAdmin(userId, username)
  },

  canModifyAuctions: (userId: string, username: string): boolean => {
    return adminProtection.isAdmin(userId, username)
  },

  canAccessAdminFeatures: (userId: string, username: string): boolean => {
    return adminProtection.isAdmin(userId, username)
  }
}

export const ADMIN_AUCTIONS_TEMPLATE = [
  {
    id: 'admin-auction-silver-1',
    tokenSymbol: 'SILVER',
    tokenName: 'Silver Backed Token',
    amount: 1,
    startingBid: 50,
    currentBid: 50,
    reservePrice: 50,
    creatorId: 'admin',
    creatorUsername: ADMIN_GITHUB_USERNAMES[0], // Use primary admin
    startTime: Date.now(),
    endTime: Date.now() + (30 * 24 * 60 * 60 * 1000),
    status: 'active' as const,
    bids: [],
    description: 'Premium silver-backed token with real silver bits backing. Backed by actual physical silver.',
    attachments: []
  },
  {
    id: 'admin-auction-research-1',
    tokenSymbol: 'RESEARCH',
    tokenName: 'Research Token',
    amount: 100,
    startingBid: 10,
    currentBid: 10,
    reservePrice: 10,
    creatorId: 'admin',
    creatorUsername: ADMIN_GITHUB_USERNAMES[0], // Use primary admin
    startTime: Date.now(),
    endTime: Date.now() + (30 * 24 * 60 * 60 * 1000),
    status: 'active' as const,
    bids: [],
    description: 'Research tokens backed by real documented research. Each token represents verified research contributions.',
    attachments: []
  },
  {
    id: 'admin-auction-inf-1',
    tokenSymbol: 'INF',
    tokenName: 'Infinity Token',
    amount: 1000,
    startingBid: 100,
    currentBid: 100,
    reservePrice: 100,
    creatorId: 'admin',
    creatorUsername: ADMIN_GITHUB_USERNAMES[0], // Use primary admin
    startTime: Date.now(),
    endTime: Date.now() + (30 * 24 * 60 * 60 * 1000),
    status: 'active' as const,
    bids: [],
    description: 'Primary Infinity tokens - the backbone of the entire ecosystem. World currency beta program.',
    attachments: []
  }
]

export async function restoreAdminAuctions() {
  // Use Spark API to get user
  if (!window.spark) return
  
  try {
    const ownerUser = await window.spark.user()
    
    if (!ownerUser || !adminProtection.isAdmin(String(ownerUser.id), ownerUser.login)) {
      return
    }

    const existingAuctions = await window.spark.kv.get<any[]>('token-auctions') || []
    
    const adminAuctionIds = ADMIN_AUCTIONS_TEMPLATE.map(a => a.id)
    const hasAdminAuctions = existingAuctions.some(a => adminAuctionIds.includes(a.id))
    
    if (hasAdminAuctions) {
      return
    }

    const mergedAuctions = [
      ...ADMIN_AUCTIONS_TEMPLATE.map(auction => ({
        ...auction,
        creatorId: String(ownerUser.id),
        creatorUsername: ownerUser.login
      })),
      ...existingAuctions.filter(a => !adminAuctionIds.includes(a.id))
    ]

    await window.spark.kv.set('token-auctions', mergedAuctions)
  } catch (error) {
    console.error('Failed to restore admin auctions:', error)
  }
}

export async function protectAdminAuctions() {
  // Use Spark API to get user
  if (!window.spark) return
  
  try {
    const ownerUser = await window.spark.user()
    
    if (!ownerUser || !adminProtection.isAdmin(String(ownerUser.id), ownerUser.login)) {
      return
    }

    const existingAuctions = await window.spark.kv.get<any[]>('token-auctions') || []
    const adminAuctionIds = ADMIN_AUCTIONS_TEMPLATE.map(a => a.id)
    
    const protectedAuctions = existingAuctions.map(auction => {
      if (adminAuctionIds.includes(auction.id) && auction.creatorId !== String(ownerUser.id)) {
        return {
          ...ADMIN_AUCTIONS_TEMPLATE.find(a => a.id === auction.id),
          creatorId: String(ownerUser.id),
          creatorUsername: ownerUser.login,
          bids: auction.bids || []
        }
      }
      return auction
    })

    await window.spark.kv.set('token-auctions', protectedAuctions)
  } catch (error) {
    console.error('Failed to protect admin auctions:', error)
  }
}
