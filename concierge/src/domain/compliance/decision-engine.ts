/**
 * Aggregates screening results and profile signals into a single compliance
 * decision. Sits at the top of the priority ladder: its outcome can veto any
 * downstream step, and nothing downstream can soften it.
 */
import type {
  ComplianceDecision,
  CustomerProfile,
  RiskFactor,
} from '../types';
import { screenCustomer, type ScreeningResult } from './screening';

const REFER_THRESHOLD = 50;
const DECLINE_THRESHOLD = 90;

/** Inflows this far above the declared income band suggest undeclared sources. */
const INFLOW_MULTIPLE_LIMIT = 3;

const BAND_MONTHLY_CEILING: Record<string, number> = {
  'under-25k': 2100,
  '25k-75k': 6250,
  '75k-150k': 12500,
  'over-150k': 50000,
};

export function assessCompliance(profile: CustomerProfile): ComplianceDecision {
  if (!profile.identity || !profile.financial) {
    throw new Error('Compliance assessment requires identity and financial profile');
  }

  const screening = screenCustomer(profile.identity);
  const factors = collectRiskFactors(profile, screening);
  const riskScore = Math.min(
    100,
    factors.reduce((total, factor) => total + factor.weight, 0),
  );

  return {
    outcome: decideOutcome(screening, riskScore),
    riskScore,
    factors,
    requiresEnhancedDueDiligence:
      screening.pepMatch || screening.jurisdictionRisk === 'elevated',
  };
}

function decideOutcome(
  screening: ScreeningResult,
  riskScore: number,
): ComplianceDecision['outcome'] {
  if (screening.sanctionsMatch || screening.jurisdictionRisk === 'prohibited') {
    return 'decline';
  }
  if (riskScore >= DECLINE_THRESHOLD) {
    return 'decline';
  }
  if (screening.pepMatch || riskScore >= REFER_THRESHOLD) {
    return 'refer';
  }
  return 'approve';
}

function collectRiskFactors(
  profile: CustomerProfile,
  screening: ScreeningResult,
): RiskFactor[] {
  const factors: RiskFactor[] = [];

  if (screening.sanctionsMatch) {
    factors.push({
      code: 'sanctions-match',
      detail: 'Name matched a sanctions list entry',
      weight: 100,
    });
  }
  if (screening.pepMatch) {
    factors.push({
      code: 'pep-match',
      detail: 'Name matched a politically exposed person record',
      weight: 55,
    });
  }
  if (screening.jurisdictionRisk === 'prohibited') {
    factors.push({
      code: 'prohibited-jurisdiction',
      detail: 'Nationality or residence in a prohibited jurisdiction',
      weight: 100,
    });
  }
  if (screening.jurisdictionRisk === 'elevated') {
    factors.push({
      code: 'elevated-jurisdiction',
      detail: 'Nationality or residence in an elevated-risk jurisdiction',
      weight: 30,
    });
  }

  const financial = profile.financial;
  if (financial) {
    const ceiling = BAND_MONTHLY_CEILING[financial.annualIncomeBand] ?? 0;
    if (financial.expectedMonthlyInflow > ceiling * INFLOW_MULTIPLE_LIMIT) {
      factors.push({
        code: 'inflow-income-mismatch',
        detail: 'Expected inflows are far above the declared income band',
        weight: 35,
      });
    }
    if (financial.sourceOfFunds === 'gift' || financial.sourceOfFunds === 'other') {
      factors.push({
        code: 'opaque-source-of-funds',
        detail: 'Source of funds needs supporting evidence',
        weight: 20,
      });
    }
  }

  if (profile.taxResidency && profile.taxResidency.countries.length > 2) {
    factors.push({
      code: 'multi-jurisdiction-tax',
      detail: 'Tax residency in more than two countries',
      weight: 15,
    });
  }

  return factors;
}
