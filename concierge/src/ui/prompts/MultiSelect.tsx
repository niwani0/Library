import { useState } from 'react';

import type { Chip } from '../../engine/types';

interface MultiSelectProps {
  options: Chip[];
  confirmLabel: string;
  onConfirm: (values: string[]) => void;
}

export function MultiSelect({ options, confirmLabel, onConfirm }: MultiSelectProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function handleToggle(value: string): void {
    setSelected((previous) =>
      previous.includes(value)
        ? previous.filter((v) => v !== value)
        : [...previous.filter((v) => v !== 'none' && value !== 'none'), value],
    );
  }

  return (
    <div className="prompt-card">
      <ul className="chip-row" aria-label="Select any that apply">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <li key={option.value}>
              <button
                type="button"
                className={isSelected ? 'chip is-selected' : 'chip'}
                aria-pressed={isSelected}
                onClick={() => handleToggle(option.value)}
              >
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="btn btn-primary"
        disabled={selected.length === 0}
        onClick={() => onConfirm(selected.filter((value) => value !== 'none'))}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
