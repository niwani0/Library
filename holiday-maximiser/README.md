# 🌏 Hong Kong Holiday Maximiser 2027

A cute, single-page web app that turns your annual leave into the longest,
best-timed adventures around Hong Kong's 2027 public holidays.

## Run it

No build step. Open `index.html` in any browser (or serve the folder), e.g.:

```bash
python3 -m http.server -d holiday-maximiser 8000
# then visit http://localhost:8000
```

## Deploy to Netlify

`dist/` contains a fully self-contained, single-file build (CSS and JS inlined,
no external requests) — the easiest thing to host.

- **Drag-and-drop:** go to <https://app.netlify.com/drop> and drop the `dist`
  folder (its `index.html` is the whole app). Or drop the single file
  `dist/holiday-maximiser.html`.
- **Git-based deploy:** point Netlify at this repo and set the publish directory
  to `holiday-maximiser/dist` (see `dist/netlify.toml`). There is no build
  command.

To rebuild `dist/` after editing the source files:

```bash
cd holiday-maximiser && node -e '
const fs=require("fs");
let h=fs.readFileSync("index.html","utf8")
 .replace("<link rel=\"stylesheet\" href=\"styles.css\" />","<style>\n"+fs.readFileSync("styles.css","utf8")+"\n</style>")
 .replace("<script src=\"data.js\"></script>","<script>\n"+fs.readFileSync("data.js","utf8")+"\n</script>")
 .replace("<script src=\"app.js\"></script>","<script>\n"+fs.readFileSync("app.js","utf8")+"\n</script>");
fs.writeFileSync("dist/index.html",h); fs.writeFileSync("dist/holiday-maximiser.html",h);'
```

The UI is a guided, one-question-at-a-time flow: each step reveals the next as
you answer it (month → breaks → plan & destinations → journey → summary).

## Features

1. **Month → best maximisers.** Pick a 2027 month and it finds the breaks that
   bridge public holidays with the fewest leave days, ranked by efficiency
   (days off per leave day). Add as many breaks as you like, in any month.
2. **Per-break fine-tuning.** Every break you add to the plan gets its own
   start-earlier / end-later controls, so two breaks in the same month (e.g.
   26 Mar–5 Apr and 3–11 Apr) are tuned independently; leave and length
   recompute live.
3. **Regions.** Choose from Asia, North/Central/South America, Central Asia,
   Middle East, Eastern/Western Europe, Scandinavia, UK & Ireland,
   Australia & New Zealand, Pacific Islands.
4. **In-season country picks.** Countries whose ideal travel months include the
   chosen month are surfaced as "in season".
5. **Distance & flight time.** Great-circle distance and a friendly non-stop
   flight-time estimate from Hong Kong, per country.
6. **Per-month leave count.** Every planned break shows its exact leave days.
7. **Year summary.** Total leave used, total days off gained, and the headline
   "1 leave day buys N days off" ratio.
8. **Round-the-world optimiser.** Selecting countries across multiple regions
   reorders them into an efficient loop (nearest-neighbour + 2-opt) that starts
   and ends in Hong Kong.
9. **Scenery photos.** Each selected country shows an iconic photo of its famous
   scenery for the chosen month (e.g. Japan shows cherry blossoms in April;
   France, the Eiffel Tower — or Provence lavender in June). The hero photo
   **rotates through your picked destinations** as a slideshow (every 5s, pausing
   on hover, disabled under reduced-motion). Images are the lead photo of the
   landmark's Wikipedia article (PageImages API, cached); if one can't load, a
   captioned regional gradient shows instead. (The Claude Artifact preview
   sandboxes external requests, so it shows the gradients — the live Netlify site
   loads the real photos.)
10. **One-leave long-weekend wins.** Every 2027 holiday on a Thursday is offered
    as a quick-win shortcut that jumps you straight to planning it.
11. **Free-weekend short-haul mode.** When a break costs zero leave (a free long
    weekend), the destination picker only offers places reachable in ~4 hours or
    less from Hong Kong — the sensible range for a short escape. Extending it
    into a leave day unlocks the full region picker again.

## Data notes

- Holiday dataset: the 17 gazetted **GovHK 2027 General Holidays** (`data.js`).
- In 2027, **three** general holidays fall on a Thursday — Buddha's Birthday
  (13 May), HKSAR Establishment Day (1 Jul), and the day after Mid-Autumn
  (16 Sep). The app detects these dynamically.
- Distances are straight-line great-circle estimates; flight times assume a
  ~850 km/h cruise plus ~1.5 h of taxi/climb/descent, so they are indicative
  rather than real timetables.
