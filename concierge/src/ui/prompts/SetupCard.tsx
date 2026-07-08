import { useState } from 'react';

import type { SetupOption } from '../../engine/types';

interface SetupCardProps {
  options: SetupOption[];
  onConfirm: (enabled: string[]) => void;
}

export function SetupCard({ options, onConfirm }: SetupCardProps) {
  const [enabled, setEnabled] = useState<string[]>(['biometrics', 'push']);

  function handleToggle(id: string): void {
    setEnabled((previous) =>
      previous.includes(id) ? previous.filter((e) => e !== id) : [...previous, id],
    );
  }

  return (
    <div className="prompt-card">
      <h2 className="card-title">Make the app yours</h2>
      {options.map((option) => (
        <label className="checkbox-option" htmlFor={`setup-${option.id}`} key={option.id}>
          <input
            id={`setup-${option.id}`}
            type="checkbox"
            checked={enabled.includes(option.id)}
            onChange={() => handleToggle(option.id)}
          />
          <span>
            <span className="option-title">{option.title}</span>
            <span className="option-description">{option.description}</span>
          </span>
        </label>
      ))}
      <button type="button" className="btn btn-primary" onClick={() => onConfirm(enabled)}>
        Done
      </button>
    </div>
  );
}
