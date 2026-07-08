/**
 * Offer-led acquisition: the customer arrives from a marketing offer, so the
 * journey already knows the product, the purpose of the account, and the
 * goal — none of which should ever be asked again.
 */
export interface OfferFaqEntry {
  id: string;
  question: string;
  patterns: RegExp[];
  answer: string;
}

export interface Offer {
  id: string;
  name: string;
  headlineRate: string;
  termMonths: number;
  currency: 'SGD';
  minimumDeposit: number;
  /** Days after account opening before the promotional rate lapses. */
  fundingWindowDays: number;
  faq: OfferFaqEntry[];
}

export const PREMIER_DEPOSIT_OFFER: Offer = {
  id: 'premier-deposit-388',
  name: 'Premier 12-Month Term Deposit',
  headlineRate: '3.88% p.a.',
  termMonths: 12,
  currency: 'SGD',
  minimumDeposit: 30000,
  fundingWindowDays: 30,
  faq: [
    {
      id: 'rate',
      question: 'Is the rate guaranteed?',
      patterns: [/\brate\b/, /\binterest\b/, /\bguarantee/, /\b3\.88\b/, /\bp\.?a\.?\b/, /\breturns?\b/],
      answer:
        'The 3.88% p.a. is fixed for the full 12 months from the day your deposit lands — it does not move with the market. Interest is paid at maturity.',
    },
    {
      id: 'minimum',
      question: 'What is the minimum?',
      patterns: [/\bminimum\b/, /\bhow much\b.*\b(?:need|deposit|put)\b/, /\bleast\b/, /\b30,?000\b/],
      answer:
        'The offer starts at S$30,000, placed as a single deposit within 30 days of opening the account. There is no upper cap for this promotion.',
    },
    {
      id: 'early-withdrawal',
      question: 'What if I withdraw early?',
      patterns: [/\bearly\b/, /\bwithdraw/, /\bbreak\b/, /\bcancel\b/, /\bbefore maturity\b/, /\bcatch(es)?\b/, /\bpenalt/],
      answer:
        'You can withdraw before maturity, and your principal is always yours — you would give up the promotional interest and receive the board rate for the period held instead. No hidden fees beyond that.',
    },
    {
      id: 'eligibility',
      question: 'Who is eligible?',
      patterns: [/\beligib/, /\bqualif/, /\bwho can\b/, /\bpremier\b.*\brequire/, /\brequirements?\b/],
      answer:
        'It is a Premier exclusive for new-to-bank customers. You do not need to hold Premier status today — this application opens it, and the deposit itself counts toward the Premier balance requirement.',
    },
    {
      id: 'insurance',
      question: 'Is my money protected?',
      patterns: [/\bprotect/, /\binsur/, /\bsdic\b/, /\bsafe\b/, /\bsecure\b/, /\bbank fails?\b/],
      answer:
        'Singapore dollar deposits with HSBC Singapore are insured by SDIC up to S$100,000 per depositor. Your deposit sits with a fully licensed bank.',
    },
    {
      id: 'funding',
      question: 'How do I fund it?',
      patterns: [/\bfund/, /\btransfer/, /\bfast\b/, /\bpaynow\b/, /\bmove (?:my )?money\b/, /\bsend (?:the )?money\b/],
      answer:
        'Once your account is open you transfer from any Singapore bank via FAST or PayNow — it arrives in minutes. From overseas, a telegraphic transfer works too; the 30-day window gives you time.',
    },
    {
      id: 'deadline',
      question: 'How long is this valid?',
      patterns: [/\bvalid\b/, /\bdeadline\b/, /\bexpir/, /\bhow long\b/, /\buntil when\b/, /\blast\b.*\boffer\b/],
      answer:
        'The rate is locked for you at account opening, and you then have 30 days to place the deposit. Applying today secures it.',
    },
    {
      id: 'tenor',
      question: 'What happens at maturity?',
      patterns: [/\bmatur/, /\b12 months?\b/, /\bterm\b/, /\btenor\b/, /\bafter (?:a|one) year\b/, /\brenew/, /\broll/],
      answer:
        'At maturity the principal and interest land in your Premier account. Nothing auto-renews without your say-so — we will ask you first, with the rates available then.',
    },
  ],
};

export function findFaqAnswer(offer: Offer, text: string): OfferFaqEntry | undefined {
  const lowered = text.toLowerCase();
  return offer.faq.find((entry) => entry.patterns.some((pattern) => pattern.test(lowered)));
}

export function formatSgd(amount: number): string {
  return 'S$' + new Intl.NumberFormat('en-SG', { maximumFractionDigits: 0 }).format(amount);
}

/** The funding deadline shown at account opening (Phase 2, step 16). */
export function fundingDeadline(offer: Offer, openedAt: Date): string {
  const deadline = new Date(openedAt.getTime());
  deadline.setDate(deadline.getDate() + offer.fundingWindowDays);
  return deadline.toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' });
}
