/**
 * WC 2026 Round of 32 bracket structure.
 *
 * 16 slots ordered TOP → BOTTOM as they appear visually left-to-right in the bracket.
 * Slot pair (2k, 2k+1) feeds winner into R16 slot k.
 *
 * homeGroup / awayGroup: group letter (A-L)
 * homePos / awayPos: 1=winner, 2=runner-up, 3=best-3rd
 * away3rdPool: which groups contribute best-3rd candidates for that slot
 *
 * Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage
 */

export interface BracketSlot {
  /** Descriptive label for display when team is unknown */
  homeLabel: string;
  awayLabel: string;
  /** Group letter A-L (or null for 3rd-place slots we can't pre-assign) */
  homeGroup: string;
  homePos: 1 | 2 | 3;
  awayGroup: string | null;
  awayPos: 1 | 2 | 3;
  /** Which groups the 3rd-place qualifier could come from (for away 3rd slots) */
  away3rdPool?: string; // e.g. 'ABCDF'
}

// In bracket display order (top → bottom). Pairs (0,1), (2,3), … feed into R16.
export const R32_SLOTS: BracketSlot[] = [
  // ── Top half → SF 1 ─────────────────────────────────────────
  // R16-0 (M89): W74 vs W77
  { homeLabel: 'Winner Group E',       awayLabel: 'Best 3rd (A/B/C/D/F)', homeGroup: 'E', homePos: 1, awayGroup: null, awayPos: 3, away3rdPool: 'ABCDF' },
  { homeLabel: 'Winner Group I',       awayLabel: 'Best 3rd (C/D/F/G/H)', homeGroup: 'I', homePos: 1, awayGroup: null, awayPos: 3, away3rdPool: 'CDFGH' },

  // R16-1 (M90): W73 vs W75
  { homeLabel: 'Runner-up Group A',    awayLabel: 'Runner-up Group B',    homeGroup: 'A', homePos: 2, awayGroup: 'B',  awayPos: 2 },
  { homeLabel: 'Winner Group F',       awayLabel: 'Runner-up Group C',    homeGroup: 'F', homePos: 1, awayGroup: 'C',  awayPos: 2 },

  // R16-2 (M93): W83 vs W84
  { homeLabel: 'Runner-up Group K',    awayLabel: 'Runner-up Group L',    homeGroup: 'K', homePos: 2, awayGroup: 'L',  awayPos: 2 },
  { homeLabel: 'Winner Group H',       awayLabel: 'Runner-up Group J',    homeGroup: 'H', homePos: 1, awayGroup: 'J',  awayPos: 2 },

  // R16-3 (M94): W81 vs W82
  { homeLabel: 'Winner Group D',       awayLabel: 'Best 3rd (B/E/F/I/J)', homeGroup: 'D', homePos: 1, awayGroup: null, awayPos: 3, away3rdPool: 'BEFIJ' },
  { homeLabel: 'Winner Group G',       awayLabel: 'Best 3rd (A/E/H/I/J)', homeGroup: 'G', homePos: 1, awayGroup: null, awayPos: 3, away3rdPool: 'AEHIJ' },

  // ── Bottom half → SF 2 ──────────────────────────────────────
  // R16-4 (M91): W76 vs W78
  { homeLabel: 'Winner Group C',       awayLabel: 'Runner-up Group F',    homeGroup: 'C', homePos: 1, awayGroup: 'F',  awayPos: 2 },
  { homeLabel: 'Runner-up Group E',    awayLabel: 'Runner-up Group I',    homeGroup: 'E', homePos: 2, awayGroup: 'I',  awayPos: 2 },

  // R16-5 (M92): W79 vs W80
  { homeLabel: 'Winner Group A',       awayLabel: 'Best 3rd (C/E/F/H/I)', homeGroup: 'A', homePos: 1, awayGroup: null, awayPos: 3, away3rdPool: 'CEFHI' },
  { homeLabel: 'Winner Group L',       awayLabel: 'Best 3rd (E/H/I/J/K)', homeGroup: 'L', homePos: 1, awayGroup: null, awayPos: 3, away3rdPool: 'EHIJK' },

  // R16-6 (M95): W86 vs W88
  { homeLabel: 'Winner Group J',       awayLabel: 'Runner-up Group H',    homeGroup: 'J', homePos: 1, awayGroup: 'H',  awayPos: 2 },
  { homeLabel: 'Runner-up Group D',    awayLabel: 'Runner-up Group G',    homeGroup: 'D', homePos: 2, awayGroup: 'G',  awayPos: 2 },

  // R16-7 (M96): W85 vs W87
  { homeLabel: 'Winner Group B',       awayLabel: 'Best 3rd (E/F/G/I/J)', homeGroup: 'B', homePos: 1, awayGroup: null, awayPos: 3, away3rdPool: 'EFGIJ' },
  { homeLabel: 'Winner Group K',       awayLabel: 'Best 3rd (D/E/I/J/L)', homeGroup: 'K', homePos: 1, awayGroup: null, awayPos: 3, away3rdPool: 'DEIJL' },
];
