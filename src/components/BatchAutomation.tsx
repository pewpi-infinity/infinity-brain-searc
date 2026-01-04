import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Robot, Lightning, CheckCircle, Clock, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface BatchJob {
  id: string
  name: string
  description: string
  enabled: boolean
  frequency: number
  lastRun?: number
  nextRun?: number
}

const DEFAULT_JOBS: BatchJob[] = [
  { id: 'auto-auction', name: 'Auto-Create Auctions', description: 'Automatically create auctions for new tokens', enabled: false, frequency: 24 },
  { id: 'auto-price', name: 'Auto-Price Optimization', description: 'AI adjusts auction prices based on market', enabled: false, frequency: 6 },
  { id: 'auto-trade', name: 'Auto-Trade Stale Tokens', description: 'Transfer inactive tokens to active traders', enabled: false, frequency: 12 },
  { id: 'auto-redistribute', name: 'Auto-Redistribute Rewards', description: 'Distribute earnings to token holders', enabled: false, frequency: 24 },
  { id: 'auto-backup', name: 'Auto-Backup Data', description: 'Backup all tokens, auctions, and data', enabled: false, frequency: 168 },
  { id: 'auto-analyze', name: 'Auto-Analyze Repos', description: 'Score and mint tokens for quality repos', enabled: false, frequency: 12 },
]

export function BatchAutomation() {
  const [jobs, setJobs] = useKV<BatchJob[]>('batch-automation-jobs', DEFAULT_JOBS)
  const [globalSpeed, setGlobalSpeed] = useKV<number>('batch-automation-speed', 50)
  const [masterSwitch, setMasterSwitch] = useKV<boolean>('batch-automation-enabled', false)

  const toggleJob = (id: string) => {
    setJobs((current) =>
      (current || DEFAULT_JOBS).map((job) =>
        job.id === id
          ? { 
              ...job, 
              enabled: !job.enabled,
              nextRun: !job.enabled ? Date.now() + (job.frequency * 60 * 60 * 1000) : undefined
            }
          : job
      )
    )
    const job = (jobs || DEFAULT_JOBS).find(j => j.id === id)
    if (job) {
      toast.success(job.enabled ? `${job.name} Disabled` : `${job.name} Enabled`)
    }
  }

  const updateFrequency = (id: string, hours: number) => {
    setJobs((current) =>
      (current || DEFAULT_JOBS).map((job) =>
        job.id === id
          ? { 
              ...job, 
              frequency: hours,
              nextRun: job.enabled ? Date.now() + (hours * 60 * 60 * 1000) : undefined
            }
          : job
      )
    )
  }

  const enabledJobs = (jobs || DEFAULT_JOBS).filter(j => j.enabled).length
  const totalJobs = (jobs || DEFAULT_JOBS).length

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Robot size={32} weight="duotone" className="text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold">Batch Automation</h2>
              <p className="text-sm text-muted-foreground">Set it and forget it - AI handles everything</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={masterSwitch ? "default" : "secondary"} className="text-sm px-3 py-1">
              {masterSwitch ? '✅ All Systems Go' : '⏸️ Paused'}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white/50">
            <div className="text-center">
              <CheckCircle size={24} className="mx-auto mb-2 text-green-600" weight="duotone" />
              <div className="text-2xl font-bold text-green-600">{enabledJobs}/{totalJobs}</div>
              <div className="text-xs text-muted-foreground">Active Jobs</div>
            </div>
          </Card>
          <Card className="p-4 bg-white/50">
            <div className="text-center">
              <Lightning size={24} className="mx-auto mb-2 text-orange-600" weight="duotone" />
              <div className="text-2xl font-bold text-orange-600">{globalSpeed}%</div>
              <div className="text-xs text-muted-foreground">Processing Speed</div>
            </div>
          </Card>
          <Card className="p-4 bg-white/50">
            <div className="text-center">
              <ArrowsClockwise size={24} className="mx-auto mb-2 text-blue-600" weight="duotone" />
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-xs text-muted-foreground">Always Running</div>
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Processing Speed</Label>
            <span className="text-sm text-muted-foreground">{globalSpeed}%</span>
          </div>
          <Slider
            value={[globalSpeed || 50]}
            onValueChange={(value) => setGlobalSpeed(value[0])}
            max={100}
            step={10}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>🐢 Conservative</span>
            <span>🚀 Aggressive</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Robot size={24} weight="duotone" className="text-purple-600" />
            <div>
              <Label htmlFor="master-switch" className="cursor-pointer font-semibold text-base">
                Master Automation Switch
              </Label>
              <p className="text-xs text-muted-foreground">Enable all batch automations</p>
            </div>
          </div>
          <Switch
            id="master-switch"
            checked={masterSwitch}
            onCheckedChange={(checked) => {
              setMasterSwitch(checked)
              toast.success(checked ? '🤖 Batch Automation Activated' : '⏸️ Batch Automation Paused')
            }}
          />
        </div>
      </Card>

      <div className="grid gap-4">
        {(jobs || DEFAULT_JOBS).map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`p-4 ${job.enabled && masterSwitch ? 'bg-green-50 border-green-200' : 'bg-card'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {job.enabled && masterSwitch ? (
                      <CheckCircle size={20} weight="duotone" className="text-green-600" />
                    ) : (
                      <Clock size={20} weight="duotone" className="text-muted-foreground" />
                    )}
                    <h3 className="font-semibold">{job.name}</h3>
                    {job.enabled && masterSwitch && (
                      <Badge variant="outline" className="text-xs">
                        Every {job.frequency}h
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                  
                  {job.enabled && (
                    <div className="space-y-2">
                      <Label className="text-xs">Run Frequency (Hours)</Label>
                      <div className="flex gap-2">
                        {[1, 6, 12, 24, 168].map((hours) => (
                          <Button
                            key={hours}
                            size="sm"
                            variant={job.frequency === hours ? "default" : "outline"}
                            onClick={() => updateFrequency(job.id, hours)}
                          >
                            {hours === 168 ? 'Weekly' : `${hours}h`}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Switch
                  checked={job.enabled}
                  onCheckedChange={() => toggleJob(job.id)}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <p className="text-sm text-amber-900">
          💡 <strong>How it works:</strong> Enable the jobs you want automated. Set frequencies for each task. 
          The Master Switch controls everything - turn it off to pause all automations instantly.
          Like a racing game's auto-pilot - you're always in control! 🏎️
        </p>
      </Card>
    </div>
  )
}
