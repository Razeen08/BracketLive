#!/usr/bin/env node
/**
 * Fetches live WC 2026 data from football-data.org and writes to public/data/.
 * Run in CI before `npm run build` to bake the latest data into the static site.
 *
 * Usage:  VITE_API_KEY=xxx node scripts/fetch-data.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'data');

const API_KEY = process.env.VITE_API_KEY;
if (!API_KEY || API_KEY === 'your_api_key_here') {
  console.error('ERROR: VITE_API_KEY env var is not set.');
  process.exit(1);
}

const BASE = 'https://api.football-data.org/v4';
const HEADERS = { 'X-Auth-Token': API_KEY };

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${path}: ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('Fetching WC matches…');
  const matchesData = await get('/competitions/WC/matches');
  writeFileSync(
    join(OUT_DIR, 'matches.json'),
    JSON.stringify(matchesData, null, 2),
    'utf8'
  );
  console.log(`  Saved ${matchesData.matches?.length ?? 0} matches.`);

  console.log('Fetching WC standings…');
  const standingsData = await get('/competitions/WC/standings');
  writeFileSync(
    join(OUT_DIR, 'standings.json'),
    JSON.stringify(standingsData, null, 2),
    'utf8'
  );
  console.log(`  Saved ${standingsData.standings?.length ?? 0} groups.`);

  console.log('Done – public/data/ updated.');
}

main().catch((err) => {
  console.error('fetch-data failed:', err.message);
  process.exit(1);
});
