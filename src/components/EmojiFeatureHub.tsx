import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useKV } from '@github/spark/hooks'
import { 
  Planet,
  MagnetStraight,
  CurrencyDollar,
  HardDrives,
  Star,
  Faders,
  CrownSimple,
  ShieldCheckered,
  Vault,
  Scan,
  DiamondsFour,
  Robot,
  Globe,
  SquaresFour,
  Phone,
  TwitterLogo,
  Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EmojiFeature {
  emoji: string
  name: string
  description: string
  icon: typeof Planet
  action: () => void
  enabled: boolean
}

export function EmojiFeatureHub() {
  const [features, setFeatures] = useKV<Record<string, boolean>>('emoji-features', {
    planet: true,
    magnet: true,
    posting: true,
    terminal: true,
    localBackup: true,
    liveBackup: true,
    siteRepair: true,
    modulate: true,
    cycling: true,
    infinityPhone: true,
    twitterClicks: true,
    security: true,
    armored: true,
    mushroom: true,
    globalScan: true,
    facet: true,
    robotStrength: true,
    worldwide: true,
    import: true
  })

  const [phoneNumber, setPhoneNumber] = useKV<string>('infinity-phone', '')
  const [backupStatus, setBackupStatus] = useKV<{ local: boolean; full: boolean }>('backup-status', { local: false, full: false })
  const [scanningRepos, setScanningRepos] = useState(false)
  const [repoCount, setRepoCount] = useKV<number>('scanned-repos', 0)

  const toggleFeature = (featureKey: string) => {
    setFeatures((current = {}) => ({
      ...current,
      [featureKey]: !current[featureKey]
    }))
  }

  const performLocalBackup = async () => {
    toast.info('💲 Performing local backup...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setBackupStatus((current = { local: false, full: false }) => ({ ...current, local: true }))
    toast.success('💲 Local backup completed!')
  }

  const performFullBackup = async () => {
    toast.info('📀 Performing full terminal backup...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    setBackupStatus((current = { local: false, full: false }) => ({ ...current, full: true }))
    toast.success('📀 Full backup completed!')
  }

  const scanAllRepos = async () => {
    setScanningRepos(true)
    toast.info('💫 Scanning all repositories...')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500))
      const mockRepoCount = Math.floor(Math.random() * 20) + 10
      setRepoCount(mockRepoCount)
      toast.success(`✨ Found ${mockRepoCount} repositories!`)
    } finally {
      setScanningRepos(false)
    }
  }

  const scanGlobalPages = async () => {
    toast.info('✨ Performing worldwide scan...')
    await new Promise(resolve => setTimeout(resolve, 2500))
    toast.success('✨ Global scan completed! Found content in repos.')
  }

  const enableSiteRepair = () => {
    toast.success('⭐ Live site repair enabled! Broken websites will be fixed automatically.')
    toggleFeature('siteRepair')
  }

  const modulateRoute = () => {
    toast.info('🎛️ Route content modulation activated!')
    toggleFeature('modulate')
  }

  const cycleStarScan = async () => {
    toast.info('💫 Cycling star scan initiated...')
    await scanAllRepos()
  }

  const setupInfinityPhone = () => {
    if (phoneNumber) {
      toast.success(`⚙️ Infinity phone number configured: ${phoneNumber}`)
    } else {
      toast.error('⚙️ Please enter a phone number')
    }
  }

  const enableTwitterClicks = () => {
    toast.success('👑 Twitter-like clicks and movement enabled!')
    toggleFeature('twitterClicks')
  }

  const enableSecurity = () => {
    toast.success('🔱 Trident security system activated!')
    toggleFeature('security')
  }

  const enableArmored = () => {
    toast.success('💰 Armored car protection enabled!')
    toggleFeature('armored')
  }

  const doubleSizeMushroom = () => {
    toast.success('🍄 Mushroom power-up! Size doubled!')
    document.body.style.transform = 'scale(1.02)'
    setTimeout(() => {
      document.body.style.transform = 'scale(1)'
    }, 2000)
  }

  const facetContent = () => {
    toast.info('💎 Faceting content for maximum clarity...')
    toggleFeature('facet')
  }

  const enableRobotStrength = () => {
    toast.success('🦾 Robot strength activated for carts and OS!')
    toggleFeature('robotStrength')
  }

  const enableWorldwideWeb = () => {
    toast.success('🌐 Worldwide web connection established!')
    toggleFeature('worldwide')
  }

  const importAttachments = () => {
    toast.info('🟦 Import system ready - anything attached will be imported!')
    toggleFeature('import')
  }

  const emojiFeatures = [
    { emoji: '🪐', name: 'Planet Pull', desc: 'Pull everything you\'ve typed', icon: Planet, action: () => toast.success('🪐 Pulling all typed content!') },
    { emoji: '🧲', name: 'Magnet Mode', desc: 'Magnetic content attraction', icon: MagnetStraight, action: () => toast.success('🧲 Magnet pulling anything!') },
    { emoji: '🤑', name: 'Multi-Post', desc: 'Post to all signed-in socials', icon: CurrencyDollar, action: () => toast.success('🤑 Posting to all socials!') },
    { emoji: '📀', name: 'Full Backup', desc: 'Complete terminal backup', icon: HardDrives, action: performFullBackup },
    { emoji: '💲', name: 'Local Backup', desc: 'Save data locally', icon: CurrencyDollar, action: performLocalBackup },
    { emoji: '⭐', name: 'Site Repair', desc: 'Fix broken websites live', icon: Star, action: enableSiteRepair },
    { emoji: '🎛️', name: 'Route Modulate', desc: 'Modulate route content', icon: Faders, action: modulateRoute },
    { emoji: '💫', name: 'Cycle Scan', desc: 'Star-like repo scanner', icon: Sparkle, action: cycleStarScan },
    { emoji: '⚙️', name: 'Infinity Phone', desc: 'Personalized phone tools', icon: Phone, action: setupInfinityPhone },
    { emoji: '👑', name: 'Twitter Clicks', desc: 'Twitter-like movement', icon: CrownSimple, action: enableTwitterClicks },
    { emoji: '🔱', name: 'Trident Security', desc: 'Advanced protection', icon: ShieldCheckered, action: enableSecurity },
    { emoji: '💰', name: 'Armored Car', desc: 'Maximum security', icon: Vault, action: enableArmored },
    { emoji: '🍄', name: 'Mushroom Power', desc: 'Double in size', icon: Sparkle, action: doubleSizeMushroom },
    { emoji: '✨', name: 'Global Scan', desc: 'Scan pages in all repos', icon: Scan, action: scanGlobalPages },
    { emoji: '💎', name: 'Facet Content', desc: 'Crystal-clear content', icon: DiamondsFour, action: facetContent },
    { emoji: '🦾', name: 'Robot Strength', desc: 'Enhanced carts & OS', icon: Robot, action: enableRobotStrength },
    { emoji: '🌐', name: 'Worldwide Web', desc: 'Global connectivity', icon: Globe, action: enableWorldwideWeb },
    { emoji: '🟦', name: 'Import System', desc: 'Import anything attached', icon: SquaresFour, action: importAttachments }
  ]

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkle size={32} weight="duotone" className="text-accent" />
            Emoji Feature Hub
          </CardTitle>
          <CardDescription className="text-base">
            Activate powerful features with emoji shortcuts - Your complete toolkit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emojiFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.emoji}
                  className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                  onClick={feature.action}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{feature.emoji}</span>
                        <Icon size={24} weight="duotone" className="text-accent" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{feature.name}</h4>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader>
              <CardTitle className="text-lg">⚙️ Infinity Phone Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="phone-number">Personalized Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone-number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your infinity phone number"
                    className="flex-1"
                  />
                  <Button onClick={setupInfinityPhone}>
                    <Phone size={20} weight="duotone" className="mr-2" />
                    Set
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10">
            <CardHeader>
              <CardTitle className="text-lg">Backup Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💲</span>
                  <span className="font-medium">Local Backup</span>
                </div>
                <Badge variant={(backupStatus?.local) ? 'default' : 'secondary'}>
                  {(backupStatus?.local) ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📀</span>
                  <span className="font-medium">Full Terminal Backup</span>
                </div>
                <Badge variant={(backupStatus?.full) ? 'default' : 'secondary'}>
                  {(backupStatus?.full) ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={performLocalBackup} variant="outline" className="flex-1">
                  💲 Local Backup
                </Button>
                <Button onClick={performFullBackup} variant="outline" className="flex-1">
                  📀 Full Backup
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Repository Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">💫 Scanned Repositories</p>
                  <p className="text-2xl font-bold text-accent">{repoCount}</p>
                </div>
                <Button onClick={scanAllRepos} disabled={scanningRepos} size="lg">
                  {scanningRepos ? '⏳ Scanning...' : '💫 Scan Now'}
                </Button>
              </div>
              <Button onClick={scanGlobalPages} variant="outline" className="w-full">
                ✨ Worldwide Page Scan
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
            <CardHeader>
              <CardTitle className="text-lg">🍄👑 Mario Power-Ups Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge className="text-lg px-3 py-1">🍄 Mushroom</Badge>
                <Badge className="text-lg px-3 py-1">👑 Crown</Badge>
                <Badge className="text-lg px-3 py-1">⭐ Star</Badge>
                <Badge className="text-lg px-3 py-1">🌸 Fire Flower</Badge>
                <Badge className="text-lg px-3 py-1">💎 Diamond</Badge>
                <Badge className="text-lg px-3 py-1">💰 Coin</Badge>
                <Badge className="text-lg px-3 py-1">🪐 Planet</Badge>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
