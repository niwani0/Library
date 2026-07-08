import { PREMIER_DEPOSIT_OFFER, formatSgd } from '../../domain/offers';
import { hasSavedJourney } from '../journey-storage';

/** Steps 3-4 of the funnel: offer details, then into the app. */
export function OfferPage() {
  const canResume = hasSavedJourney(PREMIER_DEPOSIT_OFFER.id);

  return (
    <div className="page offer-page">
      <header className="offer-hero">
        <p className="eyebrow">HSBC Premier · New-to-bank exclusive</p>
        <p className="offer-rate">
          3.88<span className="offer-rate-unit">% p.a.</span>
        </p>
        <h1 className="offer-title">12-month SGD term deposit</h1>
        <p className="offer-sub">
          Lock a fixed rate on {formatSgd(PREMIER_DEPOSIT_OFFER.minimumDeposit)} or more —
          and open your Premier relationship with it.
        </p>
      </header>

      <dl className="offer-facts">
        <div>
          <dt>Minimum</dt>
          <dd>{formatSgd(PREMIER_DEPOSIT_OFFER.minimumDeposit)}</dd>
        </div>
        <div>
          <dt>Protected</dt>
          <dd>SDIC insured</dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd>Locked at opening</dd>
        </div>
        <div>
          <dt>Apply in</dt>
          <dd>~5 minutes</dd>
        </div>
      </dl>

      <section className="offer-how">
        <h2 className="offer-section-title">How it works</h2>
        <ol className="steps-list">
          <li>
            <span className="steps-number" aria-hidden="true">
              1
            </span>
            Apply in the app — Singpass makes it mostly typing-free
          </li>
          <li>
            <span className="steps-number" aria-hidden="true">
              2
            </span>
            Your account opens and the rate is locked for you
          </li>
          <li>
            <span className="steps-number" aria-hidden="true">
              3
            </span>
            Transfer your deposit within 30 days via FAST or PayNow
          </li>
        </ol>
      </section>

      <section>
        <h2 className="offer-section-title">Good questions</h2>
        {PREMIER_DEPOSIT_OFFER.faq.slice(0, 4).map((entry) => (
          <details className="offer-faq" key={entry.id}>
            <summary>{entry.question}</summary>
            <p>{entry.answer}</p>
          </details>
        ))}
      </section>

      <p className="page-footnote">
        Deposits insured by SDIC up to S$100,000 per depositor. Interest at maturity.
        A concept demonstration, not an HSBC product.
      </p>

      <div className="offer-cta">
        {canResume ? (
          <a className="btn btn-primary offer-cta-btn" href="#/apply">
            Continue your application
          </a>
        ) : (
          <a className="btn btn-primary offer-cta-btn" href="#/appstore">
            Get the app to apply
          </a>
        )}
      </div>
    </div>
  );
}
