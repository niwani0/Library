import type { Stage } from '../engine/types';

const STEPS = ['You', 'Your details', 'Verification', 'Review', 'Ready'] as const;

const STAGE_TO_STEP: Record<Stage, number> = {
  discovery: 0,
  'discovery-context': 0,
  recommendation: 0,
  identity: 1,
  document: 2,
  financial: 2,
  tax: 2,
  review: 3,
  consent: 3,
  funding: 4,
  complete: 4,
  referred: 4,
  declined: 4,
};

interface JourneyProgressProps {
  stage: Stage;
}

export function JourneyProgress({ stage }: JourneyProgressProps) {
  const currentStep = STAGE_TO_STEP[stage];
  return (
    <nav className="journey" aria-label="Onboarding progress">
      <ol>
        {STEPS.map((label, index) => {
          const stepClass =
            index < currentStep
              ? 'journey-step is-done'
              : index === currentStep
                ? 'journey-step is-current'
                : 'journey-step';
          return (
            <li
              key={label}
              className={stepClass}
              aria-current={index === currentStep ? 'step' : undefined}
            >
              <span className="journey-dot" aria-hidden="true" />
              <span className="journey-label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
