/** Step 1 of the funnel: where the customer first meets the offer. */
export function SearchPage() {
  return (
    <div className="page search-page">
      <div className="search-bar" role="search">
        <span className="search-glyph" aria-hidden="true">
          ⌕
        </span>
        <span className="search-query">best fixed deposit rate singapore</span>
      </div>
      <p className="search-meta">About 2,140,000 results</p>

      <a className="search-result search-result-sponsored" href="#/offer">
        <span className="search-sponsored-tag">Sponsored</span>
        <span className="search-result-url">hsbc.com.sg › premier › term-deposit</span>
        <span className="search-result-title">
          3.88% p.a. 12-Month Term Deposit — HSBC Premier
        </span>
        <span className="search-result-snippet">
          New-to-bank exclusive. Rate locked at opening, SDIC insured, apply in about five
          minutes with Singpass. Minimum S$30,000.
        </span>
      </a>

      <div className="search-result" aria-disabled="true">
        <span className="search-result-url">moneysense.example.sg › fixed-deposits</span>
        <span className="search-result-title">Fixed deposit rates compared — July 2026</span>
        <span className="search-result-snippet">
          We compare the latest promotional fixed deposit rates across major banks in
          Singapore, including tenors from 3 to 24 months…
        </span>
      </div>

      <div className="search-result" aria-disabled="true">
        <span className="search-result-url">reddit.example.com › r/singaporefi</span>
        <span className="search-result-title">
          Where are you parking cash right now? — r/singaporefi
        </span>
        <span className="search-result-snippet">
          With T-bill yields easing, promo FD rates are looking attractive again. Anyone
          compared the premier tiers…
        </span>
      </div>

      <p className="page-footnote">
        A concept demonstration — the search page and results are simulated.
      </p>
    </div>
  );
}
