import { useState } from 'react';

import type { ConsentId } from '../../domain/types';
import { CONSENT_LABELS } from '../labels';

interface StepsConsentProps {
  steps: string[];
  required: ConsentId[];
  onAgree: (granted: ConsentId[]) => void;
}

export function StepsConsent({ steps, required, onAgree }: StepsConsentProps) {
  const [ticked, setTicked] = useState<ConsentId[]>([]);

  const hasAllRequired = required.every((id) => ticked.includes(id));

  function handleToggle(id: ConsentId): void {
    setTicked((previous) =>
      previous.includes(id) ? previous.filter((t) => t !== id) : [...previous, id],
    );
  }

  return (
    <div className="prompt-card">
      <h2 className="card-title">Here is how it works</h2>
      <ol className="steps-list">
        {steps.map((step, index) => (
          <li key={step}>
            <span className="steps-number" aria-hidden="true">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <fieldset>
        <legend>Before we begin</legend>
        {required.map((id) => {
          const { title, description } = CONSENT_LABELS[id];
          return (
            <label className="checkbox-option" htmlFor={`steps-consent-${id}`} key={id}>
              <input
                id={`steps-consent-${id}`}
                type="checkbox"
                checked={ticked.includes(id)}
                onChange={() => handleToggle(id)}
              />
              <span>
                <span className="option-title">{title}</span>
                <span className="option-description">{description}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!hasAllRequired}
        onClick={() => onAgree(ticked)}
      >
        Agree and begin
      </button>
    </div>
  );
}
