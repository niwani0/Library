/** Step 5 of the funnel: the App Store moment, simulated. */
export function AppStorePage() {
  return (
    <div className="page store-page">
      <p className="store-back">
        <a href="#/offer">‹ Back</a>
      </p>
      <div className="store-head">
        <span className="store-icon" aria-hidden="true">
          <svg viewBox="0 0 40 20" focusable="false">
            <rect x="10" y="0" width="20" height="20" fill="#ffffff" />
            <path d="M10 0 L20 10 L10 20 Z" fill="#DB0011" />
            <path d="M30 0 L20 10 L30 20 Z" fill="#DB0011" />
          </svg>
        </span>
        <div>
          <h1 className="store-name">HSBC Singapore</h1>
          <p className="store-developer">HSBC Bank (Singapore) Limited</p>
        </div>
        <a className="btn btn-primary store-get" href="#/apply">
          GET
        </a>
      </div>

      <dl className="store-stats">
        <div>
          <dt>Rating</dt>
          <dd>4.8 ★</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>4+</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>Finance</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>182 MB</dd>
        </div>
      </dl>

      <div className="store-shots" aria-hidden="true">
        <div className="store-shot">
          <span>Meet Clara, your concierge</span>
        </div>
        <div className="store-shot">
          <span>Open an account in minutes</span>
        </div>
        <div className="store-shot">
          <span>Bank in 19 currencies</span>
        </div>
      </div>

      <p className="store-blurb">
        Applying for the Premier term deposit offer? Tap GET and Clara, the in-app
        concierge, will take it from there — most of the form fills itself.
      </p>

      <p className="page-footnote">A simulated App Store listing for this concept.</p>
    </div>
  );
}
