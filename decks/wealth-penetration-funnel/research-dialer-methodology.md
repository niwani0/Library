# Research — Is the "Dialer.io logic" real? Methodology check + deck reorg proposal

**Date:** 2026-07-16
**Author:** research pass for the Wealth Penetration Funnel deck
**Scope:** verify what dialer.io actually publishes as a methodology, then propose how to
reorganise this deck around the *verified* framework.

## Executive summary

- **dialer.io is an outbound power-dialer / speed-to-lead sales-engagement SaaS** for
  outbound sales and SDR teams, **co-founded and run by Matt(hew) Ryder (Co-Founder & CEO)**.
  Its published "method" is operational, not strategic: a **Speed-to-Lead cadence**, spam-safe
  **number management** to lift **pick-up rates**, AI call routing, compliance scrubbing, and
  CRM-of-record reporting dashboards.
- **Matt Ryder's own sales-methodology lineage is NEPQ (Neuro-Emotional Persuasion
  Questioning) — the Jeremy Miner / 7th Level questioning-and-closing method — plus the
  dialer.io Speed-to-Lead cadence. It is NOT Winning by Design / SPICED / Bowtie**, and it is
  NOT a strategic funnel-diagnostic loop. NEPQ is a 7-step *conversation* framework for a
  single call (ask the right questions in the right sequence), not a "diagnose the funnel"
  method.
- **Neither dialer.io nor Matt Ryder publishes the five-step "Define the outcome → diagnose
  the funnel → isolate the true bottleneck → apply targeted interventions → close the
  measurement loop" framework the deck attributes to "Dialer.io logic."** That loop is a
  **generic funnel-analysis / CRO / outbound-bottleneck-diagnosis practice** that many sources
  (Apollo, Funnel.io, Call Logic, Adapty) describe — a sound idea, but *not* "Dialer.io logic"
  and *not* traceable to Matt Ryder's content.
- **Sourcing caveat (important):** dialer.io's own domain is **blocked by this session's
  egress policy** (proxy returned HTTP 403 CONNECT rejections for `dialer.io` and
  `www.dialer.io`). I could not fetch a single dialer.io page directly. All dialer.io facts
  below come from **WebSearch summaries of dialer.io's own pages** (homepage, `/faq`,
  `/resource`), not from pages I rendered myself. Product characterisation confidence is
  **MEDIUM**; the "no such five-step framework exists" claim is **MEDIUM-LOW** (absence of
  evidence — I could not crawl their docs/blog).
- **Bottom line for the deck:** the *logic* is fine and defensible as a funnel-diagnostic
  loop — but the *attribution* to dialer.io is not. Either re-ground the loop in citable
  general sources, or restrict the dialer.io reference to the two places it genuinely fits
  (cadence design → interventions; reporting cockpit → measurement loop).

---

## Part 1 — What dialer.io actually is (primary sources, with honesty about reach)

### What I tried (reachability log)

| Target | Method | Result |
|---|---|---|
| `https://dialer.io` | WebFetch | HTTP 403 |
| `https://www.dialer.io` | WebFetch | HTTP 403 |
| `https://www.dialer.io/resource` | WebFetch | HTTP 403 |
| `dialer.io`, `www.dialer.io` | curl (browser UA) | proxy CONNECT rejected — `403 policy denial`, logged in `recentRelayFailures` |
| `https://dialerio.vercel.app/` (mirror seen in search) | WebFetch | HTTP 403 |

The proxy status endpoint recorded `kind: connect_rejected — gateway answered 403 to CONNECT
(policy denial or upstream failure)` for `dialer.io:443` and `www.dialer.io:443`. Per the
proxy README, a 403 CONNECT is an **organization egress-policy block**, not a transient error,
and must not be retried or routed around. **The primary site is therefore unreachable in this
session.** Everything below is reconstructed from search-engine summaries of dialer.io's own
copy.

### The product

dialer.io is "built for outbound teams that want more conversations, not more dialing" — a
platform to help sales teams "make more calls, connect with more prospects, and drive more
revenue." Positioned as an **enterprise outbound dialing / speed-to-lead platform** for
**sales and SDR teams** running outbound calling campaigns.

Published capabilities (from homepage / FAQ copy as surfaced in search):

- **Fast/power dialing** — "dial through your call list 10x faster."
- **Local presence dialing** — local area codes to lift pick-up ("4x more likely to answer").
- **Number management** — proprietary anti-spam-flagging system to keep pick-up rates high.
- **Speed-to-Lead cadence** — contact new leads fast, then space follow-ups with cooldowns
  and decaying dialing frequency.
- **AI-powered call routing** — "right rep at the right time."
- **Analytics** — "track every metric that matters, from connect rates to talk time";
  dashboards for peak answer times, agent activity, gaps/opportunities.
- **Compliance** — TCPA, DNC, state-reg scrubbing and consent.
- **CRM integrations** — Salesforce, HubSpot, "50+ CRMs" with automatic logging and
  disposition; "keeps your CRM as the system of record."

**Metric / vocabulary set dialer.io actually uses:** pick-up rate (they cite "dozens of
factors" driving pickup into a 15-25% band), connect/contact rate, talk time, dispositions,
cadence (Speed-to-Lead), peak answer times, agent activity, agent-to-lead ratio — plus
compliance (TCPA/DNC) and CRM-of-record logging. Reported outcome anecdote: pick-up rates
"from under 10% to over 30%," "3X your pickup rates."

### Who is Matt Ryder, and does the loop trace to him?

**Matt (Matthew) Ryder is dialer.io's Co-Founder & CEO** — his LinkedIn headline is literally
"I was sick of low pick up rates, slow speed to lead and spam flagging so I built dialer.io"
( https://www.linkedin.com/in/matthew-ryder/ ). Background as surfaced by search: former
special-forces serviceman ("Sales Sniper"), high-ticket closer, ran **Sales Sniper
Consulting** (Australia) and was a senior figure at **7th Level** (Jeremy Miner's sales-training
company); founder of the **"F The Gurus"** sales-training community; credits teams with $300M+
in sales.

**His published sales methodology is NEPQ — Neuro-Emotional Persuasion Questioning** — the
method authored by **Jeremy Miner / 7th Level**, which Ryder teaches and built his closing
career on ( https://7thlevelhq.com/our-methodology/ ). NEPQ is a **seven-step *questioning*
structure for an individual sales conversation** — "asking the right questions, in the right
sequence, with the right delivery" so the prospect persuades themselves. It governs *how you
talk on a call*; it is **not** a funnel-diagnostic or bottleneck-isolation loop.

**Verdict on attribution:** The deck's five-step loop **does not trace to Matt Ryder's
first-party content.** The two frameworks Ryder is genuinely associated with are (a) **NEPQ**
(call-level questioning — different object entirely) and (b) **dialer.io's Speed-to-Lead
cadence** (an outbound-dialing sequence — operational, not a strategic diagnosis loop).
Neither is "define outcome → diagnose funnel → isolate bottleneck → intervene → measure."
Note the plausible *reason* the deck reached for the attribution: Ryder is visibly a
"frameworks/steps" operator (NEPQ has 7 steps; Speed-to-Lead is a cadence), so a five-step
governing loop *feels* on-brand for him — but I found no published version of this specific
loop from him or from dialer.io. It is **generic funnel/CRO practice** (see below).

> Disambiguation caution: search engines conflate this Matt Ryder with unrelated "Matt Ryder"
> results and, separately, NEPQ's authorship sits with **Jeremy Miner**, not Ryder — Ryder is
> a practitioner/teacher of it, not its author. Treat both as MEDIUM-confidence pending
> first-hand pages (his site, Skool, and dialer.io are all unreachable/blocked here).

### Is the deck's five-step loop dialer.io's published methodology?

**No — not on the evidence available.** Nothing surfaced from dialer.io's own pages describes
a named "define → diagnose → isolate bottleneck → intervene → measure" strategic loop.
dialer.io's published thinking is narrower and operational: *lift pick-up rate via number
management + local presence, contact fast via a Speed-to-Lead cadence, and read results off a
reporting dashboard.* The closest dialer.io comes to "diagnosis" is its **reporting/dashboards**
("highlight gaps and opportunities for data-driven decisions") — that is a measurement surface,
not a five-stage governing method.

The five-step loop the deck uses is a **well-established general practice** that shows up
across funnel-analysis / CRO / outbound-diagnosis writing, e.g.:

- Generic funnel-analysis workflow: *identify the bottleneck via funnel analysis → segment
  with cohort analysis → investigate causes → test fixes via A/B* (Adapty, FullSession).
- Outbound bottleneck diagnosis as an explicit **five-step process**: *map the process →
  quantify each stage with data → find the true bottleneck → intervene → measure* (Call Logic).
- "Start with a single measurable outcome (the macro conversion)" then diagnose drop-off by
  segment (Apollo, Quadratic).

So the deck's loop is **industry-standard funnel/CRO logic, loosely paraphrased and
mis-attributed to dialer.io.** It is not fabricated and it is not wrong — it is just not
"Dialer.io's."

### Source table (claim | source URL | confidence)

| Claim | Source URL | Confidence |
|---|---|---|
| dialer.io is an outbound power-dialer / speed-to-lead platform for sales & SDR teams | https://www.dialer.io/ (via WebSearch summary; site unreachable directly) | MEDIUM |
| Core value = lift pick-up rates via number management + local presence; "3X pickup" | https://www.dialer.io/ | MEDIUM |
| Speed-to-Lead cadence = fast first contact, then spaced follow-ups with cooldowns | https://www.dialer.io/faq | MEDIUM |
| Metric vocabulary: connect rate, talk time, dispositions, peak answer times | https://www.dialer.io/ ; https://www.dialer.io/faq | MEDIUM |
| CRM kept as "system of record"; auto logging + disposition to Salesforce/HubSpot/50+ | https://www.dialer.io/ | MEDIUM |
| Matt (Matthew) Ryder is dialer.io's Co-Founder & CEO ("I built dialer.io") | https://www.linkedin.com/in/matthew-ryder/ | HIGH |
| Ryder's background: ex-special-forces, Sales Sniper Consulting, 7th Level, "F The Gurus" | https://au.linkedin.com/in/matthew-ryder-3b0a811b0 ; https://www.skool.com/@matt-ryder-3248 | MEDIUM |
| Ryder's sales methodology is NEPQ (a 7-step questioning/closing method), not a funnel loop | https://7thlevelhq.com/our-methodology/ | MEDIUM-HIGH |
| NEPQ is authored by Jeremy Miner / 7th Level; Ryder teaches it (not its author) | https://7thlevelhq.com/ ; https://gritdaily.com/jeremy-miner-neuro-emotional-persuasion/ | MEDIUM-HIGH |
| Ryder has no established Winning-by-Design / SPICED / Bowtie lineage | (no connecting source found) https://winningbydesign.com/saas-selling/ | MEDIUM |
| Neither dialer.io nor Matt Ryder publishes the named 5-step define→diagnose→isolate→intervene→measure loop | Absence across https://www.dialer.io/ , /faq, /resource, /education, and Ryder's channels (as surfaced by WebSearch; sites unreachable directly) | MEDIUM-LOW |
| The 5-step loop is general funnel/CRO/outbound-diagnosis practice, not dialer.io-specific | https://adapty.io/glossary/funnel-analysis/ ; https://www.fullsession.io/blog/conversion-funnel-analysis/ ; https://www.apollo.io/insights/sales-funnel-analysis | HIGH |
| Outbound bottleneck diagnosis is itself a documented 5-step process (map→quantify→isolate→intervene→measure) | https://www.calllogic.com/blog/how-to-identify-bottlenecks-in-your-outbound-sales-process/ | MEDIUM-HIGH |
| dialer.io domain blocked by egress policy (403 CONNECT), could not verify pages first-hand | Session proxy `recentRelayFailures` log | HIGH |

**Confidence in Part 1 overall: LOW-to-MEDIUM**, driven entirely by the inability to reach
the primary domain. I have deliberately not padded this with vendor SEO blog content beyond
what is needed to establish where the loop genuinely comes from.

---

## Part 2 — Deck inventory (17 slides, from `index.html` + `README.md` + `data.md`)

| # | Slide H1 (verbatim from `index.html`) | Role |
|---|---|---|
| 1 | The Path to 50% Wealth Penetration | Title |
| 2 | The plan does not reach the ambition | Case for change (42.8% vs 50% @2030, gap 7.2pp) |
| 3 | Every region plateaus below the 50% line | Penetration trajectory chart |
| 4 | One common funnel — where value is created or lost | Define the wealth-growth funnel (Acquire→Fund→Qualify→Penetrate→Grow NNIA→Retain; 3 pools NTB/ETB/clean-up) |
| 5 | Which markets are on track — and where the funnel breaks | Position-by-market scorecard (IWPB-9) |
| 6 | *Divider:* Diagnose the funnel before prescribing a fix | Diagnostic section divider |
| 7 | Are we acquiring customers capable of driving wealth growth? | NTB diagnostic (MOB3 quality, A–E lenses) |
| 8 | The engine can run — when the funnel is orchestrated | Core-5 NNM momentum callout (Jun W4) |
| 9 | Where is investable money sitting — and why isn't it converting? | ETB diagnostic (NNIA by region, 6 lenses) |
| 10 | What is structurally dragging penetration down? | Portfolio dilution diagnostic |
| 11 | *Divider:* Act on the true bottleneck — one lever at a time | Action section divider |
| 12 | Make acquisition the first quality-control point | NTB action plan (5 moves) |
| 13 | Convert addressable balances into sustainable NNIA | ETB action plan (7-step Identify→Retain) |
| 14 | Remove structural dilution — without gaming the denominator | Clean-up action plan |
| 15 | Three levers, one sequenced view to 2030 | Integrated roadmap + decision records |
| 16 | A monthly cockpit that closes the loop | Measurement & management loop |
| 17 | Seven decisions to put us on the path to 50% | Executive decisions required |

Plus a 7-slide PPTX-only appendix (taxonomy key, per-market trajectories, active-customer /
MOB3 tables, NNIA + Core-5 recap, rendered chart + sources).

The deck **already gestures at all five loop stages** — the action divider literally reads
"Act on the true bottleneck." The problem is not absence; it is **balance and attribution**
(see Part 3).

---

## Part 3 — Reorg proposal (grounded in the verified loop)

**Recommendation:** keep the five-stage loop as the deck's spine — it is sound — but stop
calling it "the Dialer.io governing structure." Re-ground it as a **funnel-diagnostic loop**
(citably: general funnel/CRO practice + outbound bottleneck diagnosis), and reference
dialer.io **only** at the two stages where dialer.io genuinely has published IP: cadence
design (interventions) and the reporting cockpit (measurement). Then rebalance the slides so
the deck actually *performs* the "isolate the true bottleneck" step it currently only
sloganeers.

### Stage → slide mapping (current deck vs verified loop)

| Verified loop stage | Current slides | Verdict |
|---|---|---|
| **1. Define the outcome** | 2 Case for change · 3 Trajectory chart · 4 Define funnel | **Over-served** — three slides all establish "42.8% < 50%." |
| **2. Diagnose the funnel** | 5 Scorecard · 7 NTB diag · 9 ETB diag · 10 Dilution diag | Well-served. Solid. |
| **3. Isolate the TRUE bottleneck** | (only the divider 11 slogan; the "22% MOB3 vs 36% on-book" finding is buried in slide 2 / README) | **Under-served** — no dedicated slide that names and quantifies THE one bottleneck. This is the weakest link vs the loop. |
| **4. Apply targeted interventions** | 12 NTB action · 13 ETB action · 14 Clean-up · 15 Roadmap | Well-served (arguably heavy — three parallel plans). dialer.io analogy is **strongest and defensible** here (slide 13's Identify→…→Retain is a cadence). |
| **5. Close the measurement loop** | 16 Measurement cockpit · 17 Decisions | Well-served; dialer.io "dashboard/gaps-and-opportunities" reference is defensible here. |
| (Straddler) | 8 Core-5 momentum ("the engine can run") | Mis-placed mid-diagnosis — it is a proof-of-concept for intervention, not a diagnostic. |

### Recommended slide order

1. Title
2. **Define — the gap** (merge current 2 + 3: headline 42.8% vs 50% with the trajectory
   chart as the evidence panel, not two separate slides)
3. **Define — the funnel** (current 4, the Acquire→…→Retain model + three pools)
4. *Diagnostic divider* (current 6)
5. Position-by-market scorecard (current 5) — move it under the diagnostic banner where it
   belongs analytically
6. NTB diagnostic (current 7)
7. ETB diagnostic (current 9)
8. Portfolio dilution diagnostic (current 10)
9. **NEW — "The true bottleneck: acquisition quality"** (decompose the 7.2pp gap; show 22%
   new-cohort MOB3 penetration vs 36% on-book as the primary drag; explicitly rank the three
   pools so the audience sees *which* lever moves the number most)
10. *Action divider* (current 11)
11. NTB action (current 12) — lead here, because it is the isolated bottleneck
12. Core-5 momentum proof point (current 8, **moved**) — "the engine can run when
    orchestrated" now supports the action, not interrupts the diagnosis
13. ETB action (current 13)
14. Clean-up action (current 14)
15. Roadmap (current 15)
16. Measurement cockpit (current 16)
17. Decisions (current 17)

### Concrete recommended changes (do these)

1. **Insert a dedicated "Isolate the true bottleneck" slide** (new slide 9 above). The deck
   claims the "isolate" step but never lands it on its own slide — it currently jumps from
   parallel diagnostics straight to three parallel action plans. Decompose the 7.2pp gap and
   name acquisition quality as *the* bottleneck. This is the single highest-value fix.
   (Grounding: outbound bottleneck diagnosis explicitly requires a quantification/isolation
   step — https://www.calllogic.com/blog/how-to-identify-bottlenecks-in-your-outbound-sales-process/ )
2. **Compress the Define stage from 3 slides to 2** (merge trajectory chart into the
   case-for-change as its evidence panel). Three slides on "we fall short" is over-served and
   delays the diagnosis.
3. **Move Core-5 momentum (slide 8) out of the diagnostic block** into the action block as a
   proof point. Mid-diagnosis it reads as a tangent; beside the NTB/ETB actions it earns its
   "the engine can run when orchestrated" framing.
4. **Re-label the framing, honestly.** Change README line 4-7 and any on-slide "Dialer.io
   governing structure" language to a neutral **"funnel diagnostic loop."** Neither dialer.io
   nor its CEO Matt Ryder publishes this five-step loop — Ryder's actual frameworks are
   **NEPQ** (a call-level questioning method he teaches, authored by Jeremy Miner/7th Level)
   and dialer.io's **Speed-to-Lead cadence**. Keep the dialer.io/Ryder reference only where
   it is genuinely true: (a) the ETB Identify→…→Retain sequence as a **Speed-to-Lead-style
   cadence**, and (b) the monthly cockpit as dialer.io's **reporting/dashboard** analogue.
   Cite the loop itself to general funnel/CRO practice
   ( https://www.apollo.io/insights/sales-funnel-analysis ,
   https://adapty.io/glossary/funnel-analysis/ ) and, for the isolate step, to documented
   outbound bottleneck diagnosis
   ( https://www.calllogic.com/blog/how-to-identify-bottlenecks-in-your-outbound-sales-process/ ).
   If the deck's audience specifically expects "Dialer.io," the honest one-liner is: *"We
   borrow the operating instinct behind dialer.io — relentlessly diagnose where contacts leak
   out of the funnel and fix the true bottleneck — and apply it to wealth penetration,"*
   which is defensible without claiming a published five-step framework that does not exist.
5. **Move the position-by-market scorecard (slide 5) below the diagnostic divider.** It is a
   diagnostic artefact, not part of "define"; placing it under the divider tightens the
   define→diagnose transition.
6. **(Optional) Trim parallel action plans.** Three full action slides (NTB/ETB/clean-up)
   plus a roadmap is intervention-heavy given the deck now isolates acquisition as *the*
   bottleneck — consider making NTB the hero and compressing clean-up into the roadmap.

---

## Sourcing caveats / what I could not verify

- **I never rendered a dialer.io page.** The domain is blocked by this session's egress
  policy (proxy 403 CONNECT, logged). Every dialer.io fact is a **WebSearch summary of
  dialer.io's own copy**, one abstraction removed from the source. Verify against the live
  site before external use.
- **The "no five-step framework" finding is an absence-of-evidence claim (MEDIUM-LOW).** I
  could not crawl dialer.io's `/resource`, `/faq`, docs, or blog directly. It is possible —
  though not supported by anything I found — that a dialer.io article describes such a loop.
  If confirming this matters, re-run from an environment where `dialer.io` is allowlisted.
- **Matt Ryder's first-party content was not read first-hand.** His LinkedIn, Skool
  ("F The Gurus"), YouTube, Delphi AI clone, and the dialer.io `/education` and `/about` pages
  were not fetchable (LinkedIn/Skool gate crawlers; dialer.io is egress-blocked). It remains
  *possible* he lays out a funnel-diagnostic model in a talk/post I could not reach — but
  nothing in the indexed summaries suggests the specific five-step loop. His documented
  frameworks are NEPQ (questioning) and Speed-to-Lead (cadence).
- **NEPQ authorship.** NEPQ is Jeremy Miner's / 7th Level's method; Ryder is a
  practitioner-teacher of it. Do not attribute NEPQ's *authorship* to Ryder in the deck.
- **Exact metric definitions unverified.** dialer.io's precise definitions of connect rate
  vs pick-up rate, and its disposition taxonomy, were not readable first-hand.
- **The deck's data (FRP/NNIA) is orthogonal to this research** and was not re-verified here;
  `data.md` already flags it as transcribed from screenshots pending workbook confirmation.
