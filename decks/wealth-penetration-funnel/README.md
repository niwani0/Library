# Wealth Penetration Funnel — Path to 50%

A self-contained, keyboard-navigable HTML deck arguing the case for reaching 50%
wealth penetration. It applies the **Dialer.io governing structure** —
define the outcome → diagnose the funnel → isolate the true bottleneck →
apply targeted interventions → close the measurement loop — to a wealth-growth
funnel rather than a lead-to-sale funnel.

## The funnel

`Acquire → Fund → Qualify → Penetrate → Grow NNIA → Retain`, run across three
customer pools that share one diagnostic architecture:

- **NTB** — new acquisition (are we acquiring wealth-capable customers?)
- **ETB** — existing customers (is on-book investable money converting?)
- **Clean-up** — value protection (what structurally dilutes the portfolio?)

## Slides (17 total: title + 14 content + 2 section dividers)

1. Case for change — 42.8% vs 50% at 2030, real FRP trajectory
2. Penetration trajectory chart (2024→2030, IWPB-9 + Asia/Am&EU/ME vs 50% line)
3. Define the wealth growth funnel
4. Current position by market (real IWPB-9 scorecard + classification)
5. *Section divider — Diagnostic*
6. NTB diagnostic (real MOB3 quality metrics)
7. Core-5 NNM momentum callout (MTD June Week 4)
8. ETB diagnostic (real NNIA-by-region)
9. Portfolio dilution diagnostic
10. *Section divider — Action*
11. NTB action plan
12. ETB action plan
13. Portfolio clean-up action plan
14. Integrated action roadmap
15. Measurement & management loop
16. Executive decisions required

## Data

Real figures are drawn from the FRP / NNIA pack shared 16 Jul 2026 and
transcribed into `data.md` (source of truth). The headline finding: on the
current FRP, IWPB-9 wealth penetration reaches only **42.8% by 2030 — 7.2pp
short of the 50% ambition**, with acquisition quality (22% new-cohort
penetration at MOB3 vs 36% on-book) as the primary drag.

The trajectory chart's series palette was validated for colourblind-safety
with the `dataviz` skill validator (light-mode categorical: blue / teal /
amber, plus the IWPB-9 total as an emphasized dark line with direct labels).

## Formats

- **`index.html`** — the interactive web deck (17 slides). Navigate with arrow
  keys / space / PageUp / PageDown, the on-screen `‹ ›`, or `Home` / `End`.
  The print stylesheet lays out every slide as a 16:9 page.
- **`Wealth-Penetration-Funnel.pptx`** — native PowerPoint (24 slides = the 17
  core slides + a 7-slide appendix). Regenerate with `python3 build_pptx.py`.

## Appendix (PPTX only)

1. Appendix divider
2. **Taxonomy mapping key** — reconciles the three market views (IWPB-9 FRP ·
   Core-5 NNM · NNIA product tree), with the AOC/China decode flagged for
   confirmation.
3. **Wealth penetration %** — full per-market trajectory 2024→2030
4. **TRB qualifiers %** — full per-market trajectory 2024→2030
5. **Active customers + new-cohort @MOB3** penetration tables
6. **NNIA by region + Core-5 momentum** recap
7. **Rendered penetration chart + sources & caveats**

The trajectory slide carries a **native, editable** PowerPoint line chart; the
appendix embeds the **pixel-perfect rendered** version of the same chart.
Market classifications match the web deck (unchanged).

## Notes

- Figures are transcribed from screenshots of the FRP/NNIA pack (see `data.md`).
  **Verify against the source workbook before external use** — a few cells were
  read from low-resolution captures.
- Three market taxonomies exist in the source (full product tree, Core-5 NNM,
  IWPB-9 FRP). The deck leads on **IWPB-9** with a **Core-5** momentum callout.
- No external assets or network calls; the file is fully offline-capable.
