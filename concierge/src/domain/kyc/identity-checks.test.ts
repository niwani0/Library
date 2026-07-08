import { describe, expect, it } from 'vitest';

import type { Identity } from '../types';
import { checkIdentity } from './identity-checks';

const TODAY = new Date('2026-07-07T12:00:00Z');

function identityFixture(overrides: Partial<Identity> = {}): Identity {
  return {
    fullName: 'Amelia Chen',
    dateOfBirth: '1990-04-12',
    nationality: 'British',
    countryOfResidence: 'United Kingdom',
    residentialAddress: '12 Harbour Street, London, N1 4AB',
    email: 'amelia@example.com',
    phone: '+44 7700 900123',
    ...overrides,
  };
}

describe('checkIdentity', () => {
  it('accepts a complete valid identity', () => {
    const result = checkIdentity(identityFixture(), TODAY);

    expect(result.accepted).toBe(true);
  });

  it('rejects a single-word name', () => {
    const result = checkIdentity(identityFixture({ fullName: 'Amelia' }), TODAY);

    expect(result.issues[0]).toContain('full legal name');
  });

  it('rejects applicants under 18', () => {
    const result = checkIdentity(
      identityFixture({ dateOfBirth: '2010-01-01' }),
      TODAY,
    );

    expect(result.issues[0]).toContain('18 or over');
  });

  it('accepts an applicant on their 18th birthday', () => {
    const result = checkIdentity(
      identityFixture({ dateOfBirth: '2008-07-07' }),
      TODAY,
    );

    expect(result.accepted).toBe(true);
  });

  it('rejects an applicant one day before their 18th birthday', () => {
    const result = checkIdentity(
      identityFixture({ dateOfBirth: '2008-07-08' }),
      TODAY,
    );

    expect(result.accepted).toBe(false);
  });

  it('rejects an unparseable date of birth', () => {
    const result = checkIdentity(
      identityFixture({ dateOfBirth: 'not-a-date' }),
      TODAY,
    );

    expect(result.issues[0]).toContain('not a valid date');
  });

  it('rejects a malformed email address', () => {
    const result = checkIdentity(identityFixture({ email: 'amelia@' }), TODAY);

    expect(result.issues[0]).toContain('Email');
  });

  it('rejects a malformed phone number', () => {
    const result = checkIdentity(identityFixture({ phone: 'abc' }), TODAY);

    expect(result.issues[0]).toContain('Phone');
  });

  it('rejects a too-short residential address', () => {
    const result = checkIdentity(
      identityFixture({ residentialAddress: 'Flat 1' }),
      TODAY,
    );

    expect(result.issues[0]).toContain('address');
  });
});
