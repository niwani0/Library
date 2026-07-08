import type { Recommendation } from '../../domain/types';
import { formatCurrency } from '../../engine/orchestrator';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: () => void;
}

export function RecommendationCard({ recommendation, onAccept }: RecommendationCardProps) {
  const { product, reasons, stretchProduct } = recommendation;
  return (
    <article className="prompt-card reco-card">
      <p className="eyebrow">Our recommendation</p>
      <div>
        <h2 className="reco-name">{product.name}</h2>
        <p className="reco-tagline">{product.tagline}</p>
      </div>
      <p className="reco-fee">
        {product.monthlyFee === 0
          ? 'No monthly fee'
          : `${formatCurrency(product.monthlyFee)} a month`}
      </p>
      <div>
        <h3 className="reco-section-title">Key features</h3>
        <ul className="reco-list">
          {product.keyFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="reco-section-title">Why this fits you</h3>
        <ul className="reco-list">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
      {stretchProduct && (
        <p className="reco-stretch">
          Worth knowing: {stretchProduct.name} — {stretchProduct.tagline.toLowerCase()} —
          becomes available at a higher income band, should things change.
        </p>
      )}
      <button type="button" className="btn btn-gold" onClick={onAccept}>
        Open this account
      </button>
    </article>
  );
}
