import type { Identity } from '../types';
import { localDateParts, parseDateOnly, yearsBetween } from './date-only';

export interface IdentityCheckResult {
  accepted: boolean;
  issues: string[];
}

const MINIMUM_AGE_YEARS = 18;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

export function checkIdentity(identity: Identity, today: Date): IdentityCheckResult {
  const issues = [
    ...checkIdentityCore(identity, today).issues,
    ...checkContact(identity.email, identity.phone).issues,
  ];
  return { accepted: issues.length === 0, issues };
}

/** Everything except contact details — Singpass supplies this part alone. */
export function checkIdentityCore(
  identity: Omit<Identity, 'email' | 'phone'>,
  today: Date,
): IdentityCheckResult {
  const issues: string[] = [];

  if (identity.fullName.trim().split(/\s+/).length < 2) {
    issues.push('Please give your full legal name as it appears on your ID');
  }

  const dateOfBirth = parseDateOnly(identity.dateOfBirth);
  const age = dateOfBirth ? yearsBetween(dateOfBirth, localDateParts(today)) : Number.NaN;
  if (Number.isNaN(age)) {
    issues.push('Date of birth is not a valid date');
  } else if (age < MINIMUM_AGE_YEARS) {
    issues.push('You need to be 18 or over to open this account');
  } else if (age > 120) {
    issues.push('Please check the date of birth — it looks incorrect');
  }

  if (identity.residentialAddress.trim().length < 10) {
    issues.push('Please give your full residential address');
  }
  if (identity.nationality.trim().length < 2) {
    issues.push('Nationality is required');
  }
  if (identity.countryOfResidence.trim().length < 2) {
    issues.push('Country of residence is required');
  }

  return { accepted: issues.length === 0, issues };
}

export function checkContact(email: string, phone: string): IdentityCheckResult {
  const issues: string[] = [];
  if (!EMAIL_PATTERN.test(email.trim())) {
    issues.push('Email address does not look right');
  }
  if (!PHONE_PATTERN.test(phone.trim())) {
    issues.push('Phone number does not look right');
  }
  return { accepted: issues.length === 0, issues };
}
