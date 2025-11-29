"use server"

import { enrichPropsWithTeams, getTeamAbbr } from "../lib/espn"

const API_KEY = process.env.ODDS_API_KEY;

// Convert American odds to points (2-8 scale)
// -200 or worse = 2 points (very safe)
// -110 to -150 = 4-5 points (standard)
// +100 to +200 = 6 points
// +200 to +300 = 7-8 points (risky)
function oddsToPoints(americanOdds: number): number {
  if (americanOdds <= -300) return 2;
  if (americanOdds <= -200) return 3;
  if (americanOdds <= -150) return 4;
  if (americanOdds <= -110) return 5;
  if (americanOdds <= +100) return 5;
  if (americanOdds <= +150) return 6;
  if (americanOdds <= +200) return 7;
  if (americanOdds <= +300) return 8;
  return 8; // +300 or better
}

// Get risk label from odds
function oddsToRiskLabel(americanOdds: number): string {
  if (americanOdds <= -200) return 'SAFE';
  if (americanOdds <= -110) return 'BASE';
  if (americanOdds <= +150) return 'RISK';
  return 'MAX';
}

// 1. Get ALL upcoming NFL games (The Wheel Data)
export async function getSchedule() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); 

  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?apiKey=${API_KEY}&regions=us&markets=h2h&oddsFormat=american&commenceTimeFrom=${now.toISOString().split('.')[0]}Z&commenceTimeTo=${nextWeek.toISOString().split('.')[0]}Z`,
    { next: { revalidate: 3600 } }
  );
  
  if (!res.ok) return [];
  const games = await res.json();

  return games.map((game: any) => ({
    id: game.id,
    home_team: game.home_team,
    away_team: game.away_team,
    // Store team abbreviations for easier matching
    home_abbr: getTeamAbbr(game.home_team),
    away_abbr: getTeamAbbr(game.away_team)
  }));
}

// 2. Get Props for a Specific Game - NOW WITH ALTERNATE LINES
export async function getGameProps(gameId: string) {
  // Fetch both standard and alternate lines
  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events/${gameId}/odds?apiKey=${API_KEY}&regions=us&markets=player_pass_yds,player_rush_yds,player_reception_yds,player_pass_yds_alternate,player_rush_yds_alternate,player_reception_yds_alternate&oddsFormat=american`,
    { cache: 'no-store' }
  );

  if (!res.ok) return null;
  const data = await res.json();

  // Group all lines by player and stat type
  const playerLines: Record<string, any[]> = {};
  
  data.bookmakers.forEach((bookie: any) => {
    if (!['draftkings', 'fanduel', 'betmgm'].includes(bookie.key)) return;

    bookie.markets.forEach((market: any) => {
      const statType = market.key.replace('_alternate', '');
      
      market.outcomes.forEach((outcome: any) => {
        // Only look at "Over" outcomes
        if (outcome.name !== 'Over') return;
        
        const playerKey = `${outcome.description}-${statType}`;
        
        if (!playerLines[playerKey]) {
          playerLines[playerKey] = [];
        }
        
        // Add this line option
        playerLines[playerKey].push({
          line: outcome.point,
          odds: outcome.price,
          points: oddsToPoints(outcome.price),
          riskLabel: oddsToRiskLabel(outcome.price)
        });
      });
    });
  });

  // Convert to array of props with all available lines
  const propsWithLines: any[] = [];
  
  Object.entries(playerLines).forEach(([key, lines]) => {
    const [player, statType] = key.split('-player_');
    
    // Dedupe lines by line value, keeping best odds
    const uniqueLines = lines.reduce((acc: any[], line) => {
      const existing = acc.find(l => l.line === line.line);
      if (!existing) {
        acc.push(line);
      } else if (line.odds > existing.odds) {
        // Keep better odds
        Object.assign(existing, line);
      }
      return acc;
    }, []);
    
    // Sort by line value (lowest to highest)
    uniqueLines.sort((a, b) => a.line - b.line);
    
    if (uniqueLines.length > 0) {
      // Find the "base" line (closest to -110)
      const baseLine = uniqueLines.reduce((best, line) => {
        const bestDiff = Math.abs(best.odds - (-110));
        const lineDiff = Math.abs(line.odds - (-110));
        return lineDiff < bestDiff ? line : best;
      }, uniqueLines[0]);
      
      propsWithLines.push({
        id: key,
        player: player,
        stat: formatStatName('player_' + statType),
        type: 'player_' + statType,
        line: baseLine.line,
        odds: baseLine.odds,
        // All available alternate lines for this player/stat
        alternateLines: uniqueLines
      });
    }
  });

  // Limit to 10 unique player/stat combos
  const limitedProps = propsWithLines.slice(0, 10);

  // ENRICH WITH TEAM DATA FROM ESPN
  const enrichedProps = await enrichPropsWithTeams(limitedProps);
  
  return enrichedProps;
}

function formatStatName(key: string) {
  if (key === 'player_pass_yds') return 'Passing Yards';
  if (key === 'player_rush_yds') return 'Rushing Yards';
  if (key === 'player_reception_yds') return 'Receiving Yards';
  return key;
}