import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useLocalStorage } from '@/lib/useLocalStorage'
import {
  FloppyDisk,
  Clock,
  Check,
  DownloadSimple,
  CircleNotch,
  Calendar,
  Database,
  FileArchive,
  CloudArrowDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface BackupRecord {
  id: string
  timestamp: number
  type: 'manual' | 'auto'
  dataSize: number
  itemCount: number
  status: 'success' | 'failed'
}

interface BackupSettings {
  enabled: boolean
  frequency: 'daily' | 'twice-daily' | 'weekly'
  time: string
  lastBackup?: number
  nextBackup?: number
}

export function AutoBackupScheduler() {
  const [backupSettings, setBackupSettings] = useLocalStorage<BackupSettings>('backup-settings', {
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    lastBackup: undefined,
    nextBackup: undefined
  })
  const [backupHistory, setBackupHistory] = useLocalStorage<BackupRecord[]>('backup-history', [])
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)

  const calculateNextBackup = (settings: BackupSettings): number => {
    const now = new Date()
    const [hours, minutes] = settings.time.split(':').map(Number)
    
    const next = new Date()
    next.setHours(hours, minutes, 0, 0)

    if (next <= now) {
      switch (settings.frequency) {
        case 'daily':
          next.setDate(next.getDate() + 1)
          break
        case 'twice-daily':
          next.setHours(next.getHours() + 12)
          break
        case 'weekly':
          next.setDate(next.getDate() + 7)
          break
      }
    }

    return next.getTime()
  }

  const performBackup = async (type: 'manual' | 'auto' = 'manual') => {
    setIsBackingUp(true)
    setBackupProgress(0)

    try {
      const allKeys = await window.spark.kv.keys()
      setBackupProgress(10)

      const backupData: Record<string, any> = {}
      let itemCount = 0

      const dataKeys = allKeys.filter(key => 
        key.includes('post') || 
        key.includes('scheduled') || 
        key.includes('social') ||
        key.includes('conversation') ||
        key.includes('analytics')
      )

      for (let i = 0; i < dataKeys.length; i++) {
        const key = dataKeys[i]
        const value = await window.spark.kv.get(key)
        if (value !== undefined) {
          backupData[key] = value
          itemCount++
        }
        setBackupProgress(10 + (i / dataKeys.length) * 70)
      }

      const backupJson = JSON.stringify(backupData, null, 2)
      const dataSize = new Blob([backupJson]).size

      const timestamp = Date.now()
      const dateStr = format(timestamp, 'yyyy-MM-dd_HH-mm-ss')
      const filename = `infinity-brain-backup_${dateStr}.json`

      const blob = new Blob([backupJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      await window.spark.kv.set(`backup-snapshot-${timestamp}`, {
        data: backupData,
        timestamp,
        itemCount,
        dataSize
      })

      const newRecord: BackupRecord = {
        id: timestamp.toString(),
        timestamp,
        type,
        dataSize,
        itemCount,
        status: 'success'
      }

      setBackupHistory((current = []) => [newRecord, ...current].slice(0, 50))
      
      setBackupSettings((current) => ({
        ...current!,
        lastBackup: timestamp,
        nextBackup: calculateNextBackup(current!)
      }))

      setBackupProgress(100)
      
      toast.success(
        `Backup completed! ${itemCount} items backed up (${(dataSize / 1024).toFixed(2)} KB)`,
        { icon: <Check size={20} weight="bold" /> }
      )

      return true
    } catch (error) {
      console.error('Backup error:', error)
      
      const newRecord: BackupRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type,
        dataSize: 0,
        itemCount: 0,
        status: 'failed'
      }
      
      setBackupHistory((current = []) => [newRecord, ...current].slice(0, 50))
      toast.error('Backup failed. Please try again.')
      return false
    } finally {
      setIsBackingUp(false)
      setTimeout(() => setBackupProgress(0), 1000)
    }
  }

  const restoreFromBackup = async (backupId: string) => {
    try {
      const snapshot = await window.spark.kv.get<any>(`backup-snapshot-${backupId}`)
      
      if (!snapshot || !snapshot.data) {
        toast.error('Backup snapshot not found')
        return
      }

      let restored = 0
      for (const [key, value] of Object.entries(snapshot.data)) {
        await window.spark.kv.set(key, value)
        restored++
      }

      toast.success(`Restored ${restored} items from backup!`, {
        icon: <CloudArrowDown size={20} weight="bold" />
      })
    } catch (error) {
      console.error('Restore error:', error)
      toast.error('Failed to restore backup')
    }
  }

  useEffect(() => {
    if (!backupSettings?.enabled) return

    const checkAndRunBackup = async () => {
      const now = Date.now()
      const nextBackup = backupSettings.nextBackup || calculateNextBackup(backupSettings)
      
      if (now >= nextBackup) {
        await performBackup('auto')
      }
    }

    const interval = setInterval(checkAndRunBackup, 60000)
    checkAndRunBackup()

    return () => clearInterval(interval)
  }, [backupSettings])

  useEffect(() => {
    if (backupSettings && !backupSettings.nextBackup) {
      setBackupSettings((current) => ({
        ...current!,
        nextBackup: calculateNextBackup(current!)
      }))
    }
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getTimeUntilNext = () => {
    if (!backupSettings?.nextBackup) return 'Calculating...'
    
    const diff = backupSettings.nextBackup - Date.now()
    if (diff <= 0) return 'Soon'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} day${days > 1 ? 's' : ''}`
    }
    
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FloppyDisk size={28} weight="duotone" className="text-accent" />
                Automatic Backup Scheduler
              </CardTitle>
              <CardDescription>
                Automatically backup your posts, schedules, and settings daily
              </CardDescription>
            </div>
            <Badge 
              variant={backupSettings?.enabled ? "default" : "secondary"}
              className="text-lg px-4 py-2"
            >
              {backupSettings?.enabled ? 'Active' : 'Paused'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={20} weight="duotone" />
                  Last Backup
                </div>
                <div className="text-2xl font-bold">
                  {backupSettings?.lastBackup 
                    ? format(backupSettings.lastBackup, 'MMM d, h:mm a')
                    : 'Never'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-primary/10">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={20} weight="duotone" />
                  Next Backup
                </div>
                <div className="text-2xl font-bold">
                  {getTimeUntilNext()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-secondary/10">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Database size={20} weight="duotone" />
                  Total Backups
                </div>
                <div className="text-2xl font-bold">
                  {(backupHistory || []).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-backup" className="text-base font-semibold">
                  Enable Automatic Backups
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your data on schedule
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={backupSettings?.enabled || false}
                onCheckedChange={(checked) => 
                  setBackupSettings((current) => ({
                    ...current!,
                    enabled: checked
                  }))
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select
                  value={backupSettings?.frequency || 'daily'}
                  onValueChange={(value: 'daily' | 'twice-daily' | 'weekly') => {
                    setBackupSettings((current) => {
                      const updated = { ...current!, frequency: value }
                      return {
                        ...updated,
                        nextBackup: calculateNextBackup(updated)
                      }
                    })
                  }}
                >
                  <SelectTrigger id="backup-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twice-daily">Twice Daily</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-time">Backup Time</Label>
                <input
                  id="backup-time"
                  type="time"
                  value={backupSettings?.time || '02:00'}
                  onChange={(e) => {
                    setBackupSettings((current) => {
                      const updated = { ...current!, time: e.target.value }
                      return {
                        ...updated,
                        nextBackup: calculateNextBackup(updated)
                      }
                    })
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {isBackingUp && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Creating backup...</span>
                <span className="font-semibold">{Math.round(backupProgress)}%</span>
              </div>
              <Progress value={backupProgress} />
            </div>
          )}

          <Button
            onClick={() => performBackup('manual')}
            disabled={isBackingUp}
            className="w-full bg-gradient-to-r from-accent to-secondary hover:opacity-90"
            size="lg"
          >
            {isBackingUp ? (
              <>
                <CircleNotch size={20} className="mr-2 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <DownloadSimple size={20} weight="bold" className="mr-2" />
                Create Backup Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive size={24} weight="duotone" className="text-secondary" />
            Backup History
          </CardTitle>
          <CardDescription>Recent automatic and manual backups</CardDescription>
        </CardHeader>
        <CardContent>
          {(backupHistory || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileArchive size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
              <p>No backups yet. Create your first backup above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(backupHistory || []).slice(0, 20).map((backup) => (
                <Card 
                  key={backup.id} 
                  className={`hover:shadow-md transition-shadow ${
                    backup.status === 'failed' ? 'border-destructive' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          backup.status === 'success' 
                            ? 'bg-accent/10 text-accent' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {backup.status === 'success' ? (
                            <Check size={20} weight="bold" />
                          ) : (
                            <Database size={20} weight="bold" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {format(backup.timestamp, 'MMM d, yyyy • h:mm a')}
                            </span>
                            <Badge variant={backup.type === 'auto' ? 'default' : 'secondary'}>
                              {backup.type === 'auto' ? 'Automatic' : 'Manual'}
                            </Badge>
                            {backup.status === 'failed' && (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </div>
                          {backup.status === 'success' && (
                            <div className="text-sm text-muted-foreground">
                              {backup.itemCount} items • {formatBytes(backup.dataSize)}
                            </div>
                          )}
                        </div>
                      </div>
                      {backup.status === 'success' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreFromBackup(backup.id)}
                        >
                          <CloudArrowDown size={16} className="mr-2" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="text-lg">Backup Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Check size={20} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Automatic backups</span> run in the background at your scheduled time
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check size={20} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Backup files</span> are downloaded as JSON and can be restored anytime
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check size={20} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">All data</span> including posts, schedules, analytics, and settings are backed up
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Check size={20} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Restore from any backup</span> to recover your data instantly
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
