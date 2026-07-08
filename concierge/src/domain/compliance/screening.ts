/**
 * Simulated watchlist screening. In production this would call a sanctions /
 * PEP screening provider; the decision semantics here mirror the real ones:
 * a sanctions match is terminal, a PEP match triggers enhanced due diligence,
 * and jurisdiction risk feeds the aggregate risk score.
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

/** Demo watchlist — lets reviewers exercise the refer/decline paths on demand. */
const DEMO_WATCHLIST: Array<{ name: string; kind: 'sanctions' | 'pep' }> = [
  { name: 'victor sanction', kind: 'sanctions' },
  { name: 'petra epstein-pep', kind: 'pep' },
];

export function screenCustomer(identity: Identity): ScreeningResult {
  const normalizedName = identity.fullName.trim().toLowerCase();
  const match = DEMO_WATCHLIST.find((entry) => entry.name === normalizedName);

  return {
    sanctionsMatch: match?.kind === 'sanctions',
    pepMatch: match?.kind === 'pep',
    jurisdictionRisk: rateJurisdiction(identity),
  };
}

function rateJurisdiction(identity: Identity): ScreeningResult['jurisdictionRisk'] {
  const places = [identity.nationality, identity.countryOfResidence].map((place) =>
    place.trim().toLowerCase(),
  );
  if (places.some((place) => SANCTIONED_JURISDICTIONS.includes(place))) {
    return 'prohibited';
  }
  if (places.some((place) => ELEVATED_RISK_JURISDICTIONS.includes(place))) {
    return 'elevated';
  }
  return 'standard';
}
