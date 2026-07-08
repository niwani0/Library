import type {
  ConsentId,
  CustomerGoal,
  FinancialProfile,
  Identity,
  IdentityDocument,
  Recommendation,
  TaxResidency,
} from '../domain/types';

/**
 * The onboarding journey is a deterministic state machine. The conversational
 * layer phrases each step warmly, but never decides whether a regulatory step
 * happens — that separation is what makes the audit trail defensible.
 */
export type Stage =
  | 'discovery'
  | 'discovery-context'
  | 'recommendation'
  | 'identity'
  | 'document'
  | 'financial'
  | 'tax'
  | 'review'
  | 'consent'
  | 'funding'
  | 'complete'
  | 'referred'
  | 'declined';

export interface Chip {
  label: string;
  value: string;
}

export type ConciergePrompt =
  | { kind: 'chips'; options: Chip[]; allowFreeText: boolean }
  | { kind: 'identity-form'; whyWeAsk: string }
  | { kind: 'document-form'; whyWeAsk: string }
  | { kind: 'financial-form'; whyWeAsk: string }
  | { kind: 'tax-form'; whyWeAsk: string }
  | { kind: 'recommendation'; recommendation: Recommendation }
  | { kind: 'review' }
  | { kind: 'consent'; required: ConsentId[]; optional: ConsentId[] }
  | { kind: 'funding'; suggestedAmounts: number[] }
  | { kind: 'completion'; accountNumber: string; sortCode: string }
  | { kind: 'ended' };

export interface ConciergeTurn {
  messages: string[];
  prompt: ConciergePrompt;
  stage: Stage;
}

export type CustomerAction =
  | { kind: 'text'; text: string }
  | { kind: 'choice'; value: string }
  | { kind: 'identity'; identity: Identity }
  | { kind: 'document'; document: IdentityDocument }
  | { kind: 'financial'; financial: FinancialProfile }
  | { kind: 'tax'; taxResidency: TaxResidency }
  | { kind: 'consent'; granted: ConsentId[] }
  | { kind: 'confirm-review' }
  | { kind: 'deposit'; amount: number }
  | { kind: 'skip-funding' }
  | { kind: 'request-human' };

/** What the scripted language layer extracts from a free-text customer message. */
export interface Interpretation {
  goal?: CustomerGoal;
  wantsHuman: boolean;
  asksWhy: boolean;
}
