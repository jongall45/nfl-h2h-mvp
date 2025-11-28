"use client"

import { useRef, useState, useEffect } from "react"
import { getTeamLogoUrl, getPlayerId, getPlayerHeadshotUrl } from "../../lib/espn"

// ============ COMPONENTS ============

export function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl border border-[#222] bg-[#0a0a0a] text-zinc-200 shadow-2xl transition-all duration-300 hover:border-[#333] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255, 107, 53, 0.08), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  )
}

// Player headshot component with auto-fetch
function PlayerHeadshot({ playerName, size = "sm" }: { playerName: string; size?: "sm" | "md" | "lg" }) {
  const [headshotUrl, setHeadshotUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // Size in pixels
  const sizePixels = { sm: 32, md: 40, lg: 48 }
  const px = sizePixels[size]
  
  useEffect(() => {
    if (!playerName) {
      setLoading(false)
      return
    }
    
    let mounted = true
    
    getPlayerId(playerName).then(id => {
      if (mounted) {
        setHeadshotUrl(getPlayerHeadshotUrl(id))
        setLoading(false)
      }
    })
    
    return () => { mounted = false }
  }, [playerName])
  
  return (
    <div style={{ width: px, height: px, minWidth: px, minHeight: px, maxWidth: px, maxHeight: px, borderRadius: '50%', overflow: 'hidden', backgroundColor: '#161616', border: '1px solid #333', flexShrink: 0, position: 'relative' }}>
      {loading ? (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#222' }} className="animate-pulse" />
      ) : headshotUrl && !error ? (
        <img 
          src={headshotUrl} 
          alt={playerName || "Player"}
          width={px}
          height={px}
          style={{ width: px, height: px, minWidth: px, minHeight: px, maxWidth: px, maxHeight: px, objectFit: 'cover' }}
          className="rounded-full"
          onError={() => setError(true)}
        />
      ) : (
        <div style={{ width: px, height: px, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 12, fontWeight: 'bold' }}>
          {playerName?.charAt(0) || "?"}
        </div>
      )}
    </div>
  )
}

// Team logo component
function TeamLogo({ teamName, size = "sm" }: { teamName: string; size?: "sm" | "md" | "lg" }) {
  const [error, setError] = useState(false)
  const logoUrl = getTeamLogoUrl(teamName || "")
  
  // Size in pixels
  const sizePixels = { sm: 24, md: 32, lg: 40 }
  const px = sizePixels[size]
  
  if (!logoUrl || error) return null
  
  return (
    <img 
      src={logoUrl} 
      alt={teamName || "Team"}
      width={px}
      height={px}
      style={{ width: px, height: px, minWidth: px, minHeight: px, maxWidth: px, maxHeight: px, objectFit: 'contain' }}
      onError={() => setError(true)}
    />
  )
}

interface Player {
  player: string
  stat: string
  line: number
  type: string
}

interface MatchupCardProps {
  homeTeam: string
  awayTeam: string
  homePlayers: Player[]
  awayPlayers: Player[]
  onSelectProp: (player: Player, team: string, opponent: string) => void
}

export function MatchupCard({ homeTeam, awayTeam, homePlayers, awayPlayers, onSelectProp }: MatchupCardProps) {
  return (
    <div style={{
      borderRadius: '16px',
      backgroundColor: '#111',
      border: '1px solid #222',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      maxWidth: '360px',
      margin: '0 auto'
    }}>
      {/* Header with team matchup */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a' }}>
        {/* MATCHUP HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TeamLogo teamName={awayTeam} size="sm" />
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff', textTransform: 'uppercase' }}>{awayTeam}</span>
          </div>
          <span style={{ color: '#444', fontSize: '11px' }}>vs</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff', textTransform: 'uppercase' }}>{homeTeam}</span>
            <TeamLogo teamName={homeTeam} size="sm" />
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '8px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Select Your Prop
        </div>
      </div>

      {/* Props list - scrollable inner content */}
      <div style={{ 
        margin: '8px',
        padding: '8px',
        backgroundColor: '#0a0a0a',
        borderRadius: '12px',
        border: '1px solid #1a1a1a',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {/* AWAY TEAM SECTION */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingLeft: '4px' }}>
            <TeamLogo teamName={awayTeam} size="sm" />
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{awayTeam}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {awayPlayers.map((player, idx) => (
              <button
                key={idx}
                onClick={() => onSelectProp(player, awayTeam, homeTeam)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #1a1a1a',
                  backgroundColor: '#111',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover:border-[#00FF00]/30 hover:bg-[#161616]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlayerHeadshot playerName={player.player} size="sm" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#ffffff', fontWeight: 500, fontSize: '12px' }}>{player.player}</div>
                    <div style={{ color: '#666', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{player.stat}</div>
                  </div>
                </div>
                <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>{player.line}</div>
              </button>
            ))}
          </div>
        </div>

        {/* DIVIDER BETWEEN TEAMS */}
        <div style={{ height: '1px', backgroundColor: '#1a1a1a', margin: '8px 0' }}></div>

        {/* HOME TEAM SECTION */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingLeft: '4px' }}>
            <TeamLogo teamName={homeTeam} size="sm" />
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{homeTeam}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {homePlayers.map((player, idx) => (
              <button
                key={idx}
                onClick={() => onSelectProp(player, homeTeam, awayTeam)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #1a1a1a',
                  backgroundColor: '#111',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover:border-[#00FF00]/30 hover:bg-[#161616]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlayerHeadshot playerName={player.player} size="sm" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#ffffff', fontWeight: 500, fontSize: '12px' }}>{player.player}</div>
                    <div style={{ color: '#666', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{player.stat}</div>
                  </div>
                </div>
                <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>{player.line}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
