import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Crown, Star, Sparkle, Lightning, Path, Play, Pause, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Character {
  id: string
  name: string
  emoji: string
  x: number
  y: number
  isDragging: boolean
}

interface Point {
  x: number
  y: number
}

interface AnimationPath {
  id: string
  name: string
  points: Point[]
  color: string
  loop: boolean
}

interface SceneElement {
  id: string
  type: 'character' | 'castle' | 'powerup'
  name: string
  emoji: string
  x: number
  y: number
  scale: number
  isAnimating?: boolean
  currentPath?: string
  pathProgress?: number
}

export function MarioScene() {
  const [characters, setCharacters] = useState<SceneElement[]>([
    { id: 'mario', type: 'character', name: 'Mario', emoji: '🧔', x: 50, y: 300, scale: 1, isAnimating: false, pathProgress: 0 },
    { id: 'luigi', type: 'character', name: 'Luigi', emoji: '👨', x: 150, y: 300, scale: 1, isAnimating: false, pathProgress: 0 },
    { id: 'peach', type: 'character', name: 'Princess Peach', emoji: '👸', x: 500, y: 100, scale: 1, isAnimating: false, pathProgress: 0 },
    { id: 'toad', type: 'character', name: 'Toad', emoji: '🍄', x: 250, y: 300, scale: 1, isAnimating: false, pathProgress: 0 },
    { id: 'castle', type: 'castle', name: 'Castle', emoji: '🏰', x: 600, y: 80, scale: 1.5, isAnimating: false, pathProgress: 0 },
  ])

  const [powerUps, setPowerUps] = useState<SceneElement[]>([
    { id: 'star', type: 'powerup', name: 'Star', emoji: '⭐', x: 350, y: 200, scale: 1, isAnimating: false, pathProgress: 0 },
    { id: 'mushroom', type: 'powerup', name: 'Mushroom', emoji: '🍄', x: 450, y: 250, scale: 1, isAnimating: false, pathProgress: 0 },
    { id: 'fire', type: 'powerup', name: 'Fire Flower', emoji: '🌺', x: 400, y: 150, scale: 1, isAnimating: false, pathProgress: 0 },
    { id: 'coin', type: 'powerup', name: 'Coin', emoji: '💰', x: 300, y: 100, scale: 0.8, isAnimating: false, pathProgress: 0 },
  ])

  const [animationPaths] = useState<AnimationPath[]>([
    {
      id: 'path1',
      name: 'Ground Patrol',
      points: [
        { x: 50, y: 400 },
        { x: 200, y: 400 },
        { x: 400, y: 400 },
        { x: 600, y: 400 },
        { x: 50, y: 400 }
      ],
      color: '#ef4444',
      loop: true
    },
    {
      id: 'path2',
      name: 'Sky Route',
      points: [
        { x: 100, y: 100 },
        { x: 300, y: 80 },
        { x: 500, y: 100 },
        { x: 600, y: 150 },
        { x: 400, y: 200 },
        { x: 100, y: 100 }
      ],
      color: '#3b82f6',
      loop: true
    },
    {
      id: 'path3',
      name: 'Castle Approach',
      points: [
        { x: 50, y: 350 },
        { x: 200, y: 300 },
        { x: 350, y: 250 },
        { x: 500, y: 200 },
        { x: 600, y: 100 }
      ],
      color: '#10b981',
      loop: false
    },
    {
      id: 'path4',
      name: 'Figure Eight',
      points: [
        { x: 200, y: 250 },
        { x: 300, y: 200 },
        { x: 400, y: 250 },
        { x: 300, y: 300 },
        { x: 200, y: 250 },
        { x: 300, y: 200 },
        { x: 400, y: 150 },
        { x: 500, y: 200 },
        { x: 400, y: 250 },
        { x: 300, y: 200 }
      ],
      color: '#f59e0b',
      loop: true
    },
    {
      id: 'path5',
      name: 'Zigzag',
      points: [
        { x: 50, y: 350 },
        { x: 150, y: 250 },
        { x: 250, y: 350 },
        { x: 350, y: 250 },
        { x: 450, y: 350 },
        { x: 550, y: 250 },
        { x: 650, y: 350 }
      ],
      color: '#a855f7',
      loop: false
    }
  ])

  const [showPaths, setShowPaths] = useState(true)
  const [draggedItem, setDraggedItem] = useState<{ id: string, offsetX: number, offsetY: number } | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)

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
      { id: 'mario', type: 'character', name: 'Mario', emoji: '🧔', x: 50, y: 300, scale: 1, isAnimating: false, pathProgress: 0 },
      { id: 'luigi', type: 'character', name: 'Luigi', emoji: '👨', x: 150, y: 300, scale: 1, isAnimating: false, pathProgress: 0 },
      { id: 'peach', type: 'character', name: 'Princess Peach', emoji: '👸', x: 500, y: 100, scale: 1, isAnimating: false, pathProgress: 0 },
      { id: 'toad', type: 'character', name: 'Toad', emoji: '🍄', x: 250, y: 300, scale: 1, isAnimating: false, pathProgress: 0 },
      { id: 'castle', type: 'castle', name: 'Castle', emoji: '🏰', x: 600, y: 80, scale: 1.5, isAnimating: false, pathProgress: 0 },
    ])
    setPowerUps([
      { id: 'star', type: 'powerup', name: 'Star', emoji: '⭐', x: 350, y: 200, scale: 1, isAnimating: false, pathProgress: 0 },
      { id: 'mushroom', type: 'powerup', name: 'Mushroom', emoji: '🍄', x: 450, y: 250, scale: 1, isAnimating: false, pathProgress: 0 },
      { id: 'fire', type: 'powerup', name: 'Fire Flower', emoji: '🌺', x: 400, y: 150, scale: 1, isAnimating: false, pathProgress: 0 },
      { id: 'coin', type: 'powerup', name: 'Coin', emoji: '💰', x: 300, y: 100, scale: 0.8, isAnimating: false, pathProgress: 0 },
    ])
    setSelectedItem(null)
    toast.success('Scene reset!')
  }

  const getPositionOnPath = (path: AnimationPath, progress: number): Point => {
    const totalPoints = path.points.length
    if (totalPoints < 2) return path.points[0] || { x: 0, y: 0 }

    const segmentProgress = progress * (totalPoints - 1)
    const segmentIndex = Math.floor(segmentProgress)
    const segmentFraction = segmentProgress - segmentIndex

    if (segmentIndex >= totalPoints - 1) {
      return path.points[totalPoints - 1]
    }

    const startPoint = path.points[segmentIndex]
    const endPoint = path.points[segmentIndex + 1]

    return {
      x: startPoint.x + (endPoint.x - startPoint.x) * segmentFraction,
      y: startPoint.y + (endPoint.y - startPoint.y) * segmentFraction
    }
  }

  const startAnimation = (itemId: string, pathId: string) => {
    const updateFn = (items: SceneElement[]) =>
      items.map(item =>
        item.id === itemId
          ? { ...item, isAnimating: true, currentPath: pathId, pathProgress: 0 }
          : item
      )
    
    setCharacters(updateFn)
    setPowerUps(updateFn)
    
    const path = animationPaths.find(p => p.id === pathId)
    const allItems = [...characters, ...powerUps]
    const item = allItems.find(i => i.id === itemId)
    
    toast.success(`${item?.name} started following ${path?.name}!`)
  }

  const stopAnimation = (itemId: string) => {
    const updateFn = (items: SceneElement[]) =>
      items.map(item =>
        item.id === itemId
          ? { ...item, isAnimating: false, currentPath: undefined, pathProgress: 0 }
          : item
      )
    
    setCharacters(updateFn)
    setPowerUps(updateFn)
    
    const allItems = [...characters, ...powerUps]
    const item = allItems.find(i => i.id === itemId)
    toast.info(`${item?.name} stopped animation`)
  }

  const stopAllAnimations = () => {
    const updateFn = (items: SceneElement[]) =>
      items.map(item => ({ ...item, isAnimating: false, currentPath: undefined, pathProgress: 0 }))
    
    setCharacters(updateFn)
    setPowerUps(updateFn)
    toast.info('All animations stopped')
  }

  useEffect(() => {
    const animate = () => {
      const updateFn = (items: SceneElement[]) =>
        items.map(item => {
          if (!item.isAnimating || !item.currentPath) return item

          const path = animationPaths.find(p => p.id === item.currentPath)
          if (!path) return item

          let newProgress = (item.pathProgress || 0) + 0.003

          if (newProgress >= 1) {
            if (path.loop) {
              newProgress = 0
            } else {
              return { ...item, isAnimating: false, pathProgress: 1 }
            }
          }

          const position = getPositionOnPath(path, newProgress)
          return { ...item, x: position.x, y: position.y, pathProgress: newProgress }
        })

      setCharacters(updateFn)
      setPowerUps(updateFn)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animationPaths])

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
        <div className="space-y-3">
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

          <div className="flex flex-wrap gap-2 items-center border-t pt-3">
            <Button
              onClick={() => setShowPaths(!showPaths)}
              size="sm"
              variant={showPaths ? 'default' : 'outline'}
            >
              <Path size={16} className="mr-1" />
              {showPaths ? 'Hide' : 'Show'} Paths
            </Button>
            <Button
              onClick={stopAllAnimations}
              size="sm"
              variant="outline"
            >
              <Pause size={16} className="mr-1" />
              Stop All
            </Button>
            <div className="text-xs text-muted-foreground">
              Click character + path button to animate
            </div>
          </div>
          
          {selectedItem && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Play size={16} className="text-accent" />
                Animation Paths for {[...characters, ...powerUps].find(i => i.id === selectedItem)?.name}
              </div>
              <div className="flex flex-wrap gap-2">
                {animationPaths.map(path => (
                  <Button
                    key={path.id}
                    onClick={() => {
                      const item = [...characters, ...powerUps].find(i => i.id === selectedItem)
                      if (item?.isAnimating && item.currentPath === path.id) {
                        stopAnimation(selectedItem)
                      } else {
                        startAnimation(selectedItem, path.id)
                      }
                    }}
                    size="sm"
                    variant={
                      [...characters, ...powerUps].find(i => i.id === selectedItem)?.currentPath === path.id
                        ? 'default'
                        : 'outline'
                    }
                    style={{
                      borderColor: path.color,
                      ...([...characters, ...powerUps].find(i => i.id === selectedItem)?.currentPath !== path.id && {
                        color: path.color
                      })
                    }}
                  >
                    {[...characters, ...powerUps].find(i => i.id === selectedItem)?.currentPath === path.id ? (
                      <Pause size={14} className="mr-1" />
                    ) : (
                      <Play size={14} className="mr-1" />
                    )}
                    {path.name}
                    {path.loop && <ArrowsClockwise size={12} className="ml-1" />}
                  </Button>
                ))}
              </div>
            </div>
          )}
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
          {showPaths && animationPaths.map(path => (
            <svg
              key={path.id}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <defs>
                <marker
                  id={`arrow-${path.id}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill={path.color} />
                </marker>
              </defs>
              <path
                d={`M ${path.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                stroke={path.color}
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                opacity="0.6"
                markerEnd={`url(#arrow-${path.id})`}
              />
              {path.points.map((point, idx) => (
                <circle
                  key={idx}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={path.color}
                  opacity="0.8"
                />
              ))}
            </svg>
          ))}

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
                {item.isAnimating && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold whitespace-nowrap">
                    <Play size={10} weight="fill" className="inline mr-0.5" />
                    {Math.round((item.pathProgress || 0) * 100)}%
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="font-semibold mb-1 flex items-center gap-1">
              <Sparkle size={16} className="text-accent" />
              Controls
            </div>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>• Click & drag to move items</li>
              <li>• Double-click characters to teleport</li>
              <li>• Double-click power-ups to resize</li>
              <li>• Select item + path to animate</li>
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
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="font-semibold mb-1 flex items-center gap-1">
              <Path size={16} className="text-primary" />
              Animations
            </div>
            <p className="text-muted-foreground text-xs">
              {[...characters, ...powerUps].filter(i => i.isAnimating).length} active • {animationPaths.length} paths
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
