/**
 * Prefill sources for the offer journey. In production these are the Singpass
 * MyInfo API and the platform identity APIs; the shapes and the journey
 * semantics here are real — the data is simulated for the concept.
 */
import type { Identity, IdentityDocument } from '../domain/types';

export interface SingpassRecord {
  identity: Omit<Identity, 'email' | 'phone'>;
  document: IdentityDocument;
}

export function fetchSingpassRecord(): SingpassRecord {
  return {
    identity: {
      fullName: 'Alexandra Tan Wei Lin',
      dateOfBirth: '1988-03-21',
      nationality: 'Singaporean',
      countryOfResidence: 'Singapore',
      residentialAddress: '18 Marina Boulevard, #12-04, Singapore 018980',
    },
    document: {
      type: 'national-id',
      documentNumber: 'S8812345A',
      expiryDate: '2036-01-01',
      issuingCountry: 'Singapore',
    },
  };
}

export interface PlatformContact {
  email: string;
  phone: string;
}

export function fetchPlatformContact(): PlatformContact {
  return {
    email: 'alexandra.tan@icloud.com',
    phone: '+65 8123 4567',
  };
}

/** Common mail-domain typos worth catching before they break verification. */
const DOMAIN_CORRECTIONS: Record<string, string> = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'iclod.com': 'icloud.com',
  'icloud.co': 'icloud.com',
};

export function suggestEmailCorrection(email: string): string | undefined {
  const atIndex = email.lastIndexOf('@');
  if (atIndex < 1) {
    return undefined;
  }
  const domain = email.slice(atIndex + 1).toLowerCase();
  const corrected = DOMAIN_CORRECTIONS[domain];
  return corrected ? email.slice(0, atIndex + 1) + corrected : undefined;
}
