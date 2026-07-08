import { useEffect, useRef, useState } from 'react';

import type { ConsentId, Identity, IdentityDocument } from '../domain/types';
import type { FinancialProfile, TaxResidency } from '../domain/types';
import { createConcierge, formatCurrency, type Concierge } from '../engine/orchestrator';
import type { ConciergeTurn, CustomerAction } from '../engine/types';
import { FreeTextInput } from './FreeTextInput';
import { Header } from './Header';
import { JourneyProgress } from './JourneyProgress';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChipsPrompt } from './prompts/ChipsPrompt';
import { CompletionCard } from './prompts/CompletionCard';
import { ConsentPrompt } from './prompts/ConsentPrompt';
import { DocumentForm } from './prompts/DocumentForm';
import { FinancialForm } from './prompts/FinancialForm';
import { FundingPrompt } from './prompts/FundingPrompt';
import { IdentityForm } from './prompts/IdentityForm';
import { RecommendationCard } from './prompts/RecommendationCard';
import { ReviewCard } from './prompts/ReviewCard';
import { TaxForm } from './prompts/TaxForm';

interface TranscriptEntry {
  id: number;
  role: 'concierge' | 'customer';
  text: string;
}

/** Delay between revealed concierge messages — long enough to read, short enough to respect. */
const REVEAL_INTERVAL_MS = 650;

export function App() {
  const engineRef = useRef<Concierge | null>(null);
  if (!engineRef.current) {
    engineRef.current = createConcierge();
  }
  const engine = engineRef.current;

  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [activeTurn, setActiveTurn] = useState<ConciergeTurn | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [productName, setProductName] = useState<string | undefined>(undefined);

  const hasStartedRef = useRef(false);
  const nextIdRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const endOfConversationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    revealTurn(engine.start());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    endOfConversationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [entries.length, isTyping, activeTurn]);

  function appendEntry(role: TranscriptEntry['role'], text: string): void {
    nextIdRef.current += 1;
    const id = nextIdRef.current;
    setEntries((previous) => [...previous, { id, role, text }]);
  }

  function revealTurn(turn: ConciergeTurn): void {
    if (turn.prompt.kind === 'recommendation') {
      setProductName(turn.prompt.recommendation.product.name);
    }
    setActiveTurn(turn);
    setIsTyping(true);
    turn.messages.forEach((text, index) => {
      const isLast = index === turn.messages.length - 1;
      const timeoutId = window.setTimeout(() => {
        appendEntry('concierge', text);
        if (isLast) {
          setIsTyping(false);
        }
      }, REVEAL_INTERVAL_MS * (index + 1));
      timeoutsRef.current.push(timeoutId);
    });
  }

  function sendAction(action: CustomerAction, echo: string | null): void {
    if (isTyping) {
      return;
    }
    if (echo) {
      appendEntry('customer', echo);
    }
    revealTurn(engine.handle(action));
  }

  function handleFreeText(text: string): void {
    sendAction({ kind: 'text', text }, text);
  }

  function handleRequestHuman(): void {
    sendAction({ kind: 'request-human' }, 'I would like to talk to a person');
  }

  function handleIdentity(identity: Identity): void {
    sendAction({ kind: 'identity', identity }, 'Personal details provided');
  }

  function handleDocument(document: IdentityDocument): void {
    sendAction({ kind: 'document', document }, 'Document details provided');
  }

  function handleFinancial(financial: FinancialProfile): void {
    sendAction({ kind: 'financial', financial }, 'Financial details provided');
  }

  function handleTax(taxResidency: TaxResidency): void {
    sendAction({ kind: 'tax', taxResidency }, 'Tax residency provided');
  }

  function handleConsent(granted: ConsentId[]): void {
    sendAction({ kind: 'consent', granted }, 'Agreements accepted');
  }

  function handleDeposit(amount: number): void {
    sendAction({ kind: 'deposit', amount }, `First deposit: ${formatCurrency(amount)}`);
  }

  function renderPrompt(turn: ConciergeTurn) {
    const prompt = turn.prompt;
    switch (prompt.kind) {
      case 'chips':
        return (
          <>
            <ChipsPrompt
              options={prompt.options}
              onSelect={(chip) => sendAction({ kind: 'choice', value: chip.value }, chip.label)}
            />
            {prompt.allowFreeText && (
              <FreeTextInput
                placeholder="Tell me in your own words…"
                variant="primary"
                onSubmitText={handleFreeText}
              />
            )}
          </>
        );
      case 'recommendation':
        return (
          <RecommendationCard
            recommendation={prompt.recommendation}
            onAccept={() => sendAction({ kind: 'choice', value: 'accept' }, 'Open this account')}
          />
        );
      case 'identity-form':
        return <IdentityForm whyWeAsk={prompt.whyWeAsk} onSubmitIdentity={handleIdentity} />;
      case 'document-form':
        return <DocumentForm whyWeAsk={prompt.whyWeAsk} onSubmitDocument={handleDocument} />;
      case 'financial-form':
        return (
          <FinancialForm
            whyWeAsk={prompt.whyWeAsk}
            prefilledIncomeBand={engine.profile.incomeBand}
            onSubmitFinancial={handleFinancial}
          />
        );
      case 'tax-form':
        return <TaxForm whyWeAsk={prompt.whyWeAsk} onSubmitTax={handleTax} />;
      case 'review':
        return (
          <ReviewCard
            profile={engine.profile}
            productName={productName}
            onConfirm={() => sendAction({ kind: 'confirm-review' }, 'Everything is correct')}
          />
        );
      case 'consent':
        return (
          <ConsentPrompt
            required={prompt.required}
            optional={prompt.optional}
            onGrant={handleConsent}
          />
        );
      case 'funding':
        return (
          <FundingPrompt
            suggestedAmounts={prompt.suggestedAmounts}
            onDeposit={handleDeposit}
            onSkip={() => sendAction({ kind: 'skip-funding' }, 'I will fund it later')}
          />
        );
      case 'completion':
        return (
          <CompletionCard accountNumber={prompt.accountNumber} sortCode={prompt.sortCode} />
        );
      case 'ended':
        return <p className="dock-ended">This conversation is complete.</p>;
    }
  }

  const shouldOfferSideChannel =
    activeTurn !== null &&
    !['chips', 'completion', 'ended'].includes(activeTurn.prompt.kind);

  return (
    <div className="app">
      <div className="chrome-top">
        <Header onRequestHuman={handleRequestHuman} />
        {activeTurn && <JourneyProgress stage={activeTurn.stage} />}
      </div>
      <main className="conversation">
        <ol className="transcript" aria-live="polite">
          {entries.map((entry) => (
            <MessageBubble key={entry.id} role={entry.role} text={entry.text} />
          ))}
          {isTyping && <TypingIndicator />}
        </ol>
        {activeTurn && (
          <div className={isTyping ? 'prompt-dock is-waiting' : 'prompt-dock'}>
            {renderPrompt(activeTurn)}
            {shouldOfferSideChannel && (
              <FreeTextInput
                placeholder="Ask a question at any time…"
                variant="secondary"
                onSubmitText={handleFreeText}
              />
            )}
          </div>
        )}
        <div ref={endOfConversationRef} />
      </main>
      <footer className="legal-strip">
        Eligible deposits protected up to £85,000 by the FSCS · Meridian is a fictional
        bank created for a product demonstration.
      </footer>
    </div>
  );
}
