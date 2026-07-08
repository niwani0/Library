import { describe, expect, it } from 'vitest';

import type { IdentityDocument } from '../types';
import { checkDocument } from './document-checks';

const TODAY = new Date('2026-07-07T12:00:00Z');

function documentFixture(overrides: Partial<IdentityDocument> = {}): IdentityDocument {
  return {
    type: 'passport',
    documentNumber: 'X1234567',
    expiryDate: '2030-05-01',
    issuingCountry: 'United Kingdom',
    ...overrides,
  };
}

describe('checkDocument', () => {
  it('accepts a valid in-date passport', () => {
    const result = checkDocument(documentFixture(), TODAY);

    expect(result.accepted).toBe(true);
  });

  it('rejects an expired document', () => {
    const result = checkDocument(documentFixture({ expiryDate: '2024-01-01' }), TODAY);

    expect(result.issues[0]).toContain('expired');
  });

  it('rejects a document expiring today', () => {
    const result = checkDocument(
      documentFixture({ expiryDate: '2026-07-07T12:00:00Z' }),
      TODAY,
    );

    expect(result.accepted).toBe(false);
  });

  it('rejects a malformed document number', () => {
    const result = checkDocument(documentFixture({ documentNumber: '!!!' }), TODAY);

    expect(result.issues[0]).toContain('Document number');
  });

  it('rejects an unparseable expiry date', () => {
    const result = checkDocument(documentFixture({ expiryDate: 'soon' }), TODAY);

    expect(result.issues[0]).toContain('not a valid date');
  });

  it('rejects a missing issuing country', () => {
    const result = checkDocument(documentFixture({ issuingCountry: '' }), TODAY);

    expect(result.issues[0]).toContain('Issuing country');
  });
});
