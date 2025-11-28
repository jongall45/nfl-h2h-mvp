"use client"

import { useEffect, useState } from "react"
import { getTeamLogoUrl } from "../lib/espn"

interface Game {
  id: string
  home_team: string
  away_team: string
}

interface SlotMachineWheelProps {
  games: Game[]
  targetGame: Game
  onComplete: () => void
}

// Team logo component with fixed size
function TeamLogo({ teamName, size = 48 }: { teamName: string; size?: number }) {
  const [error, setError] = useState(false)
  
  const teamKey = teamName?.split(' ').pop() || teamName
  const logoUrl = getTeamLogoUrl(teamKey)
  
  if (!logoUrl || error) {
    return (
      <div 
        className="bg-zinc-700 rounded-full flex items-center justify-center text-white font-bold"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        {teamKey?.charAt(0) || "?"}
      </div>
    )
  }
  
  return (
    <img 
      src={logoUrl} 
      alt={teamName}
      width={size}
      height={size}
      style={{ width: size, height: size, minWidth: size, minHeight: size, objectFit: 'contain' }}
      onError={() => setError(true)}
    />
  )
}

export function SlotMachineWheel({ games, targetGame, onComplete }: SlotMachineWheelProps) {
  const [displayIndex, setDisplayIndex] = useState(0)
  const [phase, setPhase] = useState<'spinning' | 'slowing' | 'locked'>('spinning')
  const [blur, setBlur] = useState(2)
  
  useEffect(() => {
    if (!games || games.length === 0 || !targetGame) return
    
    let speed = 50
    let count = 0
    const totalSpins = 8  // Just 8 quick spins
    let timeoutId: NodeJS.Timeout
    let lastIndex = -1  // Track last shown game to avoid repeats

    const spin = () => {
      // Pick a random index that's different from the last one
      let newIndex
      if (games.length > 1) {
        do {
          newIndex = Math.floor(Math.random() * games.length)
        } while (newIndex === lastIndex)
      } else {
        newIndex = 0
      }
      lastIndex = newIndex
      setDisplayIndex(newIndex)
      count++
      
      if (count < totalSpins) {
        setPhase('spinning')
        setBlur(1)
        speed = 50 + (count * 15)  // Gets slightly slower each spin
        timeoutId = setTimeout(spin, speed)
      } else {
        // Lock on target
        const targetIndex = games.findIndex(g => g.id === targetGame.id)
        setDisplayIndex(targetIndex !== -1 ? targetIndex : 0)
        setPhase('locked')
        setBlur(0)
        
        setTimeout(() => {
          onComplete()
        }, 400)  // Quick 400ms pause then move on
      }
    }

    // Start immediately
    spin()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [games, targetGame, onComplete])

  // Show loading if no games
  if (!games || games.length === 0 || !targetGame) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="text-[#00FF00] text-sm tracking-[0.3em] font-medium animate-pulse">
          LOADING GAMES...
        </div>
      </div>
    )
  }

  const currentGame = games[displayIndex] || games[0]
  const awayTeam = currentGame?.away_team?.split(' ').pop() || "AWAY"
  const homeTeam = currentGame?.home_team?.split(' ').pop() || "HOME"

  return (
    <div className="flex flex-col items-center justify-center w-full">
      
      {/* Main Card Container */}
      <div style={{
        borderRadius: '20px',
        backgroundColor: '#111',
        border: '1px solid #222',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        width: '100%',
        maxWidth: '360px'
      }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #1a1a1a' }}>
          <div style={{ 
            fontSize: '11px', 
            color: phase === 'locked' ? '#00FF00' : '#888', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em',
            fontWeight: 600
          }}>
            {phase === 'locked' ? 'Match Found' : 'Finding Your Match...'}
          </div>
        </div>

        {/* Inner Content Area - The Spinner */}
        <div style={{ 
          margin: '12px',
          padding: '24px 16px',
          backgroundColor: '#0a0a0a',
          borderRadius: '14px',
          border: phase === 'locked' ? '1px solid rgba(0, 255, 0, 0.3)' : '1px solid #1a1a1a',
          transition: 'border-color 0.3s',
          boxShadow: phase === 'locked' ? '0 0 20px rgba(0, 255, 0, 0.1)' : 'none'
        }}>
          
          {/* Matchup Display */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              filter: phase !== 'locked' ? `blur(${blur}px)` : 'none',
              transition: 'filter 0.15s'
            }}
          >
            {/* Away Team */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <TeamLogo teamName={currentGame?.away_team} size={48} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textTransform: 'uppercase' }}>
                {awayTeam}
              </span>
            </div>
            
            {/* VS */}
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 700, 
              color: '#00FF00',
              padding: '0 8px'
            }}>
              VS
            </div>
            
            {/* Home Team */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <TeamLogo teamName={currentGame?.home_team} size={48} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textTransform: 'uppercase' }}>
                {homeTeam}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div style={{ padding: '0 20px 16px' }}>
          {/* Progress bar */}
          <div style={{ 
            height: '4px', 
            backgroundColor: '#1a1a1a', 
            borderRadius: '2px', 
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div 
              style={{
                height: '100%',
                backgroundColor: '#00FF00',
                borderRadius: '2px',
                width: phase === 'locked' ? '100%' : '0%',
                transition: 'width 0.8s ease-out',
                boxShadow: '0 0 8px rgba(0, 255, 0, 0.5)'
              }}
            />
          </div>
          
          {/* Status message */}
          <div style={{ 
            textAlign: 'center',
            fontSize: '10px', 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            color: phase === 'locked' ? '#00FF00' : '#555'
          }}>
            {phase === 'locked' ? 'Loading Props...' : 'Scanning NFL Games...'}
          </div>
        </div>
      </div>
      
    </div>
  )
}