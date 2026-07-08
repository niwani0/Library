import type { ChoiceCard } from '../../engine/types';

interface ChoiceCardsProps {
  options: ChoiceCard[];
  onSelect: (option: ChoiceCard) => void;
}

export function ChoiceCards({ options, onSelect }: ChoiceCardsProps) {
  return (
    <div className="choice-cards">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className="choice-card"
          onClick={() => onSelect(option)}
        >
          <span className="choice-card-head">
            <span className="choice-card-title">{option.title}</span>
            {option.badge && <span className="choice-card-badge">{option.badge}</span>}
          </span>
          <span className="choice-card-description">{option.description}</span>
        </button>
      ))}
    </div>
  );
}
