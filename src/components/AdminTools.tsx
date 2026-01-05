import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, ArrowsClockwise, Database, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { restoreAdminAuctions, protectAdminAuctions, ADMIN_AUCTIONS_TEMPLATE } from '@/lib/adminProtection'
import { useKV } from '@github/spark/hooks'

export function AdminTools() {
  const [isRestoring, setIsRestoring] = useState(false)
  const [isProtecting, setIsProtecting] = useState(false)
  const [auctions] = useKV<any[]>('token-auctions', [])

  const handleRestoreAuctions = async () => {
    setIsRestoring(true)
    try {
      await restoreAdminAuctions()
      toast.success('Admin auctions restored!', {
        description: `${ADMIN_AUCTIONS_TEMPLATE.length} auctions have been added back`
      })
    } catch (error) {
      toast.error('Failed to restore auctions')
      console.error(error)
    } finally {
      setIsRestoring(false)
    }
  }

  const handleProtectAuctions = async () => {
    setIsProtecting(true)
    try {
      await protectAdminAuctions()
      toast.success('Admin auctions protected!', {
        description: 'All admin auction data has been verified and secured'
      })
    } catch (error) {
      toast.error('Failed to protect auctions')
      console.error(error)
    } finally {
      setIsProtecting(false)
    }
  }

  const adminAuctionIds = ADMIN_AUCTIONS_TEMPLATE.map(a => a.id)
  const activeAdminAuctions = (auctions || []).filter(a => 
    adminAuctionIds.includes(a.id) && a.status === 'active'
  )

  return (
    <div className="space-y-6">
      <Card className="gradient-border bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield size={32} weight="duotone" className="text-accent" />
            Admin Control Panel
          </CardTitle>
          <CardDescription>
            System owner tools for managing auctions and maintaining data integrity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Total Auctions</p>
              <p className="text-2xl font-bold">{(auctions || []).length}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Admin Auctions</p>
              <p className="text-2xl font-bold">{activeAdminAuctions.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Expected</p>
              <p className="text-2xl font-bold">{ADMIN_AUCTIONS_TEMPLATE.length}</p>
            </div>
          </div>

          {activeAdminAuctions.length < ADMIN_AUCTIONS_TEMPLATE.length && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm font-semibold text-destructive mb-1">⚠️ Missing Admin Auctions</p>
              <p className="text-xs text-muted-foreground">
                {ADMIN_AUCTIONS_TEMPLATE.length - activeAdminAuctions.length} admin auction(s) are missing. 
                Click "Restore Admin Auctions" to add them back.
              </p>
            </div>
          )}

          {activeAdminAuctions.length === ADMIN_AUCTIONS_TEMPLATE.length && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle size={16} weight="fill" />
                All Admin Auctions Active
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All {ADMIN_AUCTIONS_TEMPLATE.length} admin auctions are properly loaded and protected.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Database size={20} weight="duotone" />
                Auction Management
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                <Button
                  onClick={handleRestoreAuctions}
                  disabled={isRestoring}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  <ArrowsClockwise 
                    size={20} 
                    weight="bold" 
                    className={isRestoring ? 'animate-spin mr-2' : 'mr-2'} 
                  />
                  {isRestoring ? 'Restoring...' : 'Restore Admin Auctions'}
                </Button>
                <Button
                  onClick={handleProtectAuctions}
                  disabled={isProtecting}
                  variant="outline"
                  className="w-full"
                >
                  <Shield 
                    size={20} 
                    weight="bold" 
                    className={isProtecting ? 'animate-pulse mr-2' : 'mr-2'} 
                  />
                  {isProtecting ? 'Protecting...' : 'Protect Auctions'}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold mb-3">Admin Auction Status</h4>
              <div className="space-y-2">
                {ADMIN_AUCTIONS_TEMPLATE.map(template => {
                  const auction = (auctions || []).find(a => a.id === template.id)
                  const isActive = auction && auction.status === 'active'
                  
                  return (
                    <div key={template.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">{template.tokenName}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.amount} {template.tokenSymbol} • ${template.startingBid} starting bid
                        </p>
                      </div>
                      <Badge 
                        variant={isActive ? 'default' : 'destructive'}
                        className={isActive ? 'bg-green-500' : ''}
                      >
                        {isActive ? 'Active' : 'Missing'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Protection Rules</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>✓ Admin auctions are automatically protected every 60 seconds</li>
              <li>✓ Sync wallet only adds tokens, never removes them</li>
              <li>✓ Auction earnings are permanently protected</li>
              <li>✓ Spent tokens stay spent - no rollbacks allowed</li>
              <li>✓ All admin data verified on page load</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
