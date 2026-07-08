/**
 * Core domain types for Project Concierge.
 *
 * Every decision the concierge makes is ranked on this ladder — when two
 * concerns conflict, the higher one always wins. Commercial opportunity is
 * deliberately last: the customer came to solve a problem, and we help them
 * solve it first.
 */
export const PRIORITY_LADDER = [
  'compliance',
  'trust',
  'customer-goal',
  'effort',
  'commercial',
] as const;

export type Priority = (typeof PRIORITY_LADDER)[number];

export type CustomerGoal =
  | 'everyday-banking'
  | 'saving'
  | 'international'
  | 'wealth-growth'
  | 'moving-country';

export type EmploymentStatus =
  | 'employed'
  | 'self-employed'
  | 'retired'
  | 'student'
  | 'not-employed';

export type SourceOfFunds =
  | 'salary'
  | 'business-income'
  | 'savings'
  | 'investments'
  | 'pension'
  | 'property-sale'
  | 'inheritance'
  | 'gift'
  | 'other';

export interface Identity {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
  residentialAddress: string;
  email: string;
  phone: string;
}

export interface FinancialProfile {
  employmentStatus: EmploymentStatus;
  occupation: string;
  annualIncomeBand: IncomeBand;
  sourceOfFunds: SourceOfFunds;
  expectedMonthlyInflow: number;
}

export type IncomeBand = 'under-25k' | '25k-75k' | '75k-150k' | 'over-150k';

export interface TaxResidency {
  countries: string[];
  usPerson: boolean;
}

export type DocumentType = 'passport' | 'driving-licence' | 'national-id';

export interface IdentityDocument {
  type: DocumentType;
  documentNumber: string;
  expiryDate: string;
  issuingCountry: string;
}

/** Soft signals volunteered during conversation — personalisation, never gating. */
export interface CustomerInsights {
  services?: string[];
  marketSentiment?: string;
}

export interface CustomerProfile {
  goal?: CustomerGoal;
  goalContext?: string;
  offerId?: string;
  insights?: CustomerInsights;
  /** Captured once in discovery and pre-filled later — never ask twice. */
  incomeBand?: IncomeBand;
  identity?: Identity;
  document?: IdentityDocument;
  financial?: FinancialProfile;
  taxResidency?: TaxResidency;
  consents: ConsentRecord[];
  initialDepositAmount?: number;
}

export interface ConsentRecord {
  id: ConsentId;
  grantedAt: string;
}

export type ConsentId = 'terms' | 'data-processing' | 'credit-check' | 'marketing';

/** Consents a customer must grant before an account can be opened. */
export const REQUIRED_CONSENTS: ConsentId[] = ['terms', 'data-processing'];

export type ComplianceOutcome = 'approve' | 'refer' | 'decline';

export interface RiskFactor {
  code: string;
  detail: string;
  weight: number;
}

export interface ComplianceDecision {
  outcome: ComplianceOutcome;
  riskScore: number;
  factors: RiskFactor[];
  requiresEnhancedDueDiligence: boolean;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  monthlyFee: number;
  minimumIncomeBand?: IncomeBand;
  bestFor: CustomerGoal[];
  keyFeatures: string[];
}

export interface Recommendation {
  product: Product;
  reasons: string[];
  /** Present only when the customer narrowly misses a better-fit product. */
  stretchProduct?: Product;
}
