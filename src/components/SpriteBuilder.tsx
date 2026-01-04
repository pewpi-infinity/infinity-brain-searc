import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkle, Plus, Download, MagicWand } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface SpriteDesign {
  id: string
  name: string
  emoji: string
  description: string
  category: 'character' | 'castle' | 'powerup' | 'enemy' | 'item'
  createdAt: number
}

export function SpriteBuilder() {
  const [sprites, setSprites] = useLocalStorage<SpriteDesign[]>('mario-sprites', [])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SpriteDesign['category']>('character')
  const [isGenerating, setIsGenerating] = useState(false)

  const spritesList = sprites || []

  const generateSpriteWithAI = async () => {
    if (!name || !description) {
      toast.error('Please provide a name and description')
      return
    }

    setIsGenerating(true)
    try {
      const promptText = `You are a sprite designer for 8-bit Mario-style games. 
Generate a single perfect emoji that represents a ${category} with this name: "${name}" and description: "${description}".

Choose the best emoji from these categories:
- For characters: 🧔👨👩👸🤴👦👧🧙‍♂️🧙‍♀️👷‍♂️👷‍♀️🦸‍♂️🦸‍♀️🧟‍♂️🧟‍♀️
- For castles/buildings: 🏰🏛️🏗️🏘️🏚️⛪🕌
- For powerups: ⭐💫✨🌟⚡🔥💎💰🪙
- For enemies: 👹👺👻🤖👾🦖🐉🦂🕷️
- For items: 🍄🌺🔑🗝️🎁📦🧰🛡️⚔️

Return ONLY the single best emoji character, nothing else.`

      const emoji = await window.spark.llm(promptText, 'gpt-4o-mini')
      const cleanEmoji = emoji.trim().slice(0, 2)

      const newSprite: SpriteDesign = {
        id: `sprite-${Date.now()}`,
        name,
        emoji: cleanEmoji,
        description,
        category,
        createdAt: Date.now()
      }

      setSprites(current => [...(current || []), newSprite])
      toast.success(`${cleanEmoji} ${name} created!`)
      
      setName('')
      setDescription('')
    } catch (error) {
      toast.error('Failed to generate sprite. Please try again.')
      console.error('Sprite generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const manualAddSprite = (emoji: string) => {
    if (!name) {
      toast.error('Please provide a name first')
      return
    }

    const newSprite: SpriteDesign = {
      id: `sprite-${Date.now()}`,
      name,
      emoji,
      description: description || 'Custom sprite',
      category,
      createdAt: Date.now()
    }

    setSprites(current => [...(current || []), newSprite])
    toast.success(`${emoji} ${name} added!`)
    
    setName('')
    setDescription('')
  }

  const deleteSprite = (id: string) => {
    setSprites(current => (current || []).filter(s => s.id !== id))
    toast.info('Sprite deleted')
  }

  const exportToJSON = () => {
    const data = {
      sprites: spritesList,
      exportedAt: new Date().toISOString(),
      totalCount: spritesList.length
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mario-sprites-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Sprite index exported!')
  }

  const quickAddEmojis = [
    { emoji: '🧔', name: 'Mario' },
    { emoji: '👨', name: 'Luigi' },
    { emoji: '👸', name: 'Peach' },
    { emoji: '🍄', name: 'Mushroom' },
    { emoji: '⭐', name: 'Star' },
    { emoji: '🏰', name: 'Castle' },
    { emoji: '👹', name: 'Bowser' },
    { emoji: '💰', name: 'Coin' },
    { emoji: '🔥', name: 'Fire Flower' },
    { emoji: '👾', name: 'Enemy' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagicWand size={24} weight="duotone" className="text-primary" />
            AI Sprite Generator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe your character and let AI choose the perfect emoji sprite
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprite-name">Sprite Name</Label>
            <Input
              id="sprite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Super Mario, Evil Koopa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprite-category">Category</Label>
            <select
              id="sprite-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as SpriteDesign['category'])}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              <option value="character">Character</option>
              <option value="castle">Castle/Building</option>
              <option value="powerup">Power-up</option>
              <option value="enemy">Enemy</option>
              <option value="item">Item</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprite-description">Description</Label>
            <Textarea
              id="sprite-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the character's appearance, abilities, and personality..."
              rows={4}
            />
          </div>

          <Button
            onClick={generateSpriteWithAI}
            disabled={isGenerating || !name || !description}
            className="w-full"
          >
            {isGenerating ? (
              <>Generating sprite...</>
            ) : (
              <>
                <Sparkle className="mr-2" size={20} />
                Generate with AI
              </>
            )}
          </Button>

          <div className="pt-4 border-t">
            <p className="text-sm font-semibold mb-2">Quick Add:</p>
            <div className="grid grid-cols-5 gap-2">
              {quickAddEmojis.map((item) => (
                <Button
                  key={item.emoji}
                  onClick={() => {
                    setName(item.name)
                    manualAddSprite(item.emoji)
                  }}
                  variant="outline"
                  size="sm"
                  className="text-2xl p-2"
                  title={item.name}
                >
                  {item.emoji}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              📋 Sprite Index
            </span>
            <Button
              onClick={exportToJSON}
              size="sm"
              variant="outline"
              disabled={spritesList.length === 0}
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {spritesList.length} sprite{spritesList.length !== 1 ? 's' : ''} in your collection
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {spritesList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Plus size={48} className="mx-auto mb-2 opacity-50" />
                <p>No sprites yet. Create your first one!</p>
              </div>
            ) : (
              spritesList.map((sprite) => (
                <div
                  key={sprite.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="text-4xl">{sprite.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{sprite.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {sprite.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {sprite.category}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteSprite(sprite.id)}
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                  >
                    🗑️
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
