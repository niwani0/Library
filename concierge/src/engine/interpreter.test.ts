import { describe, expect, it } from 'vitest';

import { interpret } from './interpreter';

describe('interpret goals', () => {
  it('detects an international need from travel language', () => {
    expect(interpret('I travel a lot for work').goal).toBe('international');
  });

  it('detects a saving goal', () => {
    expect(interpret('I want to put money aside for a house deposit').goal).toBe('saving');
  });

  it('detects a relocation before a generic international need', () => {
    expect(interpret("I'm moving to the UK next month").goal).toBe('moving-country');
  });

  it('detects a wealth goal from investing language', () => {
    expect(interpret('Looking to invest and grow my money').goal).toBe('wealth-growth');
  });

  it('detects everyday banking from salary language', () => {
    expect(interpret('I just need somewhere for my salary to land').goal).toBe(
      'everyday-banking',
    );
  });

  it('returns no goal for unrelated text', () => {
    expect(interpret('nice weather today').goal).toBeUndefined();
  });
});

describe('interpret escalation signals', () => {
  it('detects a request for a human', () => {
    expect(interpret('can I talk to someone real').wantsHuman).toBe(true);
  });

  it('detects a why-do-you-need-this question', () => {
    expect(interpret('why do you need my date of birth?').asksWhy).toBe(true);
  });

  it('does not flag ordinary answers as escalations', () => {
    expect(interpret('I want to open a savings account').wantsHuman).toBe(false);
  });
});
