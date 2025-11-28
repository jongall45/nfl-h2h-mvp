// Draft history storage utilities

export interface DraftPick {
  player: string
  stat: string
  line: number
  finalLine: number
  direction: 'over' | 'under'
  potentialPoints: number
  riskLabel: string
}

export interface OpponentPick {
  player: string
  stat: string
  line: number
  points: number
  strategy: string
}

export interface Draft {
  id: string
  createdAt: string
  game: {
    homeTeam: string
    awayTeam: string
    gameTime: string
  }
  userPicks: DraftPick[]
  opponentPicks: OpponentPick[]
  userTotalPoints: number
  opponentTotalPoints: number
  isDoubledDown: boolean
  potentialPayout: number
  status: 'pending' | 'won' | 'lost' | 'push'
  entryFee: number
}

const DRAFTS_KEY = 'h2h_drafts'

// Get all drafts from localStorage
export function getDrafts(): Draft[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(DRAFTS_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

// Save a new draft
export function saveDraft(draft: Omit<Draft, 'id' | 'createdAt'>): Draft {
  const drafts = getDrafts()
  const newDraft: Draft = {
    ...draft,
    id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  }
  drafts.unshift(newDraft) // Add to beginning (newest first)
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  return newDraft
}

// Get a single draft by ID
export function getDraftById(id: string): Draft | null {
  const drafts = getDrafts()
  return drafts.find(d => d.id === id) || null
}

// Delete a draft
export function deleteDraft(id: string): void {
  const drafts = getDrafts()
  const filtered = drafts.filter(d => d.id !== id)
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered))
}

// Clear all drafts
export function clearAllDrafts(): void {
  localStorage.removeItem(DRAFTS_KEY)
}

// Get draft stats
export function getDraftStats() {
  const drafts = getDrafts()
  const wins = drafts.filter(d => d.status === 'won').length
  const losses = drafts.filter(d => d.status === 'lost').length
  const pending = drafts.filter(d => d.status === 'pending').length
  const totalWinnings = drafts
    .filter(d => d.status === 'won')
    .reduce((sum, d) => sum + d.potentialPayout, 0)
  const totalLosses = drafts
    .filter(d => d.status === 'lost')
    .reduce((sum, d) => sum + d.entryFee, 0)
  
  return {
    totalDrafts: drafts.length,
    wins,
    losses,
    pending,
    winRate: drafts.length > 0 ? (wins / (wins + losses)) * 100 : 0,
    netProfit: totalWinnings - totalLosses
  }
}

