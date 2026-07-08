import { createAuditTrail, type AuditTrail } from '../domain/audit/audit-trail';
import { assessCompliance } from '../domain/compliance/decision-engine';
import { checkDocument } from '../domain/kyc/document-checks';
import { checkIdentity } from '../domain/kyc/identity-checks';
import { INCOME_BAND_ORDER } from '../domain/product-catalog';
import { recommendProduct } from '../domain/recommendation/recommender';
import type {
  ComplianceDecision,
  ConsentId,
  CustomerGoal,
  CustomerProfile,
  Identity,
  IdentityDocument,
  IncomeBand,
  Recommendation,
} from '../domain/types';
import { REQUIRED_CONSENTS } from '../domain/types';
import { interpret } from './interpreter';
import { SCRIPT } from './script';
import type {
  ConciergePrompt,
  ConciergeTurn,
  CustomerAction,
  Stage,
} from './types';

export interface ConciergeDeps {
  clock?: () => Date;
  /** Randomness boundary — injected so tests stay deterministic. */
  accountNumberSource?: () => string;
}

export interface Concierge {
  start(): ConciergeTurn;
  handle(action: CustomerAction): ConciergeTurn;
  readonly profile: CustomerProfile;
  readonly audit: AuditTrail;
  /** Populated after the compliance gate has run. Never shown to declined customers. */
  readonly decision: ComplianceDecision | undefined;
}

const SORT_CODE = '04-29-51';
const SUGGESTED_DEPOSITS = [100, 500, 2000];

export function createConcierge(deps: ConciergeDeps = {}): Concierge {
  const clock = deps.clock ?? (() => new Date());
  const accountNumberSource = deps.accountNumberSource ?? randomAccountNumber;

  const profile: CustomerProfile = { consents: [] };
  const audit = createAuditTrail(clock);
  let stage: Stage = 'discovery';
  let recommendation: Recommendation | undefined;
  let decision: ComplianceDecision | undefined;
  let accountNumber: string | undefined;

  function start(): ConciergeTurn {
    audit.record('journey-started', 'Customer opened the concierge');
    return turn([...SCRIPT.welcome], goalPrompt());
  }

  function handle(action: CustomerAction): ConciergeTurn {
    if (action.kind === 'request-human') {
      audit.record('handoff-requested', `Customer asked for a person at stage ${stage}`);
      return turn([...SCRIPT.handoff], currentPrompt());
    }
    if (action.kind === 'text') {
      return handleFreeText(action.text);
    }
    return handleStructured(action);
  }

  function handleFreeText(text: string): ConciergeTurn {
    const interpretation = interpret(text);
    if (interpretation.wantsHuman) {
      audit.record('handoff-requested', `Customer asked for a person at stage ${stage}`);
      return turn([...SCRIPT.handoff], currentPrompt());
    }
    if (interpretation.asksWhy) {
      return turn([SCRIPT.whyReassurance], currentPrompt());
    }
    if (stage === 'discovery' && interpretation.goal) {
      return captureGoal(interpretation.goal, text);
    }
    return turn([SCRIPT.fallback], currentPrompt());
  }

  function handleStructured(action: CustomerAction): ConciergeTurn {
    switch (stage) {
      case 'discovery':
        if (action.kind === 'choice' && isGoal(action.value)) {
          return captureGoal(action.value, 'chip selection');
        }
        break;
      case 'discovery-context':
        if (action.kind === 'choice' && isIncomeBand(action.value)) {
          return captureIncome(action.value);
        }
        break;
      case 'recommendation':
        if (action.kind === 'choice' && action.value === 'accept') {
          audit.record('recommendation-accepted', recommendation?.product.name ?? '');
          stage = 'identity';
          return turn([SCRIPT.identityIntro], currentPrompt());
        }
        break;
      case 'identity':
        if (action.kind === 'identity') {
          return captureIdentity(action.identity);
        }
        break;
      case 'document':
        if (action.kind === 'document') {
          return captureDocument(action.document);
        }
        break;
      case 'financial':
        if (action.kind === 'financial') {
          profile.financial = action.financial;
          audit.record('financial-captured', `Source of funds: ${action.financial.sourceOfFunds}`);
          stage = 'tax';
          return turn([SCRIPT.taxIntro], currentPrompt());
        }
        break;
      case 'tax':
        if (action.kind === 'tax') {
          profile.taxResidency = action.taxResidency;
          audit.record('tax-residency-captured', action.taxResidency.countries.join(', '));
          stage = 'review';
          return turn([SCRIPT.reviewIntro], currentPrompt());
        }
        break;
      case 'review':
        if (action.kind === 'confirm-review') {
          audit.record('review-confirmed', 'Customer confirmed their details');
          stage = 'consent';
          return turn([SCRIPT.consentIntro], currentPrompt());
        }
        break;
      case 'consent':
        if (action.kind === 'consent') {
          return captureConsents(action.granted);
        }
        break;
      case 'funding':
        if (action.kind === 'deposit') {
          return completeWithDeposit(action.amount);
        }
        if (action.kind === 'skip-funding') {
          audit.record('funding-skipped', 'Customer chose to fund later');
          stage = 'complete';
          return turn([...SCRIPT.complete], completionPrompt());
        }
        break;
      case 'complete':
      case 'referred':
      case 'declined':
        break;
    }
    return turn([SCRIPT.fallback], currentPrompt());
  }

  function captureGoal(goal: CustomerGoal, source: string): ConciergeTurn {
    profile.goal = goal;
    profile.goalContext = source;
    audit.record('goal-captured', goal);
    stage = 'discovery-context';
    return turn(
      [SCRIPT.goalAcknowledgement[goal], SCRIPT.discoveryContext],
      currentPrompt(),
    );
  }

  function captureIncome(band: IncomeBand): ConciergeTurn {
    const goal = profile.goal;
    if (!goal) {
      return turn([SCRIPT.fallback], goalPrompt());
    }
    recommendation = recommendProduct(goal, band);
    profile.incomeBand = band;
    audit.record('income-band-captured', band);
    audit.record('recommendation-made', recommendation.product.name);
    stage = 'recommendation';
    return turn(
      [SCRIPT.recommendationIntro, SCRIPT.recommendationHonesty],
      { kind: 'recommendation', recommendation },
    );
  }

  function captureIdentity(identity: Identity): ConciergeTurn {
    const result = checkIdentity(identity, clock());
    if (!result.accepted) {
      return turn([SCRIPT.formIssuesIntro, ...result.issues], currentPrompt());
    }
    profile.identity = identity;
    audit.record('identity-captured', identity.fullName);
    stage = 'document';
    return turn([SCRIPT.documentIntro], currentPrompt());
  }

  function captureDocument(document: IdentityDocument): ConciergeTurn {
    const result = checkDocument(document, clock());
    if (!result.accepted) {
      return turn([SCRIPT.formIssuesIntro, ...result.issues], currentPrompt());
    }
    profile.document = document;
    audit.record('document-accepted', `${document.type} (${document.issuingCountry})`);
    stage = 'financial';
    return turn([SCRIPT.financialIntro], currentPrompt());
  }

  function captureConsents(granted: ConsentId[]): ConciergeTurn {
    const missingRequired = REQUIRED_CONSENTS.filter((id) => !granted.includes(id));
    if (missingRequired.length > 0) {
      return turn([SCRIPT.consentMissing], currentPrompt());
    }
    const grantedAt = clock().toISOString();
    profile.consents = granted.map((id) => ({ id, grantedAt }));
    audit.record('consents-granted', granted.join(', '));
    return runComplianceGate();
  }

  /**
   * The one place an application can be approved, referred, or declined.
   * Referrals and declines end the journey here — no downstream step can
   * reopen or soften the outcome.
   */
  function runComplianceGate(): ConciergeTurn {
    decision = assessCompliance(profile);
    audit.record(
      'compliance-decision',
      `${decision.outcome} (risk ${decision.riskScore}): ${decision.factors
        .map((factor) => factor.code)
        .join(', ') || 'no risk factors'}`,
    );

    if (decision.outcome === 'decline') {
      stage = 'declined';
      return turn([...SCRIPT.declined], { kind: 'ended' });
    }
    if (decision.outcome === 'refer') {
      stage = 'referred';
      return turn([...SCRIPT.referred], { kind: 'ended' });
    }

    accountNumber = accountNumberSource();
    audit.record('account-opened', `Account ${accountNumber}`);
    stage = 'funding';
    return turn([SCRIPT.processing, ...SCRIPT.approvedFunding], currentPrompt());
  }

  function completeWithDeposit(amount: number): ConciergeTurn {
    if (!Number.isFinite(amount) || amount <= 0) {
      return turn([SCRIPT.fallback], currentPrompt());
    }
    audit.record('initial-deposit', formatCurrency(amount));
    profile.initialDepositAmount = amount;
    stage = 'complete';
    const messages = [
      SCRIPT.completeWithDeposit(formatCurrency(amount)),
      SCRIPT.complete[1],
    ];
    // A first deposit far above declared inflows needs source-of-funds
    // evidence — said upfront so the later ask never feels like suspicion.
    const monthlyInflow = profile.financial?.expectedMonthlyInflow ?? 0;
    if (amount > monthlyInflow * 3) {
      audit.record('deposit-evidence-requested', formatCurrency(amount));
      messages.push(SCRIPT.largeDepositEvidence);
    }
    return turn(messages, completionPrompt());
  }

  function goalPrompt(): ConciergePrompt {
    return { kind: 'chips', options: [...SCRIPT.goalChips], allowFreeText: true };
  }

  function completionPrompt(): ConciergePrompt {
    return {
      kind: 'completion',
      accountNumber: accountNumber ?? '',
      sortCode: SORT_CODE,
    };
  }

  function currentPrompt(): ConciergePrompt {
    switch (stage) {
      case 'discovery':
        return goalPrompt();
      case 'discovery-context':
        return { kind: 'chips', options: [...SCRIPT.incomeChips], allowFreeText: false };
      case 'recommendation':
        if (!recommendation) {
          return goalPrompt();
        }
        return { kind: 'recommendation', recommendation };
      case 'identity':
        return { kind: 'identity-form', whyWeAsk: SCRIPT.identityWhy };
      case 'document':
        return { kind: 'document-form', whyWeAsk: SCRIPT.documentWhy };
      case 'financial':
        return { kind: 'financial-form', whyWeAsk: SCRIPT.financialWhy };
      case 'tax':
        return { kind: 'tax-form', whyWeAsk: SCRIPT.taxWhy };
      case 'review':
        return { kind: 'review' };
      case 'consent':
        return {
          kind: 'consent',
          required: [...REQUIRED_CONSENTS],
          optional: ['marketing'],
        };
      case 'funding':
        return { kind: 'funding', suggestedAmounts: SUGGESTED_DEPOSITS };
      case 'complete':
        return completionPrompt();
      case 'referred':
      case 'declined':
        return { kind: 'ended' };
    }
  }

  function turn(messages: string[], prompt: ConciergePrompt): ConciergeTurn {
    return { messages, prompt, stage };
  }

  return {
    start,
    handle,
    profile,
    audit,
    get decision() {
      return decision;
    },
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

const ALL_GOALS: CustomerGoal[] = [
  'everyday-banking',
  'saving',
  'international',
  'wealth-growth',
  'moving-country',
];

function isGoal(value: string): value is CustomerGoal {
  return (ALL_GOALS as string[]).includes(value);
}

function isIncomeBand(value: string): value is IncomeBand {
  return (INCOME_BAND_ORDER as string[]).includes(value);
}

function randomAccountNumber(): string {
  const digits = new Uint32Array(1);
  crypto.getRandomValues(digits);
  return String(10000000 + ((digits[0] ?? 0) % 90000000));
}
