// app/lib/espn.ts

// NFL Team abbreviations - UPPERCASE to match ESPN
export const NFL_TEAMS: Record<string, string> = {
  'ARIZONA': 'ARI', 'CARDINALS': 'ARI',
  'ATLANTA': 'ATL', 'FALCONS': 'ATL',
  'BALTIMORE': 'BAL', 'RAVENS': 'BAL',
  'BUFFALO': 'BUF', 'BILLS': 'BUF',
  'CAROLINA': 'CAR', 'PANTHERS': 'CAR',
  'CHICAGO': 'CHI', 'BEARS': 'CHI',
  'CINCINNATI': 'CIN', 'BENGALS': 'CIN',
  'CLEVELAND': 'CLE', 'BROWNS': 'CLE',
  'DALLAS': 'DAL', 'COWBOYS': 'DAL',
  'DENVER': 'DEN', 'BRONCOS': 'DEN',
  'DETROIT': 'DET', 'LIONS': 'DET',
  'GREEN BAY': 'GB', 'PACKERS': 'GB', 'GREEN': 'GB',
  'HOUSTON': 'HOU', 'TEXANS': 'HOU',
  'INDIANAPOLIS': 'IND', 'COLTS': 'IND',
  'JACKSONVILLE': 'JAX', 'JAGUARS': 'JAX',
  'KANSAS CITY': 'KC', 'CHIEFS': 'KC', 'KANSAS': 'KC',
  'LAS VEGAS': 'LV', 'RAIDERS': 'LV', 'VEGAS': 'LV',
  'LA CHARGERS': 'LAC', 'CHARGERS': 'LAC', 'LOS ANGELES CHARGERS': 'LAC',
  'LA RAMS': 'LAR', 'RAMS': 'LAR', 'LOS ANGELES RAMS': 'LAR',
  'MIAMI': 'MIA', 'DOLPHINS': 'MIA',
  'MINNESOTA': 'MIN', 'VIKINGS': 'MIN',
  'NEW ENGLAND': 'NE', 'PATRIOTS': 'NE',
  'NEW ORLEANS': 'NO', 'SAINTS': 'NO',
  'NY GIANTS': 'NYG', 'GIANTS': 'NYG', 'NEW YORK GIANTS': 'NYG',
  'NY JETS': 'NYJ', 'JETS': 'NYJ', 'NEW YORK JETS': 'NYJ',
  'PHILADELPHIA': 'PHI', 'EAGLES': 'PHI',
  'PITTSBURGH': 'PIT', 'STEELERS': 'PIT',
  'SAN FRANCISCO': 'SF', '49ERS': 'SF', 'NINERS': 'SF',
  'SEATTLE': 'SEA', 'SEAHAWKS': 'SEA',
  'TAMPA BAY': 'TB', 'BUCCANEERS': 'TB', 'BUCS': 'TB',
  'TENNESSEE': 'TEN', 'TITANS': 'TEN',
  'WASHINGTON': 'WSH', 'COMMANDERS': 'WSH', 'WAS': 'WSH',
}

// ESPN Team IDs for fetching rosters
const ESPN_TEAM_IDS: Record<string, number> = {
  'ARI': 22, 'ATL': 1, 'BAL': 33, 'BUF': 2, 'CAR': 29,
  'CHI': 3, 'CIN': 4, 'CLE': 5, 'DAL': 6, 'DEN': 7,
  'DET': 8, 'GB': 9, 'HOU': 34, 'IND': 11, 'JAX': 30,
  'KC': 12, 'LV': 13, 'LAC': 24, 'LAR': 14, 'MIA': 15,
  'MIN': 16, 'NE': 17, 'NO': 18, 'NYG': 19, 'NYJ': 20,
  'PHI': 21, 'PIT': 23, 'SF': 25, 'SEA': 26, 'TB': 27,
  'TEN': 10, 'WSH': 28
}

// Player data structure
interface PlayerData {
  id: string
  team: string | null
}

// Player cache
let playerCache: Map<string, PlayerData> | null = null
let cachePromise: Promise<Map<string, PlayerData>> | null = null

// Fetch players from ALL team rosters to get accurate team data
export async function fetchAllPlayers(): Promise<Map<string, PlayerData>> {
  if (playerCache) return playerCache
  if (cachePromise) return cachePromise
  
  cachePromise = (async () => {
    const cache = new Map<string, PlayerData>()
    
    try {
      // Fetch each team's roster to get accurate player-team mappings
      const teamAbbrs = Object.keys(ESPN_TEAM_IDS)
      
      console.log('[ESPN] Fetching rosters for all NFL teams...')
      
      // Fetch all teams in parallel
      const rosterPromises = teamAbbrs.map(async (abbr) => {
        const teamId = ESPN_TEAM_IDS[abbr]
        try {
          const res = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`,
            { cache: 'force-cache' }
          )
          if (!res.ok) return []
          
          const data = await res.json()
          const players: { name: string; id: string; team: string }[] = []
          
          // Extract players from all position groups
          if (data.athletes) {
            for (const group of data.athletes) {
              if (group.items) {
                for (const player of group.items) {
                  if (player.fullName && player.id) {
                    players.push({
                      name: player.fullName.toUpperCase().trim(),
                      id: String(player.id),
                      team: abbr
                    })
                  }
                }
              }
            }
          }
          
          return players
        } catch (e) {
          console.warn(`[ESPN] Failed to fetch roster for ${abbr}`)
          return []
        }
      })
      
      const allRosters = await Promise.all(rosterPromises)
      
      // Flatten and add to cache
      for (const roster of allRosters) {
        for (const player of roster) {
          cache.set(player.name, {
            id: player.id,
            team: player.team
          })
        }
      }
      
      console.log(`[ESPN] Loaded ${cache.size} NFL players with team data`)
      
      playerCache = cache
      return cache
    } catch (error) {
      console.error('[ESPN] Error fetching players:', error)
      return cache
    }
  })()
  
  return cachePromise
}

// Get player ID by name
export async function getPlayerId(playerName: string): Promise<string | null> {
  if (!playerName || typeof playerName !== 'string') return null
  
  const cache = await fetchAllPlayers()
  const normalized = playerName.toUpperCase().trim()
  
  // Direct match
  const direct = cache.get(normalized)
  if (direct) return direct.id
  
  // Fuzzy match
  for (const [name, data] of cache.entries()) {
    if (name.includes(normalized) || normalized.includes(name)) {
      return data.id
    }
  }
  
  // Remove suffixes
  const cleanName = normalized.replace(/\s+(JR\.?|SR\.?|II|III|IV|V)$/i, '').trim()
  if (cleanName && cleanName !== normalized) {
    const clean = cache.get(cleanName)
    if (clean) return clean.id
    
    for (const [name, data] of cache.entries()) {
      if (name.includes(cleanName) || cleanName.includes(name)) {
        return data.id
      }
    }
  }
  
  return null
}

// Get player's team abbreviation
export async function getPlayerTeam(playerName: string): Promise<string | null> {
  if (!playerName || typeof playerName !== 'string') return null
  
  const cache = await fetchAllPlayers()
  const normalized = playerName.toUpperCase().trim()
  
  // Direct match
  const direct = cache.get(normalized)
  if (direct?.team) return direct.team
  
  // Fuzzy match
  for (const [name, data] of cache.entries()) {
    if (name.includes(normalized) || normalized.includes(name)) {
      if (data.team) return data.team
    }
  }
  
  // Remove suffixes
  const cleanName = normalized.replace(/\s+(JR\.?|SR\.?|II|III|IV|V)$/i, '').trim()
  if (cleanName && cleanName !== normalized) {
    const clean = cache.get(cleanName)
    if (clean?.team) return clean.team
    
    for (const [name, data] of cache.entries()) {
      if (name.includes(cleanName) || cleanName.includes(name)) {
        if (data.team) return data.team
      }
    }
  }
  
  return null
}

// Get team abbreviation from full team name
export function getTeamAbbr(teamName: string): string | null {
  if (!teamName || typeof teamName !== 'string') return null
  
  const upper = teamName.toUpperCase().trim()
  if (NFL_TEAMS[upper]) return NFL_TEAMS[upper]
  
  for (const word of upper.split(' ')) {
    if (NFL_TEAMS[word]) return NFL_TEAMS[word]
  }
  
  for (const [key, abbr] of Object.entries(NFL_TEAMS)) {
    if (upper.includes(key)) return abbr
  }
  
  return null
}

// Get team logo URL  
export function getTeamLogoUrl(teamName: string): string | null {
  const abbr = getTeamAbbr(teamName)
  if (!abbr) return null
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`
}

// Get player headshot URL
export function getPlayerHeadshotUrl(playerId: string | null): string | null {
  if (!playerId) return null
  return `https://a.espncdn.com/i/headshots/nfl/players/full/${playerId}.png`
}

// Batch enrich props with team data
export async function enrichPropsWithTeams(props: any[]): Promise<any[]> {
  if (!props || props.length === 0) return []
  
  // Make sure cache is loaded first
  await fetchAllPlayers()
  
  const enriched = await Promise.all(
    props.map(async (prop) => {
      const team = await getPlayerTeam(prop.player)
      return {
        ...prop,
        playerTeam: team
      }
    })
  )
  
  console.log('[ESPN] Enriched props:', enriched.map(p => `${p.player} -> ${p.playerTeam}`))
  
  return enriched
}