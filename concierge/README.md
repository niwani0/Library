# Project Concierge

An AI-powered banking onboarding experience. Not a chatbot, not a digital
form — an intelligent private banker that happens to open accounts.

## Running it

```bash
cd concierge
pnpm install
pnpm dev        # local demo at http://localhost:5173
pnpm test       # full unit suite
pnpm build      # typecheck + production build
```

## The priority ladder

Every engineering decision optimises for customer trust, effort, confidence,
regulatory compliance, and business outcomes — and when they conflict, this
order wins, top to bottom:

1. **Compliance** — the decision engine (`src/domain/compliance/`) can veto
   anything downstream and nothing downstream can soften it.
2. **Trust** — every sensitive question carries a "why we ask" explanation;
   a human is one tap away at every step; declines are neutral because
   explaining an AML decline is tipping off.
3. **Customer goal** — the conversation opens with "what brings you here",
   and no product is mentioned until the goal is understood.
4. **Effort** — chips over typing, forms pre-filled from earlier answers
   (nothing is ever asked twice), funding is skippable.
5. **Commercial** — last, by design. The recommender picks the cheapest
   product that fits the goal; a better-tier product is mentioned only as a
   quiet fact when the customer is one income band away from qualifying.

## Architecture: two lanes

The design follows one core decision (see `docs/research-report.md`): a warm
conversational layer wrapped around a deterministic compliance state machine.
The language layer phrases regulatory steps — it never decides whether they
happen.

```
src/domain/     what a bank must do
  product-catalog.ts        products and eligibility
  recommendation/           needs-based recommendation (goal first, fee last)
  kyc/                      identity and document validation
  compliance/               watchlist screening + risk-scored decision engine
                            (approve / refer / decline)
  audit/                    append-only trail of every material step
src/engine/     how the concierge behaves
  orchestrator.ts           the journey state machine — the only place an
                            application can be approved, referred, or declined
  interpreter.ts            deterministic free-text understanding (goal
                            detection, "why?" questions, human-handoff asks)
  script.ts                 every word the concierge can say, in one place
  tone-guard.ts             mechanical voice enforcement — tests lint every
                            script line (≤3 sentences, no exclamation marks,
                            no salesy or robotic phrases)
src/ui/         the experience
```

The interpreter is intentionally swappable: the orchestrator depends only on
the `Interpretation` shape, so a hosted-model interpreter (e.g. Claude) can
replace the pattern-based one behind the same signature without touching the
state machine — which is exactly the point: the model gets a voice, never a
veto.

## Compliance behaviours worth knowing

- **Sanctions match or prohibited jurisdiction → decline**, with neutral
  copy and no reasons (tipping off is a criminal offence). Risk factors go
  to the audit trail, never the customer.
- **PEP match or elevated risk → refer** to a human specialist, framed as a
  routine review with a two-working-day expectation. Enhanced due diligence
  is a hard-coded human handoff, never an AI judgment call.
- **Attestations are explicit taps** — consents and tax declarations are
  structured actions with timestamps, never inferred from prose.
- The demo watchlist lets reviewers exercise these paths on demand: apply as
  `Victor Sanction` (decline) or `Petra Epstein-Pep` (refer).

## Changing your mind is a first-class path

- Naming a different goal at the recommendation re-runs it — "say so if a
  different account suits you better" is a real exit, not a pleasantry.
- Every section of the review play-back has a Change button that reopens
  the form pre-filled and returns straight to the review afterwards.
- If an income correction leaves the customer ineligible for the accepted
  product, the concierge switches them to one that fits and says so.
- Anything typed while the concierge is mid-sentence is queued and answered
  next — never silently dropped.

## Testing

Unit tests pin behaviour, not implementation: full-journey tests through the
state machine, decision-engine tests for every outcome (including screening
evasion attempts — demonyms, whitespace, titles), and a tone-guard test that
lints the complete concierge voice. Date logic is calendar-based and the
suite passes under UTC, UTC−5, and UTC+14 alike.

A Playwright smoke suite (`e2e/smoke.mjs`) drives the built app through the
happy path, a review edit, the neutral decline path, and a 380px viewport:

```bash
pnpm build && pnpm preview --port 4173 &
node e2e/smoke.mjs   # requires playwright + a chromium install
```

`Meridian` is a fictional bank created for this demonstration.
