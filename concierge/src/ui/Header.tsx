interface HeaderProps {
  onRequestHuman: () => void;
}

/** The HSBC hexagon mark, drawn inline so the app stays self-contained. */
function HexagonMark() {
  return (
    <svg className="hex-mark" viewBox="0 0 40 20" aria-hidden="true" focusable="false">
      <rect x="10" y="0" width="20" height="20" fill="#DB0011" />
      <path d="M10 0 L20 10 L10 20 Z" fill="#fff" />
      <path d="M30 0 L20 10 L30 20 Z" fill="#fff" />
      <path d="M10 0 L0 10 L10 20 Z" fill="#DB0011" />
      <path d="M30 0 L40 10 L30 20 Z" fill="#DB0011" />
    </svg>
  );
}

export function Header({ onRequestHuman }: HeaderProps) {
  return (
    <header className="masthead">
      <div className="masthead-inner">
        <div className="masthead-brand">
          <HexagonMark />
          <div>
            <h1 className="wordmark">HSBC</h1>
            <p className="masthead-subtitle">Evie · Premier Onboarding</p>
          </div>
        </div>
        <button type="button" className="btn-quiet" onClick={onRequestHuman}>
          Talk to a person
        </button>
      </div>
    </header>
  );
}
