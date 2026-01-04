import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Crown, Play, Pause, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { useAuth } from '@/lib/auth'

interface FallingEmoji {
  id: string
  emoji: string
  x: number
  y: number
  speed: number
  points: number
}

interface DailyProgress {
  date: string
  caught: number
  points: number
}

export function EmojiCatcherGame() {
  const { userProfile, isAuthenticated, addTokens } = useAuth()
  const [dailyProgress, setDailyProgress] = useLocalStorage<DailyProgress[]>('emoji-catcher-progress', [])
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [emojis, setEmojis] = useState<FallingEmoji[]>([])
  const [caughtToday, setCaughtToday] = useState(0)
  const gameRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const spawnTimerRef = useRef<number | undefined>(undefined)

  const MAX_DAILY_CATCHES = 10
  const EMOJI_TYPES = [
    { emoji: '⭐', points: 1, weight: 50 },
    { emoji: '🍄', points: 2, weight: 30 },
    { emoji: '👑', points: 5, weight: 20 }
  ]

  const today = new Date().toDateString()
  const todayProgress = dailyProgress?.find(p => p.date === today)
  const todayCaught = todayProgress?.caught || 0
  const canPlayMore = todayCaught < MAX_DAILY_CATCHES

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current)
      }
    }
  }, [])

  const getRandomEmoji = () => {
    const totalWeight = EMOJI_TYPES.reduce((sum, type) => sum + type.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const type of EMOJI_TYPES) {
      random -= type.weight
      if (random <= 0) {
        return type
      }
    }
    
    return EMOJI_TYPES[0]
  }

  const spawnEmoji = () => {
    if (!gameRef.current) return
    
    const width = gameRef.current.offsetWidth
    const emojiType = getRandomEmoji()
    
    const newEmoji: FallingEmoji = {
      id: `emoji-${Date.now()}-${Math.random()}`,
      emoji: emojiType.emoji,
      x: Math.random() * (width - 60),
      y: -60,
      speed: 2 + Math.random() * 2,
      points: emojiType.points
    }
    
    setEmojis(prev => [...prev, newEmoji])
  }

  const updateGame = () => {
    if (!gameRef.current) return
    
    const height = gameRef.current.offsetHeight
    
    setEmojis(prev => {
      return prev
        .map(emoji => ({
          ...emoji,
          y: emoji.y + emoji.speed
        }))
        .filter(emoji => emoji.y < height + 60)
    })
    
    animationRef.current = requestAnimationFrame(updateGame)
  }

  const handleEmojiClick = async (emoji: FallingEmoji) => {
    if (!isAuthenticated) {
      toast.error('Please log in to play')
      return
    }

    if (todayCaught >= MAX_DAILY_CATCHES) {
      toast.warning('Daily limit reached!', {
        description: 'Come back tomorrow for more rewards'
      })
      stopGame()
      return
    }

    setEmojis(prev => prev.filter(e => e.id !== emoji.id))
    setScore(prev => prev + emoji.points)
    setCaughtToday(prev => prev + 1)

    try {
      await addTokens('INF', emoji.points)
      
      toast.success(`+${emoji.points} INF Tokens!`, {
        description: `Caught ${emoji.emoji} • ${MAX_DAILY_CATCHES - todayCaught - 1} chances left today`,
        icon: emoji.emoji
      })

      const newCaughtCount = todayCaught + 1

      setDailyProgress((current) => {
        const updated = current || []
        const existingIndex = updated.findIndex(p => p.date === today)
        
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            date: today,
            caught: newCaughtCount,
            points: (updated[existingIndex].points || 0) + emoji.points
          }
        } else {
          updated.push({
            date: today,
            caught: newCaughtCount,
            points: emoji.points
          })
        }
        
        return updated
      })

      if (newCaughtCount >= MAX_DAILY_CATCHES) {
        toast.success('Daily limit reached!', {
          description: 'You earned all your tokens for today. Come back tomorrow!',
          duration: 5000
        })
        stopGame()
      }

    } catch (error) {
      console.error('Error awarding tokens:', error)
    }
  }

  const startGame = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to play')
      return
    }

    if (!canPlayMore) {
      toast.warning('Daily limit reached!', {
        description: 'Come back tomorrow for more rewards'
      })
      return
    }

    setIsPlaying(true)
    setScore(0)
    setCaughtToday(todayCaught)
    setEmojis([])
    
    animationRef.current = requestAnimationFrame(updateGame)
    spawnTimerRef.current = window.setInterval(() => {
      spawnEmoji()
    }, 1500)
  }

  const stopGame = () => {
    setIsPlaying(false)
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current)
    }
    
    setEmojis([])
  }

  const toggleGame = () => {
    if (isPlaying) {
      stopGame()
    } else {
      startGame()
    }
  }

  return (
    <Card className="overflow-hidden gradient-border">
      <div className="p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Trophy size={24} weight="duotone" className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Emoji Catcher</h3>
              <p className="text-xs text-muted-foreground">
                Catch falling emojis to earn bonus tokens!
              </p>
            </div>
          </div>
          
          <Button
            onClick={toggleGame}
            disabled={!isAuthenticated || !canPlayMore}
            className={isPlaying ? "bg-destructive" : "bg-gradient-to-r from-primary to-accent"}
          >
            {isPlaying ? (
              <>
                <Pause size={20} weight="fill" className="mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play size={20} weight="fill" className="mr-2" />
                Play
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star size={16} weight="fill" className="text-yellow-400" />
            <span className="font-medium">Score: {score}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Crown size={16} weight="fill" className="text-accent" />
            <span className="font-medium">
              Today: {todayCaught}/{MAX_DAILY_CATCHES}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Daily Progress</span>
            <span className="font-medium">
              {Math.round((todayCaught / MAX_DAILY_CATCHES) * 100)}%
            </span>
          </div>
          <Progress value={(todayCaught / MAX_DAILY_CATCHES) * 100} />
        </div>

        {!isAuthenticated && (
          <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg text-xs text-yellow-700 dark:text-yellow-300">
            ⚠️ Log in to play and earn tokens
          </div>
        )}

        {isAuthenticated && !canPlayMore && (
          <div className="mt-3 p-3 bg-green-500/10 rounded-lg text-xs text-green-700 dark:text-green-300">
            ✅ Daily limit reached! Come back tomorrow for more rewards
          </div>
        )}
      </div>

      <div
        ref={gameRef}
        className="relative h-[400px] bg-gradient-to-b from-background to-muted/30 overflow-hidden cursor-crosshair"
        style={{ 
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, oklch(0.88 0.03 280 / 0.1) 20px, oklch(0.88 0.03 280 / 0.1) 21px)',
        }}
      >
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center space-y-4 p-6">
              <div className="text-6xl mb-4">⭐ 🍄 👑</div>
              <h4 className="text-xl font-bold">Ready to Play?</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Click falling emojis to catch them!</p>
                <div className="flex gap-4 justify-center mt-4">
                  <Badge variant="outline" className="px-3 py-1">⭐ = 1 INF</Badge>
                  <Badge variant="outline" className="px-3 py-1">🍄 = 2 INF</Badge>
                  <Badge variant="outline" className="px-3 py-1">👑 = 5 INF</Badge>
                </div>
                <p className="mt-3 text-xs">
                  Limited to {MAX_DAILY_CATCHES} catches per day
                </p>
              </div>
            </div>
          </div>
        )}

        {emojis.map(emoji => (
          <button
            key={emoji.id}
            className="absolute transition-none cursor-pointer hover:scale-125 active:scale-95"
            style={{
              left: `${emoji.x}px`,
              top: `${emoji.y}px`,
              fontSize: '48px',
              lineHeight: 1,
              animation: 'pulse 0.5s ease-in-out infinite',
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
            onClick={() => handleEmojiClick(emoji)}
          >
            {emoji.emoji}
          </button>
        ))}
      </div>

      <div className="p-4 bg-muted/30 border-t">
        <div className="text-xs text-muted-foreground text-center">
          <p className="font-medium mb-2">Recent Progress</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {dailyProgress
              ?.slice(-7)
              .reverse()
              .map((progress, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {new Date(progress.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  : {progress.points} pts
                </Badge>
              ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
