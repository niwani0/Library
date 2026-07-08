/**
 * Mechanical enforcement of the concierge voice. Prompt guidance drifts;
 * a linter does not. Every string the concierge can say is checked in tests:
 * professional, warm, confident, efficient — never salesy, robotic, verbose.
 */
const MAX_SENTENCES_PER_MESSAGE = 3;

const BANNED_PHRASES = [
  'act now',
  "don't miss",
  'limited time',
  'exclusive offer',
  'unlock',
  'supercharge',
  'game-changing',
  'best-in-class',
  'as an ai',
  'i am just a',
  'unfortunately',
  'per our policy',
  'you must',
  'invalid input',
];

export function lintTone(message: string): string[] {
  const issues: string[] = [];
  const lowered = message.toLowerCase();

  if (message.includes('!')) {
    issues.push('exclamation marks read as salesy or shouty');
  }

  const sentences = message
    .split(/[.?]\s/)
    .filter((sentence) => sentence.trim().length > 0);
  if (sentences.length > MAX_SENTENCES_PER_MESSAGE) {
    issues.push(`more than ${MAX_SENTENCES_PER_MESSAGE} sentences reads as verbose`);
  }

  for (const phrase of BANNED_PHRASES) {
    if (lowered.includes(phrase)) {
      issues.push(`banned phrase: "${phrase}"`);
    }
  }

  return issues;
}
