import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Copy, 
  MagnifyingGlass, 
  Sparkle, 
  TrendUp,
  Heart,
  Lightbulb,
  ShoppingCart,
  Megaphone,
  Question,
  Calendar,
  Fire,
  Hash,
  MagicWand
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Template {
  id: string
  title: string
  content: string
  category: string
  hashtags: string[]
  emoji?: string
}

interface HashtagCategory {
  category: string
  tags: string[]
  icon: typeof Hash
  color: string
}

const POST_TEMPLATES: Template[] = [
  {
    id: 'announcement',
    title: 'Product Announcement',
    content: '🚀 Exciting news! We\'re thrilled to announce [PRODUCT/FEATURE]. This changes everything for [TARGET AUDIENCE]. Check it out: [LINK]',
    category: 'business',
    hashtags: ['#ProductLaunch', '#Innovation', '#TechNews', '#NewRelease'],
    emoji: '🚀'
  },
  {
    id: 'question',
    title: 'Engagement Question',
    content: '🤔 Quick question for you: What\'s your biggest challenge with [TOPIC]? Drop your answers below - I\'d love to hear from you!',
    category: 'engagement',
    hashtags: ['#CommunityQuestion', '#LetsTalk', '#Engagement'],
    emoji: '🤔'
  },
  {
    id: 'tip',
    title: 'Pro Tip',
    content: '💡 Pro tip: [INSERT TIP]. This simple trick can save you [BENEFIT]. Try it and let me know how it works for you!',
    category: 'educational',
    hashtags: ['#ProTip', '#LifeHack', '#Productivity', '#Tips'],
    emoji: '💡'
  },
  {
    id: 'testimonial',
    title: 'Customer Success',
    content: '❤️ "What a wonderful testimonial from [CUSTOMER NAME]: \'[TESTIMONIAL TEXT]\'" Stories like this remind us why we do what we do! #CustomerLove',
    category: 'business',
    hashtags: ['#Testimonial', '#CustomerSuccess', '#HappyCustomer', '#Review'],
    emoji: '❤️'
  },
  {
    id: 'behind-scenes',
    title: 'Behind the Scenes',
    content: '👀 Behind the scenes look at [PROCESS/TEAM/WORK]. Here\'s what goes into making [PRODUCT/SERVICE] amazing for you!',
    category: 'content',
    hashtags: ['#BehindTheScenes', '#TeamWork', '#Process', '#Transparency'],
    emoji: '👀'
  },
  {
    id: 'motivational',
    title: 'Motivational Quote',
    content: '✨ "[INSPIRATIONAL QUOTE]" - [AUTHOR]. What\'s keeping you motivated today? Share in the comments!',
    category: 'inspiration',
    hashtags: ['#Motivation', '#Inspiration', '#MondayMotivation', '#Mindset'],
    emoji: '✨'
  },
  {
    id: 'how-to',
    title: 'How-To Guide',
    content: '📝 How to [ACCOMPLISH GOAL] in [TIMEFRAME]:\n1. [STEP 1]\n2. [STEP 2]\n3. [STEP 3]\n\nSave this for later!',
    category: 'educational',
    hashtags: ['#HowTo', '#Tutorial', '#Guide', '#LearnWithMe'],
    emoji: '📝'
  },
  {
    id: 'poll',
    title: 'Poll/Survey',
    content: '📊 Poll time! We need your input on [TOPIC]. Vote below:\n\nA) [OPTION A]\nB) [OPTION B]\nC) [OPTION C]\n\nDrop your vote in comments!',
    category: 'engagement',
    hashtags: ['#Poll', '#YourOpinion', '#Vote', '#Community'],
    emoji: '📊'
  },
  {
    id: 'milestone',
    title: 'Milestone Celebration',
    content: '🎉 We did it! [MILESTONE] achieved! Thank you to everyone who helped us get here. This is just the beginning!',
    category: 'business',
    hashtags: ['#Milestone', '#Celebration', '#Grateful', '#Achievement'],
    emoji: '🎉'
  },
  {
    id: 'thread-starter',
    title: 'Thread Starter',
    content: '🧵 THREAD: Everything you need to know about [TOPIC]. This is a game-changer. Let\'s dive in... (1/X)',
    category: 'content',
    hashtags: ['#Thread', '#DeepDive', '#Knowledge', '#Learn'],
    emoji: '🧵'
  },
  {
    id: 'event',
    title: 'Event Announcement',
    content: '📅 Mark your calendars! Join us for [EVENT NAME] on [DATE] at [TIME]. We\'ll be discussing [TOPIC]. Register here: [LINK]',
    category: 'business',
    hashtags: ['#Event', '#Webinar', '#LiveEvent', '#Registration'],
    emoji: '📅'
  },
  {
    id: 'trending',
    title: 'Trending Topic',
    content: '🔥 Everyone\'s talking about [TRENDING TOPIC]. Here\'s our take: [YOUR OPINION/INSIGHT]. What\'s your perspective?',
    category: 'engagement',
    hashtags: ['#Trending', '#HotTopic', '#Discussion', '#CurrentEvents'],
    emoji: '🔥'
  },
  {
    id: 'thank-you',
    title: 'Thank You Post',
    content: '🙏 Huge thank you to [PERSON/GROUP] for [REASON]. Your support means everything to us!',
    category: 'engagement',
    hashtags: ['#ThankYou', '#Gratitude', '#Appreciation', '#Community'],
    emoji: '🙏'
  },
  {
    id: 'sale',
    title: 'Sale Announcement',
    content: '🛍️ SALE ALERT! Get [DISCOUNT]% off [PRODUCT] - but only for [TIMEFRAME]! Don\'t miss out: [LINK] #LimitedTime',
    category: 'business',
    hashtags: ['#Sale', '#Discount', '#Shopping', '#Deal', '#LimitedOffer'],
    emoji: '🛍️'
  },
  {
    id: 'fun-fact',
    title: 'Fun Fact Friday',
    content: '🤓 Fun Fact Friday: Did you know [INTERESTING FACT]? Share this with someone who needs to know!',
    category: 'content',
    hashtags: ['#FunFactFriday', '#DidYouKnow', '#Learning', '#Trivia'],
    emoji: '🤓'
  },
  {
    id: 'before-after',
    title: 'Before & After',
    content: '↔️ Before vs After using [PRODUCT/SERVICE]:\n\nBefore: [PROBLEM]\nAfter: [SOLUTION]\n\nThe difference is incredible!',
    category: 'business',
    hashtags: ['#BeforeAndAfter', '#Transformation', '#Results', '#Success'],
    emoji: '↔️'
  }
]

const HASHTAG_CATEGORIES: HashtagCategory[] = [
  {
    category: 'Business & Marketing',
    icon: TrendUp,
    color: 'text-primary',
    tags: [
      '#Marketing', '#Business', '#Entrepreneur', '#SmallBusiness', '#StartUp',
      '#Growth', '#Branding', '#Sales', '#Revenue', '#ROI',
      '#B2B', '#B2C', '#Strategy', '#Leadership', '#Innovation'
    ]
  },
  {
    category: 'Technology & AI',
    icon: Sparkle,
    color: 'text-accent',
    tags: [
      '#AI', '#Technology', '#Tech', '#Innovation', '#MachineLearning',
      '#ArtificialIntelligence', '#Coding', '#Programming', '#Developer', '#SaaS',
      '#WebDev', '#TechNews', '#Digital', '#Automation', '#Future'
    ]
  },
  {
    category: 'Social Media',
    icon: Megaphone,
    color: 'text-secondary',
    tags: [
      '#SocialMedia', '#ContentCreator', '#Influencer', '#Instagram', '#TikTok',
      '#YouTube', '#Twitter', '#LinkedIn', '#Facebook', '#SocialMediaMarketing',
      '#ContentMarketing', '#Viral', '#Trending', '#Engagement', '#Community'
    ]
  },
  {
    category: 'Lifestyle & Wellness',
    icon: Heart,
    color: 'text-pink-500',
    tags: [
      '#Lifestyle', '#Wellness', '#Health', '#Fitness', '#SelfCare',
      '#MentalHealth', '#Mindfulness', '#Motivation', '#Inspiration', '#Goals',
      '#Success', '#PersonalGrowth', '#Productivity', '#WorkLifeBalance', '#Happiness'
    ]
  },
  {
    category: 'E-commerce & Shopping',
    icon: ShoppingCart,
    color: 'text-orange-500',
    tags: [
      '#Shopping', '#Sale', '#Discount', '#Deal', '#OnlineShopping',
      '#Ecommerce', '#Fashion', '#Style', '#Product', '#NewArrival',
      '#LimitedEdition', '#Exclusive', '#ShopNow', '#BuyNow', '#FreeShipping'
    ]
  },
  {
    category: 'Content & Education',
    icon: Lightbulb,
    color: 'text-yellow-500',
    tags: [
      '#Education', '#Learning', '#Knowledge', '#Tutorial', '#HowTo',
      '#Tips', '#Advice', '#Guide', '#Training', '#Course',
      '#Skills', '#Professional', '#Career', '#Development', '#Expert'
    ]
  },
  {
    category: 'Trending & Viral',
    icon: Fire,
    color: 'text-red-500',
    tags: [
      '#Trending', '#Viral', '#FYP', '#ForYou', '#Explore',
      '#Hot', '#Popular', '#MustSee', '#Breaking', '#News',
      '#Latest', '#Update', '#Now', '#Today', '#ThisWeek'
    ]
  },
  {
    category: 'Engagement & Community',
    icon: Question,
    color: 'text-blue-500',
    tags: [
      '#Community', '#Engagement', '#Discussion', '#Question', '#Poll',
      '#Opinion', '#Thoughts', '#Share', '#Comment', '#Reply',
      '#Join', '#Connect', '#Network', '#Together', '#WeekendVibes'
    ]
  },
  {
    category: 'Time-Based',
    icon: Calendar,
    color: 'text-purple-500',
    tags: [
      '#MondayMotivation', '#TuesdayThoughts', '#WednesdayWisdom', '#ThursdayVibes', '#FridayFeeling',
      '#SaturdayMood', '#SundayFunday', '#WeekendVibes', '#TGIF', '#NewWeek',
      '#MonthEnd', '#QuarterlyGoals', '#YearInReview', '#NewYearNewMe', '#SeasonalSale'
    ]
  }
]

interface TemplateLibraryProps {
  onUseTemplate: (content: string, hashtags: string[]) => void
}

export function TemplateLibrary({ onUseTemplate }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])

  const categories = ['all', ...Array.from(new Set(POST_TEMPLATES.map(t => t.category)))]

  const filteredTemplates = POST_TEMPLATES.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUseTemplate = (template: Template) => {
    const allHashtags = [...template.hashtags, ...selectedHashtags]
    const uniqueHashtags = Array.from(new Set(allHashtags))
    const contentWithHashtags = `${template.content}\n\n${uniqueHashtags.join(' ')}`
    onUseTemplate(contentWithHashtags, uniqueHashtags)
    toast.success('Template loaded! Customize it and post.')
  }

  const handleToggleHashtag = (tag: string) => {
    setSelectedHashtags(current => 
      current.includes(tag) 
        ? current.filter(t => t !== tag)
        : [...current, tag]
    )
  }

  const handleCopyHashtags = (tags: string[]) => {
    navigator.clipboard.writeText(tags.join(' '))
    toast.success('Hashtags copied to clipboard!')
  }

  const handleGenerateAIHashtags = async () => {
    const promptText = 'Generate 10 trending and relevant hashtags for social media marketing in 2024. Return as JSON with a "hashtags" array containing just the hashtag strings (including the # symbol).'
    const prompt = window.spark.llmPrompt([promptText], '')
    
    try {
      toast.info('Generating AI-powered hashtags...')
      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      
      if (data.hashtags && Array.isArray(data.hashtags)) {
        setSelectedHashtags(current => {
          const combined = [...current, ...data.hashtags]
          return Array.from(new Set(combined))
        })
        toast.success(`Added ${data.hashtags.length} AI-generated hashtags!`)
      }
    } catch (error) {
      toast.error('Failed to generate hashtags')
      console.error('AI hashtag error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkle size={28} weight="duotone" className="text-accent" />
                Template Library
              </CardTitle>
              <CardDescription>
                Pre-written post formats and hashtag suggestions to boost your engagement
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {filteredTemplates.length} Templates
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground">
                <Copy size={20} weight="duotone" className="mr-2" />
                Post Templates
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground">
                <Hash size={20} weight="duotone" className="mr-2" />
                Hashtag Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-md border bg-background"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedHashtags.length > 0 && (
                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-2">Selected Hashtags ({selectedHashtags.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedHashtags.map(tag => (
                            <Badge 
                              key={tag}
                              variant="secondary"
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleToggleHashtag(tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyHashtags(selectedHashtags)}
                        >
                          <Copy size={16} className="mr-2" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedHashtags([])}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <ScrollArea className="h-[600px] pr-4">
                <div className="grid gap-4">
                  {filteredTemplates.map(template => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-accent">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2">
                              {template.emoji && (
                                <span className="text-2xl">{template.emoji}</span>
                              )}
                              <div>
                                <h4 className="font-semibold">{template.title}</h4>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUseTemplate(template)}
                              className="bg-gradient-to-r from-accent to-secondary"
                            >
                              <Copy size={16} className="mr-2" />
                              Use Template
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 border-muted pl-3">
                            {template.content}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {template.hashtags.map(tag => (
                              <Badge
                                key={tag}
                                variant={selectedHashtags.includes(tag) ? "default" : "secondary"}
                                className="cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => handleToggleHashtag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="hashtags" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={handleGenerateAIHashtags}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  <MagicWand size={20} weight="duotone" className="mr-2" />
                  Generate AI Hashtags
                </Button>
                {selectedHashtags.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleCopyHashtags(selectedHashtags)}
                    >
                      <Copy size={20} className="mr-2" />
                      Copy Selected ({selectedHashtags.length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedHashtags([])}
                    >
                      Clear All
                    </Button>
                  </>
                )}
              </div>

              {selectedHashtags.length > 0 && (
                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold mb-2">Selected Hashtags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedHashtags.map(tag => (
                        <Badge 
                          key={tag}
                          variant="default"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleToggleHashtag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {HASHTAG_CATEGORIES.map(category => (
                    <Card key={category.category} className="border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <category.icon size={24} weight="duotone" className={category.color} />
                          {category.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {category.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant={selectedHashtags.includes(tag) ? "default" : "secondary"}
                              className="cursor-pointer hover:scale-105 transition-transform text-sm"
                              onClick={() => handleToggleHashtag(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyHashtags(category.tags)}
                          className="mt-4"
                        >
                          <Copy size={16} className="mr-2" />
                          Copy All {category.category} Tags
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
