import { describe, expect, it } from 'vitest';

import { PREMIER_DEPOSIT_OFFER } from '../domain/offers';
import type { CustomerAction } from './types';
import { createConcierge, type Concierge } from './orchestrator';

const FIXED_NOW = () => new Date(2026, 6, 7, 12);
const FIXED_ACCOUNT = () => '12345678';

function offerConcierge(): Concierge {
  return createConcierge({
    clock: FIXED_NOW,
    accountNumberSource: FIXED_ACCOUNT,
    offer: PREMIER_DEPOSIT_OFFER,
  });
}

const SINGPASS_PATH_TO_REVIEW: CustomerAction[] = [
  { kind: 'choice', value: 'ready' },
  { kind: 'consent', granted: ['terms', 'data-processing'] },
  { kind: 'choice', value: 'singpass' },
  { kind: 'choice', value: 'confirm' },
  { kind: 'choice', value: 'platform' },
  {
    kind: 'financial',
    financial: {
      employmentStatus: 'employed',
      occupation: 'Architect',
      annualIncomeBand: '75k-150k',
      sourceOfFunds: 'savings',
      expectedMonthlyInflow: 8000,
    },
  },
  { kind: 'multi-select', values: ['fx'] },
  { kind: 'choice', value: 'secure-yields' },
  { kind: 'tax', taxResidency: { countries: ['Singapore'], usPerson: false } },
];

function runTo(engine: Concierge, actions: CustomerAction[]) {
  engine.start();
  let last = engine.handle(actions[0] as CustomerAction);
  for (const action of actions.slice(1)) {
    last = engine.handle(action);
  }
  return last;
}

describe('offer journey — arrival and questions', () => {
  it('opens by naming the offer the customer came in with', () => {
    const first = offerConcierge().start();

    expect(first.messages.join(' ')).toContain('3.88%');
  });

  it('answers a free-text question about early withdrawal', () => {
    const engine = offerConcierge();
    engine.start();

    const reply = engine.handle({ kind: 'text', text: 'what if I need the money early?' });

    expect(reply.messages[0]).toContain('principal is always yours');
  });

  it('stays at the offer stage while questions continue', () => {
    const engine = offerConcierge();
    engine.start();

    const reply = engine.handle({ kind: 'text', text: 'is the rate guaranteed?' });

    expect(reply.stage).toBe('offer-welcome');
  });

  it('answers offer questions mid-application too', () => {
    const engine = offerConcierge();
    runTo(engine, SINGPASS_PATH_TO_REVIEW.slice(0, 3));

    const reply = engine.handle({ kind: 'text', text: 'remind me about the minimum deposit?' });

    expect(reply.messages[0]).toContain('S$30,000');
  });

  it('moves to the steps-and-consent layout when the customer is ready', () => {
    const engine = offerConcierge();
    engine.start();

    const reply = engine.handle({ kind: 'text', text: "ok let's start" });

    expect(reply.prompt.kind).toBe('steps-consent');
  });

  it('records the purpose of account from the offer, never asking for it', () => {
    const engine = offerConcierge();
    engine.start();

    expect(engine.profile.goal).toBe('saving');
  });
});

describe('offer journey — Singpass path', () => {
  it('prefills identity from Singpass with nothing to type', () => {
    const engine = offerConcierge();
    runTo(engine, SINGPASS_PATH_TO_REVIEW.slice(0, 3));

    expect(engine.profile.identity?.fullName).toBe('Alexandra Tan Wei Lin');
  });

  it('asks the customer to confirm the retrieved details', () => {
    const engine = offerConcierge();

    const reply = runTo(engine, SINGPASS_PATH_TO_REVIEW.slice(0, 3));

    expect(reply.prompt.kind).toBe('identity-confirm');
  });

  it('merges device contact details into the identity', () => {
    const engine = offerConcierge();
    runTo(engine, SINGPASS_PATH_TO_REVIEW.slice(0, 5));

    expect(engine.profile.identity?.email).toBe('alexandra.tan@icloud.com');
  });

  it('reaches the review after insights and tax', () => {
    const engine = offerConcierge();

    const reply = runTo(engine, SINGPASS_PATH_TO_REVIEW);

    expect(reply.stage).toBe('review');
  });

  it('stores volunteered service interests as insights', () => {
    const engine = offerConcierge();
    runTo(engine, SINGPASS_PATH_TO_REVIEW);

    expect(engine.profile.insights?.services).toEqual(['fx']);
  });

  it('opens the account straight after review — consent was given up front', () => {
    const engine = offerConcierge();
    runTo(engine, SINGPASS_PATH_TO_REVIEW);

    const reply = engine.handle({ kind: 'confirm-review' });

    expect(reply.prompt.kind).toBe('transfer');
  });

  it('shows the funding deadline with the transfer details', () => {
    const engine = offerConcierge();
    runTo(engine, SINGPASS_PATH_TO_REVIEW);

    const reply = engine.handle({ kind: 'confirm-review' });

    expect(reply.prompt).toMatchObject({ deadline: '6 August 2026' });
  });

  it('ends with setup choices and a tour offer', () => {
    const engine = offerConcierge();
    runTo(engine, [
      ...SINGPASS_PATH_TO_REVIEW,
      { kind: 'confirm-review' },
      { kind: 'choice', value: 'continue' },
      { kind: 'setup', enabled: ['biometrics', 'push'] },
    ]);

    const reply = engine.handle({ kind: 'choice', value: 'tour-later' });

    expect(reply.stage).toBe('complete');
  });

  it('records a marketing consent only when chosen at setup', () => {
    const engine = offerConcierge();
    runTo(engine, [
      ...SINGPASS_PATH_TO_REVIEW,
      { kind: 'confirm-review' },
      { kind: 'choice', value: 'continue' },
    ]);

    engine.handle({ kind: 'setup', enabled: ['biometrics'] });

    expect(engine.profile.consents.map((consent) => consent.id)).not.toContain('marketing');
  });
});

describe('offer journey — manual and recovery paths', () => {
  it('continues past a failed document with verification deferred', () => {
    const engine = offerConcierge();
    runTo(engine, [
      { kind: 'choice', value: 'ready' },
      { kind: 'consent', granted: ['terms', 'data-processing'] },
      { kind: 'choice', value: 'upload' },
    ]);

    const reply = engine.handle({
      kind: 'document',
      document: {
        type: 'passport',
        documentNumber: '!!!',
        expiryDate: '2030-01-01',
        issuingCountry: 'Singapore',
      },
    });

    expect(reply.stage).toBe('identity');
  });

  it('notes the pending verification when the account opens', () => {
    const engine = offerConcierge();
    runTo(engine, [
      { kind: 'choice', value: 'ready' },
      { kind: 'consent', granted: ['terms', 'data-processing'] },
      { kind: 'choice', value: 'upload' },
      {
        kind: 'document',
        document: {
          type: 'passport',
          documentNumber: '!!!',
          expiryDate: '2030-01-01',
          issuingCountry: 'Singapore',
        },
      },
      {
        kind: 'identity',
        identity: {
          fullName: 'Alexandra Tan Wei Lin',
          dateOfBirth: '1988-03-21',
          nationality: 'Singaporean',
          countryOfResidence: 'Singapore',
          residentialAddress: '18 Marina Boulevard, #12-04, Singapore 018980',
          email: '',
          phone: '',
        },
      },
      { kind: 'choice', value: 'platform' },
      SINGPASS_PATH_TO_REVIEW[5] as CustomerAction,
      { kind: 'multi-select', values: [] },
      { kind: 'choice', value: 'balanced' },
      { kind: 'tax', taxResidency: { countries: ['Singapore'], usPerson: false } },
    ]);

    const reply = engine.handle({ kind: 'confirm-review' });

    expect(reply.messages.join(' ')).toContain('background');
  });

  it('catches a likely email typo and offers the correction', () => {
    const engine = offerConcierge();
    runTo(engine, [...SINGPASS_PATH_TO_REVIEW.slice(0, 4), { kind: 'choice', value: 'manual' }]);

    const reply = engine.handle({
      kind: 'contact',
      email: 'alex@gamil.com',
      phone: '+65 8123 4567',
    });

    expect(reply.messages[0]).toContain('alex@gmail.com');
  });

  it('applies the corrected email when the customer accepts it', () => {
    const engine = offerConcierge();
    runTo(engine, [
      ...SINGPASS_PATH_TO_REVIEW.slice(0, 4),
      { kind: 'choice', value: 'manual' },
      { kind: 'contact', email: 'alex@gamil.com', phone: '+65 8123 4567' },
    ]);

    engine.handle({ kind: 'choice', value: 'use-suggested' });

    expect(engine.profile.identity?.email).toBe('alex@gmail.com');
  });

  it('respects the customer keeping what they typed', () => {
    const engine = offerConcierge();
    runTo(engine, [
      ...SINGPASS_PATH_TO_REVIEW.slice(0, 4),
      { kind: 'choice', value: 'manual' },
      { kind: 'contact', email: 'alex@gamil.com', phone: '+65 8123 4567' },
    ]);

    engine.handle({ kind: 'choice', value: 'keep-original' });

    expect(engine.profile.identity?.email).toBe('alex@gamil.com');
  });
});

describe('offer journey — resume where you left off', () => {
  it('restores the saved stage instead of starting over', () => {
    const engine = offerConcierge();
    runTo(engine, SINGPASS_PATH_TO_REVIEW.slice(0, 5));
    const saved = engine.snapshot();

    const restored = createConcierge({
      clock: FIXED_NOW,
      accountNumberSource: FIXED_ACCOUNT,
      offer: PREMIER_DEPOSIT_OFFER,
      snapshot: saved,
    });

    expect(restored.start().stage).toBe('financial');
  });

  it('keeps everything the customer already shared', () => {
    const engine = offerConcierge();
    runTo(engine, SINGPASS_PATH_TO_REVIEW.slice(0, 5));
    const saved = engine.snapshot();

    const restored = createConcierge({
      clock: FIXED_NOW,
      accountNumberSource: FIXED_ACCOUNT,
      offer: PREMIER_DEPOSIT_OFFER,
      snapshot: saved,
    });
    restored.start();

    expect(restored.profile.identity?.fullName).toBe('Alexandra Tan Wei Lin');
  });

  it('greets a returning customer as returning, not new', () => {
    const engine = offerConcierge();
    runTo(engine, SINGPASS_PATH_TO_REVIEW.slice(0, 5));

    const restored = createConcierge({
      clock: FIXED_NOW,
      offer: PREMIER_DEPOSIT_OFFER,
      snapshot: engine.snapshot(),
    });

    expect(restored.start().messages[0]).toContain('Welcome back');
  });

  it('saves the typo interlude as the contact step, never a dead end', () => {
    const engine = offerConcierge();
    runTo(engine, [
      ...SINGPASS_PATH_TO_REVIEW.slice(0, 4),
      { kind: 'choice', value: 'manual' },
      { kind: 'contact', email: 'alex@gamil.com', phone: '+65 8123 4567' },
    ]);

    expect(engine.snapshot().stage).toBe('contact');
  });

  it('still declines a sanctions match on the offer path — compliance is unchanged', () => {
    const engine = offerConcierge();
    runTo(engine, [
      { kind: 'choice', value: 'ready' },
      { kind: 'consent', granted: ['terms', 'data-processing'] },
      { kind: 'choice', value: 'upload' },
      {
        kind: 'document',
        document: {
          type: 'passport',
          documentNumber: 'X1234567',
          expiryDate: '2030-01-01',
          issuingCountry: 'Singapore',
        },
      },
      {
        kind: 'identity',
        identity: {
          fullName: 'Victor Sanction',
          dateOfBirth: '1985-02-02',
          nationality: 'Singaporean',
          countryOfResidence: 'Singapore',
          residentialAddress: '9 Long Acre Road, Singapore 018989',
          email: '',
          phone: '',
        },
      },
      { kind: 'choice', value: 'platform' },
      SINGPASS_PATH_TO_REVIEW[5] as CustomerAction,
      { kind: 'multi-select', values: [] },
      { kind: 'choice', value: 'balanced' },
      { kind: 'tax', taxResidency: { countries: ['Singapore'], usPerson: false } },
    ]);

    const reply = engine.handle({ kind: 'confirm-review' });

    expect(reply.stage).toBe('declined');
  });
});
