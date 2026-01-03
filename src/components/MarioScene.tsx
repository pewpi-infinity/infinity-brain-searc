import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Crown, Star, Sparkle, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Character {
  id: string
  name: string
  emoji: string
  x: number
  y: number
  isDragging: boolean
}

interface SceneElement {
  id: string
  type: 'character' | 'castle' | 'powerup'
  name: string
  emoji: string
  x: number
  y: number
  scale: number
}

export function MarioScene() {
  const [characters, setCharacters] = useState<SceneElement[]>([
    { id: 'mario', type: 'character', name: 'Mario', emoji: '🧔', x: 50, y: 300, scale: 1 },
    { id: 'luigi', type: 'character', name: 'Luigi', emoji: '👨', x: 150, y: 300, scale: 1 },
    { id: 'peach', type: 'character', name: 'Princess Peach', emoji: '👸', x: 500, y: 100, scale: 1 },
    { id: 'toad', type: 'character', name: 'Toad', emoji: '🍄', x: 250, y: 300, scale: 1 },
    { id: 'castle', type: 'castle', name: 'Castle', emoji: '🏰', x: 600, y: 80, scale: 1.5 },
  ])

  const [powerUps, setPowerUps] = useState<SceneElement[]>([
    { id: 'star', type: 'powerup', name: 'Star', emoji: '⭐', x: 350, y: 200, scale: 1 },
    { id: 'mushroom', type: 'powerup', name: 'Mushroom', emoji: '🍄', x: 450, y: 250, scale: 1 },
    { id: 'fire', type: 'powerup', name: 'Fire Flower', emoji: '🌺', x: 400, y: 150, scale: 1 },
    { id: 'coin', type: 'powerup', name: 'Coin', emoji: '💰', x: 300, y: 100, scale: 0.8 },
  ])

  const [draggedItem, setDraggedItem] = useState<{ id: string, offsetX: number, offsetY: number } | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const sceneRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const rect = sceneRef.current?.getBoundingClientRect()
    if (!rect) return

    const allItems = [...characters, ...powerUps]
    const item = allItems.find(c => c.id === id)
    if (!item) return

    const offsetX = e.clientX - rect.left - item.x
    const offsetY = e.clientY - rect.top - item.y

    setDraggedItem({ id, offsetX, offsetY })
    setSelectedItem(id)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItem || !sceneRef.current) return

    const rect = sceneRef.current.getBoundingClientRect()
    const newX = Math.max(0, Math.min(e.clientX - rect.left - draggedItem.offsetX, rect.width - 60))
    const newY = Math.max(0, Math.min(e.clientY - rect.top - draggedItem.offsetY, rect.height - 60))

    setCharacters(prev =>
      prev.map(c => c.id === draggedItem.id ? { ...c, x: newX, y: newY } : c)
    )
    setPowerUps(prev =>
      prev.map(p => p.id === draggedItem.id ? { ...p, x: newX, y: newY } : p)
    )
  }

  const handleMouseUp = () => {
    if (draggedItem) {
      const allItems = [...characters, ...powerUps]
      const item = allItems.find(i => i.id === draggedItem.id)
      if (item) {
        toast.success(`${item.name} moved to new position!`)
      }
    }
    setDraggedItem(null)
  }

  const handleDoubleClick = (id: string) => {
    const allItems = [...characters, ...powerUps]
    const item = allItems.find(i => i.id === id)
    
    if (item?.type === 'powerup') {
      setPowerUps(prev => prev.map(p => 
        p.id === id ? { ...p, scale: p.scale === 1 ? 2 : 1 } : p
      ))
      toast.success(`${item.name} ${item.scale === 1 ? 'doubled' : 'normal'} size! 🍄`)
    } else if (item?.type === 'character') {
      const newX = Math.random() * 600
      const newY = Math.random() * 300
      setCharacters(prev => prev.map(c => 
        c.id === id ? { ...c, x: newX, y: newY } : c
      ))
      toast.info(`${item.name} teleported! ✨`)
    }
  }

  const addCharacter = (emoji: string, name: string) => {
    const newChar: SceneElement = {
      id: `char-${Date.now()}`,
      type: 'character',
      name,
      emoji,
      x: Math.random() * 600,
      y: Math.random() * 300,
      scale: 1
    }
    setCharacters(prev => [...prev, newChar])
    toast.success(`${name} joined the scene!`)
  }

  const addPowerUp = (emoji: string, name: string) => {
    const newPowerUp: SceneElement = {
      id: `power-${Date.now()}`,
      type: 'powerup',
      name,
      emoji,
      x: Math.random() * 600,
      y: Math.random() * 300,
      scale: 1
    }
    setPowerUps(prev => [...prev, newPowerUp])
    toast.success(`${name} appeared!`)
  }

  const removeItem = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id))
    setPowerUps(prev => prev.filter(p => p.id !== id))
    setSelectedItem(null)
    toast.info('Item removed from scene')
  }

  const resetScene = () => {
    setCharacters([
      { id: 'mario', type: 'character', name: 'Mario', emoji: '🧔', x: 50, y: 300, scale: 1 },
      { id: 'luigi', type: 'character', name: 'Luigi', emoji: '👨', x: 150, y: 300, scale: 1 },
      { id: 'peach', type: 'character', name: 'Princess Peach', emoji: '👸', x: 500, y: 100, scale: 1 },
      { id: 'toad', type: 'character', name: 'Toad', emoji: '🍄', x: 250, y: 300, scale: 1 },
      { id: 'castle', type: 'castle', name: 'Castle', emoji: '🏰', x: 600, y: 80, scale: 1.5 },
    ])
    setPowerUps([
      { id: 'star', type: 'powerup', name: 'Star', emoji: '⭐', x: 350, y: 200, scale: 1 },
      { id: 'mushroom', type: 'powerup', name: 'Mushroom', emoji: '🍄', x: 450, y: 250, scale: 1 },
      { id: 'fire', type: 'powerup', name: 'Fire Flower', emoji: '🌺', x: 400, y: 150, scale: 1 },
      { id: 'coin', type: 'powerup', name: 'Coin', emoji: '💰', x: 300, y: 100, scale: 0.8 },
    ])
    setSelectedItem(null)
    toast.success('Scene reset!')
  }

  return (
    <Card className="gradient-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏰 8-Bit Mario Scene Builder
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag characters and power-ups around the scene. Double-click characters to teleport them, double-click power-ups to change size!
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => addCharacter('🧔', 'Mario')}
            size="sm"
            variant="outline"
          >
            Add Mario 🧔
          </Button>
          <Button
            onClick={() => addCharacter('👨', 'Luigi')}
            size="sm"
            variant="outline"
          >
            Add Luigi 👨
          </Button>
          <Button
            onClick={() => addCharacter('👸', 'Princess Peach')}
            size="sm"
            variant="outline"
          >
            Add Peach 👸
          </Button>
          <Button
            onClick={() => addCharacter('👑', 'King')}
            size="sm"
            variant="outline"
          >
            Add King 👑
          </Button>
          <Button
            onClick={() => addPowerUp('🍄', 'Mushroom')}
            size="sm"
            variant="outline"
          >
            Add Mushroom 🍄
          </Button>
          <Button
            onClick={() => addPowerUp('⭐', 'Star')}
            size="sm"
            variant="outline"
          >
            Add Star ⭐
          </Button>
          <Button
            onClick={() => addPowerUp('💰', 'Coin')}
            size="sm"
            variant="outline"
          >
            Add Coin 💰
          </Button>
          <Button
            onClick={() => addCharacter('🏰', 'Castle')}
            size="sm"
            variant="outline"
          >
            Add Castle 🏰
          </Button>
          {selectedItem && (
            <Button
              onClick={() => removeItem(selectedItem)}
              size="sm"
              variant="destructive"
            >
              Remove Selected
            </Button>
          )}
          <Button
            onClick={resetScene}
            size="sm"
            variant="secondary"
          >
            Reset Scene
          </Button>
        </div>

        <div
          ref={sceneRef}
          className="relative w-full h-[500px] bg-gradient-to-b from-sky-400 via-sky-300 to-green-500 rounded-lg border-4 border-primary overflow-hidden cursor-crosshair"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.1) 19px, rgba(255,255,255,0.1) 20px),
              repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.1) 19px, rgba(255,255,255,0.1) 20px)
            `
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-green-600 to-green-700 border-t-4 border-green-800" />

          <div className="absolute bottom-16 left-0 right-0 h-4 bg-yellow-600 opacity-50" />

          {[...characters, ...powerUps].map((item) => (
            <div
              key={item.id}
              className={`absolute cursor-move transition-all hover:scale-110 ${
                selectedItem === item.id ? 'ring-4 ring-accent rounded-lg' : ''
              } ${draggedItem?.id === item.id ? 'z-50 drop-shadow-2xl' : ''}`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                fontSize: `${item.scale * 48}px`,
                transform: draggedItem?.id === item.id ? 'rotate(5deg)' : 'none',
                userSelect: 'none',
              }}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
              onDoubleClick={() => handleDoubleClick(item.id)}
              title={`${item.name} - Drag to move, Double-click for action`}
            >
              <div className="relative">
                {item.emoji}
                {item.type === 'powerup' && item.scale > 1 && (
                  <div className="absolute -top-2 -right-2 text-xs bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    2x
                  </div>
                )}
              </div>
            </div>
          ))}

          {draggedItem && (
            <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
              Dragging: {[...characters, ...powerUps].find(i => i.id === draggedItem.id)?.name}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="font-semibold mb-1 flex items-center gap-1">
              <Sparkle size={16} className="text-accent" />
              Controls
            </div>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>• Click & drag to move items</li>
              <li>• Double-click characters to teleport</li>
              <li>• Double-click power-ups to resize</li>
            </ul>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="font-semibold mb-1 flex items-center gap-1">
              <Crown size={16} className="text-secondary" />
              Characters
            </div>
            <p className="text-muted-foreground text-xs">
              {characters.length} characters in scene
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="font-semibold mb-1 flex items-center gap-1">
              <Star size={16} className="text-accent" />
              Power-ups
            </div>
            <p className="text-muted-foreground text-xs">
              {powerUps.length} power-ups in scene
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
