"use client"

import { Shield, Zap, AlertTriangle } from "lucide-react"

interface DoubleDownProps {
  onDecide: (didDoubleDown: boolean) => void
  potentialPoints: number
}

export function DoubleDown({ onDecide, potentialPoints }: DoubleDownProps) {
  return (
    <div className="w-full max-w-[360px] mx-auto">
      {/* Main Card Container */}
      <div style={{
        borderRadius: '20px',
        backgroundColor: '#111',
        border: '1px solid #222',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        
        {/* Header */}
        <div style={{ padding: '24px 20px 20px', textAlign: 'center' }}>
          {/* Icon */}
          <div style={{ 
            width: 48, 
            height: 48, 
            margin: '0 auto 16px',
            borderRadius: '50%',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle style={{ width: 24, height: 24, color: '#eab308' }} />
      </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '8px' }}>
        Moment of Truth
      </h2>
          <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>
            You have <span style={{ color: '#fff', fontWeight: 600 }}>{potentialPoints}</span> potential points. Cap your upside or chase the jackpot?
      </p>
        </div>

        {/* Inner Content Area - Options */}
        <div style={{ 
          margin: '0 12px 12px',
          backgroundColor: '#0a0a0a',
          borderRadius: '14px',
          border: '1px solid #1a1a1a',
          overflow: 'hidden'
        }}>
        {/* Option 1: Safe */}
        <button 
          onClick={() => onDecide(false)}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid #1a1a1a',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
            className="hover:bg-[#111]"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Play It Safe</span>
              <Shield style={{ width: 20, height: 20, color: '#555' }} />
          </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
            Keep your current entry. Win 2x if you beat your opponent.
          </div>
        </button>

        {/* Option 2: Double Down */}
        <button 
          onClick={() => onDecide(true)}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'rgba(0, 255, 0, 0.05)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
            className="hover:bg-[#00FF00]/10"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#00FF00', fontStyle: 'italic' }}>DOUBLE DOWN</span>
              <Zap style={{ width: 20, height: 20, color: '#00FF00', fill: '#00FF00' }} />
          </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              Add $25 to entry. Unlock <span style={{ color: '#fff', fontWeight: 600 }}>8x Multiplier</span> if you go 5/5.
          </div>
        </button>
        </div>
      </div>
    </div>
  )
}