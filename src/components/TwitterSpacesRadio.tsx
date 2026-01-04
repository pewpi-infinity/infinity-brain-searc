import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Radio, Play, Pause, SkipForward, SkipBack, MagnifyingGlass, CaretRight, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface TwitterSpace {
  id: string
  title: string
  hostName: string
  hostAvatar?: string
  participantCount: number
  isLive: boolean
  startedAt: number
  topics: string[]
  url: string
}

export function TwitterSpacesRadio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSpaceIndex, setCurrentSpaceIndex] = useState(0)
  const [volume, setVolume] = useState([70])
  const [searchQuery, setSearchQuery] = useState('')
  const [spaces, setSpaces] = useLocalStorage<TwitterSpace[]>('twitter-spaces-feed', [])
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorite-spaces', [])

  useEffect(() => {
    const initializeSpaces = async () => {
      if (!spaces || spaces.length === 0) {
        const demoSpaces: TwitterSpace[] = [
          {
            id: 'space-1',
            title: 'Web3 & Cryptocurrency Trading Strategies',
            hostName: '@crypto_insights',
            participantCount: 1247,
            isLive: true,
            startedAt: Date.now() - 3600000,
            topics: ['crypto', 'trading', 'web3'],
            url: 'https://twitter.com/i/spaces/demo1'
          },
          {
            id: 'space-2',
            title: 'Building the Future: AI & Blockchain',
            hostName: '@tech_pioneers',
            participantCount: 892,
            isLive: true,
            startedAt: Date.now() - 7200000,
            topics: ['AI', 'blockchain', 'innovation'],
            url: 'https://twitter.com/i/spaces/demo2'
          },
          {
            id: 'space-3',
            title: 'NFT Art Market Discussion',
            hostName: '@nft_community',
            participantCount: 634,
            isLive: true,
            startedAt: Date.now() - 1800000,
            topics: ['NFT', 'art', 'marketplace'],
            url: 'https://twitter.com/i/spaces/demo3'
          },
          {
            id: 'space-4',
            title: 'Tokenomics 101: Building Sustainable Economies',
            hostName: '@infinity_brain',
            participantCount: 2103,
            isLive: true,
            startedAt: Date.now() - 5400000,
            topics: ['tokenomics', 'economy', 'defi'],
            url: 'https://twitter.com/i/spaces/demo4'
          },
          {
            id: 'space-5',
            title: 'Social Media Marketing in 2024',
            hostName: '@marketing_pro',
            participantCount: 445,
            isLive: true,
            startedAt: Date.now() - 2700000,
            topics: ['marketing', 'social media', 'business'],
            url: 'https://twitter.com/i/spaces/demo5'
          }
        ]
        setSpaces(demoSpaces)
      }
    }

    initializeSpaces()
  }, [])

  const currentSpace = spaces && spaces.length > 0 ? spaces[currentSpaceIndex] : null

  const handlePlay = () => {
    if (!currentSpace) {
      toast.error('No spaces available')
      return
    }
    setIsPlaying(true)
    toast.success(`🎙️ Tuned into: ${currentSpace.title}`)
  }

  const handlePause = () => {
    setIsPlaying(false)
    toast.info('⏸️ Paused')
  }

  const handleNext = () => {
    if (!spaces || spaces.length === 0) return
    const nextIndex = (currentSpaceIndex + 1) % spaces.length
    setCurrentSpaceIndex(nextIndex)
    if (isPlaying) {
      toast.success(`⏭️ Switched to: ${spaces[nextIndex].title}`)
    }
  }

  const handlePrevious = () => {
    if (!spaces || spaces.length === 0) return
    const prevIndex = currentSpaceIndex === 0 ? spaces.length - 1 : currentSpaceIndex - 1
    setCurrentSpaceIndex(prevIndex)
    if (isPlaying) {
      toast.success(`⏮️ Switched to: ${spaces[prevIndex].title}`)
    }
  }

  const handleTuneToSpace = (index: number) => {
    setCurrentSpaceIndex(index)
    setIsPlaying(true)
    if (spaces) {
      toast.success(`🎙️ Tuned into: ${spaces[index].title}`)
    }
  }

  const filteredSpaces = spaces ? spaces.filter(space =>
    space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : []

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'Just started'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isPlaying ? 'bg-primary animate-pulse' : 'bg-muted'}`}>
                <Radio size={32} weight="duotone" className={isPlaying ? 'text-primary-foreground' : 'text-foreground'} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Twitter Spaces Radio
                  {isPlaying && (
                    <Badge variant="default" className="animate-pulse">
                      🔴 LIVE
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Tune into live Twitter Spaces like a radio station
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentSpace && (
            <motion.div
              key={currentSpace.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">{currentSpace.title}</h3>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="font-semibold">{currentSpace.hostName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {currentSpace.participantCount.toLocaleString()} listening
                  </span>
                  <span>•</span>
                  <span>{getTimeAgo(currentSpace.startedAt)}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {currentSpace.topics.map(topic => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      #{topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePrevious}
                  className="h-12 w-12 rounded-full p-0"
                >
                  <SkipBack size={20} weight="fill" />
                </Button>
                
                {isPlaying ? (
                  <Button
                    size="lg"
                    onClick={handlePause}
                    className="h-16 w-16 rounded-full p-0"
                  >
                    <Pause size={28} weight="fill" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handlePlay}
                    className="h-16 w-16 rounded-full p-0"
                  >
                    <Play size={28} weight="fill" />
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleNext}
                  className="h-12 w-12 rounded-full p-0"
                >
                  <SkipForward size={20} weight="fill" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-semibold">{volume[0]}%</span>
                </div>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.open(currentSpace.url, '_blank')
                  toast.success('Opening Twitter Space in new tab! 🚀')
                }}
              >
                Open in Twitter
                <CaretRight size={16} weight="bold" />
              </Button>
            </motion.div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MagnifyingGlass size={20} className="text-muted-foreground" />
              <Input
                placeholder="Search spaces by title, host, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredSpaces.map((space, index) => (
                    <motion.div
                      key={space.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          currentSpace?.id === space.id && isPlaying
                            ? 'ring-2 ring-primary bg-primary/5'
                            : ''
                        }`}
                        onClick={() => handleTuneToSpace(spaces ? spaces.indexOf(space) : 0)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {space.isLive && (
                                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                )}
                                <h4 className="font-semibold truncate">{space.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {space.hostName} • {space.participantCount.toLocaleString()} listeners
                              </p>
                              <div className="flex items-center gap-1 flex-wrap">
                                {space.topics.slice(0, 3).map(topic => (
                                  <Badge key={topic} variant="outline" className="text-xs">
                                    #{topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {currentSpace?.id === space.id && isPlaying && (
                              <div className="flex items-center gap-1">
                                <div className="h-3 w-1 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                                <div className="h-3 w-1 bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                                <div className="h-3 w-1 bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
