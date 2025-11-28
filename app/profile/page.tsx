"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getUserProfile, updateUsername, updateBio, clearUserProfile, type UserProfile } from "../lib/user"
import { getDraftStats } from "../lib/drafts"

export default function ProfilePage() {
  const router = useRouter()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editBio, setEditBio] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const userProfile = getUserProfile()
    if (!userProfile) {
      router.push('/login')
      return
    }

    // Update stats from drafts
    const stats = getDraftStats()
    userProfile.stats = stats
    setProfile(userProfile)
    setEditUsername(userProfile.username)
    setEditBio(userProfile.bio)
  }, [router])

  const handleSave = () => {
    setError('')

    if (!/^[a-zA-Z0-9]{3,20}$/.test(editUsername)) {
      setError('Username must be 3-20 alphanumeric characters')
      return
    }

    updateUsername(editUsername)
    updateBio(editBio)

    setProfile(prev => prev ? { ...prev, username: editUsername, bio: editBio } : null)
    setIsEditing(false)
  }

  const handleSignOut = () => {
    clearUserProfile()
    router.push('/')
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div style={{ color: '#00FF00' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-[#0a0a0a] text-white"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      {/* Grid background */}
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

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em' }}>
              <span style={{ color: '#fff' }}>h2h.</span>
              <span style={{ color: '#00FF00' }}>cash</span>
            </div>
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link 
              href="/drafts"
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '20px',
                color: '#888',
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              My Drafts
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
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-24 px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            {/* Profile Header */}
            <div style={{
              padding: '32px',
              borderBottom: '1px solid #222',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '24px'
            }}>
              {/* Avatar */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #00FF00',
                flexShrink: 0
              }}>
                {profile.image ? (
                  <img 
                    src={profile.image} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    color: '#555'
                  }}>
                    {profile.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      maxLength={20}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        backgroundColor: '#0a0a0a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: 500,
                        marginBottom: '12px'
                      }}
                    />
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      maxLength={150}
                      rows={2}
                      placeholder="Add a bio..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        backgroundColor: '#0a0a0a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        resize: 'none'
                      }}
                    />
                    {error && (
                      <div style={{ color: '#ff6b35', fontSize: '12px', marginTop: '8px' }}>
                        {error}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>
                      {profile.username}
                    </h1>
                    <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                      {profile.email}
                    </p>
                    {profile.bio && (
                      <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.5 }}>
                        {profile.bio}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Edit Button */}
              <div>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditUsername(profile.username)
                        setEditBio(profile.bio)
                        setError('')
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#888',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#00FF00',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#000',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#888',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderBottom: '1px solid #222'
            }}>
              <div style={{ padding: '20px', textAlign: 'center', borderRight: '1px solid #222' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#fff' }}>
                  {profile.stats.totalDrafts}
                </div>
                <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em', marginTop: '4px' }}>
                  DRAFTS
                </div>
              </div>
              <div style={{ padding: '20px', textAlign: 'center', borderRight: '1px solid #222' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#00FF00' }}>
                  {profile.stats.wins}
                </div>
                <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em', marginTop: '4px' }}>
                  WINS
                </div>
              </div>
              <div style={{ padding: '20px', textAlign: 'center', borderRight: '1px solid #222' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#ff6b35' }}>
                  {profile.stats.losses}
                </div>
                <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em', marginTop: '4px' }}>
                  LOSSES
                </div>
              </div>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 600, 
                  color: profile.stats.netProfit >= 0 ? '#00FF00' : '#ff6b35' 
                }}>
                  {profile.stats.netProfit >= 0 ? '+' : ''}${profile.stats.netProfit}
                </div>
                <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em', marginTop: '4px' }}>
                  PROFIT
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#555' }}>
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#ff6b35',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Link 
              href="/drafts"
              style={{
                padding: '20px',
                backgroundColor: '#111',
                border: '1px solid #222',
                borderRadius: '12px',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
              <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>View Drafts</div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                {profile.stats.totalDrafts} total
              </div>
            </Link>
            <Link 
              href="/"
              style={{
                padding: '20px',
                backgroundColor: '#111',
                border: '1px solid #222',
                borderRadius: '12px',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
              <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>New Draft</div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                Start competing
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

