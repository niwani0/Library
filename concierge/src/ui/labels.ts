import type {
  ConsentId,
  CustomerGoal,
  DocumentType,
  EmploymentStatus,
  IncomeBand,
  SourceOfFunds,
} from '../domain/types';

export const GOAL_LABELS: Record<CustomerGoal, string> = {
  'everyday-banking': 'Day-to-day banking',
  saving: 'Building savings',
  international: 'Banking abroad',
  'wealth-growth': 'Growing my wealth',
  'moving-country': 'Moving country',
};

export const INCOME_BAND_LABELS: Record<IncomeBand, string> = {
  'under-25k': 'Under £25k',
  '25k-75k': '£25k – £75k',
  '75k-150k': '£75k – £150k',
  'over-150k': 'Over £150k',
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employed: 'Employed',
  'self-employed': 'Self-employed',
  retired: 'Retired',
  student: 'Student',
  'not-employed': 'Not currently employed',
};

export const SOURCE_OF_FUNDS_LABELS: Record<SourceOfFunds, string> = {
  salary: 'Salary',
  'business-income': 'Business income',
  savings: 'Savings',
  investments: 'Investments',
  pension: 'Pension',
  'property-sale': 'Property sale',
  inheritance: 'Inheritance',
  gift: 'Gift',
  other: 'Other',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  passport: 'Passport',
  'driving-licence': 'Driving licence',
  'national-id': 'National ID card',
};

export const CONSENT_LABELS: Record<ConsentId, { title: string; description: string }> = {
  terms: {
    title: 'Terms & key facts',
    description: 'I agree to the account terms and have read the key facts document.',
  },
  'data-processing': {
    title: 'Data processing for identity checks',
    description:
      'I agree to HSBC processing my details to verify my identity, as the law requires.',
  },
  'credit-check': {
    title: 'Credit check',
    description: 'I agree to HSBC running a credit check where one is needed.',
  },
  marketing: {
    title: 'Marketing',
    description: 'Occasional news about products and rates. You can opt out at any time.',
  },
};

/** Shows only day and year (e.g. "12 •• 1990") — the full DOB never appears on screen. */
export function maskDateOfBirth(isoDate: string): string {
  const [year, , day] = isoDate.split('-');
  if (!year || !day) {
    return '••';
  }
  return `${Number(day)} •• ${year}`;
}
