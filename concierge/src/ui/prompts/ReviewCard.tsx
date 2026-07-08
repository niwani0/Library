import type { CustomerProfile } from '../../domain/types';
import type { EditableSection } from '../../engine/types';
import {
  DOCUMENT_TYPE_LABELS,
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
  onEdit: (section: EditableSection) => void;
}

interface ReviewSection {
  title: string;
  section?: EditableSection;
  rows: Array<[string, string]>;
}

export function ReviewCard({ profile, productName, onConfirm, onEdit }: ReviewCardProps) {
  const { identity, document, financial, taxResidency } = profile;
  const incomeBand = financial?.annualIncomeBand ?? profile.incomeBand;

  const sections: ReviewSection[] = [
    {
      title: 'Your account',
      rows: [
        ['Your goal', profile.goal ? GOAL_LABELS[profile.goal] : '—'],
        ['Account', productName ?? '—'],
      ],
    },
    {
      title: 'About you',
      section: 'identity',
      rows: [
        ['Name', identity?.fullName ?? '—'],
        ['Date of birth', identity ? maskDateOfBirth(identity.dateOfBirth) : '—'],
        ['Address', identity?.residentialAddress ?? '—'],
      ],
    },
    {
      title: 'Your document',
      section: 'document',
      rows: [
        ['Document', document ? DOCUMENT_TYPE_LABELS[document.type] : '—'],
        ['Issued by', document?.issuingCountry ?? '—'],
      ],
    },
    {
      title: 'Your finances',
      section: 'financial',
      rows: [
        [
          'Employment',
          financial
            ? `${EMPLOYMENT_STATUS_LABELS[financial.employmentStatus]} — ${financial.occupation}`
            : '—',
        ],
        ['Annual income', incomeBand ? INCOME_BAND_LABELS[incomeBand] : '—'],
        ['Source of funds', financial ? SOURCE_OF_FUNDS_LABELS[financial.sourceOfFunds] : '—'],
      ],
    },
    {
      title: 'Tax residency',
      section: 'tax',
      rows: [['Resident for tax in', taxResidency ? taxResidency.countries.join(', ') : '—']],
    },
  ];

  return (
    <article className="prompt-card">
      <h2 className="card-title">A quick look before we make it official</h2>
      {sections.map(({ title, section, rows }) => (
        <section key={title} className="review-section">
          <div className="review-section-head">
            <h3>{title}</h3>
            {section && (
              <button
                type="button"
                className="btn btn-outline btn-compact"
                onClick={() => onEdit(section)}
              >
                Change
              </button>
            )}
          </div>
          <dl className="review-list">
            {rows.map(([label, value]) => (
              <div className="review-row" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <button type="button" className="btn btn-primary" onClick={onConfirm}>
        Everything is correct
      </button>
    </article>
  );
}
