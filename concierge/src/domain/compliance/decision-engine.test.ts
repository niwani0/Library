import { describe, expect, it } from 'vitest';

import type { CustomerProfile, FinancialProfile, Identity } from '../types';
import { assessCompliance } from './decision-engine';

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

function financialFixture(overrides: Partial<FinancialProfile> = {}): FinancialProfile {
  return {
    employmentStatus: 'employed',
    occupation: 'Architect',
    annualIncomeBand: '25k-75k',
    sourceOfFunds: 'salary',
    expectedMonthlyInflow: 4000,
    ...overrides,
  };
}

function profileFixture(overrides: Partial<CustomerProfile> = {}): CustomerProfile {
  return {
    identity: identityFixture(),
    financial: financialFixture(),
    consents: [],
    ...overrides,
  };
}

describe('assessCompliance', () => {
  it('approves a standard low-risk customer', () => {
    const decision = assessCompliance(profileFixture());

    expect(decision.outcome).toBe('approve');
  });

  it('declines on a sanctions list match', () => {
    const profile = profileFixture({
      identity: identityFixture({ fullName: 'Victor Sanction' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.outcome).toBe('decline');
  });

  it('declines a sanctions match despite extra internal whitespace', () => {
    const profile = profileFixture({
      identity: identityFixture({ fullName: 'Victor  Sanction' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.outcome).toBe('decline');
  });

  it('declines a sanctions match hidden behind a title', () => {
    const profile = profileFixture({
      identity: identityFixture({ fullName: 'Mr. Victor Sanction' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.outcome).toBe('decline');
  });

  it('declines a sanctioned-country national entered as a demonym', () => {
    const profile = profileFixture({
      identity: identityFixture({ nationality: 'Iranian' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.outcome).toBe('decline');
  });

  it('treats an elevated-risk demonym as elevated jurisdiction risk', () => {
    const profile = profileFixture({
      identity: identityFixture({ nationality: 'Panamanian' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.factors.map((factor) => factor.code)).toContain(
      'elevated-jurisdiction',
    );
  });

  it('declines residents of prohibited jurisdictions', () => {
    const profile = profileFixture({
      identity: identityFixture({ countryOfResidence: 'North Korea' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.outcome).toBe('decline');
  });

  it('refers a politically exposed person for manual review', () => {
    const profile = profileFixture({
      identity: identityFixture({ fullName: 'Petra Epstein-Pep' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.outcome).toBe('refer');
  });

  it('requires enhanced due diligence for a politically exposed person', () => {
    const profile = profileFixture({
      identity: identityFixture({ fullName: 'Petra Epstein-Pep' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.requiresEnhancedDueDiligence).toBe(true);
  });

  it('refers when combined risk factors cross the referral threshold', () => {
    const profile = profileFixture({
      identity: identityFixture({ countryOfResidence: 'Panama' }),
      financial: financialFixture({
        sourceOfFunds: 'gift',
        expectedMonthlyInflow: 50000,
      }),
    });

    const decision = assessCompliance(profile);

    expect(decision.outcome).toBe('refer');
  });

  it('flags inflows far above the declared income band', () => {
    const profile = profileFixture({
      financial: financialFixture({ expectedMonthlyInflow: 30000 }),
    });

    const decision = assessCompliance(profile);

    expect(decision.factors.map((factor) => factor.code)).toContain(
      'inflow-income-mismatch',
    );
  });

  it('records the reason behind every sanctions decline', () => {
    const profile = profileFixture({
      identity: identityFixture({ fullName: 'Victor Sanction' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.factors[0]?.detail).toContain('sanctions');
  });

  it('caps the risk score at 100', () => {
    const profile = profileFixture({
      identity: identityFixture({
        fullName: 'Victor Sanction',
        countryOfResidence: 'Iran',
      }),
      financial: financialFixture({ sourceOfFunds: 'other' }),
    });

    const decision = assessCompliance(profile);

    expect(decision.riskScore).toBe(100);
  });

  it('throws when assessing an incomplete profile', () => {
    const incomplete: CustomerProfile = { consents: [] };

    expect(() => assessCompliance(incomplete)).toThrow(
      'Compliance assessment requires identity and financial profile',
    );
  });
});
