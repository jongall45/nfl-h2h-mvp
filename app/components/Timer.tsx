"use client"

import { useEffect, useState, useRef } from "react"
import { Clock } from "lucide-react"

export function Timer({ onExpire }: { onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState(60)
  const onExpireRef = useRef(onExpire)

  // Keep ref updated
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    // Start timer immediately
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, []) // Empty deps - only run once on mount

  const isUrgent = timeLeft < 10

  return (
    <div className="w-full flex justify-center mb-4">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '12px',
        backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.1)' : '#111',
        border: isUrgent ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid #222',
        transition: 'all 0.3s'
      }}>
        <Clock style={{ width: 18, height: 18, color: isUrgent ? '#ef4444' : '#555' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '2px' }}>
            Shot Clock
          </span>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '20px', 
            fontWeight: 700, 
            color: isUrgent ? '#ef4444' : '#fff',
            lineHeight: 1
          }}>
          00:{timeLeft.toString().padStart(2, '0')}
        </span>
      </div>
      </div>
    </div>
  )
}