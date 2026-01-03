const ADMIN_GITHUB_ID = 'pewpi-infinity'

export interface AdminProtection {
  isAdmin: (userId: string, username: string) => boolean
  canSyncWallet: (userId: string, username: string) => boolean
  canModifyAuctions: (userId: string, username: string) => boolean
  canAccessAdminFeatures: (userId: string, username: string) => boolean
}

export const adminProtection: AdminProtection = {
  isAdmin: (userId: string, username: string): boolean => {
    return username.toLowerCase() === ADMIN_GITHUB_ID.toLowerCase()
  },

  canSyncWallet: (userId: string, username: string): boolean => {
    return adminProtection.isAdmin(userId, username)
  },

  canModifyAuctions: (userId: string, username: string): boolean => {
    return true
  },

  canAccessAdminFeatures: (userId: string, username: string): boolean => {
    return adminProtection.isAdmin(userId, username)
  }
}

export async function restoreAdminAuctions() {
  const ownerUser = await window.spark.user()
  
  if (!ownerUser || !adminProtection.isAdmin(String(ownerUser.id), ownerUser.login)) {
    return
  }

  const existingAuctions = await window.spark.kv.get<any[]>('token-auctions') || []
  
  if (existingAuctions.length > 0) {
    return
  }

  const restoredAuctions = [
    {
      id: `auction-${Date.now()}-1`,
      tokenSymbol: 'SILVER',
      tokenName: 'Silver Backed Token',
      amount: 1,
      startingBid: 50,
      currentBid: 50,
      minIncrement: 5,
      startTime: Date.now(),
      endTime: Date.now() + (7 * 24 * 60 * 60 * 1000),
      status: 'active',
      seller: ownerUser.login,
      sellerId: String(ownerUser.id),
      bids: [],
      watchers: [],
      description: 'Premium silver-backed token with real silver bits backing',
      paymentMethods: ['USD', 'INF'],
      mediaAttachments: []
    }
  ]

  await window.spark.kv.set('token-auctions', restoredAuctions)
}
