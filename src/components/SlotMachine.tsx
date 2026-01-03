import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coin, Trophy } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '⭐']

export function SlotMachine() {
  const [credits, setCredits] = useKV<number>('slot-credits', 100)
  const [isSpinning, setIsSpinning] = useState(false)
  const [reels, setReels] = useState(['🍒', '🍋', '🍊'])
  const [lastWin, setLastWin] = useState(0)

  const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

  const calculateWin = (results: string[]) => {
    if (results[0] === results[1] && results[1] === results[2]) {
      if (results[0] === '💎') return 100
      if (results[0] === '7️⃣') return 50
      if (results[0] === '⭐') return 30
      return 20
    }
    if (results[0] === results[1] || results[1] === results[2]) {
      return 5
    }
    return 0
  }

  const spin = () => {
    if ((credits || 0) < 10 || isSpinning) return

    setCredits((prev) => (prev || 0) - 10)
    setIsSpinning(true)
    setLastWin(0)

    const spinDuration = 800
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]

    setTimeout(() => {
      setReels(results)
      const winAmount = calculateWin(results)
      setLastWin(winAmount)
      if (winAmount > 0) {
        setCredits((prev) => (prev || 0) + winAmount)
      }
      setIsSpinning(false)
    }, spinDuration)
  }

  const addCredits = () => {
    setCredits((prev) => (prev || 0) + 50)
  }

  return (
    <Card className="p-6 gradient-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Coin size={24} weight="duotone" className="text-accent" />
            Slot Machine
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Credits:</span>
            <span className="text-2xl font-bold text-accent">{credits || 0}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-xl">
          <div className="flex justify-center gap-4 mb-6">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={`w-24 h-24 bg-white rounded-lg flex items-center justify-center text-5xl shadow-lg ${
                  isSpinning ? 'slot-reel' : ''
                }`}
              >
                {isSpinning ? '❓' : symbol}
              </div>
            ))}
          </div>

          {lastWin > 0 && (
            <div className="text-center mb-4 animate-bounce">
              <Trophy size={32} weight="fill" className="text-yellow-300 mx-auto mb-2" />
              <p className="text-white text-2xl font-bold">Won {lastWin} credits!</p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button
              onClick={spin}
              disabled={isSpinning || (credits || 0) < 10}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8"
            >
              {isSpinning ? 'SPINNING...' : 'SPIN (10 credits)'}
            </Button>
            <Button
              onClick={addCredits}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/20"
            >
              Add 50 Credits
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>💎 Three diamonds: 100 credits</p>
          <p>7️⃣ Three sevens: 50 credits</p>
          <p>⭐ Three stars: 30 credits</p>
          <p>🍒🍋🍊🍇 Three matching: 20 credits</p>
          <p>Two matching: 5 credits</p>
        </div>
      </div>
    </Card>
  )
}