"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Trophy, Users, Lock, Globe, Copy, Check, Loader2, Sparkles, DollarSign, UserPlus } from "lucide-react"
import { createContest, PAYOUT_STRUCTURES, calculatePrizePool } from "../../lib/contests"
import { getSchedule } from "../../actions/getOdds"

export default function CreateContestPage() {
  const router = useRouter()
  const [schedule, setSchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState<'public' | 'private'>('private')
  const [entryFee, setEntryFee] = useState(10)
  const [maxEntries, setMaxEntries] = useState(10)
  const [selectedGame, setSelectedGame] = useState<string>('')
  const [payoutType, setPayoutType] = useState<'winnerTakesAll' | 'top3' | 'top25Percent'>('winnerTakesAll')
  
  const [created, setCreated] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [contestId, setContestId] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true)
      const games = await getSchedule()
      setSchedule(games)
      setLoading(false)
    }
    loadSchedule()
  }, [])

  const prizePool = calculatePrizePool(entryFee, maxEntries, 10)

  const handleCreate = async () => {
    if (!name || !selectedGame) {
      alert('Please fill in all fields')
      return
    }

    setCreating(true)
    
    const game = schedule.find(g => g.id === selectedGame)
    if (!game) {
      setCreating(false)
      return
    }

    const contest = await createContest({
      name,
      type,
      entryFee,
      maxEntries,
      gameTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      payoutStructure: PAYOUT_STRUCTURES[payoutType]
    })

    if (contest) {
      setInviteCode(contest.inviteCode || '')
      setContestId(contest.id)
      setCreated(true)
    } else {
      alert('Error creating contest. Please try again.')
    }
    
    setCreating(false)
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/contests/${contestId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (created) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center relative overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {/* Confetti FX */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-[#00FF00] rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.3
              }}
            />
          ))}
        </div>

        <div className="w-full max-w-md p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/20 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,0,0.2)]">
              <Check size={48} className="text-[#00FF00]" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Contest Created!</h1>
            <p className="text-white/40">Your tournament is live and ready for players.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 backdrop-blur-xl">
            <div className="text-center mb-6">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Invite Code</div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl font-mono font-bold tracking-widest text-white">{inviteCode}</span>
                <button
                  onClick={copyInviteCode}
                  className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group"
                >
                  {copied ? <Check size={20} className="text-[#00FF00]" /> : <Copy size={20} className="text-white/40 group-hover:text-white" />}
                </button>
              </div>
            </div>

            <button
              onClick={copyInviteLink}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Share2 size={18} />
              Copy Invite Link
            </button>
          </div>

          <div className="flex gap-3">
            <Link
              href="/contests"
              className="flex-1 py-4 bg-white/5 text-white/60 font-semibold rounded-xl hover:bg-white/10 transition-colors text-center"
            >
              Done
            </Link>
            <Link
              href={`/contests/${contestId}`}
              className="flex-1 py-4 bg-[#00FF00] text-black font-bold rounded-xl hover:bg-[#00DD00] transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,255,0,0.3)] text-center"
            >
              View Contest
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0,255,0,0.1), transparent 70%)' }}></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/contests" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group w-fit">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Cancel</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Contest</h1>
          <p className="text-white/40">Set up your tournament rules and prizes.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#00FF00] mb-4" />
            <p className="text-white/40 text-sm">Loading schedule...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section: Details */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white/40 uppercase tracking-wider ml-1">Contest Details</label>
              
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm">
                <div className="mb-4">
                  <label className="block text-sm text-white/60 mb-2">Contest Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sunday Showdown"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#00FF00]/50 transition-colors text-white placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Visibility</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setType('private')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        type === 'private' 
                          ? 'bg-[#00FF00]/10 border-[#00FF00]/50 shadow-[0_0_15px_rgba(0,255,0,0.1)]' 
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Lock size={16} className={type === 'private' ? 'text-[#00FF00]' : 'text-white/40'} />
                        <span className={`font-semibold ${type === 'private' ? 'text-[#00FF00]' : 'text-white'}`}>Private</span>
                      </div>
                      <div className="text-xs text-white/40">Invite only via code</div>
                    </button>
                    <button
                      onClick={() => setType('public')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        type === 'public' 
                          ? 'bg-[#00FF00]/10 border-[#00FF00]/50 shadow-[0_0_15px_rgba(0,255,0,0.1)]' 
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Globe size={16} className={type === 'public' ? 'text-[#00FF00]' : 'text-white/40'} />
                        <span className={`font-semibold ${type === 'public' ? 'text-[#00FF00]' : 'text-white'}`}>Public</span>
                      </div>
                      <div className="text-xs text-white/40">Open to everyone</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Rules */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white/40 uppercase tracking-wider ml-1">Rules & Prizes</label>
              
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm space-y-6">
                {/* Entry Fee */}
                <div>
                  <label className="block text-sm text-white/60 mb-2">Entry Fee</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 25, 50].map(fee => (
                      <button
                        key={fee}
                        onClick={() => setEntryFee(fee)}
                        className={`py-3 rounded-xl border font-semibold transition-all ${
                          entryFee === fee 
                            ? 'bg-white text-black border-white shadow-lg transform scale-105' 
                            : 'bg-black/40 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        ${fee}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Entries */}
                <div>
                  <label className="block text-sm text-white/60 mb-2">Max Players</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 10, 25, 100].map(max => (
                      <button
                        key={max}
                        onClick={() => {
                          setMaxEntries(max)
                          if (max === 2) setPayoutType('winnerTakesAll')
                          else if (max <= 10) setPayoutType('top3')
                          else setPayoutType('top25Percent')
                        }}
                        className={`py-3 rounded-xl border font-semibold transition-all ${
                          maxEntries === max 
                            ? 'bg-white text-black border-white shadow-lg transform scale-105' 
                            : 'bg-black/40 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {max}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payout Structure */}
                <div>
                  <label className="block text-sm text-white/60 mb-2">Payout Structure</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPayoutType('winnerTakesAll')}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        payoutType === 'winnerTakesAll' 
                          ? 'bg-[#00FF00]/10 border-[#00FF00]/50' 
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className={`font-semibold ${payoutType === 'winnerTakesAll' ? 'text-[#00FF00]' : 'text-white'}`}>Winner Takes All</div>
                        <div className="text-xs text-white/40">1st place wins everything</div>
                      </div>
                      {payoutType === 'winnerTakesAll' && <Check size={18} className="text-[#00FF00]" />}
                    </button>
                    <button
                      onClick={() => setPayoutType('top3')}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        payoutType === 'top3' 
                          ? 'bg-[#00FF00]/10 border-[#00FF00]/50' 
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className={`font-semibold ${payoutType === 'top3' ? 'text-[#00FF00]' : 'text-white'}`}>Top 3</div>
                        <div className="text-xs text-white/40">50% / 30% / 20% split</div>
                      </div>
                      {payoutType === 'top3' && <Check size={18} className="text-[#00FF00]" />}
                    </button>
                    <button
                      onClick={() => setPayoutType('top25Percent')}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        payoutType === 'top25Percent' 
                          ? 'bg-[#00FF00]/10 border-[#00FF00]/50' 
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className={`font-semibold ${payoutType === 'top25Percent' ? 'text-[#00FF00]' : 'text-white'}`}>Top 25%</div>
                        <div className="text-xs text-white/40">More winners, smaller prizes</div>
                      </div>
                      {payoutType === 'top25Percent' && <Check size={18} className="text-[#00FF00]" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Game */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white/40 uppercase tracking-wider ml-1">Game Schedule</label>
              
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm">
                <select
                  value={selectedGame}
                  onChange={e => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#00FF00]/50 transition-colors appearance-none text-white"
                >
                  <option value="">Select a game...</option>
                  {schedule.map(game => (
                    <option key={game.id} value={game.id}>
                      {game.away_team} @ {game.home_team}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary & Submit */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/10 z-50">
              <div className="max-w-2xl mx-auto flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Prize Pool</div>
                  <div className="text-2xl font-bold text-[#00FF00]">${prizePool.toFixed(0)}</div>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={!name || !selectedGame || creating}
                  className="px-8 py-3 bg-[#00FF00] text-black font-bold rounded-xl hover:bg-[#00DD00] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,0,0.3)]"
                >
                  {creating && <Loader2 size={18} className="animate-spin" />}
                  Launch Contest
                </button>
              </div>
            </div>
            
            {/* Spacer for fixed footer */}
            <div className="h-20"></div>
          </div>
        )}
      </main>
    </div>
  )
}

function Share2({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
