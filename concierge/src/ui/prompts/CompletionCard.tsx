interface CompletionCardProps {
  accountNumber: string;
  sortCode: string;
}

export function CompletionCard({ accountNumber, sortCode }: CompletionCardProps) {
  return (
    <article className="prompt-card completion-card">
      <p className="eyebrow">Account open</p>
      <h2 className="card-title">Welcome to Meridian.</h2>
      <dl className="account-facts">
        <div>
          <dt>Account number</dt>
          <dd>{accountNumber}</dd>
        </div>
        <div>
          <dt>Sort code</dt>
          <dd>{sortCode}</dd>
        </div>
      </dl>
      <div>
        <h3 className="reco-section-title">What happens next</h3>
        <ul className="reco-list">
          <li>Your card arrives within five working days.</li>
          <li>Download the Meridian app to start banking today.</li>
          <li>Your welcome pack and key documents arrive by email.</li>
        </ul>
      </div>
    </article>
  );
}
