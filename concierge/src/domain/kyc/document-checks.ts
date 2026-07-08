import type { IdentityDocument } from '../types';
import { compareDateParts, localDateParts, parseDateOnly } from './date-only';

export interface DocumentCheckResult {
  accepted: boolean;
  issues: string[];
}

const DOCUMENT_NUMBER_PATTERN = /^[A-Z0-9]{6,12}$/i;

export function checkDocument(
  document: IdentityDocument,
  today: Date,
): DocumentCheckResult {
  const issues: string[] = [];

  if (!DOCUMENT_NUMBER_PATTERN.test(document.documentNumber.trim())) {
    issues.push('Document number should be 6–12 letters and digits');
  }

  const expiry = parseDateOnly(document.expiryDate);
  if (!expiry) {
    issues.push('Expiry date is not a valid date');
  } else if (compareDateParts(expiry, localDateParts(today)) <= 0) {
    issues.push('This document has expired — we need one that is still valid');
  }

  if (document.issuingCountry.trim().length < 2) {
    issues.push('Issuing country is required');
  }

  return { accepted: issues.length === 0, issues };
}
