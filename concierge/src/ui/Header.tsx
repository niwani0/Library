interface HeaderProps {
  onRequestHuman: () => void;
}

export function Header({ onRequestHuman }: HeaderProps) {
  return (
    <header className="masthead">
      <div className="masthead-inner">
        <div>
          <h1 className="wordmark">MERIDIAN</h1>
          <p className="masthead-subtitle">Private Client Onboarding</p>
        </div>
        <button type="button" className="btn-quiet" onClick={onRequestHuman}>
          Talk to a person
        </button>
      </div>
    </header>
  );
}
