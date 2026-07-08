import { useState, type FormEvent } from 'react';

import type { TaxResidency } from '../../domain/types';
import { WhyWeAsk } from '../WhyWeAsk';

interface TaxFormProps {
  whyWeAsk: string;
  initialTax?: TaxResidency;
  onSubmitTax: (taxResidency: TaxResidency) => void;
}

const MAX_COUNTRIES = 3;
const COUNTRY_LABELS = ['Country of tax residency', 'Second country', 'Third country'];

export function TaxForm({ whyWeAsk, initialTax, onSubmitTax }: TaxFormProps) {
  const [countries, setCountries] = useState<string[]>(
    initialTax && initialTax.countries.length > 0 ? initialTax.countries : [''],
  );
  const [usPersonAnswer, setUsPersonAnswer] = useState<'yes' | 'no' | null>(
    initialTax ? (initialTax.usPerson ? 'yes' : 'no') : null,
  );

  const filledCountries = countries.map((c) => c.trim()).filter((c) => c !== '');
  const isComplete = filledCountries.length > 0 && usPersonAnswer !== null;

  function setCountry(index: number, value: string): void {
    setCountries((previous) => previous.map((c, i) => (i === index ? value : c)));
  }

  function handleAddCountry(): void {
    setCountries((previous) =>
      previous.length < MAX_COUNTRIES ? [...previous, ''] : previous,
    );
  }

  function handleRemoveCountry(index: number): void {
    setCountries((previous) => previous.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!isComplete) {
      return;
    }
    onSubmitTax({ countries: filledCountries, usPerson: usPersonAnswer === 'yes' });
  }

  return (
    <form className="prompt-card" onSubmit={handleSubmit}>
      <h2 className="card-title">Tax residency</h2>
      {countries.map((country, index) => (
        <div className="field" key={index}>
          <label htmlFor={`tax-country-${index}`}>{COUNTRY_LABELS[index]}</label>
          <div className="free-text">
            <input
              id={`tax-country-${index}`}
              type="text"
              value={country}
              onChange={(event) => setCountry(index, event.target.value)}
            />
            {index > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-compact"
                onClick={() => handleRemoveCountry(index)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
      {countries.length < MAX_COUNTRIES && (
        <button
          type="button"
          className="btn btn-outline btn-compact"
          onClick={handleAddCountry}
        >
          Add another country
        </button>
      )}
      <fieldset>
        <legend>Are you a US person for tax purposes?</legend>
        <div className="radio-row">
          <label className="radio-option" htmlFor="tax-us-yes">
            <input
              id="tax-us-yes"
              type="radio"
              name="us-person"
              checked={usPersonAnswer === 'yes'}
              onChange={() => setUsPersonAnswer('yes')}
            />
            Yes
          </label>
          <label className="radio-option" htmlFor="tax-us-no">
            <input
              id="tax-us-no"
              type="radio"
              name="us-person"
              checked={usPersonAnswer === 'no'}
              onChange={() => setUsPersonAnswer('no')}
            />
            No
          </label>
        </div>
      </fieldset>
      <WhyWeAsk text={whyWeAsk} />
      <button type="submit" className="btn btn-primary" disabled={!isComplete}>
        Continue
      </button>
    </form>
  );
}
