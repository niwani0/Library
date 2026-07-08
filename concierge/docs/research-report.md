# Project Concierge — Research Report
AI-powered Premier banking onboarding. Researched 2026-07-07. Jurisdiction focus: UK (MLR 2017 / FCA), HK (AMLO Cap 615 / HKMA), with FATF/OECD global baselines.

---

## 1. Regulatory baseline for account opening

### 1.1 KYC / CIP — concrete data fields to collect (individual retail customer)

**Identity (mandatory core — UK MLR 2017 Reg 28, HK AMLO Sch 2, FATF Rec 10):**

| Field | Notes |
|---|---|
| Full legal name | As on ID document; capture former names/aliases |
| Date of birth | Age gate (18+ for standard accounts) |
| Residential address | Not PO Box; proof required or verified electronically |
| Nationality / citizenship(s) | All citizenships (feeds FATCA + sanctions) |
| Country of birth | FATCA US-indicia check |
| ID document: type, number, issuing country, expiry | Passport / national ID / driving licence |
| Liveness/selfie biometric match | Standard for remote onboarding (UK JMLSG; HKMA accepts iAM Smart in HK) |

**Contact & profile:** mobile (verified via OTP), email (verified), residency status (e.g. UK resident? visa type), employment status, occupation + employer name, industry/sector (high-risk sector flags: gambling, crypto, arms, cash-intensive), annual income band, purpose of account, expected account activity (monthly in/out volume, international transfers Y/N, expected countries).

**Source of funds (SoF) — all customers, proportionate:** primary funding source for the account (salary / savings / business income / investment proceeds / property sale / gift / inheritance) + expected initial deposit size.

**FATCA/CRS self-certification (valid form requires exactly):**
1. Name; 2. Residential address; 3. ALL jurisdictions of tax residency; 4. TIN per jurisdiction (or reason code A/B/C for no TIN — e.g. "jurisdiction does not issue TINs"); 5. Date of birth (CRS); 6. US person? (citizen/green card/substantial presence) — US indicia (US birthplace, US address/phone, standing orders to US) trigger a cure-or-classify workflow; 7. Signature/attestation + date. Must be validated within 90 days of opening or the bank must restrict/close the account.

**Screening (run by system, not asked):** sanctions lists (OFAC, UN, UK OFSI, EU, HKMA), PEP databases, adverse media, fraud databases (CIFAS in UK), device/behavioural fraud signals.

### 1.2 CDD vs EDD — triggers and extra requirements

| Level | Trigger | Extra requirements |
|---|---|---|
| **Simplified DD** | Low-risk product + low-risk profile (basic account, domestic, salaried) | Reduced verification intensity; still identify + verify |
| **Standard CDD** | Default | Fields above + risk-rate the customer |
| **EDD** | Any of: PEP (domestic or foreign), PEP family member / close associate; high-risk third country (FATF black/grey list; UK HRTC list); sanctions partial match; adverse media hit; complex/opaque wealth; non-resident with no clear nexus; high-risk occupation/industry; unusually large expected volumes; non-face-to-face concerns not otherwise mitigated | **Source of wealth** (how total net worth was accumulated) AND **source of funds** (where these specific funds come from) with corroborating evidence (payslips, tax returns, sale contracts, probate); **senior management approval** before establishing the relationship (UK Reg 33(5)); enhanced ongoing monitoring; adverse-media lookback (~10 years good practice); documented rationale |

PEP status question to ask every applicant: "Do you, or does an immediate family member or close associate, currently or in the past 12 months hold a prominent public function (e.g. senior government, judicial, military, state-owned-enterprise executive, senior political party role)?" — with plain-language examples, since customers rarely know the term "PEP."

### 1.3 Decision points (approve / refer / decline)

| Signal | Outcome |
|---|---|
| ID verified + address verified + no screening hits + risk score low/medium + valid tax self-cert | **Auto-approve** (target: minutes) |
| Fuzzy sanctions/PEP name match; ID document quality low; address mismatch; SoF answer inconsistent with profile (e.g. student expecting £50k/month); EDD trigger; US indicia unresolved; risk score high | **Refer to manual review / human RM** — account may open in restricted mode (no funding or capped) pending review, or be held |
| Confirmed sanctions match; failed identity verification after retries; refusal to provide mandatory CDD data (bank MUST not open — MLR Reg 31 "cessation of transactions"); confirmed fraud marker | **Decline** (and consider SAR/STR filing — and never tip off the customer: give a neutral decline message) |

**Key rule for the concierge:** if CDD cannot be completed, the bank must not establish the relationship. The AI must never talk a customer past a mandatory field, and decline messaging must be neutral (tipping-off is a criminal offence in UK/HK).

### 1.4 Suitability / appropriateness for product recommendations

- **UK:** FCA Consumer Duty (PRIN 2A, since July 2023) — act to deliver good outcomes; products must match the target market's needs/objectives; avoid foreseeable harm; communications must support understanding. Personal recommendations of investments trigger full **suitability** (COBS 9A: knowledge & experience, financial situation, objectives, risk tolerance, capacity for loss). Non-advised sales of complex products trigger **appropriateness** (COBS 10A: knowledge & experience test).
- **Practical boundary for the AI concierge:** it may provide *information and guidance* (factual product features, generic education, filtering by stated objective type) but must not make a *personal recommendation* on regulated investments unless the full suitability process runs. Safe pattern: "Based on what you've told me, these accounts match what you described — a specialist can advise you on investments" + hand off. In HK, HKMA/SFC suitability applies to investment product sales; deposit accounts are lighter-touch.
- Recommending which *deposit/current account tier* fits (e.g. Premier vs standard, given stated balances/income) is generally guidance, not regulated advice — this is the concierge's sweet spot.

### 1.5 Audit trail / record keeping

- Retain CDD documents, verification data, and account files **5 years** after relationship ends (UK MLR Reg 40; HK AMLO s.20 — 5 years).
- Concierge implication: **log every question asked, answer given, document captured, screening result, risk score with version, decision + reason code, and any human override** — timestamped, immutable, replayable. Store the conversation transcript itself as part of the CDD record. Model/prompt version must be part of the audit record (also an emerging EU AI Act / model-risk expectation for AI-assisted decisions).
- Consent & disclosure records: privacy notice shown, FATCA/CRS attestation, terms acceptance — each with timestamp and document version.

---

## 2. What great onboarding UX looks like

### 2.1 Benchmarks

| Provider | Time-to-account | Notable patterns |
|---|---|---|
| **Monzo** | < 5 min design target | ID photo + selfie **video** with friendly copy explaining *why* each step exists; card arrives as a moment of delight |
| **Revolut** | ~24 screens/clicks, minutes (vs ~120 clicks at a legacy bank in the same study) | Asks financial **goals up front** and personalizes dashboard + tips from answers |
| **Nubank** | Minutes | Radical simplicity; one question per screen; plain language ("no bankês") |
| **Wise** | Instant start | **Progressive verification**: lets you begin (get account details, small transfers) immediately, collects more KYC as usage/limits grow |
| **HSBC Premier** | Days-to-weeks traditionally; RM-assisted | Eligibility gate (UK: £100k income or £100k savings/investments; HK: HKD 1M TRB); cross-border status portability ("Premier in one market = eligible in another") is a signature feature; named RM is the differentiator |

### 2.2 The drop-off problem (Signicat "Battle to Onboard")

- Abandonment of financial onboarding rose **40% (2016) → 63% (2020) → 68% (2022)**. ~€5.7bn/yr wasted.
- Average abandonment point: **~19 minutes** in.
- Top causes (~21% each): took too long; asked for too much personal data (92% are concerned about data volume); and **38% abandoned because they didn't have the right ID document to hand**.
- "Expectation paradox": better markets breed less patient users — speed alone doesn't win; perceived effort and clarity do.

### 2.3 Patterns to copy

1. **Show the whole journey up front**: "3 steps, about 6 minutes: who you are → verify your identity → set up your account." Progress indicator persists.
2. **Document checklist before starting**: "You'll need your passport or driving licence and 2 minutes alone with your phone camera" — directly attacks the 38% no-document drop-off.
3. **One thing per turn / per screen**; progressive disclosure; defer everything deferrable (Wise model — but note the 90-day FATCA clock and CDD-before-relationship constraint bounds how much can defer).
4. **Explain why for every sensitive ask**, inline, one sentence: "We ask about tax residency because banks are legally required to report to tax authorities under CRS."
5. **Instant partial value**: show account number / virtual card / Premier benefits preview while background checks run.
6. **Save-and-resume across channels** with no re-entry — abandonment is often interruption, not rejection.
7. **Status transparency during manual review**: "A specialist is reviewing your application — typically within 4 hours. We'll message you." Silence is the trust-killer.

---

## 3. How a top Premier Relationship Manager runs a first meeting

### 3.1 Sequencing (goals before products, always)

1. **Set expectations & agenda** ("Here's how the next 20 minutes will go, and what you'll walk away with") — reduces anxiety, signals professionalism.
2. **Relationship framing**: "What would success look like for you in working with us?" (Kitces: treat it as a Relationship Expectations meeting, not a sales meeting.)
3. **Discovery — life first, money second**: goals, timelines, family, cross-border footprint. Emotions/values behind the numbers, not just the numbers.
4. **Facts**: income sources, assets, liabilities, existing banking — collected *after* rapport, framed as "so I can tailor this."
5. **Play back what was heard** ("So the priorities are the HK–UK move, school fees in 3 years, and simplifying your accounts — did I get that right?").
6. **Then and only then, map to solutions** — as fits to stated goals, not a product list.
7. **Clear next step + who does what by when.**

### 3.2 Discovery questions that work (adapt for the concierge)

- "What's prompting you to look at Premier now?" (trigger event — relocation, income change, dissatisfaction)
- "Over the next 3–5 years, what are the big things you're planning for?" 
- "Do you have financial ties in more than one country — family, property, income?" (HSBC's differentiator; also feeds CDD naturally)
- "How do you prefer to manage money — hands-on, or would you rather someone handles the detail?"
- "Is there anything about money that keeps you up at night?"
- Visualization: "If everything went right, where are you five years from now?"

### 3.3 Handling compliance questions without breaking rapport

- **Frame as protection, not interrogation**: "A couple of standard questions every bank must ask — they protect your account as much as anything."
- **Weave, don't batch**: "You mentioned the funds come from selling your Singapore flat — great, that actually covers one of our required questions."
- **Normalize**: "Everyone gets asked this, from students to CEOs."
- **Never apologize excessively** — one confident sentence of why beats three sorries. Apology signals the question is unreasonable.
- **Plain-language PEP/SoF asks** with examples rather than jargon.

### 3.4 Tone & language patterns

- Confident, warm, unhurried. Short sentences. Client's name used sparingly (once early, once at close — not every message).
- "We" for the bank, "you" focused sentences; active voice.
- Never: "amazing opportunity," "don't miss out," exclamation marks in financial matters, fake urgency, upsell before the stated need is solved.
- Acknowledge-then-advance: reflect what the client said in a clause before asking the next question.

---

## 4. AI concierge design patterns

### 4.1 Do's and don'ts for conversational onboarding

**Do:** state up front what the assistant is (AI), what it can do, and how long onboarding takes; one question per turn; keep messages ≤ ~40 words (two short messages beat one 80-word block); confirm understanding before acting on high-stakes data; quick-reply chips for enumerable answers; allow "why do you ask?" at any point with a crisp answer; always show an escape hatch to a human.
**Don't:** free-text-parse things that have canonical formats; ask for the same thing twice; pretend to be human; make product claims with uncertainty; bury disclosures in walls of text; block the user during background checks.

### 4.2 Structured UI inside chat vs free text — decision table

| Use **structured UI (card/form/picker) in chat** | Use **free text** |
|---|---|
| Names, DOB, address (address lookup widget), ID numbers, TINs — anything validated | Goals and life context ("what brings you here?") |
| Country/occupation/income-band selection (pickers/chips) | Clarifications, questions to the assistant |
| Document capture (camera component with framing guide, not "upload a photo") | Describing source of funds narrative (then confirm structured) |
| Yes/no attestations (PEP, US person, T&Cs) — explicit tap, never inferred from prose | Anything emotional or exploratory |
| Review-and-confirm summary card before submission | — |

Rule of thumb: **conversation for meaning, components for data**. Legal attestations must be explicit UI actions (tap/sign), never inferred from a chat sentence — this is what makes the audit trail defensible.

### 4.3 Error & uncertainty handling

- Extraction confidence low → confirm, don't assume: "I read your passport number as E1234567 — is that right?"
- ID capture failure → up to 2 guided retries with a specific fix ("try near a window, avoid glare"), then offer alternate document, then human.
- Never fabricate policy/rate/eligibility answers; if unsure: "I want to get that exactly right — let me connect you with a specialist" (and log the gap).
- Ambiguous intent → clarifying question with 2–3 chip options, not a guess.
- System delay → say so with a time bound; never dead air.

### 4.4 Human handoff triggers (hard list)

1. Sanctions/PEP potential match or any EDD trigger (senior-management approval is required by law anyway).
2. Identity verification failed after retries.
3. Customer expresses distress, confusion after 2 rephrases, or explicitly asks for a person.
4. Vulnerability signals (bereavement, health, coercion hints — Consumer Duty demands extra care; coercion → fraud team, not RM).
5. Complaint language.
6. Investment advice requests beyond guidance boundary (suitability territory).
7. Any decline scenario — a human delivers/reviews declines; the AI never argues a decline, and never explains an AML-related one (tipping-off).
Handoff mechanics: warm transfer with full context ("You won't need to repeat anything"), named human where possible, time expectation stated.

### 4.5 Tone spec for Project Concierge

- **Persona**: HSBC's best Premier RM — professional, warm, confident, efficient. Never salesy, robotic, or verbose.
- Sentence budget: 1–2 sentences per message; max 3 for explanations. No emoji. No exclamation marks.
- One "why" sentence accompanies every sensitive ask. Vocabulary: "verify" not "vet," "a few details" not "your data," "specialist" not "agent."
- Confidence without absolutes: "You're all set for the next step" ✓; "You're guaranteed approval" ✗.
- Example exchange:
  > **Concierge:** Before we set up your account, I'll ask about your tax residency — banks are required to report certain information under international rules, and it takes about a minute. Are you tax resident anywhere outside the UK?
  > *(chips: "No, just the UK" / "Yes, one other country" / "Yes, more than one" / "Why do you ask?")*
  > **Customer:** Yes — Hong Kong.
  > **Concierge:** Noted — UK and Hong Kong. For Hong Kong I'll need your Hong Kong ID number, which serves as your tax identification number there. *(input field)*

---

## Top 12 design decisions for Project Concierge

1. **Two-lane architecture**: a warm conversational lane (goals, discovery, explanation) wrapped around a hard compliance state machine (CDD fields, screening, attestations). The LLM never decides *whether* a regulatory step happens — only how it's phrased.
2. **Goals before forms**: open with one discovery question ("What's prompting the move to Premier?") before any data field — it builds rapport, personalizes everything after, and pre-answers "purpose of account" CDD.
3. **Structured components for every validated datum**; free text only for meaning. All legal attestations (PEP, FATCA/CRS, T&Cs) are explicit taps rendered as cards — never inferred from prose.
4. **Pre-flight checklist**: before starting, show "passport or driving licence + 2 minutes with your camera" and a save-and-resume promise — targets the 38% who abandon for lack of documents and the ~19-minute abandonment wall.
5. **Progress and time honesty**: persistent "step 2 of 4 · about 3 minutes left." Every sensitive question carries a one-sentence why.
6. **Progressive KYC where law allows**: open in restricted mode fast (account number visible, low limits), complete EDD/tax-cert asynchronously — bounded by the FATCA 90-day clock and CDD-before-relationship rules.
7. **Three-outcome decision engine with reason codes**: auto-approve / refer / decline, every decision logged with rule version and inputs. Referrals get a stated SLA and proactive status messages; declines get neutral wording (tipping-off risk) and human review.
8. **Hard handoff list encoded as rules, not model judgment**: PEP/sanctions hits, failed IDV, vulnerability signals, advice-boundary requests, complaints, declines. Warm transfer with full transcript context.
9. **Guidance, never advice**: the concierge matches account tiers to stated needs (allowed) but routes any investment recommendation to a suitability-qualified human. Phrase pattern: "matches what you described" not "I recommend."
10. **Everything is a record**: transcript, extractions, confidence scores, screening results, overrides, model/prompt versions — immutable, retained 5+ years post-relationship, replayable for FCA/HKMA audit.
11. **Tone contract enforced mechanically**: ≤ 2 sentences per message, no exclamation marks, no urgency language, banned-phrase list ("amazing," "don't miss out"), one confident why per compliance ask, no repeated apologies. Lint the model output, don't just prompt for it.
12. **Cross-border as the hero feature**: detect multi-country ties in discovery and surface HSBC's Premier-status portability early — it's the genuine differentiator vs neobanks, and multi-jurisdiction customers are exactly who Premier onboarding serves (while correctly triggering the right CRS/EDD paths).

---

### Key sources
- UK: [MLR 2017 KYC requirements — iDenfy](https://idenfy.com/blog/kyc-uk/), [Trulioo UK KYC](https://www.trulioo.com/blog/identity-verification/kyc-uk), [OneID KYC checks](https://oneid.uk/news-and-events/kyc-checks-explained-the-uk-requirements-and-process)
- EDD/PEP: [FATF PEP Guidance (Rec 12/22)](https://www.fatf-gafi.org/content/dam/fatf-gafi/guidance/Guidance-PEP-Rec12-22.pdf.coredownload.pdf), [Sumsub EDD guide](https://sumsub.com/blog/enhanced-due-diligence-guide/), [Neotas EDD checklist](https://www.neotas.com/enhanced-due-diligence-checklist/)
- FATCA/CRS: [HSBC UK CRS self-cert form](https://www.crs.hsbc.com/-/media/crs/pdfs/uk/crs-i-self-certification-form-uk.pdf), [OECD CRS self-cert](https://www.oecd.org/content/dam/oecd/en/topics/policy-issue-focus/aeoi/crs_entities_self-cert_form.pdf), [Citi FATCA/CRS guidelines](https://www.citibank.com/tts/sa/taxinitiatives/docs/FATCA-CRS-Self-certification-Guidelines.pdf)
- HK: [HKMA CDD FAQ](https://www.hkma.gov.hk/media/eng/doc/key-functions/banking-stability/aml-cft/faq_cdd.pdf), [HKMA account opening](https://www.hkma.gov.hk/eng/smart-consumers/account-opening/)
- Suitability: [FCA PRIN 2A Consumer Duty](https://handbook.fca.org.uk/handbook/prin2a), [COBS 9A.2](https://handbook.fca.org.uk/handbook/COBS/9A/2.html)
- UX: [Signicat Battle to Onboard 2022](https://www.signicat.com/the-battle-to-onboard-2022), [Fintech Times — 68% abandonment](https://thefintechtimes.com/68-of-european-consumers-abandon-financial-applications-during-onboarding-finds-signicat/), [Craft Innovations — Revolut/Nubank/Monzo onboarding](https://craftinnovations.global/banking-onboarding-best-practices-revolut-nubank-monzo/), [Appcues fintech onboarding](https://www.appcues.com/blog/fintech-onboarding-examples)
- RM practice: [Kitces CLEAR discovery framework](https://www.kitces.com/blog/5-step-clear-framework-discovery-meetings-client-goals-psychological-meaningful-relationship-communication-financial-advisor/), [Kitces relationship-expectations questions](https://www.kitces.com/blog/financial-advisor-client-onboarding-relationship-expectations-questions-communication-relationship-expectations/), [Columbia SPS discovery meetings](https://sps.columbia.edu/news/discovery-meetings-asking-right-questions-uncover-client-goals)
- AI patterns: [AI UX Design Guide — conversational UI](https://www.aiuxdesign.guide/patterns/conversational-ui), [Deloitte — AI banking chatbots](https://www.deloitte.com/us/en/insights/industry/financial-services/ai-banking-chatbots-from-frustration-to-delight.html), [Parallel — chatbot trust UX](https://www.parallelhq.com/blog/ux-ai-chatbots)
- HSBC Premier: [HSBC UK Premier](https://www.hsbc.co.uk/current-accounts/products/premier/), [HSBC HK Premier](https://www.hsbc.com.hk/accounts/products/premier/)
