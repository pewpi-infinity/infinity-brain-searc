import { useKV } from '@github/spark/hooks'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Shield, ShieldCheck } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export function SafeModeToggle() {
  const [safeMode, setSafeMode] = useKV<boolean>('safe-mode-enabled', true)
  
  const handleToggle = (checked: boolean) => {
    setSafeMode(checked)
    if (checked) {
      toast.success('Safe Mode Enabled', {
        description: 'Advanced options hidden, irreversible actions prevented'
      })
    } else {
      toast.info('Safe Mode Disabled', {
        description: 'All features now accessible. Use caution.'
      })
    }
  }

  return (
    <Card className="p-4 bg-card/80 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {safeMode ? (
            <ShieldCheck size={24} weight="duotone" className="text-green-600" />
          ) : (
            <Shield size={24} weight="duotone" className="text-yellow-600" />
          )}
          <div>
            <Label htmlFor="safe-mode" className="text-base font-semibold cursor-pointer">
              {safeMode ? '🔒 Safe Mode (On)' : '🔓 Safe Mode (Off)'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {safeMode 
                ? 'Hides advanced options and prevents irreversible actions'
                : 'All features available - proceed with caution'
              }
            </p>
          </div>
        </div>
        <Switch
          id="safe-mode"
          checked={safeMode}
          onCheckedChange={handleToggle}
        />
      </div>
    </Card>
  )
}

export function useSafeMode() {
  const [safeMode] = useKV<boolean>('safe-mode-enabled', true)
  return safeMode
}
