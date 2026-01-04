import { useEffect } from 'react'
import { initializeSlideCoinsEcosystem } from '@/lib/slideCoinsIntegration'

export default function App() {
  useEffect(() => {
    initializeSlideCoinsEcosystem()
  }, [])

  return (
    <div className="app">
      {/* Your app content here */}
    </div>
  )
}
