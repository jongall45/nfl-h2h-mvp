"use server"

import { enrichPropsWithTeams, getTeamAbbr } from "../lib/espn"

const API_KEY = process.env.ODDS_API_KEY;

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

// 2. Get Props for a Specific Game - NOW ENRICHED WITH TEAM DATA
export async function getGameProps(gameId: string) {
  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events/${gameId}/odds?apiKey=${API_KEY}&regions=us&markets=player_pass_yds,player_rush_yds,player_reception_yds&oddsFormat=american`,
    { cache: 'no-store' }
  );

  if (!res.ok) return null;
  const data = await res.json();

  const cleanProps: any[] = [];
  
  data.bookmakers.forEach((bookie: any) => {
    if (!['draftkings', 'fanduel', 'betmgm'].includes(bookie.key)) return;

    bookie.markets.forEach((market: any) => {
      market.outcomes.forEach((outcome: any) => {
        cleanProps.push({
          id: `${market.key}-${outcome.description}`,
          player: outcome.description,
          stat: formatStatName(market.key),
          line: outcome.point,
          type: market.key
        });
      });
    });
  });

  // Filter unique players
  const uniqueProps = cleanProps.filter((v, i, a) => 
    a.findIndex(t => (t.player === v.player && t.stat === v.stat)) === i
  ).slice(0, 10);

  // ENRICH WITH TEAM DATA FROM ESPN
  const enrichedProps = await enrichPropsWithTeams(uniqueProps);
  
  return enrichedProps;
}

function formatStatName(key: string) {
  if (key === 'player_pass_yds') return 'Passing Yards';
  if (key === 'player_rush_yds') return 'Rushing Yards';
  if (key === 'player_reception_yds') return 'Receiving Yards';
  return key;
}