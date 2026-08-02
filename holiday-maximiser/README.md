# 🌏 Hong Kong Holiday Maximiser 2027

A cute, single-page web app that turns your annual leave into the longest,
best-timed adventures around Hong Kong's 2027 public holidays.

## Run it

No build step. Open `index.html` in any browser (or serve the folder), e.g.:

```bash
python3 -m http.server -d holiday-maximiser 8000
# then visit http://localhost:8000
```

## Features

1. **Month → best maximisers.** Pick a 2027 month and it finds the breaks that
   bridge public holidays with the fewest leave days, ranked by efficiency
   (days off per leave day).
2. **Fine-tune.** Nudge any break earlier or later a day at a time; leave count
   and length recompute live.
3. **Regions.** Choose from Asia, North/Central/South America, Central Asia,
   Middle East, Eastern/Western Europe, Nordic, UK, Australasian, Oceania.
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
9. **Dress-up avatar.** A travel buddy that "wears" the traditional dress of the
   country you're looking at.
10. **One-leave long-weekend wins.** Every 2027 holiday on a Thursday (add the
    Friday for a four-day weekend) plus bonus Tuesday holidays.

## Data notes

- Holiday dataset: the 17 gazetted **GovHK 2027 General Holidays** (`data.js`).
- In 2027, **three** general holidays fall on a Thursday — Buddha's Birthday
  (13 May), HKSAR Establishment Day (1 Jul), and the day after Mid-Autumn
  (16 Sep). The app detects these dynamically.
- Distances are straight-line great-circle estimates; flight times assume a
  ~850 km/h cruise plus ~1.5 h of taxi/climb/descent, so they are indicative
  rather than real timetables.
