import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Robot, User, Lightning, Gauge, Timer } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface AutoPilotSection {
  id: string
  name: string
  description: string
  enabled: boolean
  manualControlHours: number
}

const DEFAULT_SECTIONS: AutoPilotSection[] = [
  { id: 'auctions', name: 'Auction Management', description: 'Auto-create, price, and list auctions', enabled: false, manualControlHours: 0 },
  { id: 'trading', name: 'Token Trading', description: 'Auto-trade and transfer stale coins', enabled: false, manualControlHours: 0 },
  { id: 'pricing', name: 'Price Optimization', description: 'AI-powered dynamic pricing', enabled: false, manualControlHours: 0 },
  { id: 'redistribution', name: 'Token Redistribution', description: 'Move inactive tokens to active traders', enabled: false, manualControlHours: 0 },
  { id: 'analytics', name: 'Market Analysis', description: 'Monitor trends and opportunities', enabled: false, manualControlHours: 0 },
  { id: 'quality', name: 'Quality Scoring', description: 'Auto-score repos and mint tokens', enabled: false, manualControlHours: 0 },
]

export function AutoPilotControl() {
  const [sections, setSections] = useKV<AutoPilotSection[]>('autopilot-sections', DEFAULT_SECTIONS)
  const [globalSpeed, setGlobalSpeed] = useKV<number>('autopilot-speed', 50)
  const [raceMode, setRaceMode] = useKV<boolean>('race-mode-enabled', false)

  const handleToggleSection = (id: string) => {
    setSections((current) =>
      (current || DEFAULT_SECTIONS).map((section) =>
        section.id === id
          ? { ...section, enabled: !section.enabled, manualControlHours: section.enabled ? 0 : section.manualControlHours }
          : section
      )
    )
    const section = (sections || DEFAULT_SECTIONS).find(s => s.id === id)
    toast.success(section?.enabled ? `${section.name} Auto-Pilot Disabled` : `${section?.name} Auto-Pilot Enabled`)
  }

  const handleSetManualControl = (id: string, hours: number) => {
    setSections((current) =>
      (current || DEFAULT_SECTIONS).map((section) =>
        section.id === id
          ? { ...section, manualControlHours: hours }
          : section
      )
    )
    toast.info(`Manual control for ${hours}h`, {
      description: 'Auto-pilot will resume after your shift ends'
    })
  }

  const enabledCount = (sections || DEFAULT_SECTIONS).filter(s => s.enabled).length
  const manualCount = (sections || DEFAULT_SECTIONS).filter(s => s.manualControlHours > 0).length

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Gauge size={32} weight="duotone" className="text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold">Auto-Pilot Control Center</h2>
              <p className="text-sm text-muted-foreground">Racing game style automation - shift gears between manual and auto</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={raceMode ? "default" : "secondary"} className="text-sm px-3 py-1">
              {raceMode ? '🏎️ Race Mode Active' : '🚗 Cruise Mode'}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white/50">
            <div className="text-center">
              <Robot size={24} className="mx-auto mb-2 text-green-600" weight="duotone" />
              <div className="text-2xl font-bold text-green-600">{enabledCount}</div>
              <div className="text-xs text-muted-foreground">Auto-Pilot Active</div>
            </div>
          </Card>
          <Card className="p-4 bg-white/50">
            <div className="text-center">
              <User size={24} className="mx-auto mb-2 text-blue-600" weight="duotone" />
              <div className="text-2xl font-bold text-blue-600">{manualCount}</div>
              <div className="text-xs text-muted-foreground">Manual Control</div>
            </div>
          </Card>
          <Card className="p-4 bg-white/50">
            <div className="text-center">
              <Lightning size={24} className="mx-auto mb-2 text-orange-600" weight="duotone" />
              <div className="text-2xl font-bold text-orange-600">{globalSpeed}%</div>
              <div className="text-xs text-muted-foreground">Global Speed</div>
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Global Speed Control</Label>
            <span className="text-sm text-muted-foreground">{globalSpeed || 50}% throttle</span>
          </div>
          <Slider
            value={[globalSpeed || 50]}
            onValueChange={(value) => setGlobalSpeed(value[0])}
            max={100}
            step={10}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>🐌 Slow</span>
            <span>⚡ Turbo</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <Gauge size={20} weight="duotone" />
            <Label htmlFor="race-mode" className="cursor-pointer font-medium">Race Mode</Label>
          </div>
          <Switch
            id="race-mode"
            checked={raceMode}
            onCheckedChange={(checked) => {
              setRaceMode(checked)
              toast.success(checked ? '🏎️ Race Mode Activated!' : '🚗 Switched to Cruise Mode')
            }}
          />
        </div>
      </Card>

      <div className="grid gap-4">
        {(sections || DEFAULT_SECTIONS).map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`p-4 ${section.enabled ? 'bg-green-50 border-green-200' : 'bg-card'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {section.enabled ? (
                      <Robot size={20} weight="duotone" className="text-green-600" />
                    ) : (
                      <User size={20} weight="duotone" className="text-muted-foreground" />
                    )}
                    <h3 className="font-semibold">{section.name}</h3>
                    {section.manualControlHours > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Timer size={12} className="mr-1" />
                        {section.manualControlHours}h shift
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                  
                  {section.enabled && (
                    <div className="space-y-2">
                      <Label className="text-xs">Take Manual Control (Hours)</Label>
                      <div className="flex gap-2">
                        {[1, 2, 4, 8].map((hours) => (
                          <Button
                            key={hours}
                            size="sm"
                            variant={section.manualControlHours === hours ? "default" : "outline"}
                            onClick={() => handleSetManualControl(section.id, hours)}
                          >
                            {hours}h
                          </Button>
                        ))}
                        {section.manualControlHours > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSetManualControl(section.id, 0)}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <Switch
                  checked={section.enabled}
                  onCheckedChange={() => handleToggleSection(section.id)}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <p className="text-sm text-amber-900">
          💡 <strong>How it works:</strong> Enable auto-pilot for any system to let AI handle it. 
          When you want to take control, set a manual shift (1-8 hours). Auto-pilot resumes after your shift ends.
          Like a racing game - shift between manual and automatic transmission!
        </p>
      </Card>
    </div>
  )
}
