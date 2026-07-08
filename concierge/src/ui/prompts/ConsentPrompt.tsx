import { useState } from 'react';

import type { ConsentId } from '../../domain/types';
import { CONSENT_LABELS } from '../labels';

interface ConsentPromptProps {
  required: ConsentId[];
  optional: ConsentId[];
  onGrant: (granted: ConsentId[]) => void;
}

export function ConsentPrompt({ required, optional, onGrant }: ConsentPromptProps) {
  const [ticked, setTicked] = useState<ConsentId[]>([]);

  const hasAllRequired = required.every((id) => ticked.includes(id));

  function handleToggle(id: ConsentId): void {
    setTicked((previous) =>
      previous.includes(id) ? previous.filter((t) => t !== id) : [...previous, id],
    );
  }

  function renderOption(id: ConsentId, isOptional: boolean) {
    const { title, description } = CONSENT_LABELS[id];
    return (
      <label className="checkbox-option" htmlFor={`consent-${id}`} key={id}>
        <input
          id={`consent-${id}`}
          type="checkbox"
          checked={ticked.includes(id)}
          onChange={() => handleToggle(id)}
        />
        <span>
          <span className="option-title">
            {title}
            {isOptional && <span className="option-optional"> (optional)</span>}
          </span>
          <span className="option-description">{description}</span>
        </span>
      </label>
    );
  }

  return (
    <div className="prompt-card">
      <h2 className="card-title">The agreements</h2>
      <fieldset>
        <legend>Required to open your account</legend>
        {required.map((id) => renderOption(id, false))}
      </fieldset>
      <fieldset>
        <legend>Entirely your choice</legend>
        {optional.map((id) => renderOption(id, true))}
      </fieldset>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!hasAllRequired}
        onClick={() => onGrant(ticked)}
      >
        Agree and open my account
      </button>
    </div>
  );
}
