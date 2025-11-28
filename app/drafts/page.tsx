"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getDrafts, getDraftStats, deleteDraft, type Draft } from "../lib/drafts"
import { getPlayerId, getPlayerHeadshotUrl } from "../lib/espn"

// Player headshot component
function PlayerHeadshot({ playerName, size = 32 }: { playerName: string; size?: number }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getPlayerId(playerName).then(id => {
      if (id) setUrl(getPlayerHeadshotUrl(id))
    })
  }, [playerName])

  if (!url || error) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          color: '#555'
        }}
      >
        {playerName?.charAt(0) || '?'}
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={playerName}
      onError={() => setError(true)}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        objectFit: 'cover',
        border: '1px solid #333'
      }}
    />
  )
}

// Generate random username
function generateUsername(): string {
  const adjectives = ['Swift', 'Lucky', 'Bold', 'Sharp', 'Quick', 'Clever', 'Fierce', 'Steady']
  const nouns = ['Tiger', 'Eagle', 'Wolf', 'Hawk', 'Bear', 'Lion', 'Falcon', 'Shark']
  const num = Math.floor(Math.random() * 99) + 1
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${num}`
}

// Draft card component
function DraftCard({ draft, onDelete, username }: { draft: Draft; onDelete: (id: string) => void; username: string }) {
  const [expanded, setExpanded] = useState(false)
  const [opponentName] = useState(() => generateUsername())
  const date = new Date(draft.createdAt)
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  const statusColors = {
    pending: '#00FF00',
    won: '#00FF00',
    lost: '#ff6b35',
    push: '#888'
  }

  const statusLabels = {
    pending: 'LIVE',
    won: 'WON',
    lost: 'LOST',
    push: 'PUSH'
  }

  return (
    <div style={{
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '12px'
    }}>
      {/* Header - Always visible */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: expanded ? '1px solid #222' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Status indicator */}
          <div style={{
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: `${statusColors[draft.status]}15`,
            border: `1px solid ${statusColors[draft.status]}40`
          }}>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 600, 
              color: statusColors[draft.status],
              letterSpacing: '0.1em'
            }}>
              {statusLabels[draft.status]}
            </span>
          </div>

          {/* Matchup info - User vs Opponent */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#00FF00' }}>{username}</span>
              <span style={{ color: '#555', fontSize: '12px' }}>vs</span>
              <span style={{ color: '#ff6b35' }}>{opponentName}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
              {formattedDate}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Points comparison */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              <span style={{ color: '#00FF00' }}>{draft.userTotalPoints}</span>
              <span style={{ color: '#555', margin: '0 6px' }}>-</span>
              <span style={{ color: '#ff6b35' }}>{draft.opponentTotalPoints}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.05em' }}>
              {draft.isDoubledDown ? '8X MULTIPLIER' : 'STANDARD'}
            </div>
          </div>

          {/* Payout */}
          <div style={{ 
            textAlign: 'right',
            padding: '8px 16px',
            backgroundColor: draft.status === 'won' ? 'rgba(0,255,0,0.1)' : 'transparent',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: draft.status === 'won' ? '#00FF00' : '#fff' 
            }}>
              ${draft.potentialPayout}
            </div>
            <div style={{ fontSize: '10px', color: '#555' }}>PAYOUT</div>
          </div>

          {/* Expand arrow */}
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#555"
            strokeWidth="2"
            style={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '16px 20px' }}>
          {/* Picks comparison */}
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            backgroundColor: '#0a0a0a',
            borderRadius: '12px',
            border: '1px solid #1a1a1a',
            overflow: 'hidden'
          }}>
            {/* Your Picks */}
            <div style={{ flex: 1, padding: '16px', borderRight: '1px solid #1a1a1a' }}>
              <div style={{ 
                fontSize: '10px', 
                color: '#00FF00', 
                fontWeight: 600, 
                letterSpacing: '0.1em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00FF00' }} />
                YOUR PICKS
              </div>
              {draft.userPicks.slice(0, 5).map((pick, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '8px'
                }}>
                  <PlayerHeadshot playerName={pick.player} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>
                      {pick.player}
                    </div>
                    <div style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase' }}>
                      {pick.finalLine}+ {pick.stat.includes('Pass') ? 'Pass' : pick.stat.includes('Rush') ? 'Rush' : 'Rec'} YDS
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: pick.potentialPoints > 5 ? '#00FF00' : '#fff' 
                  }}>
                    {pick.potentialPoints} PTS
                  </div>
                </div>
              ))}
            </div>

            {/* Opponent Picks */}
            <div style={{ flex: 1, padding: '16px' }}>
              <div style={{ 
                fontSize: '10px', 
                color: '#ff6b35', 
                fontWeight: 600, 
                letterSpacing: '0.1em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ff6b35' }} />
                OPPONENT
              </div>
              {draft.opponentPicks.slice(0, 5).map((pick, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '8px'
                }}>
                  <PlayerHeadshot playerName={pick.player} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>
                      {pick.player}
                    </div>
                    <div style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase' }}>
                      {pick.line}+ {pick.stat.includes('Pass') ? 'Pass' : pick.stat.includes('Rush') ? 'Rush' : 'Rec'} YDS
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: pick.points > 5 ? '#ff6b35' : '#fff' 
                  }}>
                    {pick.points} PTS
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginTop: '12px',
            gap: '8px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Delete this draft?')) {
                  onDelete(draft.id)
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#666',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [stats, setStats] = useState({ totalDrafts: 0, wins: 0, losses: 0, pending: 0, winRate: 0, netProfit: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [username] = useState(() => {
    // Generate or retrieve user's username
    if (typeof window !== 'undefined') {
      let stored = localStorage.getItem('h2h_username')
      if (!stored) {
        const adjectives = ['Swift', 'Lucky', 'Bold', 'Sharp', 'Quick', 'Clever', 'Fierce', 'Steady']
        const nouns = ['Tiger', 'Eagle', 'Wolf', 'Hawk', 'Bear', 'Lion', 'Falcon', 'Shark']
        const num = Math.floor(Math.random() * 99) + 1
        stored = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${num}`
        localStorage.setItem('h2h_username', stored)
      }
      return stored
    }
    return 'You'
  })

  useEffect(() => {
    setDrafts(getDrafts())
    setStats(getDraftStats())
  }, [])

  const handleDelete = (id: string) => {
    deleteDraft(id)
    setDrafts(getDrafts())
    setStats(getDraftStats())
  }

  return (
    <div 
      className="min-h-screen bg-[#0a0a0a] text-white"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      {/* Grid background with mouse reveal */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`
        }}
      />
      <div 
        className="fixed z-0 pointer-events-none"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(0,255,0,0.12) 0%, rgba(0,255,0,0.05) 40%, transparent 70%)',
          borderRadius: '50%'
        }}
      />

      {/* Header - Centered */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="flex flex-col items-center justify-center gap-3">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em' }}>
              <span style={{ color: '#fff' }}>h2h.</span>
              <span style={{ color: '#00FF00' }}>cash</span>
            </div>
          </Link>
          <Link 
            href="/"
            className="psl-glass-btn"
            style={{ textDecoration: 'none' }}
          >
            <span className="dot"></span>
            <span className="btn-text">New Draft</span>
            <span className="arrow">→</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-32 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Page title */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 400, 
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: '8px'
            }}>
              My Drafts
            </h1>
            <p style={{ fontSize: '14px', color: '#555' }}>
              Track your matchups and see how your picks are performing
            </p>
          </div>

          {/* Stats cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: '#111',
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#fff' }}>
                {stats.totalDrafts}
              </div>
              <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em', marginTop: '4px' }}>
                TOTAL DRAFTS
              </div>
            </div>

            <div style={{
              backgroundColor: '#111',
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#00FF00' }}>
                {stats.wins}
              </div>
              <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em', marginTop: '4px' }}>
                WINS
              </div>
            </div>

            <div style={{
              backgroundColor: '#111',
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#ff6b35' }}>
                {stats.losses}
              </div>
              <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em', marginTop: '4px' }}>
                LOSSES
              </div>
            </div>

            <div style={{
              backgroundColor: '#111',
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 600, 
                color: stats.netProfit >= 0 ? '#00FF00' : '#ff6b35' 
              }}>
                {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit}
              </div>
              <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em', marginTop: '4px' }}>
                NET PROFIT
              </div>
            </div>
          </div>

          {/* Drafts list */}
          {drafts.length === 0 ? (
            <div style={{
              backgroundColor: '#111',
              border: '1px solid #222',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏈</div>
              <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#fff', marginBottom: '8px' }}>
                No drafts yet
              </h3>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '24px' }}>
                Complete your first draft to see it here
              </p>
              <Link 
                href="/"
                className="psl-glass-btn"
                style={{ textDecoration: 'none', display: 'inline-flex' }}
              >
                <span className="dot"></span>
                <span className="btn-text">Start Drafting</span>
                <span className="arrow">→</span>
              </Link>
            </div>
          ) : (
            <div>
              {drafts.map(draft => (
                <DraftCard 
                  key={draft.id} 
                  draft={draft} 
                  onDelete={handleDelete}
                  username={username}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

