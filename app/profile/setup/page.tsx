"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { generateUsername, saveUserProfile, getUserProfile, type UserProfile } from "../../lib/user"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const existing = getUserProfile()
    if (!existing) {
      // No profile, redirect to login
      router.push('/login')
      return
    }

    // Check if profile is already complete (has custom username)
    if (existing.username && !existing.username.startsWith('Swift') && !existing.username.startsWith('Lucky') && !existing.username.startsWith('Bold')) {
      router.push('/drafts')
      return
    }

    setProfile(existing)
    setUsername(existing.username || generateUsername(existing.name || undefined))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate username
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      setError('Username must be 3-20 alphanumeric characters')
      return
    }

    if (!profile) {
      setError('Profile error. Please try signing in again.')
      return
    }

    setIsLoading(true)

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        username,
        bio: bio.slice(0, 150),
      }

      saveUserProfile(updatedProfile)
      router.push('/drafts')
    } catch (err) {
      setError('Failed to create profile. Please try again.')
      setIsLoading(false)
    }
  }

  const regenerateUsername = () => {
    setUsername(generateUsername(profile?.name || undefined))
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

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Setup Card */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '440px'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 400, 
            color: '#fff',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Set up your profile
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#555',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            Choose a username for the leaderboards
          </p>

          {/* Profile Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#0a0a0a',
            borderRadius: '12px',
            border: '1px solid #1a1a1a',
            marginBottom: '24px'
          }}>
            {/* Avatar */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #00FF00',
              flexShrink: 0
            }}>
              {profile?.image ? (
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
                  fontSize: '20px',
                  color: '#555'
                }}>
                  {profile?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 500, color: '#fff' }}>
                {username || 'Username'}
              </div>
              <div style={{ fontSize: '12px', color: '#555' }}>
                {profile?.email}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                color: '#888',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Username
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  maxLength={20}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                  placeholder="Enter username"
                />
                <button
                  type="button"
                  onClick={regenerateUsername}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    color: '#888',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  title="Generate random username"
                >
                  🎲
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#444', marginTop: '6px' }}>
                3-20 characters, letters and numbers only
              </div>
            </div>

            {/* Bio Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                color: '#888',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Bio <span style={{ color: '#555' }}>(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none'
                }}
                placeholder="Tell others about yourself..."
              />
              <div style={{ fontSize: '11px', color: '#444', marginTop: '6px', textAlign: 'right' }}>
                {bio.length}/150
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                border: '1px solid rgba(255, 107, 53, 0.3)',
                borderRadius: '8px',
                color: '#ff6b35',
                fontSize: '13px',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'linear-gradient(90deg, #00FF00, #00DD00)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading || !username ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? 'Creating profile...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

