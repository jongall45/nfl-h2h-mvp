"use client"

import { useEffect, useState } from "react"
import { User } from "lucide-react"
import { getPlayerId, getPlayerHeadshotUrl } from "../lib/espn"

interface OpponentRevealProps {
  onComplete: (opponentPick: any) => void
  availableProps: any[] // We accept the list of players now
}

export function OpponentReveal({ onComplete, availableProps }: OpponentRevealProps) {
  const [step, setStep] = useState(0)
  const [headshotUrl, setHeadshotUrl] = useState<string | null>(null)
  
  // Bot Logic: Pick a random player from the list
  const [opponentPick] = useState(() => {
    const randomProp = availableProps[Math.floor(Math.random() * availableProps.length)] || { player: "Opponent", stat: "Props" }
    const isAggressive = Math.random() > 0.5
    return {
      ...randomProp,
      isAggressive,
      points: isAggressive ? 8 : 2,
      strategy: isAggressive ? "RISK" : "SAFE"
    }
  })

  // Fetch headshot for opponent's pick
  useEffect(() => {
    if (opponentPick?.player) {
      getPlayerId(opponentPick.player).then(id => {
        if (id) setHeadshotUrl(getPlayerHeadshotUrl(id))
      })
    }
  }, [opponentPick])

  useEffect(() => {
    setTimeout(() => setStep(1), 1500)
    setTimeout(() => onComplete(opponentPick), 4500) // Pass the pick back
  }, [onComplete, opponentPick])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-[340px] mx-auto p-4">
        
        {/* Main Card Container */}
        <div style={{
          borderRadius: '20px',
          backgroundColor: '#111',
          border: '1px solid #222',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          
          {/* Header */}
          <div style={{ padding: '20px 20px 16px', textAlign: 'center' }}>
            {/* Icon */}
            <div style={{ 
              width: 48, 
              height: 48, 
              margin: '0 auto 12px',
              borderRadius: '50%',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User style={{ width: 24, height: 24, color: '#555' }} />
            </div>
            
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontStyle: 'italic', marginBottom: '4px' }}>
              OPPONENT LOCKED IN
            </h2>
            <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em' }} className="animate-pulse">
              Analyzing Strategy...
            </p>
          </div>

          {/* Inner Content Area */}
          {step === 1 && (
            <div style={{ 
              margin: '0 12px 12px',
              backgroundColor: '#0a0a0a',
              borderRadius: '14px',
              border: '1px solid #1a1a1a',
              overflow: 'hidden'
            }}>
              {/* Player They Picked */}
              <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ fontSize: '9px', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                  They Picked
                </div>
                
                {/* Player Headshot */}
                <div style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  overflow: 'hidden', 
                  margin: '0 auto 10px', 
                  backgroundColor: '#161616', 
                  border: '2px solid #333' 
                }}>
                  {headshotUrl ? (
                    <img 
                      src={headshotUrl} 
                      alt={opponentPick.player}
                      style={{ width: 56, height: 56, objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 20, fontWeight: 600 }}>
                      {opponentPick.player?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{opponentPick.player}</div>
                <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{opponentPick.stat}</div>
              </div>

              {/* Strategy & Points */}
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 700, 
                  color: opponentPick.isAggressive ? '#ff6b35' : '#00FF00' 
                }}>
                  {opponentPick.strategy}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#fff' }}>
                  {opponentPick.points} PTS
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
