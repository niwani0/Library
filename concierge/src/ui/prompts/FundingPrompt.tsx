import { useState, type FormEvent } from 'react';

import { formatCurrency } from '../../engine/orchestrator';

interface FundingPromptProps {
  suggestedAmounts: number[];
  onDeposit: (amount: number) => void;
  onSkip: () => void;
}

export function FundingPrompt({ suggestedAmounts, onDeposit, onSkip }: FundingPromptProps) {
  const [customAmount, setCustomAmount] = useState('');

  const parsedAmount = Number(customAmount);
  const hasValidCustomAmount = customAmount !== '' && parsedAmount > 0;

  function handleCustomSubmit(event: FormEvent): void {
    event.preventDefault();
    if (hasValidCustomAmount) {
      onDeposit(parsedAmount);
    }
  }

  return (
    <div className="prompt-card">
      <h2 className="card-title">A first deposit?</h2>
      <ul className="chip-row amount-row" aria-label="Suggested deposit amounts">
        {suggestedAmounts.map((amount) => (
          <li key={amount}>
            <button type="button" className="chip" onClick={() => onDeposit(amount)}>
              {formatCurrency(amount)}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleCustomSubmit} className="field">
        <label htmlFor="funding-custom">Or choose your own amount (£)</label>
        <div className="funding-actions">
          <input
            id="funding-custom"
            type="number"
            min={1}
            inputMode="numeric"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={!hasValidCustomAmount}>
            Add this deposit
          </button>
        </div>
      </form>
      <button type="button" className="btn btn-outline" onClick={onSkip}>
        I&rsquo;ll do this later
      </button>
    </div>
  );
}
