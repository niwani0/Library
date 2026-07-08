import type { CustomerProfile } from '../../domain/types';
import { DOCUMENT_TYPE_LABELS, maskDateOfBirth } from '../labels';

interface IdentityConfirmCardProps {
  profile: CustomerProfile;
  onConfirm: () => void;
  onEdit: () => void;
}

export function IdentityConfirmCard({ profile, onConfirm, onEdit }: IdentityConfirmCardProps) {
  const { identity, document } = profile;

  const rows: Array<[string, string]> = [
    ['Name', identity?.fullName ?? '—'],
    ['Date of birth', identity ? maskDateOfBirth(identity.dateOfBirth) : '—'],
    ['Nationality', identity?.nationality ?? '—'],
    ['Address', identity?.residentialAddress ?? '—'],
    ['Document', document ? DOCUMENT_TYPE_LABELS[document.type] : '—'],
  ];

  return (
    <article className="prompt-card">
      <p className="eyebrow">Retrieved via Singpass</p>
      <h2 className="card-title">Is everything correct?</h2>
      <dl className="review-list">
        {rows.map(([label, value]) => (
          <div className="review-row" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="btn btn-primary" onClick={onConfirm}>
        All correct
      </button>
      <button type="button" className="btn btn-outline" onClick={onEdit}>
        Something needs a change
      </button>
    </article>
  );
}
