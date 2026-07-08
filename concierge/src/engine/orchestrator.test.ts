import { describe, expect, it } from 'vitest';

import type { CustomerAction } from './types';
import { createConcierge, type Concierge } from './orchestrator';

const FIXED_NOW = () => new Date('2026-07-07T12:00:00Z');
const FIXED_ACCOUNT = () => '12345678';

function concierge(): Concierge {
  return createConcierge({ clock: FIXED_NOW, accountNumberSource: FIXED_ACCOUNT });
}

const HAPPY_PATH_TO_CONSENT: CustomerAction[] = [
  { kind: 'choice', value: 'everyday-banking' },
  { kind: 'choice', value: '25k-75k' },
  { kind: 'choice', value: 'accept' },
  {
    kind: 'identity',
    identity: {
      fullName: 'Amelia Chen',
      dateOfBirth: '1990-04-12',
      nationality: 'British',
      countryOfResidence: 'United Kingdom',
      residentialAddress: '12 Harbour Street, London, N1 4AB',
      email: 'amelia@example.com',
      phone: '+44 7700 900123',
    },
  },
  {
    kind: 'document',
    document: {
      type: 'passport',
      documentNumber: 'X1234567',
      expiryDate: '2030-05-01',
      issuingCountry: 'United Kingdom',
    },
  },
  {
    kind: 'financial',
    financial: {
      employmentStatus: 'employed',
      occupation: 'Architect',
      annualIncomeBand: '25k-75k',
      sourceOfFunds: 'salary',
      expectedMonthlyInflow: 4000,
    },
  },
  { kind: 'tax', taxResidency: { countries: ['United Kingdom'], usPerson: false } },
  { kind: 'confirm-review' },
];

function runTo(engine: Concierge, actions: CustomerAction[]) {
  engine.start();
  let last = engine.handle(actions[0] as CustomerAction);
  for (const action of actions.slice(1)) {
    last = engine.handle(action);
  }
  return last;
}

function runHappyPathToFunding(engine: Concierge) {
  return runTo(engine, [
    ...HAPPY_PATH_TO_CONSENT,
    { kind: 'consent', granted: ['terms', 'data-processing'] },
  ]);
}

describe('createConcierge journey', () => {
  it('opens with the goal question, never a product pitch', () => {
    const first = concierge().start();

    expect(first.prompt.kind).toBe('chips');
  });

  it('acknowledges the goal before asking anything else', () => {
    const engine = concierge();
    engine.start();

    const reply = engine.handle({ kind: 'choice', value: 'saving' });

    expect(reply.messages[0]).toContain('savings');
  });

  it('understands a free-text goal about moving country', () => {
    const engine = concierge();
    engine.start();

    const reply = engine.handle({ kind: 'text', text: "I've just moved to the UK for work" });

    expect(reply.stage).toBe('discovery-context');
  });

  it('recommends a product only after goal and income are known', () => {
    const engine = concierge();

    const reply = runTo(engine, [
      { kind: 'choice', value: 'international' },
      { kind: 'choice', value: '25k-75k' },
    ]);

    expect(reply.prompt.kind).toBe('recommendation');
  });

  it('reaches the funding stage for an approvable customer', () => {
    const reply = runHappyPathToFunding(concierge());

    expect(reply.stage).toBe('funding');
  });

  it('keeps funding optional', () => {
    const engine = concierge();
    runHappyPathToFunding(engine);

    const reply = engine.handle({ kind: 'skip-funding' });

    expect(reply.stage).toBe('complete');
  });

  it('issues the account number on completion', () => {
    const engine = concierge();
    runHappyPathToFunding(engine);

    const reply = engine.handle({ kind: 'deposit', amount: 500 });

    expect(reply.prompt).toMatchObject({ kind: 'completion', accountNumber: '12345678' });
  });

  it('asks for proof of funds when a first deposit dwarfs declared inflows', () => {
    const engine = concierge();
    runHappyPathToFunding(engine);

    const reply = engine.handle({ kind: 'deposit', amount: 50000 });

    expect(reply.messages.join(' ')).toContain('proof of funds');
  });

  it('does not mention evidence for a proportionate deposit', () => {
    const engine = concierge();
    runHappyPathToFunding(engine);

    const reply = engine.handle({ kind: 'deposit', amount: 500 });

    expect(reply.messages.join(' ')).not.toContain('proof of funds');
  });

  it('confirms the deposit amount in the completion message', () => {
    const engine = concierge();
    runHappyPathToFunding(engine);

    const reply = engine.handle({ kind: 'deposit', amount: 500 });

    expect(reply.messages[0]).toContain('£500');
  });

  it('re-prompts identity with specific issues when validation fails', () => {
    const engine = concierge();
    runTo(engine, HAPPY_PATH_TO_CONSENT.slice(0, 3));

    const reply = engine.handle({
      kind: 'identity',
      identity: {
        fullName: 'Amelia',
        dateOfBirth: '1990-04-12',
        nationality: 'British',
        countryOfResidence: 'United Kingdom',
        residentialAddress: '12 Harbour Street, London, N1 4AB',
        email: 'amelia@example.com',
        phone: '+44 7700 900123',
      },
    });

    expect(reply.stage).toBe('identity');
  });

  it('holds the consent gate until required consents are granted', () => {
    const engine = concierge();
    runTo(engine, HAPPY_PATH_TO_CONSENT);

    const reply = engine.handle({ kind: 'consent', granted: ['marketing'] });

    expect(reply.stage).toBe('consent');
  });

  it('never asks for the income band twice', () => {
    const engine = concierge();
    runTo(engine, HAPPY_PATH_TO_CONSENT.slice(0, 2));

    expect(engine.profile.incomeBand).toBe('25k-75k');
  });
});

describe('createConcierge compliance outcomes', () => {
  function journeyWithName(fullName: string) {
    const engine = concierge();
    const actions = HAPPY_PATH_TO_CONSENT.map((action) =>
      action.kind === 'identity'
        ? { ...action, identity: { ...action.identity, fullName } }
        : action,
    );
    return runTo(engine, [
      ...actions,
      { kind: 'consent', granted: ['terms', 'data-processing'] },
    ]);
  }

  it('declines a sanctions match', () => {
    const reply = journeyWithName('Victor Sanction');

    expect(reply.stage).toBe('declined');
  });

  it('gives a sanctions decline no reasons — tipping off is an offence', () => {
    const reply = journeyWithName('Victor Sanction');

    expect(reply.messages.join(' ')).not.toMatch(/sanction|risk|watchlist|screen/i);
  });

  it('routes a politically exposed person to human review', () => {
    const reply = journeyWithName('Petra Epstein-Pep');

    expect(reply.stage).toBe('referred');
  });

  it('frames referral as routine, with a clear time expectation', () => {
    const reply = journeyWithName('Petra Epstein-Pep');

    expect(reply.messages.join(' ')).toContain('two working days');
  });
});

describe('createConcierge trust behaviours', () => {
  it('answers a "why do you need this" question with reassurance, not repetition', () => {
    const engine = concierge();
    runTo(engine, HAPPY_PATH_TO_CONSENT.slice(0, 3));

    const reply = engine.handle({ kind: 'text', text: 'why do you need my address?' });

    expect(reply.messages[0]).toContain('protects you');
  });

  it('keeps the customer at the same step after a why question', () => {
    const engine = concierge();
    runTo(engine, HAPPY_PATH_TO_CONSENT.slice(0, 3));

    const reply = engine.handle({ kind: 'text', text: 'why do you need my address?' });

    expect(reply.stage).toBe('identity');
  });

  it('offers a human colleague the moment one is requested', () => {
    const engine = concierge();
    engine.start();

    const reply = engine.handle({ kind: 'text', text: 'can I speak to a human please' });

    expect(reply.messages[0]).toContain('colleague');
  });

  it('records the compliance decision in the audit trail', () => {
    const engine = concierge();
    runHappyPathToFunding(engine);

    const events = engine.audit.entries.map((entry) => entry.event);

    expect(events).toContain('compliance-decision');
  });

  it('records granted consents with a timestamp', () => {
    const engine = concierge();
    runHappyPathToFunding(engine);

    expect(engine.profile.consents[0]?.grantedAt).toBe('2026-07-07T12:00:00.000Z');
  });

  it('falls back gracefully on text it cannot interpret', () => {
    const engine = concierge();
    engine.start();

    const reply = engine.handle({ kind: 'text', text: 'zxqw' });

    expect(reply.prompt.kind).toBe('chips');
  });
});
