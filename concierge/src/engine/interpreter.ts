import type { CustomerGoal } from '../domain/types';
import type { Interpretation } from './types';

/**
 * Deterministic language understanding for the demo. The orchestrator only
 * depends on the Interpretation shape, so a hosted-model interpreter can be
 * swapped in behind the same signature without touching the state machine.
 */
const GOAL_SIGNALS: Array<{ goal: CustomerGoal; patterns: RegExp[] }> = [
  {
    goal: 'moving-country',
    patterns: [/\bmov(?:e|ed|ing)\b.*\b(?:country|abroad|uk|here)\b/, /\brelocat/, /\bjust (?:arrived|landed|moved)\b/, /\bnew to the (?:uk|country)\b/, /\bexpat\b/, /\bvisa\b/],
  },
  {
    goal: 'international',
    patterns: [/\binternational\b/, /\babroad\b/, /\boverseas\b/, /\bcurrenc/, /\bexchange rate/, /\btravel/, /\bsend money\b/, /\bremit/, /\bfamily (?:back )?home\b/],
  },
  {
    goal: 'wealth-growth',
    patterns: [/\binvest/, /\bwealth\b/, /\bgrow(?:ing)? my money\b/, /\bportfolio\b/, /\bretire/, /\bpremier\b/],
  },
  {
    goal: 'saving',
    patterns: [/\bsav(?:e|ing|ings)\b/, /\bdeposit\b/, /\bput (?:some )?money (?:away|aside)\b/, /\brainy day\b/, /\bhouse deposit\b/, /\bnest egg\b/],
  },
  {
    goal: 'everyday-banking',
    patterns: [/\beveryday\b/, /\bday.to.day\b/, /\bcurrent account\b/, /\bsalary\b/, /\bdirect debit/, /\bnew account\b/, /\bbasic\b/, /\bspending\b/],
  },
];

const HUMAN_PATTERNS = [/\bhuman\b/, /\bperson\b/, /\bspeak to some(?:one|body)\b/, /\btalk to some(?:one|body)\b/, /\badvis[eo]r\b/, /\bagent\b/, /\bbranch\b/, /\bcall me\b/];

const WHY_PATTERNS = [/\bwhy do you (?:need|want|ask)\b/, /\bwhy is (?:this|that) (?:needed|necessary|required)\b/, /\bdo you really need\b/, /\bis (?:this|that) safe\b/, /\bwhat.s it for\b/, /\bwho sees\b/];

export function interpret(text: string): Interpretation {
  const lowered = text.toLowerCase();

  return {
    goal: GOAL_SIGNALS.find(({ patterns }) =>
      patterns.some((pattern) => pattern.test(lowered)),
    )?.goal,
    wantsHuman: HUMAN_PATTERNS.some((pattern) => pattern.test(lowered)),
    asksWhy: WHY_PATTERNS.some((pattern) => pattern.test(lowered)),
  };
}
