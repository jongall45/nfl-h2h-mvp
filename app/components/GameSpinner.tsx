"use client"

import { useEffect, useState, useRef } from "react"

interface Game {
  id: string
  home_team: string
  away_team: string
}

interface GameSpinnerProps {
  games: Game[]
  targetGame: Game
  onComplete: () => void
}

export function GameSpinner({ games, targetGame, onComplete }: GameSpinnerProps) {
  const [displayIndex, setDisplayIndex] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  
  // Audio ref if you ever add sound later
  // const tickSound = useRef(new Audio('/tick.mp3'))

  useEffect(() => {
    let speed = 50 // Start fast (50ms)
    let totalTime = 0
    const maxTime = 6000 // 6 seconds (10s feels too long in practice, but manageable)
    let timeoutId: NodeJS.Timeout

    const spin = () => {
      // 1. Cycle the index
      setDisplayIndex((prev) => (prev + 1) % games.length)
      
      // 2. Increase time and slow down (exponential decay)
      totalTime += speed
      if (totalTime < maxTime * 0.7) {
        // First 70%: constant speed
        speed = 50
      } else {
        // Last 30%: slow down dramatically
        speed = speed * 1.1 
      }

      // 3. Check if done
      if (totalTime >= maxTime) {
        // LANDING SEQUENCE
        // Find the index of the actual target game so we display the right one
        const targetIndex = games.findIndex(g => g.id === targetGame.id)
        setDisplayIndex(targetIndex !== -1 ? targetIndex : 0)
        setIsLocked(true)
        
        // Wait 1 second on the locked screen before proceeding
        setTimeout(() => {
          onComplete()
        }, 1500)
      } else {
        // Keep spinning
        timeoutId = setTimeout(spin, speed)
      }
    }

    spin()

    return () => clearTimeout(timeoutId)
  }, [games, targetGame, onComplete])

  const currentGame = games[displayIndex] || games[0]

  return (
    <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
      <div className="text-zinc-500 text-sm uppercase tracking-[0.3em] mb-8 animate-pulse">
        Scouring NFL Schedule...
      </div>

      {/* The Reel */}
      <div className="relative w-full max-w-lg h-40 flex items-center justify-center overflow-hidden border-y border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        
        {/* The Glow Effect behind the text */}
        <div className={`absolute inset-0 bg-[#00FF00]/5 transition-opacity duration-300 ${isLocked ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* The Text */}
        <div className="z-10 text-center">
          <h2 className={`text-4xl md:text-6xl font-black italic tracking-tighter transition-all duration-100 ${
            isLocked 
              ? 'text-[#00FF00] scale-110 drop-shadow-[0_0_15px_rgba(0,255,0,0.8)]' 
              : 'text-zinc-700 blur-[1px]'
          }`}>
            {currentGame?.away_team.split(' ').pop()}
            <span className="text-zinc-600 mx-4 text-2xl not-italic font-normal">VS</span>
            {currentGame?.home_team.split(' ').pop()}
          </h2>
        </div>

        {/* Decorative scan lines */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      </div>

      <div className="mt-8 h-2 w-64 bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full bg-[#00FF00]/50 animate-[loading_6s_ease-out_forwards]" style={{ width: '100%' }}></div>
      </div>
    </div>
  )
}