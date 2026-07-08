import { useEffect, useRef, useState } from 'react';

import type { ConsentId, Identity, IdentityDocument } from '../domain/types';
import type { FinancialProfile, TaxResidency } from '../domain/types';
import { createConcierge, formatCurrency, type Concierge } from '../engine/orchestrator';
import type { ConciergeTurn, CustomerAction, EditableSection } from '../engine/types';
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
  const engineRef = useRef<Concierge>(createConcierge());

  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [activeTurn, setActiveTurn] = useState<ConciergeTurn | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const nextIdRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const endOfConversationRef = useRef<HTMLDivElement | null>(null);
  // Mirror of isTyping plus a queue, so anything the customer says while the
  // concierge is mid-sentence is answered next, never silently dropped.
  const isRevealingRef = useRef(false);
  const pendingRef = useRef<Array<{ action: CustomerAction; echo: string | null }>>([]);

  // Each effect run begins a fresh session and the cleanup aborts it, so
  // StrictMode's dev-only remount restarts cleanly instead of stranding the
  // welcome messages in cleared timeouts.
  useEffect(() => {
    engineRef.current = createConcierge();
    setEntries([]);
    pendingRef.current = [];
    isRevealingRef.current = false;
    revealTurn(engineRef.current.start());
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setActiveTurn(turn);
    setIsTyping(true);
    isRevealingRef.current = true;
    turn.messages.forEach((text, index) => {
      const isLast = index === turn.messages.length - 1;
      const timeoutId = window.setTimeout(() => {
        appendEntry('concierge', text);
        if (isLast) {
          isRevealingRef.current = false;
          const queued = pendingRef.current.shift();
          if (queued) {
            deliver(queued.action, queued.echo);
          } else {
            setIsTyping(false);
          }
        }
      }, REVEAL_INTERVAL_MS * (index + 1));
      timeoutsRef.current.push(timeoutId);
    });
  }

  function deliver(action: CustomerAction, echo: string | null): void {
    if (echo) {
      appendEntry('customer', echo);
    }
    revealTurn(engineRef.current.handle(action));
  }

  function sendAction(action: CustomerAction, echo: string | null): void {
    if (isRevealingRef.current) {
      pendingRef.current.push({ action, echo });
      return;
    }
    deliver(action, echo);
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

  function handleEditSection(section: EditableSection): void {
    const sectionLabels: Record<EditableSection, string> = {
      identity: 'my personal details',
      document: 'my document',
      financial: 'my finances',
      tax: 'my tax residency',
    };
    sendAction({ kind: 'edit-section', section }, `I need to change ${sectionLabels[section]}`);
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
        return (
          <IdentityForm
            whyWeAsk={prompt.whyWeAsk}
            initialIdentity={engineRef.current.profile.identity}
            onSubmitIdentity={handleIdentity}
          />
        );
      case 'document-form':
        return (
          <DocumentForm
            whyWeAsk={prompt.whyWeAsk}
            initialDocument={engineRef.current.profile.document}
            onSubmitDocument={handleDocument}
          />
        );
      case 'financial-form':
        return (
          <FinancialForm
            whyWeAsk={prompt.whyWeAsk}
            prefilledIncomeBand={engineRef.current.profile.incomeBand}
            initialFinancial={engineRef.current.profile.financial}
            onSubmitFinancial={handleFinancial}
          />
        );
      case 'tax-form':
        return (
          <TaxForm
            whyWeAsk={prompt.whyWeAsk}
            initialTax={engineRef.current.profile.taxResidency}
            onSubmitTax={handleTax}
          />
        );
      case 'review':
        return (
          <ReviewCard
            profile={engineRef.current.profile}
            productName={engineRef.current.recommendation?.product.name}
            onConfirm={() => sendAction({ kind: 'confirm-review' }, 'Everything is correct')}
            onEdit={handleEditSection}
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
        {activeTurn && activeTurn.stage !== 'declined' && activeTurn.stage !== 'referred' && (
          <JourneyProgress stage={activeTurn.stage} />
        )}
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
        Eligible deposits protected up to £85,000 by the FSCS · This is a concept
        demonstration and not an HSBC product.
      </footer>
    </div>
  );
}
