import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { PREMIER_DEPOSIT_OFFER } from './domain/offers';
import { App } from './ui/App';
import { AppStorePage } from './ui/pages/AppStorePage';
import { OfferPage } from './ui/pages/OfferPage';
import { SearchPage } from './ui/pages/SearchPage';
import './ui/styles.css';

function Root() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // The apply routes remount the app per route so each journey starts clean.
  let screen;
  if (route.startsWith('#/apply')) {
    screen = <App key="apply" offer={PREMIER_DEPOSIT_OFFER} />;
  } else if (route.startsWith('#/classic')) {
    screen = <App key="classic" />;
  } else if (route.startsWith('#/appstore')) {
    screen = <AppStorePage />;
  } else if (route.startsWith('#/offer')) {
    screen = <OfferPage />;
  } else {
    screen = <SearchPage />;
  }

  return (
    <div className="stage">
      <div className="phone">
        <div className="phone-screen">{screen}</div>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Missing #root element');
}

createRoot(container).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
