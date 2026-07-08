interface TransferCardProps {
  accountNumber: string;
  rate: string;
  amountMinimum: string;
  deadline: string;
  isVerificationPending: boolean;
  onContinue: () => void;
}

export function TransferCard({
  accountNumber,
  rate,
  amountMinimum,
  deadline,
  isVerificationPending,
  onContinue,
}: TransferCardProps) {
  return (
    <article className="prompt-card completion-card">
      <p className="eyebrow">Account open · {rate} locked</p>
      <h2 className="card-title">Fund it when you are ready</h2>
      <dl className="account-facts">
        <div>
          <dt>Account number</dt>
          <dd>{accountNumber}</dd>
        </div>
        <div>
          <dt>Transfer via</dt>
          <dd>FAST · PayNow</dd>
        </div>
        <div>
          <dt>Minimum deposit</dt>
          <dd>{amountMinimum}</dd>
        </div>
        <div>
          <dt>Fund by</dt>
          <dd>{deadline}</dd>
        </div>
      </dl>
      {isVerificationPending && (
        <p className="card-hint">
          Document verification is finishing in the background — we will message you if
          anything more is needed.
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinue}>
        Finish setting up
      </button>
    </article>
  );
}
