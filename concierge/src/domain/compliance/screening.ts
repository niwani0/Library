/**
 * Simulated watchlist screening. In production this would call a sanctions /
 * PEP screening provider with fuzzy name matching; the decision semantics here
 * mirror the real ones: a sanctions match is terminal, a PEP match triggers
 * enhanced due diligence, and jurisdiction risk feeds the aggregate risk score.
 */
import type { Identity } from '../types';

export interface ScreeningResult {
  sanctionsMatch: boolean;
  pepMatch: boolean;
  jurisdictionRisk: 'standard' | 'elevated' | 'prohibited';
}

const SANCTIONED_JURISDICTIONS = ['north korea', 'iran', 'syria'];

const ELEVATED_RISK_JURISDICTIONS = [
  'panama',
  'monaco',
  'cayman islands',
  'british virgin islands',
];

/** Nationality fields naturally collect demonyms, not country names. */
const DEMONYM_TO_COUNTRY: Record<string, string> = {
  'north korean': 'north korea',
  iranian: 'iran',
  syrian: 'syria',
  panamanian: 'panama',
  monegasque: 'monaco',
  caymanian: 'cayman islands',
  'british virgin islander': 'british virgin islands',
};

/** Demo watchlist — lets reviewers exercise the refer/decline paths on demand. */
const DEMO_WATCHLIST: Array<{ name: string; kind: 'sanctions' | 'pep' }> = [
  { name: 'victor sanction', kind: 'sanctions' },
  { name: 'petra epstein-pep', kind: 'pep' },
];

export function screenCustomer(identity: Identity): ScreeningResult {
  // Substring match over a normalized name, so titles, extra spaces, or
  // punctuation cannot defeat the terminal sanctions path.
  const normalizedName = normalizeName(identity.fullName);
  const match = DEMO_WATCHLIST.find((entry) =>
    normalizedName.includes(normalizeName(entry.name)),
  );

  return {
    sanctionsMatch: match?.kind === 'sanctions',
    pepMatch: match?.kind === 'pep',
    jurisdictionRisk: rateJurisdiction(identity),
  };
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePlace(place: string): string {
  const cleaned = place.trim().toLowerCase().replace(/\s+/g, ' ');
  return DEMONYM_TO_COUNTRY[cleaned] ?? cleaned;
}

function rateJurisdiction(identity: Identity): ScreeningResult['jurisdictionRisk'] {
  const places = [identity.nationality, identity.countryOfResidence].map(normalizePlace);
  if (places.some((place) => SANCTIONED_JURISDICTIONS.includes(place))) {
    return 'prohibited';
  }
  if (places.some((place) => ELEVATED_RISK_JURISDICTIONS.includes(place))) {
    return 'elevated';
  }
  return 'standard';
}
