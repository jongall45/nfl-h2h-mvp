"use client"

import { useState, useEffect } from "react"
import { getPlayerId, getPlayerHeadshotUrl } from "../lib/espn"

interface BettingCardProps {
  player: string
  team: string
  opponent: string
  stat: string
  line: number
  type: string
  onLockIn: (points: number, finalLine: number, riskLabel: string) => void
}

export function BettingCard({ player, team, opponent, stat, line, type, onLockIn }: BettingCardProps) {
  const [sliderValue, setSliderValue] = useState(50)
  const [imageError, setImageError] = useState(false)
  const [headshotUrl, setHeadshotUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Fetch player headshot
  useEffect(() => {
    if (!player) {
      setLoading(false)
      return
    }
    
    let mounted = true
    
    getPlayerId(player).then(id => {
      if (mounted) {
        setHeadshotUrl(getPlayerHeadshotUrl(id))
        setLoading(false)
      }
    })
    
    return () => { mounted = false }
  }, [player])
  
  // Math Logic
  const isQB = type === 'player_pass_yds';
  const yardMultiplier = isQB ? 25 : 10;
  const pointOffset = Math.round(((sliderValue - 50) / 50) * 3); 
  const targetYards = Math.round(line + (pointOffset * yardMultiplier));
  const potentialPoints = 5 + pointOffset;

  // Calculate min/max yards
  const minYards = Math.round(line - (3 * yardMultiplier))
  const maxYards = Math.round(line + (3 * yardMultiplier))

  // --- Dynamic Styling ---
  let riskLabel = "BASE"
  
  if (potentialPoints < 5) {
    riskLabel = "SAFE"
  } else if (potentialPoints > 5) {
    riskLabel = "RISK"
  }

  return (
    <div className="w-full max-w-[340px] mx-auto relative z-10">
      {/* Outer card with rounded corners and subtle border */}
      <div style={{
        borderRadius: '20px',
        backgroundColor: '#111',
        border: '1px solid #222',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        
        {/* ===== HEADER ROW ===== */}
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Player Avatar */}
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            overflow: 'hidden', 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333',
            flexShrink: 0 
          }}>
            {loading ? (
              <div style={{ width: 40, height: 40, backgroundColor: '#222' }} className="animate-pulse" />
            ) : headshotUrl && !imageError ? (
              <img 
                src={headshotUrl} 
                alt={player}
                style={{ width: 40, height: 40, objectFit: 'cover' }}
                onError={() => setImageError(true)}
              />
            ) : (
              <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 16, fontWeight: 500 }}>
                {player.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Dots indicator */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: potentialPoints < 5 ? '#00FF00' : '#333' }}></div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: potentialPoints === 5 ? '#ffffff' : '#333' }}></div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: potentialPoints > 5 ? '#ff6b35' : '#333' }}></div>
          </div>
        </div>

        {/* ===== PLAYER NAME & STAT ===== */}
        <div style={{ padding: '0 18px 12px' }}>
          <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 500, marginBottom: '2px' }}>{player}</div>
          <div style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat}</div>
        </div>

        {/* ===== MAIN CONTENT AREA ===== */}
        <div style={{ 
          margin: '0 12px 12px',
          padding: '20px 16px',
          backgroundColor: '#0a0a0a',
          borderRadius: '14px',
          border: '1px solid #1a1a1a'
        }}>
          {/* Target Yards - Large Display */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '42px', 
              fontWeight: 600, 
              color: '#ffffff',
              lineHeight: 1,
              marginBottom: '4px'
            }}>
              {targetYards}
            </div>
            <div style={{ color: '#555', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Target Yards
            </div>
          </div>

          {/* Points Display */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            padding: '14px',
            backgroundColor: '#111',
            borderRadius: '10px',
            border: '1px solid #1a1a1a'
          }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: 300, 
              lineHeight: 1,
              color: potentialPoints < 5 ? '#00FF00' : potentialPoints > 5 ? '#ff6b35' : '#ffffff',
              transition: 'color 0.2s',
              marginBottom: '4px'
            }}>
              {potentialPoints}
            </div>
            <div style={{ color: '#555', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Points
            </div>
          </div>

          {/* ===== SLIDER SECTION ===== */}
          <div>
            {/* Slider Label */}
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '10px' }}>
              Adjust Line
            </div>
            
            {/* Min/Max Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#00FF00', fontSize: '11px', fontWeight: 500 }}>{minYards}</span>
              <span style={{ color: '#ff6b35', fontSize: '11px', fontWeight: 500 }}>{maxYards}</span>
            </div>
            
            {/* Slider Track */}
            <div style={{ position: 'relative', height: '32px', display: 'flex', alignItems: 'center' }}>
              {/* Track Background */}
              <div style={{ 
                position: 'absolute', 
                width: '100%', 
                height: '4px', 
                backgroundColor: '#222', 
                borderRadius: '2px' 
              }}></div>
              
              {/* Track Fill */}
              <div style={{ 
                position: 'absolute', 
                height: '4px', 
                background: 'linear-gradient(90deg, #00FF00, #00DD00)',
                borderRadius: '2px',
                width: `${sliderValue}%`,
                boxShadow: '0 0 8px rgba(0, 255, 0, 0.3)'
              }}></div>

              {/* Handle - Pill with arrows */}
              <div style={{ 
                position: 'absolute',
                left: `calc(${sliderValue}% - 18px)`,
                width: '36px',
                height: '22px',
                borderRadius: '11px',
                backgroundColor: '#222',
                border: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1px',
                zIndex: 40,
                pointerEvents: 'none',
                transition: 'left 0.05s ease-out'
              }}>
                <svg width="5" height="9" viewBox="0 0 6 10" fill="none">
                  <path d="M5 1L1 5L5 9" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <svg width="5" height="9" viewBox="0 0 6 10" fill="none">
                  <path d="M1 1L5 5L1 9" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Invisible Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                style={{ 
                  width: '100%', 
                  height: '32px', 
                  opacity: 0, 
                  cursor: 'grab', 
                  position: 'absolute', 
                  zIndex: 50 
                }}
              />
            </div>
            
            {/* Risk Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: '#00FF00', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Safe</span>
              <span style={{ color: '#444', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Base</span>
              <span style={{ color: '#ff6b35', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Risk</span>
            </div>
          </div>
        </div>
        
        {/* ===== LOCK IN BUTTON ===== */}
        <div style={{ padding: '0 12px 12px' }}>
          <button 
            onClick={() => onLockIn(potentialPoints, targetYards, riskLabel)}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'linear-gradient(90deg, #00FF00, #00DD00)',
              color: '#000000',
              fontWeight: 600,
              fontSize: '13px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="hover:opacity-90 active:scale-[0.98]"
          >
            Lock In Pick
          </button>
        </div>
      </div>
    </div>
  )
}
