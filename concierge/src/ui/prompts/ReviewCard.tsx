import type { CustomerProfile } from '../../domain/types';
import {
  EMPLOYMENT_STATUS_LABELS,
  GOAL_LABELS,
  INCOME_BAND_LABELS,
  SOURCE_OF_FUNDS_LABELS,
  maskDateOfBirth,
} from '../labels';

interface ReviewCardProps {
  profile: CustomerProfile;
  productName?: string;
  onConfirm: () => void;
}

export function ReviewCard({ profile, productName, onConfirm }: ReviewCardProps) {
  const { identity, financial, taxResidency } = profile;
  const incomeBand = financial?.annualIncomeBand ?? profile.incomeBand;

  const rows: Array<[string, string]> = [
    ['Your goal', profile.goal ? GOAL_LABELS[profile.goal] : '—'],
    ['Account', productName ?? '—'],
    ['Name', identity?.fullName ?? '—'],
    ['Date of birth', identity ? maskDateOfBirth(identity.dateOfBirth) : '—'],
    ['Address', identity?.residentialAddress ?? '—'],
    [
      'Employment',
      financial
        ? `${EMPLOYMENT_STATUS_LABELS[financial.employmentStatus]} — ${financial.occupation}`
        : '—',
    ],
    ['Annual income', incomeBand ? INCOME_BAND_LABELS[incomeBand] : '—'],
    ['Source of funds', financial ? SOURCE_OF_FUNDS_LABELS[financial.sourceOfFunds] : '—'],
    ['Tax residency', taxResidency ? taxResidency.countries.join(', ') : '—'],
  ];

  return (
    <article className="prompt-card">
      <h2 className="card-title">A quick look before we make it official</h2>
      <dl className="review-list">
        {rows.map(([label, value]) => (
          <div className="review-row" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="btn btn-primary" onClick={onConfirm}>
        Everything is correct
      </button>
    </article>
  );
}
