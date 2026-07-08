import type { Chip } from '../../engine/types';

interface ChipsPromptProps {
  options: Chip[];
  onSelect: (chip: Chip) => void;
}

export function ChipsPrompt({ options, onSelect }: ChipsPromptProps) {
  return (
    <ul className="chip-row" aria-label="Suggested replies">
      {options.map((option) => (
        <li key={option.value}>
          <button type="button" className="chip" onClick={() => onSelect(option)}>
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
