"use client"

import { useState, useEffect } from "react"
import { getPlayerId, getPlayerHeadshotUrl } from "../lib/espn"

interface AlternateLine {
  line: number
  odds: number
  points: number
  riskLabel: string
}

interface BettingCardProps {
  player: string
  team: string
  opponent: string
  stat: string
  line: number
  odds?: number
  type: string
  alternateLines?: AlternateLine[]
  onLockIn: (points: number, finalLine: number, riskLabel: string) => void
}

export function BettingCard({ player, team, opponent, stat, line, odds, type, alternateLines = [], onLockIn }: BettingCardProps) {
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0)
  const [imageError, setImageError] = useState(false)
  const [headshotUrl, setHeadshotUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Find and set the base line index on mount
  useEffect(() => {
    if (alternateLines.length > 0) {
      // Find the line closest to -110 odds (the "base" line)
      const baseIndex = alternateLines.findIndex(l => 
        l.odds >= -120 && l.odds <= -100
      )
      setSelectedLineIndex(baseIndex >= 0 ? baseIndex : Math.floor(alternateLines.length / 2))
    }
  }, [alternateLines])
  
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
  
  // If no alternate lines, fall back to single line with default points
  const hasAlternates = alternateLines.length > 0
  const selectedLine = hasAlternates ? alternateLines[selectedLineIndex] : { 
    line, 
    odds: odds || -110, 
    points: 5, 
    riskLabel: 'BASE' 
  }
  
  const potentialPoints = selectedLine.points
  const targetYards = selectedLine.line
  const riskLabel = selectedLine.riskLabel

  // Format odds for display
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`
  }

  // Get color based on risk
  const getRiskColor = (label: string) => {
    switch(label) {
      case 'SAFE': return '#00FF00'
      case 'BASE': return '#ffffff'
      case 'RISK': return '#ff6b35'
      case 'MAX': return '#ef4444'
      default: return '#ffffff'
    }
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
          
          {/* Risk indicator badge */}
          <div style={{ 
            padding: '4px 10px', 
            borderRadius: '20px', 
            backgroundColor: `${getRiskColor(riskLabel)}15`,
            border: `1px solid ${getRiskColor(riskLabel)}40`
          }}>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 600, 
              color: getRiskColor(riskLabel),
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {riskLabel}
            </span>
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
          {/* Target Yards & Odds - Large Display */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '42px', 
              fontWeight: 600, 
              color: '#ffffff',
              lineHeight: 1,
              marginBottom: '4px'
            }}>
              {targetYards}+
            </div>
            <div style={{ color: '#555', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
              {stat.replace(' Yards', '')} Yards
            </div>
            {/* Odds display */}
            <div style={{ 
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: '#111',
              borderRadius: '6px',
              border: '1px solid #222'
            }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: selectedLine.odds > 0 ? '#00FF00' : '#888'
              }}>
                {formatOdds(selectedLine.odds)}
              </span>
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
              color: getRiskColor(riskLabel),
              transition: 'color 0.2s',
              marginBottom: '4px'
            }}>
              {potentialPoints}
        </div>
            <div style={{ color: '#555', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Points
        </div>
      </div>

          {/* ===== LINE SELECTION ===== */}
          {hasAlternates && alternateLines.length > 1 ? (
            <div>
              <div style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>
                Select Line
              </div>
              
              {/* Line Options Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
                gap: '8px',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '4px'
              }}>
                {alternateLines.map((altLine, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedLineIndex(index)}
                    style={{
                      padding: '10px 8px',
                      backgroundColor: selectedLineIndex === index ? '#1a1a1a' : 'transparent',
                      border: `1px solid ${selectedLineIndex === index ? getRiskColor(altLine.riskLabel) : '#222'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      opacity: selectedLineIndex === index ? 1 : 0.7
                    }}
                  >
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#fff',
                      marginBottom: '2px'
                    }}>
                      {altLine.line}+
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: altLine.odds > 0 ? '#00FF00' : '#666',
                      marginBottom: '4px'
                    }}>
                      {formatOdds(altLine.odds)}
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: getRiskColor(altLine.riskLabel)
                    }}>
                      {altLine.points}pt
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Legend */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '16px', 
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #1a1a1a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00FF00' }}></div>
                  <span style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Safe</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffffff' }}></div>
                  <span style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Base</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff6b35' }}></div>
                  <span style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Risk</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                  <span style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Max</span>
                </div>
              </div>
            </div>
          ) : (
            /* Fallback: No alternates available */
            <div style={{ 
              textAlign: 'center', 
              padding: '12px',
              backgroundColor: '#111',
              borderRadius: '10px',
              border: '1px solid #1a1a1a'
            }}>
              <div style={{ fontSize: '11px', color: '#666' }}>
                Standard line only
              </div>
            </div>
          )}
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
            Lock In • {potentialPoints} Points
          </button>
      </div>
      </div>
    </div>
  )
}
