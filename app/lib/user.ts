// User profile storage utilities

export interface UserProfile {
  id: string
  email: string
  name: string
  username: string
  image: string | null
  bio: string
  createdAt: string
  stats: {
    totalDrafts: number
    wins: number
    losses: number
    winRate: number
    netProfit: number
  }
}

const PROFILE_KEY = 'h2h_user_profile'

// Generate a random username
export function generateUsername(name?: string): string {
  const adjectives = ['Swift', 'Lucky', 'Bold', 'Sharp', 'Quick', 'Clever', 'Fierce', 'Steady', 'Elite', 'Prime']
  const nouns = ['Tiger', 'Eagle', 'Wolf', 'Hawk', 'Bear', 'Lion', 'Falcon', 'Shark', 'Viper', 'Phoenix']
  const num = Math.floor(Math.random() * 99) + 1
  
  if (name) {
    // Use first part of name + random number
    const cleanName = name.split(' ')[0].replace(/[^a-zA-Z]/g, '')
    if (cleanName.length >= 3) {
      return `${cleanName}${num}`
    }
  }
  
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${num}`
}

// Get user profile from localStorage
export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(PROFILE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

// Save user profile
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

// Create profile from OAuth data
export function createProfileFromOAuth(
  id: string,
  email: string,
  name: string,
  image: string | null
): UserProfile {
  const existing = getUserProfile()
  
  // If profile exists for this user, return it
  if (existing && existing.id === id) {
    return existing
  }
  
  // Create new profile
  const profile: UserProfile = {
    id,
    email,
    name,
    username: generateUsername(name),
    image,
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
  return profile
}

// Update username
export function updateUsername(newUsername: string): boolean {
  const profile = getUserProfile()
  if (!profile) return false
  
  // Validate username (alphanumeric, 3-20 chars)
  if (!/^[a-zA-Z0-9]{3,20}$/.test(newUsername)) {
    return false
  }
  
  profile.username = newUsername
  saveUserProfile(profile)
  return true
}

// Update bio
export function updateBio(newBio: string): boolean {
  const profile = getUserProfile()
  if (!profile) return false
  
  // Limit bio to 150 chars
  profile.bio = newBio.slice(0, 150)
  saveUserProfile(profile)
  return true
}

// Update stats
export function updateProfileStats(stats: UserProfile['stats']): void {
  const profile = getUserProfile()
  if (!profile) return
  
  profile.stats = stats
  saveUserProfile(profile)
}

// Clear profile (logout)
export function clearUserProfile(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PROFILE_KEY)
}

