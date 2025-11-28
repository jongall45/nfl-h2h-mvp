"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { saveUserProfile, type UserProfile } from "../lib/user"

export default function LoginPage() {
  const router = useRouter()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !email) return
    
    setIsLoading(true)
    
    // Create profile with the username they entered
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      email: email,
      name: username,
      username: username, // Use the username they entered
      image: null,
      bio: '',
      createdAt: new Date().toISOString(),
      stats: {
        totalDrafts: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        netProfit: 0
      }
    }
    
    saveUserProfile(profile)
    router.push('/drafts')
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
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: 500, 
            letterSpacing: '-0.02em',
            marginBottom: '48px'
          }}>
            <span style={{ color: '#fff' }}>h2h.</span>
            <span style={{ color: '#00FF00' }}>cash</span>
          </div>
        </Link>

        {/* Login Card */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 400, 
            color: '#fff',
            marginBottom: '8px'
          }}>
            Welcome back
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#555',
            marginBottom: '32px'
          }}>
            Sign in to track your drafts and compete
          </p>

          <form onSubmit={handleSignUp}>
            {/* Username Input */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              placeholder="Username"
              required
              maxLength={20}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                marginBottom: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            
            {/* Email Input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                marginBottom: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            
            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !email}
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
                opacity: isLoading || !username || !email ? 0.7 : 1,
                boxSizing: 'border-box'
              }}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            margin: '20px 0'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }} />
            <span style={{ fontSize: '12px', color: '#555' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }} />
          </div>

          {/* Continue as Guest */}
          <Link 
            href="/"
            style={{
              display: 'block',
              width: '100%',
              padding: '14px 24px',
              backgroundColor: 'transparent',
              border: '1px solid #333',
              borderRadius: '12px',
              color: '#888',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            Continue as Guest
          </Link>

          <p style={{ 
            fontSize: '11px', 
            color: '#444',
            marginTop: '20px',
            lineHeight: 1.5
          }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

