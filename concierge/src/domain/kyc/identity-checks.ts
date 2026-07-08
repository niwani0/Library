import type { Identity } from '../types';

export interface IdentityCheckResult {
  accepted: boolean;
  issues: string[];
}

const MINIMUM_AGE_YEARS = 18;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

export function checkIdentity(identity: Identity, today: Date): IdentityCheckResult {
  const issues: string[] = [];

  if (identity.fullName.trim().split(/\s+/).length < 2) {
    issues.push('Please give your full legal name as it appears on your ID');
  }

  const age = yearsBetween(new Date(identity.dateOfBirth), today);
  if (Number.isNaN(age)) {
    issues.push('Date of birth is not a valid date');
  } else if (age < MINIMUM_AGE_YEARS) {
    issues.push('You need to be 18 or over to open this account');
  } else if (age > 120) {
    issues.push('Please check the date of birth — it looks incorrect');
  }

  if (!EMAIL_PATTERN.test(identity.email.trim())) {
    issues.push('Email address does not look right');
  }
  if (!PHONE_PATTERN.test(identity.phone.trim())) {
    issues.push('Phone number does not look right');
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

function yearsBetween(from: Date, to: Date): number {
  if (Number.isNaN(from.getTime())) {
    return Number.NaN;
  }
  const years = to.getFullYear() - from.getFullYear();
  const hadBirthdayThisYear =
    to.getMonth() > from.getMonth() ||
    (to.getMonth() === from.getMonth() && to.getDate() >= from.getDate());
  return hadBirthdayThisYear ? years : years - 1;
}
