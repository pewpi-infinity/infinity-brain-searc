import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, CheckCircle, XCircle, Pulse } from '@phosphor-icons/react'
import { initializeBrain, getBrainStatus, type BrainConfig } from '@/lib/brainConnector'

export function BrainStatus() {
  const [config, setConfig] = useState<BrainConfig | null>(null)
  const [status, setStatus] = useState({ connected: false, message: '' })

  useEffect(() => {
    checkBrainConnection()
    
    // Check connection every 30 seconds
    const interval = setInterval(checkBrainConnection, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const checkBrainConnection = async () => {
    const brainConfig = await initializeBrain()
    setConfig(brainConfig)
    setStatus(getBrainStatus())
  }

  if (!config) {
    return null
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 bg-card/95 backdrop-blur border-2 border-accent/30 shadow-2xl z-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Brain
              size={32}
              weight="duotone"
              className={config.isConnected ? 'text-green-500' : 'text-red-500'}
            />
            {config.isConnected && (
              <Pulse
                size={12}
                weight="fill"
                className="text-green-500 absolute -top-1 -right-1 animate-pulse"
              />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">Brain Status</h3>
              {config.isConnected ? (
                <CheckCircle size={16} weight="fill" className="text-green-500" />
              ) : (
                <XCircle size={16} weight="fill" className="text-red-500" />
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {status.message}
            </p>

            {config.isConnected && (
              <>
                <div className="flex flex-wrap gap-1 mb-2">
                  {config.capabilities.map(cap => (
                    <Badge
                      key={cap}
                      variant="secondary"
                      className="text-xs"
                    >
                      {cap.split('-')[0].toUpperCase()}
                    </Badge>
                  ))}
                </div>
                
                {config.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {new Date(config.lastSync).toLocaleTimeString()}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
