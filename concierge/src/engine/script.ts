import type { CustomerGoal } from '../domain/types';

/**
 * Every word the concierge can say lives here, so the tone guard can lint the
 * complete voice in one test. Decline copy is deliberately neutral: explaining
 * an AML decline would be tipping off, which is a criminal offence.
 */
export const SCRIPT = {
  welcome: [
    'Good afternoon — welcome to Meridian. I look after new clients here.',
    'Opening an account takes about ten minutes, and you can pause any time. To point you in the right direction: what brings you to us today?',
  ],
  goalAcknowledgement: {
    'everyday-banking': 'A dependable everyday account — sensible place to start.',
    saving: 'Building savings is one of the best reasons to switch banks.',
    international: 'Banking across borders is exactly what we do well.',
    'wealth-growth': 'Growing what you have takes the right foundations.',
    'moving-country': 'Moving countries is a big step — we can make the banking part easy.',
  } satisfies Record<CustomerGoal, string>,
  discoveryContext:
    'So I recommend the right account rather than a list of options: roughly where does your annual income sit?',
  recommendationIntro:
    'Based on what you have told me, here is the account I would open for you — and why.',
  recommendationHonesty:
    'If a different account suits you better, say so — my job is the right fit, not a particular product.',
  identityIntro:
    'Let us get you set up. First, a few details about you — exactly as they appear on your ID.',
  identityWhy:
    'Banks are required to verify who their customers are. Your details are used for identity checks only.',
  documentIntro:
    'Thank you. Next, your identity document — a passport, driving licence, or national ID works.',
  documentWhy:
    'A document check protects your account from being opened by someone pretending to be you.',
  financialIntro:
    'Nearly there. A little about your finances — this keeps your account protected from day one.',
  financialWhy:
    'Understanding expected activity lets us spot anything unusual on your account later and query it before it becomes a problem.',
  taxIntro: 'One regulatory question: where are you resident for tax purposes?',
  taxWhy:
    'International agreements require banks to record tax residency for every new client. It has no effect on eligibility for this account.',
  reviewIntro:
    'Here is everything you have told me. Worth a quick look before we make it official — you can change anything.',
  editIntro: 'Of course. Update it below, and we will pick up where we left off.',
  backToReview: 'Updated — here is everything once more.',
  productAdjusted: (name: string) =>
    `One adjustment: with your updated income, ${name} is the better fit, so I have moved you to it.`,
  consentIntro:
    'Last step before I open the account: the agreements. The first two are required; marketing is entirely your choice.',
  consentMissing:
    'The two required agreements need a tick before the account can be opened — take your time reading them.',
  processing: 'Opening your account now — this takes a few seconds.',
  approvedFunding: [
    'Your account is open. Would you like to add a first deposit now?',
    'No pressure either way — you can always fund it later from the app.',
  ],
  referred: [
    'Thank you — your application is with a specialist for a final review, which is a normal part of opening some accounts.',
    'You will hear from us within two working days, and there is nothing more you need to do.',
  ],
  declined: [
    'Thank you for your time today. We are not able to open an account for you on this occasion.',
    'This decision is final for now, and you can contact us in writing if you would like it looked at again.',
  ],
  complete: [
    'All done — your account is ready to use.',
    'Your card arrives within five working days, and the app will guide you from here.',
  ],
  completeWithDeposit: (amount: string) =>
    `All done — your account is open and your deposit of ${amount} is on its way.`,
  largeDepositEvidence:
    'One thing to expect: for a first deposit of this size we will ask for proof of funds in the app — a photo of a recent statement is usually enough.',
  handoff: [
    'Of course. A colleague will call you within one working day on the number you provide.',
    'Everything you have shared so far is saved, so you will not have to repeat yourself.',
  ],
  whyReassurance:
    'Fair question. Banks must verify who they hold accounts for — it protects you as much as it protects us. Only what the law requires is collected, and it is never sold.',
  formIssuesIntro: 'Almost — a couple of things to check:',
  fallback:
    'I want to make sure I understand. Could you tell me a little more, or pick one of the options below?',
  goalChips: [
    { label: 'Day-to-day banking', value: 'everyday-banking' },
    { label: 'Start saving', value: 'saving' },
    { label: 'Banking abroad', value: 'international' },
    { label: 'Growing my wealth', value: 'wealth-growth' },
    { label: "I'm moving country", value: 'moving-country' },
  ],
  incomeChips: [
    { label: 'Under £25k', value: 'under-25k' },
    { label: '£25k – £75k', value: '25k-75k' },
    { label: '£75k – £150k', value: '75k-150k' },
    { label: 'Over £150k', value: 'over-150k' },
  ],
} as const;

/** Flattens every concierge-visible string for the tone-guard test. */
export function allScriptMessages(): string[] {
  const messages: string[] = [];
  const visit = (value: unknown): void => {
    if (typeof value === 'string') {
      messages.push(value);
      return;
    }
    if (typeof value === 'function') {
      messages.push((value as (amount: string) => string)('£500'));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === 'object') {
      Object.values(value).forEach(visit);
    }
  };
  visit(SCRIPT);
  return messages;
}
