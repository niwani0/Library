import { useState, type FormEvent } from 'react';

import type {
  EmploymentStatus,
  FinancialProfile,
  IncomeBand,
  SourceOfFunds,
} from '../../domain/types';
import {
  EMPLOYMENT_STATUS_LABELS,
  INCOME_BAND_LABELS,
  SOURCE_OF_FUNDS_LABELS,
} from '../labels';
import { WhyWeAsk } from '../WhyWeAsk';

interface FinancialFormProps {
  whyWeAsk: string;
  prefilledIncomeBand?: IncomeBand;
  onSubmitFinancial: (financial: FinancialProfile) => void;
}

const EMPLOYMENT_STATUSES = Object.keys(EMPLOYMENT_STATUS_LABELS) as EmploymentStatus[];
const INCOME_BANDS = Object.keys(INCOME_BAND_LABELS) as IncomeBand[];
const SOURCES_OF_FUNDS = Object.keys(SOURCE_OF_FUNDS_LABELS) as SourceOfFunds[];

export function FinancialForm({
  whyWeAsk,
  prefilledIncomeBand,
  onSubmitFinancial,
}: FinancialFormProps) {
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('employed');
  const [occupation, setOccupation] = useState('');
  const [incomeBand, setIncomeBand] = useState<IncomeBand>(prefilledIncomeBand ?? '25k-75k');
  const [sourceOfFunds, setSourceOfFunds] = useState<SourceOfFunds>('salary');
  const [monthlyInflow, setMonthlyInflow] = useState('');

  const inflowAmount = Number(monthlyInflow);
  const isComplete =
    occupation.trim() !== '' && monthlyInflow !== '' && inflowAmount > 0;

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmitFinancial({
      employmentStatus,
      occupation: occupation.trim(),
      annualIncomeBand: incomeBand,
      sourceOfFunds,
      expectedMonthlyInflow: inflowAmount,
    });
  }

  return (
    <form className="prompt-card" onSubmit={handleSubmit}>
      <h2 className="card-title">Your finances</h2>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="financial-employment">Employment status</label>
          <select
            id="financial-employment"
            value={employmentStatus}
            onChange={(event) => setEmploymentStatus(event.target.value as EmploymentStatus)}
          >
            {EMPLOYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {EMPLOYMENT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="financial-occupation">Occupation</label>
          <input
            id="financial-occupation"
            type="text"
            autoComplete="organization-title"
            value={occupation}
            onChange={(event) => setOccupation(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="financial-income">Annual income</label>
          <select
            id="financial-income"
            value={incomeBand}
            onChange={(event) => setIncomeBand(event.target.value as IncomeBand)}
          >
            {INCOME_BANDS.map((band) => (
              <option key={band} value={band}>
                {INCOME_BAND_LABELS[band]}
              </option>
            ))}
          </select>
          {prefilledIncomeBand && (
            <p className="field-note">Pre-filled from earlier — change it if needed.</p>
          )}
        </div>
        <div className="field">
          <label htmlFor="financial-source">Source of funds</label>
          <select
            id="financial-source"
            value={sourceOfFunds}
            onChange={(event) => setSourceOfFunds(event.target.value as SourceOfFunds)}
          >
            {SOURCES_OF_FUNDS.map((source) => (
              <option key={source} value={source}>
                {SOURCE_OF_FUNDS_LABELS[source]}
              </option>
            ))}
          </select>
        </div>
        <div className="field field-full">
          <label htmlFor="financial-inflow">Expected monthly pay-in (£)</label>
          <input
            id="financial-inflow"
            type="number"
            min={1}
            inputMode="numeric"
            value={monthlyInflow}
            onChange={(event) => setMonthlyInflow(event.target.value)}
          />
        </div>
      </div>
      <WhyWeAsk text={whyWeAsk} />
      <button type="submit" className="btn btn-primary" disabled={!isComplete}>
        Continue
      </button>
    </form>
  );
}
