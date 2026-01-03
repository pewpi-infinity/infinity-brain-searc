import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Question, MagnifyingGlass, Robot, Coin, Graph, Sparkle } from '@phosphor-icons/react'

export function HelpLegend() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-accent to-secondary hover:scale-110 transition-transform z-50"
        >
          <Question size={24} weight="bold" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">How to Use Infinity Brain</SheetTitle>
          <SheetDescription>
            Your guide to mastering the platform
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="search">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <MagnifyingGlass size={20} className="text-primary" />
                  <span className="font-semibold">Web Search</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>Enter your query in the main search bar and press Enter or click the 🔍 button.</p>
                  <p className="font-medium">Features:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Multi-source search across Google and other engines</li>
                    <li>Vector-based relevance ranking</li>
                    <li>Visual graph connections between results</li>
                    <li>Real-time result updates</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ai">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Robot size={20} className="text-accent" />
                  <span className="font-semibold">AI Assistant</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>Click the ✨ button or use the chat panel to talk with your AI assistant.</p>
                  <p className="font-medium">Capabilities:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Answer questions on any topic</li>
                    <li>Help you build and create</li>
                    <li>Provide suggestions and ideas</li>
                    <li>Explain complex concepts</li>
                  </ul>
                  <p className="text-muted-foreground italic">Your conversation history is saved automatically.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="visualization">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Graph size={20} className="text-secondary" />
                  <span className="font-semibold">Data Visualization</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>After searching, click "Visualize Connections" to see how results relate to each other.</p>
                  <p className="font-medium">What you'll see:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Interactive graph nodes representing results</li>
                    <li>Connections showing topic relationships</li>
                    <li>Vector-based similarity clusters</li>
                    <li>Clickable nodes to explore further</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="slot">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Coin size={20} className="text-accent" />
                  <span className="font-semibold">Slot Machine</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>A fun mini-game to take a break from work!</p>
                  <p className="font-medium">How to play:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Each spin costs 10 credits</li>
                    <li>Match symbols to win credits</li>
                    <li>💎 Three diamonds: 100 credits</li>
                    <li>7️⃣ Three sevens: 50 credits</li>
                    <li>Any three matching: 20+ credits</li>
                  </ul>
                  <p className="text-muted-foreground italic">Click "Add Credits" if you run out!</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tips">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Sparkle size={20} className="text-primary" />
                  <span className="font-semibold">Tips & Tricks</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Pro tips:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Use specific keywords for better search results</li>
                    <li>Ask the AI to explain search results in detail</li>
                    <li>Try different search terms to explore connections</li>
                    <li>Save important results by copying the URLs</li>
                    <li>Use the visualization to discover related topics</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  )
}