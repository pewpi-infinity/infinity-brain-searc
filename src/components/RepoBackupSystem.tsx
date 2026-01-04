import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Database,
  DownloadSimple,
  Upload,
  Clock,
  CheckCircle,
  Warning,
  FolderOpen,
  GitBranch
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAuth } from '@/lib/auth'

interface BackupRecord {
  id: string
  userId: string
  username: string
  timestamp: number
  dataType: 'tokens' | 'auctions' | 'transactions' | 'full'
  size: number
  status: 'success' | 'pending' | 'failed'
  repoUrl?: string
}

export function RepoBackupSystem() {
  const { userProfile, isAuthenticated, currentUser } = useAuth()
  const [backups, setBackups] = useLocalStorage<BackupRecord[]>('user-backups', [])
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  
  const [allTokens] = useLocalStorage<Record<string, any>>('business-tokens', {})
  const [auctions] = useLocalStorage<any[]>('token-auctions', [])
  const [transactions] = useLocalStorage<any[]>('transaction-history', [])

  const userBackups = backups?.filter(b => b.userId === userProfile?.userId) || []

  const createBackup = async (dataType: 'tokens' | 'auctions' | 'transactions' | 'full') => {
    if (!isAuthenticated || !userProfile) {
      toast.error('Please log in to create backups')
      return
    }

    setIsBackingUp(true)
    setBackupProgress(0)

    try {
      let backupData: any = {}
      let dataSize = 0

      setBackupProgress(20)

      if (dataType === 'tokens' || dataType === 'full') {
        backupData.tokens = userProfile.businessTokens
        dataSize += JSON.stringify(backupData.tokens).length
      }

      setBackupProgress(40)

      if (dataType === 'auctions' || dataType === 'full') {
        const userAuctions = auctions?.filter(
          a => a.creatorId === userProfile.userId || 
               a.bids.some((b: any) => b.bidderId === userProfile.userId)
        ) || []
        backupData.auctions = userAuctions
        dataSize += JSON.stringify(userAuctions).length
      }

      setBackupProgress(60)

      if (dataType === 'transactions' || dataType === 'full') {
        const userTransactions = transactions?.filter(
          t => t.senderId === userProfile.userId || t.recipientId === userProfile.userId
        ) || []
        backupData.transactions = userTransactions
        dataSize += JSON.stringify(userTransactions).length
      }

      setBackupProgress(80)

      backupData.metadata = {
        userId: userProfile.userId,
        username: userProfile.username,
        backupDate: new Date().toISOString(),
        dataType,
        version: '1.0'
      }

      const backupRecord: BackupRecord = {
        id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: userProfile.userId,
        username: userProfile.username,
        timestamp: Date.now(),
        dataType,
        size: dataSize,
        status: 'success',
        repoUrl: `https://github.com/${currentUser?.username}/infinity-backups`
      }

      setBackups((current) => [...(current || []), backupRecord])

      const backupJson = JSON.stringify(backupData, null, 2)
      const blob = new Blob([backupJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `infinity-backup-${dataType}-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setBackupProgress(100)
      toast.success(`${dataType} backup created successfully!`, {
        description: `Downloaded backup file (${(dataSize / 1024).toFixed(2)} KB)`
      })

    } catch (error) {
      console.error('Backup error:', error)
      toast.error('Backup failed', {
        description: 'Please try again'
      })
    } finally {
      setIsBackingUp(false)
      setTimeout(() => setBackupProgress(0), 2000)
    }
  }

  const restoreBackup = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const text = await file.text()
        const backupData = JSON.parse(text)

        if (!backupData.metadata || backupData.metadata.userId !== userProfile?.userId) {
          toast.error('Invalid backup file', {
            description: 'This backup does not belong to your account'
          })
          return
        }

        toast.info('Backup restore is a manual process', {
          description: 'Please contact support to restore your data from backup',
          duration: 5000
        })

      } catch (error) {
        toast.error('Failed to read backup file')
      }
    }

    input.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-6 text-center">
        <Database size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Repository Backup System</h3>
        <p className="text-sm text-muted-foreground">
          Log in to backup your token exchanges and data
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 gradient-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
            <Database size={32} weight="duotone" className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Repository Backup System</h2>
            <p className="text-sm text-muted-foreground">
              Secure your token exchanges, auctions, and transaction data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Button
            onClick={() => createBackup('tokens')}
            disabled={isBackingUp}
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
          >
            <FolderOpen size={24} weight="duotone" />
            <span className="text-sm">Backup Tokens</span>
          </Button>

          <Button
            onClick={() => createBackup('auctions')}
            disabled={isBackingUp}
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
          >
            <GitBranch size={24} weight="duotone" />
            <span className="text-sm">Backup Auctions</span>
          </Button>

          <Button
            onClick={() => createBackup('transactions')}
            disabled={isBackingUp}
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
          >
            <Clock size={24} weight="duotone" />
            <span className="text-sm">Backup Transactions</span>
          </Button>

          <Button
            onClick={() => createBackup('full')}
            disabled={isBackingUp}
            className="h-auto flex-col gap-2 py-4 bg-gradient-to-r from-primary to-accent"
          >
            <DownloadSimple size={24} weight="duotone" />
            <span className="text-sm">Full Backup</span>
          </Button>
        </div>

        {isBackingUp && (
          <Card className="p-4 mb-6 bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Creating backup...</span>
                <span className="font-medium">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} />
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Button
            onClick={restoreBackup}
            variant="outline"
            className="flex-1"
          >
            <Upload size={20} weight="bold" className="mr-2" />
            Restore from Backup
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Backup History</h3>
        
        {userBackups.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {userBackups
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((backup) => (
                  <Card key={backup.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          backup.status === 'success' 
                            ? 'bg-green-500/10 text-green-500'
                            : backup.status === 'failed'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {backup.status === 'success' ? (
                            <CheckCircle size={20} weight="duotone" />
                          ) : (
                            <Warning size={20} weight="duotone" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium capitalize">{backup.dataType} Backup</h4>
                            <Badge variant={backup.status === 'success' ? 'default' : 'destructive'}>
                              {backup.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <Clock size={14} className="inline mr-1" />
                              {new Date(backup.timestamp).toLocaleString()}
                            </p>
                            <p>Size: {formatFileSize(backup.size)}</p>
                            {backup.repoUrl && (
                              <a 
                                href={backup.repoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-accent hover:underline flex items-center gap-1"
                              >
                                <GitBranch size={14} />
                                View Repository
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Database size={48} weight="duotone" className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No backups yet</p>
            <p className="text-xs mt-1">Create your first backup to secure your data</p>
          </div>
        )}
      </Card>
    </div>
  )
}
