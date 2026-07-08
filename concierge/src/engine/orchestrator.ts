import { createAuditTrail, type AuditTrail } from '../domain/audit/audit-trail';
import { assessCompliance } from '../domain/compliance/decision-engine';
import { checkDocument } from '../domain/kyc/document-checks';
import { checkIdentity } from '../domain/kyc/identity-checks';
import { findFaqAnswer, formatSgd, fundingDeadline, type Offer } from '../domain/offers';
import { INCOME_BAND_ORDER, meetsIncomeRequirement } from '../domain/product-catalog';
import { recommendProduct } from '../domain/recommendation/recommender';
import { checkContact, checkIdentityCore } from '../domain/kyc/identity-checks';
import {
  fetchPlatformContact,
  fetchSingpassRecord,
  suggestEmailCorrection,
} from './prefill';
import type {
  ComplianceDecision,
  ConsentId,
  CustomerGoal,
  CustomerProfile,
  FinancialProfile,
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
  /** Present when the customer arrived from a marketing offer. */
  offer?: Offer;
  /** Restores a journey saved mid-way — the customer never re-answers. */
  snapshot?: ConciergeSnapshot;
}

export interface ConciergeSnapshot {
  stage: Stage;
  profile: CustomerProfile;
  accountNumber?: string;
  isVerificationPending: boolean;
}

export interface Concierge {
  start(): ConciergeTurn;
  handle(action: CustomerAction): ConciergeTurn;
  snapshot(): ConciergeSnapshot;
  readonly profile: CustomerProfile;
  readonly audit: AuditTrail;
  readonly recommendation: Recommendation | undefined;
  readonly offer: Offer | undefined;
  /** Populated after the compliance gate has run. Never shown to declined customers. */
  readonly decision: ComplianceDecision | undefined;
}

const SORT_CODE = '40-05-15';
const SUGGESTED_DEPOSITS = [100, 500, 2000];

export function createConcierge(deps: ConciergeDeps = {}): Concierge {
  const clock = deps.clock ?? (() => new Date());
  const accountNumberSource = deps.accountNumberSource ?? randomAccountNumber;

  const offer = deps.offer;
  const profile: CustomerProfile = deps.snapshot?.profile ?? { consents: [] };
  const audit = createAuditTrail(clock);
  let stage: Stage = deps.snapshot?.stage ?? (offer ? 'offer-welcome' : 'discovery');
  let recommendation: Recommendation | undefined;
  let decision: ComplianceDecision | undefined;
  let accountNumber: string | undefined = deps.snapshot?.accountNumber;
  let isReturningToReview = false;
  let isVerificationPending = deps.snapshot?.isVerificationPending ?? false;
  /** Contact details held aside while the customer resolves a likely typo. */
  let heldContact: { email: string; phone: string; suggested: string } | undefined;

  function start(): ConciergeTurn {
    if (deps.snapshot) {
      audit.record('journey-resumed', `Customer returned at stage ${stage}`);
      return turn([...SCRIPT.offer.resumed], currentPrompt());
    }
    audit.record('journey-started', 'Customer opened the concierge');
    if (offer) {
      profile.offerId = offer.id;
      profile.goal = 'saving';
      profile.goalContext = `Arrived from offer: ${offer.name}`;
      audit.record('offer-context', offer.name);
      return turn([...SCRIPT.offer.welcome], offerQaPrompt());
    }
    return turn([...SCRIPT.welcome], goalPrompt());
  }

  function snapshot(): ConciergeSnapshot {
    // The typo interlude is ephemeral — resuming re-asks for contact details.
    const savedStage = stage === 'contact-typo' ? 'contact' : stage;
    return {
      stage: savedStage,
      profile: JSON.parse(JSON.stringify(profile)) as CustomerProfile,
      accountNumber,
      isVerificationPending,
    };
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
    // Offer questions are welcome at any point in the journey (steps 7-9).
    if (offer) {
      const faq = findFaqAnswer(offer, text);
      if (faq) {
        audit.record('offer-question', faq.id);
        const followUp = stage === 'offer-welcome' ? [SCRIPT.offer.anythingElse] : [];
        return turn([faq.answer, ...followUp], currentPrompt());
      }
      if (stage === 'offer-welcome') {
        if (/\b(ready|start|begin|apply|let'?s go|yes)\b/i.test(text)) {
          return beginApplication();
        }
        return turn([SCRIPT.offer.fallback], currentPrompt());
      }
    }
    if (interpretation.asksWhy) {
      return turn([SCRIPT.whyReassurance], currentPrompt());
    }
    if (stage === 'discovery' && interpretation.goal) {
      return captureGoal(interpretation.goal, text);
    }
    // "Say so if a different account suits you better" has to be a real exit,
    // not a pleasantry — a new goal here re-runs the recommendation.
    if (stage === 'recommendation' && interpretation.goal && profile.incomeBand) {
      if (interpretation.goal !== profile.goal) {
        profile.goal = interpretation.goal;
        recommendation = recommendProduct(interpretation.goal, profile.incomeBand);
        audit.record('goal-revised', interpretation.goal);
        audit.record('recommendation-made', recommendation.product.name);
        return turn(
          [SCRIPT.goalAcknowledgement[interpretation.goal]],
          { kind: 'recommendation', recommendation },
        );
      }
    }
    return turn([SCRIPT.fallback], currentPrompt());
  }

  function handleStructured(action: CustomerAction): ConciergeTurn {
    switch (stage) {
      case 'offer-welcome':
        if (action.kind === 'choice' && action.value === 'ready') {
          return beginApplication();
        }
        if (action.kind === 'choice') {
          const faq = offer?.faq.find((entry) => entry.id === action.value);
          if (faq) {
            audit.record('offer-question', faq.id);
            return turn([faq.answer, SCRIPT.offer.anythingElse], currentPrompt());
          }
        }
        break;
      case 'consent-steps':
        if (action.kind === 'consent') {
          return captureUpfrontConsents(action.granted);
        }
        break;
      case 'id-method':
        if (action.kind === 'choice' && action.value === 'singpass') {
          return applySingpass();
        }
        if (action.kind === 'choice' && action.value === 'upload') {
          stage = 'document';
          return turn([SCRIPT.offer.uploadIntro], currentPrompt());
        }
        break;
      case 'identity-confirm':
        if (action.kind === 'choice' && action.value === 'confirm') {
          audit.record('identity-confirmed', 'Singpass details confirmed by customer');
          stage = 'contact-method';
          return turn([SCRIPT.offer.contactMethodIntro], currentPrompt());
        }
        if (action.kind === 'choice' && action.value === 'edit') {
          stage = 'identity';
          return turn([SCRIPT.offer.identityIntro], currentPrompt());
        }
        break;
      case 'contact-method':
        if (action.kind === 'choice' && action.value === 'platform') {
          return applyPlatformContact();
        }
        if (action.kind === 'choice' && action.value === 'manual') {
          stage = 'contact';
          return turn([SCRIPT.offer.contactManualIntro], currentPrompt());
        }
        break;
      case 'contact':
        if (action.kind === 'contact') {
          return captureContact(action.email, action.phone);
        }
        break;
      case 'contact-typo':
        if (action.kind === 'choice' && heldContact) {
          const chosenEmail =
            action.value === 'use-suggested' ? heldContact.suggested : heldContact.email;
          const phone = heldContact.phone;
          audit.record('email-typo-resolved', action.value);
          heldContact = undefined;
          return applyContact(chosenEmail, phone);
        }
        break;
      case 'services':
        if (action.kind === 'multi-select') {
          profile.insights = { ...profile.insights, services: action.values };
          audit.record('insight-services', action.values.join(', ') || 'none');
          stage = 'sentiment';
          return turn(
            [SCRIPT.offer.insightThanks, SCRIPT.offer.sentimentIntro],
            currentPrompt(),
          );
        }
        break;
      case 'sentiment':
        if (action.kind === 'choice') {
          profile.insights = { ...profile.insights, marketSentiment: action.value };
          audit.record('insight-sentiment', action.value);
          stage = 'tax';
          return turn([SCRIPT.taxIntro], currentPrompt());
        }
        break;
      case 'transfer':
        if (action.kind === 'choice' && action.value === 'continue') {
          stage = 'setup';
          return turn([SCRIPT.offer.setupIntro], currentPrompt());
        }
        break;
      case 'setup':
        if (action.kind === 'setup') {
          return captureSetup(action.enabled);
        }
        break;
      case 'tour':
        if (action.kind === 'choice') {
          audit.record('tour-choice', action.value);
          stage = 'complete';
          const closing =
            action.value === 'tour-now' ? SCRIPT.offer.tourNow : SCRIPT.offer.tourLater;
          return turn([closing], { kind: 'ended' });
        }
        break;
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
          return captureFinancial(action.financial);
        }
        break;
      case 'tax':
        if (action.kind === 'tax') {
          profile.taxResidency = action.taxResidency;
          audit.record('tax-residency-captured', action.taxResidency.countries.join(', '));
          return proceedAfterCapture('review', SCRIPT.reviewIntro);
        }
        break;
      case 'review':
        if (action.kind === 'confirm-review') {
          audit.record('review-confirmed', 'Customer confirmed their details');
          if (offer) {
            return runComplianceGate();
          }
          stage = 'consent';
          return turn([SCRIPT.consentIntro], currentPrompt());
        }
        if (action.kind === 'edit-section') {
          audit.record('review-edit-requested', action.section);
          isReturningToReview = true;
          stage = action.section;
          return turn([SCRIPT.editIntro], currentPrompt());
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

  function beginApplication(): ConciergeTurn {
    audit.record('application-started', offer?.name ?? '');
    stage = 'consent-steps';
    return turn([SCRIPT.offer.stepsIntro], currentPrompt());
  }

  function captureUpfrontConsents(granted: ConsentId[]): ConciergeTurn {
    const accepted = REQUIRED_CONSENTS.filter((id) => granted.includes(id));
    if (accepted.length < REQUIRED_CONSENTS.length) {
      return turn([SCRIPT.consentMissing], currentPrompt());
    }
    const grantedAt = clock().toISOString();
    profile.consents = accepted.map((id) => ({ id, grantedAt }));
    audit.record('consents-granted', accepted.join(', '));
    stage = 'id-method';
    return turn([SCRIPT.offer.idMethodIntro], currentPrompt());
  }

  function applySingpass(): ConciergeTurn {
    const record = fetchSingpassRecord();
    profile.identity = { ...record.identity, email: '', phone: '' };
    profile.document = record.document;
    audit.record('singpass-retrieved', record.identity.fullName);
    audit.record('document-accepted', `${record.document.type} via Singpass`);
    stage = 'identity-confirm';
    return turn([SCRIPT.offer.singpassDone], currentPrompt());
  }

  function applyPlatformContact(): ConciergeTurn {
    const contact = fetchPlatformContact();
    audit.record('contact-prefilled', 'Device-provided email and phone');
    return finishContact(contact.email, contact.phone, SCRIPT.offer.contactPrefilled);
  }

  function captureContact(email: string, phone: string): ConciergeTurn {
    const suggested = suggestEmailCorrection(email);
    if (suggested) {
      heldContact = { email, phone, suggested };
      stage = 'contact-typo';
      return turn([SCRIPT.offer.typoQuestion(suggested)], currentPrompt());
    }
    return applyContact(email, phone);
  }

  function applyContact(email: string, phone: string): ConciergeTurn {
    const result = checkContact(email, phone);
    if (!result.accepted) {
      stage = 'contact';
      return turn([SCRIPT.formIssuesIntro, ...result.issues], currentPrompt());
    }
    return finishContact(email, phone, undefined);
  }

  function finishContact(email: string, phone: string, note: string | undefined): ConciergeTurn {
    if (!profile.identity) {
      return turn([SCRIPT.fallback], currentPrompt());
    }
    profile.identity = { ...profile.identity, email, phone };
    audit.record('contact-captured', email);
    if (isReturningToReview) {
      isReturningToReview = false;
      stage = 'review';
      return turn([SCRIPT.backToReview], currentPrompt());
    }
    stage = 'financial';
    const messages = note ? [note, SCRIPT.offer.gapIntro] : [SCRIPT.offer.gapIntro];
    return turn(messages, currentPrompt());
  }

  function captureSetup(enabled: string[]): ConciergeTurn {
    if (enabled.includes('marketing')) {
      profile.consents = [
        ...profile.consents,
        { id: 'marketing', grantedAt: clock().toISOString() },
      ];
    }
    audit.record('setup-choices', enabled.join(', ') || 'none');
    stage = 'tour';
    return turn([SCRIPT.offer.tourIntro], currentPrompt());
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
    // Offer journeys collect contact details separately, so only the core
    // identity is validated here; classic journeys validate everything.
    const result = offer
      ? checkIdentityCore(identity, clock())
      : checkIdentity(identity, clock());
    if (!result.accepted) {
      return turn([SCRIPT.formIssuesIntro, ...result.issues], currentPrompt());
    }
    const priorContact = profile.identity;
    profile.identity = offer
      ? { ...identity, email: priorContact?.email ?? '', phone: priorContact?.phone ?? '' }
      : identity;
    audit.record('identity-captured', identity.fullName);
    if (offer) {
      return proceedAfterCapture('contact-method', SCRIPT.offer.contactMethodIntro);
    }
    return proceedAfterCapture('document', SCRIPT.documentIntro);
  }

  function captureDocument(document: IdentityDocument): ConciergeTurn {
    const result = checkDocument(document, clock());
    if (!result.accepted) {
      // Offer journeys never stall on a failed capture: keep what was read,
      // retry verification in the background, and let the customer continue.
      if (offer && !isReturningToReview) {
        isVerificationPending = true;
        profile.document = document;
        audit.record('id-verification-deferred', result.issues.join('; '));
        stage = 'identity';
        return turn([SCRIPT.offer.idDeferred, SCRIPT.offer.identityIntro], currentPrompt());
      }
      return turn([SCRIPT.formIssuesIntro, ...result.issues], currentPrompt());
    }
    profile.document = document;
    audit.record('document-accepted', `${document.type} (${document.issuingCountry})`);
    if (offer) {
      return proceedAfterCapture('identity', SCRIPT.offer.identityIntro);
    }
    return proceedAfterCapture('financial', SCRIPT.financialIntro);
  }

  function captureFinancial(financial: FinancialProfile): ConciergeTurn {
    profile.financial = financial;
    audit.record('financial-captured', `Source of funds: ${financial.sourceOfFunds}`);
    const adjustments = reconcileProductEligibility(financial.annualIncomeBand);
    const next = offer
      ? proceedAfterCapture('services', SCRIPT.offer.servicesIntro)
      : proceedAfterCapture('tax', SCRIPT.taxIntro);
    return { ...next, messages: [...adjustments, ...next.messages] };
  }

  /**
   * The declared income can lawfully change after the recommendation was
   * accepted; the customer must never end up holding a product they no
   * longer qualify for.
   */
  function reconcileProductEligibility(band: IncomeBand): string[] {
    if (!recommendation || !profile.goal) {
      return [];
    }
    if (meetsIncomeRequirement(band, recommendation.product.minimumIncomeBand)) {
      return [];
    }
    recommendation = recommendProduct(profile.goal, band);
    audit.record('recommendation-adjusted', recommendation.product.name);
    return [SCRIPT.productAdjusted(recommendation.product.name)];
  }

  /** Returns to the review play-back when the capture was a review edit. */
  function proceedAfterCapture(nextStage: Stage, intro: string): ConciergeTurn {
    if (isReturningToReview) {
      isReturningToReview = false;
      stage = 'review';
      return turn([SCRIPT.backToReview], currentPrompt());
    }
    stage = nextStage;
    return turn([intro], currentPrompt());
  }

  function captureConsents(granted: ConsentId[]): ConciergeTurn {
    // Only consents that were actually offered can be recorded — the audit
    // trail must never claim an agreement the customer was not shown.
    const offered: ConsentId[] = [...REQUIRED_CONSENTS, 'marketing'];
    const accepted = offered.filter((id) => granted.includes(id));
    const missingRequired = REQUIRED_CONSENTS.filter((id) => !accepted.includes(id));
    if (missingRequired.length > 0) {
      return turn([SCRIPT.consentMissing], currentPrompt());
    }
    const grantedAt = clock().toISOString();
    profile.consents = accepted.map((id) => ({ id, grantedAt }));
    audit.record('consents-granted', accepted.join(', '));
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
    if (offer) {
      stage = 'transfer';
      const messages: string[] = [SCRIPT.processing, ...SCRIPT.offer.accountOpen];
      if (isVerificationPending) {
        messages.push(SCRIPT.offer.verificationPendingNote);
      }
      return turn(messages, currentPrompt());
    }
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

  function offerQaPrompt(): ConciergePrompt {
    const suggestions = (offer?.faq ?? [])
      .slice(0, 3)
      .map((entry) => ({ label: entry.question, value: entry.id }));
    return {
      kind: 'chips',
      options: [...suggestions, { ...SCRIPT.offer.readyChip }],
      allowFreeText: true,
    };
  }

  function currentPrompt(): ConciergePrompt {
    switch (stage) {
      case 'offer-welcome':
        return offerQaPrompt();
      case 'consent-steps':
        return {
          kind: 'steps-consent',
          steps: [...SCRIPT.offer.journeySteps],
          required: [...REQUIRED_CONSENTS],
        };
      case 'id-method':
        return { kind: 'choice-cards', options: [...SCRIPT.offer.idMethodCards] };
      case 'identity-confirm':
        return { kind: 'identity-confirm' };
      case 'contact-method':
        return { kind: 'choice-cards', options: [...SCRIPT.offer.contactMethodCards] };
      case 'contact':
        return { kind: 'contact-form' };
      case 'contact-typo':
        return {
          kind: 'chips',
          options: [
            { label: 'Use the corrected address', value: 'use-suggested' },
            { label: 'Keep what I typed', value: 'keep-original' },
          ],
          allowFreeText: false,
        };
      case 'services':
        return {
          kind: 'multi-select',
          options: [...SCRIPT.offer.serviceOptions],
          confirmLabel: 'Continue',
        };
      case 'sentiment':
        return { kind: 'chips', options: [...SCRIPT.offer.sentimentChips], allowFreeText: false };
      case 'transfer':
        return {
          kind: 'transfer',
          accountNumber: accountNumber ?? '',
          rate: offer?.headlineRate ?? '',
          amountMinimum: offer ? formatSgd(offer.minimumDeposit) : '',
          deadline: offer ? fundingDeadline(offer, clock()) : '',
          isVerificationPending,
        };
      case 'setup':
        return { kind: 'setup', options: [...SCRIPT.offer.setupOptions] };
      case 'tour':
        return { kind: 'chips', options: [...SCRIPT.offer.tourChips], allowFreeText: false };
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
    snapshot,
    profile,
    audit,
    offer,
    get recommendation() {
      return recommendation;
    },
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
