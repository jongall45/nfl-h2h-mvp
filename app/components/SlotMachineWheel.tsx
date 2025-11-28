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
    
    let speed = 30
    let elapsed = 0
    const totalDuration = 1800  // Reduced from 5000 to 1800ms (1.8 seconds)
    const slowdownStart = 1000  // Start slowing at 1 second
    let timeoutId: NodeJS.Timeout

    const spin = () => {
      setDisplayIndex(Math.floor(Math.random() * games.length))
      
      elapsed += speed
      
      if (elapsed < slowdownStart) {
        setPhase('spinning')
        setBlur(2)
        speed = 30 + Math.random() * 15
      } else if (elapsed < totalDuration) {
        setPhase('slowing')
        const progress = (elapsed - slowdownStart) / (totalDuration - slowdownStart)
        setBlur(Math.max(0, 2 * (1 - progress)))
        speed = 30 + (progress * 200)
      } else {
        const targetIndex = games.findIndex(g => g.id === targetGame.id)
        setDisplayIndex(targetIndex !== -1 ? targetIndex : 0)
        setPhase('locked')
        setBlur(0)
        
        setTimeout(() => {
          onComplete()
        }, 600)  // Reduced from 1500 to 600ms
        return
      }
      
      timeoutId = setTimeout(spin, speed)
    }

    const startDelay = setTimeout(() => spin(), 100)  // Reduced from 300 to 100ms

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(startDelay)
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
                transition: 'width 1.8s ease-out',
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