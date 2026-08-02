'use strict';

// ---------------------------------------------------------------------------
// Date helpers (all local-time; ISO strings built by hand to avoid UTC drift)
// ---------------------------------------------------------------------------

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const holidaySet = new Set(HOLIDAYS.map((h) => h.date));

function isoOf(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function dateOf(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function isWeekend(d) {
  const g = d.getDay();
  return g === 0 || g === 6;
}

function isHoliday(d) {
  return holidaySet.has(isoOf(d));
}

// A working day is a weekday that is not a public holiday — the only kind of day
// that costs an annual-leave day.
function isWorkday(d) {
  return !isWeekend(d) && !isHoliday(d);
}

function isDayOff(d) {
  return !isWorkday(d);
}

function daysBetween(a, b) {
  return Math.round((dateOf(isoOf(b)) - dateOf(isoOf(a))) / 86400000);
}

function prettyDate(d) {
  return `${DOW_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

// ---------------------------------------------------------------------------
// Runs: maximal stretches of consecutive days off across the whole year.
// A "bridge" between two runs is the set of working days separating them, which
// is exactly the annual leave you would spend to join them into one long break.
// ---------------------------------------------------------------------------

function computeRuns() {
  const runs = [];
  const start = new Date(YEAR, 0, 1);
  const end = new Date(YEAR, 11, 31);
  let cur = null;
  for (let d = start; d <= end; d = addDays(d, 1)) {
    if (isDayOff(d)) {
      if (!cur) cur = { start: new Date(d), end: new Date(d) };
      else cur.end = new Date(d);
    } else if (cur) {
      runs.push(cur);
      cur = null;
    }
  }
  if (cur) runs.push(cur);
  return runs;
}

const RUNS = computeRuns();

function bridgeCost(runA, runB) {
  return daysBetween(runA.end, runB.start) - 1;
}

function runContainsHoliday(run) {
  for (let d = new Date(run.start); d <= run.end; d = addDays(d, 1)) {
    if (isHoliday(d)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Maximiser opportunities for a month. Every candidate spans from the start of
// its leftmost run to the end of its rightmost run, so both ends already fall on
// a day off — no leave is ever wasted on the boundaries.
// ---------------------------------------------------------------------------

const MAX_LEAVE_PER_TRIP = 6;

function opportunitiesForMonth(month /* 0-indexed */) {
  const anchors = RUNS.map((r, i) => ({ r, i }))
    .filter(({ r }) => runContainsHoliday(r)
      && (r.start.getMonth() === month || r.end.getMonth() === month));

  const seen = new Set();
  const candidates = [];

  for (const { i } of anchors) {
    for (let left = 0; left <= 3; left++) {
      for (let right = 0; right <= 3; right++) {
        const lo = i - left;
        const hi = i + right;
        if (lo < 0 || hi >= RUNS.length) continue;

        let leave = 0;
        for (let k = lo; k < hi; k++) leave += bridgeCost(RUNS[k], RUNS[k + 1]);
        if (leave > MAX_LEAVE_PER_TRIP) continue;

        const startD = RUNS[lo].start;
        const endD = RUNS[hi].end;
        const span = daysBetween(startD, endD) + 1;
        const key = `${isoOf(startD)}_${isoOf(endD)}`;
        if (seen.has(key)) continue;
        seen.add(key);

        candidates.push({
          start: isoOf(startD),
          end: isoOf(endD),
          leave,
          span,
          ratio: leave === 0 ? Infinity : span / leave,
        });
      }
    }
  }

  candidates.sort((a, b) => {
    if (b.ratio !== a.ratio) return b.ratio - a.ratio;
    if (b.span !== a.span) return b.span - a.span;
    return a.leave - b.leave;
  });

  const kept = [];
  for (const c of candidates) {
    const cs = dateOf(c.start), ce = dateOf(c.end);
    const covered = kept.some((k) => dateOf(k.start) <= cs && dateOf(k.end) >= ce);
    if (!covered) kept.push(c);
  }
  return kept.slice(0, 5);
}

function leaveDaysInRange(startIso, endIso) {
  const out = [];
  for (let d = dateOf(startIso); d <= dateOf(endIso); d = addDays(d, 1)) {
    if (isWorkday(d)) out.push(isoOf(d));
  }
  return out;
}

// For months with no public holiday to bridge, build breaks from leave alone:
// a three-day long weekend anchored to each weekend, plus one full week away.
function leaveOnlyOptionsForMonth(month /* 0-indexed */) {
  const opts = [];
  const first = new Date(YEAR, month, 1);
  const last = new Date(YEAR, month + 1, 0);

  for (let d = new Date(first); d <= last; d = addDays(d, 1)) {
    if (d.getDay() !== 6) continue; // Saturdays only
    const fri = addDays(d, -1);
    const sun = addDays(d, 1);
    if (!isWorkday(fri)) continue;
    opts.push({ start: isoOf(fri), end: isoOf(sun), leave: 1, span: 3, ratio: 3, kind: 'leave' });
  }

  for (let d = new Date(first); d <= last; d = addDays(d, 1)) {
    if (d.getDay() !== 1) continue; // first Monday whose whole week is workdays
    let allWork = true;
    for (let k = 0; k < 5; k++) if (!isWorkday(addDays(d, k))) { allWork = false; break; }
    if (!allWork) continue;
    const from = addDays(d, -2), to = addDays(d, 6); // Sat before → Sun after
    const span = daysBetween(from, to) + 1;
    opts.push({ start: isoOf(from), end: isoOf(to), leave: 5, span, ratio: span / 5, kind: 'week' });
    break;
  }

  return opts;
}

// A break is a "free long weekend" while it costs no annual leave.
function isFreeBreak(b) {
  return leaveDaysInRange(b.start, b.end).length === 0;
}

// ---------------------------------------------------------------------------
// One-leave long-weekend wins. A holiday on Thursday becomes a four-day weekend
// by taking the Friday; a Tuesday holiday by taking the Monday.
// ---------------------------------------------------------------------------

function longWeekendWins() {
  const wins = [];
  for (const h of HOLIDAYS) {
    const d = dateOf(h.date);
    const dow = d.getDay();
    if (dow === 4 && isWorkday(addDays(d, 1))) {
      wins.push({ ...h, take: isoOf(addDays(d, 1)), takeLabel: 'Friday', kind: 'thursday' });
    } else if (dow === 2 && isWorkday(addDays(d, -1))) {
      wins.push({ ...h, take: isoOf(addDays(d, -1)), takeLabel: 'Monday', kind: 'tuesday' });
    }
  }
  return wins;
}

// ---------------------------------------------------------------------------
// Geography: great-circle distance and a rough non-stop flight-time estimate.
// ---------------------------------------------------------------------------

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Cruise ~850 km/h plus ~1.5h for taxi/climb/descent; a friendly estimate.
function flightHours(km) {
  return km / 850 + 1.5;
}

function fmtHours(h) {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return mins ? `${whole}h ${mins}m` : `${whole}h`;
}

const ALL_COUNTRIES = [];
const countryByName = new Map();
for (const region of Object.keys(REGIONS)) {
  for (const c of REGIONS[region]) {
    const withRegion = { ...c, region };
    ALL_COUNTRIES.push(withRegion);
    countryByName.set(c.name, withRegion);
  }
}

// Short-haul destinations reachable in about four hours or less from Hong Kong —
// the only ones offered for a free long weekend, where time is too tight to fly far.
const NEARBY_HOURS = 4;
const NEARBY_COUNTRIES = ALL_COUNTRIES
  .filter((c) => flightHours(haversineKm(HK, c)) <= NEARBY_HOURS)
  .sort((a, b) => haversineKm(HK, a) - haversineKm(HK, b));

// ---------------------------------------------------------------------------
// Order selected countries into an efficient round-the-world loop starting and
// ending in Hong Kong. Nearest-neighbour, then 2-opt clean-up.
// ---------------------------------------------------------------------------

function nodesFor(names) {
  return [{ name: 'Hong Kong', flag: '🇭🇰', lat: HK.lat, lng: HK.lng, hk: true }]
    .concat(names.map((n) => countryByName.get(n)));
}

function routeDistance(order) {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) total += haversineKm(order[i], order[i + 1]);
  return total;
}

function optimiseRoute(names) {
  const nodes = nodesFor(names);
  if (nodes.length <= 2) {
    const loop = nodes.concat([nodes[0]]);
    return { order: loop, km: routeDistance(loop) };
  }

  const remaining = nodes.slice(1);
  const tour = [nodes[0]];
  while (remaining.length) {
    const last = tour[tour.length - 1];
    let best = 0;
    let bestD = Infinity;
    remaining.forEach((n, idx) => {
      const d = haversineKm(last, n);
      if (d < bestD) { bestD = d; best = idx; }
    });
    tour.push(remaining.splice(best, 1)[0]);
  }
  tour.push(nodes[0]);

  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < tour.length - 2; i++) {
      for (let j = i + 1; j < tour.length - 1; j++) {
        const before = haversineKm(tour[i - 1], tour[i]) + haversineKm(tour[j], tour[j + 1]);
        const after = haversineKm(tour[i - 1], tour[j]) + haversineKm(tour[i], tour[j + 1]);
        if (after + 1e-6 < before) {
          let lo = i, hi = j;
          while (lo < hi) { [tour[lo], tour[hi]] = [tour[hi], tour[lo]]; lo++; hi--; }
          improved = true;
        }
      }
    }
  }
  return { order: tour, km: routeDistance(tour) };
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = { month: null, breaks: [], seq: 0 };
let focusCountry = null;

function addBreak(o) {
  if (state.breaks.some((b) => b.start === o.start && b.end === o.end)) return;
  state.breaks.push({
    id: ++state.seq,
    month: state.month,
    start: o.start,
    end: o.end,
    region: null,
    countries: [],
  });
}

function removeBreak(id) {
  const i = state.breaks.findIndex((b) => b.id === id);
  if (i >= 0) state.breaks.splice(i, 1);
}

function breakByRange(start, end) {
  return state.breaks.find((b) => b.start === start && b.end === end);
}

function allSelectedCountries() {
  const names = [];
  for (const b of state.breaks) {
    for (const n of b.countries) if (!names.includes(n)) names.push(n);
  }
  return names;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const $ = (sel) => document.querySelector(sel);
const prevVisible = {};

function renderMonthPicker() {
  const wrap = $('#month-picker');
  const plannedMonths = new Set(state.breaks.map((b) => b.month));
  wrap.innerHTML = '';
  for (let m = 0; m < 12; m++) {
    const btn = document.createElement('button');
    btn.className = 'chip' + (state.month === m ? ' chip--active' : '')
      + (plannedMonths.has(m) ? ' chip--planned' : '');
    btn.textContent = MONTH_NAMES[m].slice(0, 3);
    btn.onclick = () => { state.month = m; render('breaks'); };
    wrap.appendChild(btn);
  }

  const wins = longWeekendWins().filter((w) => w.kind === 'thursday');
  const host = $('#quickwins');
  host.innerHTML = '<span class="quickwins__label">⚡ Or grab a quick win:</span>'
    + wins.map((w) => {
      const d = dateOf(w.date);
      return `<button class="chip chip--win" data-win="${d.getMonth()}">${w.name} (${prettyDate(d)}) →</button>`;
    }).join('');
  host.querySelectorAll('[data-win]').forEach((b) => {
    b.onclick = () => { state.month = Number(b.dataset.win); render('breaks'); };
  });
}

function renderOpportunities() {
  const host = $('#opportunities');
  if (state.month === null) { host.innerHTML = ''; return; }
  const holidayOpps = opportunitiesForMonth(state.month);
  const noHoliday = holidayOpps.length === 0;
  const pool = noHoliday ? leaveOnlyOptionsForMonth(state.month) : holidayOpps;
  const bridges = pool.filter((o) => o.leave > 0);
  const freebies = pool.filter((o) => o.leave === 0);
  const monthName = MONTH_NAMES[state.month];

  let html = noHoliday
    ? `<div class="step__q">✨ No public holidays in <b>${monthName} 2027</b> — carve out a break from your own leave.</div>`
    : `<div class="step__q">✨ Best breaks in <b>${monthName} 2027</b> — add the ones you like.</div>`;

  const card = (o) => {
    const s = dateOf(o.start), e = dateOf(o.end);
    const added = !!breakByRange(o.start, o.end);
    const pill = o.leave === 0
      ? `<span class="pill pill--free">Free! ${o.span} days off, 0 leave</span>`
      : `<span class="pill">Take ${o.leave} → get ${o.span} days off</span>
         <span class="pill pill--ratio">1 leave buys ${(o.span / o.leave).toFixed(1)} days</span>`;
    return `
      <div class="opp ${added ? 'opp--planned' : ''}">
        <div class="opp__range">${prettyDate(s)} → ${prettyDate(e)}</div>
        <div class="opp__pills">${pill}</div>
        <button class="btn ${added ? 'btn--on' : ''}" data-range="${o.start}_${o.end}">
          ${added ? '✓ Added to plan' : '➕ Add to plan'}
        </button>
      </div>`;
  };

  if (bridges.length) html += '<div class="opp-grid">' + bridges.map(card).join('') + '</div>';
  if (freebies.length) {
    html += '<h4>Free long weekends (0 leave)</h4>'
      + '<div class="opp-grid">' + freebies.map(card).join('') + '</div>';
  }
  if (noHoliday) {
    html += `<p class="muted">Add one, then pick where to go — I'll recommend the best countries to visit in ${monthName}.</p>`;
  }
  host.innerHTML = html;

  host.querySelectorAll('[data-range]').forEach((b) => {
    b.onclick = () => {
      const [start, end] = b.dataset.range.split('_');
      const existing = breakByRange(start, end);
      if (existing) removeBreak(existing.id);
      else addBreak(pool.find((o) => o.start === start && o.end === end));
      render('plan');
    };
  });
}

function adjusterHTML(b) {
  const s = dateOf(b.start), e = dateOf(b.end);
  const leave = leaveDaysInRange(b.start, b.end);
  const span = daysBetween(s, e) + 1;
  const ratio = leave.length ? (span / leave.length).toFixed(1) : null;
  return `
    <div class="adjuster">
      <div class="adjuster__side">
        <span class="muted">Start earlier</span>
        <div><button class="btn btn--round" data-adj="${b.id}:start+1">＋</button>
        <button class="btn btn--round" data-adj="${b.id}:start-1">－</button></div>
      </div>
      <div class="adjuster__mid">
        <div class="adjuster__range">${prettyDate(s)} → ${prettyDate(e)}</div>
        <div class="adjuster__stats">
          <span class="pill">${span} days off</span>
          <span class="pill">${leave.length} leave day${leave.length === 1 ? '' : 's'}</span>
          ${ratio ? `<span class="pill pill--ratio">1 leave buys ${ratio} days</span>` : '<span class="pill pill--free">Free long weekend</span>'}
        </div>
        <div class="adjuster__leave">${leave.length ? 'Leave: ' + leave.map((d) => prettyDate(dateOf(d))).join(', ') : 'No leave needed 🎉'}</div>
      </div>
      <div class="adjuster__side">
        <span class="muted">End later</span>
        <div><button class="btn btn--round" data-adj="${b.id}:end+1">＋</button>
        <button class="btn btn--round" data-adj="${b.id}:end-1">－</button></div>
      </div>
    </div>`;
}

function destinationsHTML(b) {
  const monthNum = b.month + 1;
  const free = isFreeBreak(b);

  const countryCard = (c, rec) => {
    const km = haversineKm(HK, c);
    const on = b.countries.includes(c.name);
    return `
      <div class="country ${on ? 'country--on' : ''}" data-pick="${b.id}:${c.name}">
        <div class="country__flag">${c.flag}</div>
        <div class="country__body">
          <div class="country__name">${c.name} ${rec ? '<span class="tag tag--rec">in season</span>' : ''}</div>
          <div class="country__blurb">${c.blurb}</div>
          <div class="country__meta">✈️ ${Math.round(km).toLocaleString()} km · ~${fmtHours(flightHours(km))} · 👗 ${c.dress.name} ${c.dress.emoji}</div>
        </div>
        <div class="country__pick">${on ? '✓' : '+'}</div>
      </div>`;
  };

  if (free) {
    // Free long weekend: only short-haul escapes, no region step.
    const list = NEARBY_COUNTRIES.slice().sort((a, b2) => {
      const ra = a.months.includes(monthNum), rb = b2.months.includes(monthNum);
      if (ra !== rb) return ra ? -1 : 1;
      return haversineKm(HK, a) - haversineKm(HK, b2);
    });
    return `
      <div class="dest">
        <div class="dest__q">✈️ It's a short break — here's everywhere within ~${NEARBY_HOURS} hours of Hong Kong.</div>
        <div class="country-grid">${list.map((c) => countryCard(c, c.months.includes(monthNum))).join('')}</div>
      </div>`;
  }

  // Longer break: choose a region, then a country.
  let html = '<div class="dest"><div class="dest__q">🌏 Where to? Pick a region.</div><div class="chips">';
  html += Object.keys(REGIONS).map((r) =>
    `<button class="chip ${b.region === r ? 'chip--active' : ''}" data-region="${b.id}:${r}">${r}</button>`).join('');
  html += '</div>';

  if (b.region) {
    const inList = REGIONS[b.region];
    const rec = inList.filter((c) => c.months.includes(monthNum));
    const other = inList.filter((c) => !c.months.includes(monthNum));
    html += `<div class="dest__q dest__q--sub">${b.region} in ${MONTH_NAMES[b.month]}</div>`;
    html += rec.length
      ? '<h4>Recommended right now</h4><div class="country-grid">' + rec.map((c) => countryCard(c, true)).join('') + '</div>'
      : '<p class="muted">Nothing is peak-season here this month, but these are still open:</p>';
    if (other.length) {
      html += '<h4 class="muted-h">Also possible</h4><div class="country-grid">' + other.map((c) => countryCard(c, false)).join('') + '</div>';
    }
  }
  html += '</div>';
  return html;
}

function renderPlan() {
  const host = $('#plan-list');
  if (!state.breaks.length) { host.innerHTML = ''; return; }
  const ordered = state.breaks.slice().sort((a, b) =>
    dateOf(a.start) - dateOf(b.start));

  host.innerHTML = ordered.map((b) => {
    const chosen = b.countries.map((n) => {
      const c = countryByName.get(n);
      return `<span class="chosen">${c.flag} ${c.name}</span>`;
    }).join('');
    return `
      <div class="pbreak">
        <div class="pbreak__head">
          <span class="pbreak__month">${MONTH_NAMES[b.month]}</span>
          <button class="btn btn--ghost btn--sm" data-remove="${b.id}">🗑️ Remove</button>
        </div>
        ${adjusterHTML(b)}
        ${destinationsHTML(b)}
        ${chosen ? `<div class="pbreak__chosen">Going to: ${chosen}</div>` : ''}
      </div>`;
  }).join('');

  host.querySelectorAll('[data-remove]').forEach((el) => {
    el.onclick = () => { removeBreak(Number(el.dataset.remove)); render('plan'); };
  });
  host.querySelectorAll('[data-adj]').forEach((el) => {
    el.onclick = () => {
      const [id, op] = el.dataset.adj.split(':');
      const b = state.breaks.find((x) => x.id === Number(id));
      if (!b) return;
      if (op === 'start+1') b.start = isoOf(addDays(dateOf(b.start), -1));
      if (op === 'start-1') b.start = isoOf(addDays(dateOf(b.start), 1));
      if (op === 'end+1') b.end = isoOf(addDays(dateOf(b.end), 1));
      if (op === 'end-1') b.end = isoOf(addDays(dateOf(b.end), -1));
      if (dateOf(b.start) > dateOf(b.end)) b.start = b.end;
      render('plan');
    };
  });
  host.querySelectorAll('[data-region]').forEach((el) => {
    el.onclick = () => {
      const [id, region] = el.dataset.region.split(':');
      const b = state.breaks.find((x) => x.id === Number(id));
      if (b) b.region = region;
      render('plan');
    };
  });
  host.querySelectorAll('[data-pick]').forEach((el) => {
    const [id, name] = el.dataset.pick.split(':');
    el.onclick = () => {
      const b = state.breaks.find((x) => x.id === Number(id));
      if (!b) return;
      const i = b.countries.indexOf(name);
      if (i >= 0) b.countries.splice(i, 1);
      else { b.countries.push(name); focusCountry = name; }
      render('journey');
    };
    el.onmouseenter = () => { focusCountry = name; renderAvatar(); };
  });
}

function renderAvatar() {
  const host = $('#avatar');
  const names = allSelectedCountries();
  const focus = focusCountry && countryByName.get(focusCountry)
    ? countryByName.get(focusCountry)
    : (names.length ? countryByName.get(names[names.length - 1]) : null);

  const dress = focus ? focus.dress : { name: 'travel pyjamas', emoji: '🧳' };
  const flag = focus ? focus.flag : '🌏';
  const caption = focus
    ? `Dressed for <b>${focus.name}</b> — ${dress.name} ${dress.emoji}`
    : "Pick a country and I'll try on the outfit!";

  host.innerHTML = `
    <div class="pet">
      <div class="pet__flag">${flag}</div>
      <div class="pet__body">
        <div class="pet__ear pet__ear--l"></div>
        <div class="pet__ear pet__ear--r"></div>
        <div class="pet__face">
          <span class="pet__eye"></span><span class="pet__eye"></span>
          <span class="pet__cheek pet__cheek--l"></span><span class="pet__cheek pet__cheek--r"></span>
          <span class="pet__mouth"></span>
        </div>
        <div class="pet__dress">${dress.emoji}</div>
        <div class="pet__arm pet__arm--l"></div>
        <div class="pet__arm pet__arm--r"></div>
      </div>
    </div>
    <div class="pet__caption">${caption}</div>`;
}

function renderJourney() {
  const host = $('#rtw');
  const names = allSelectedCountries();
  if (!names.length) { host.innerHTML = ''; return; }
  const { order, km } = optimiseRoute(names);
  let legs = '';
  let totalHours = 0;
  for (let i = 0; i < order.length - 1; i++) {
    const legKm = haversineKm(order[i], order[i + 1]);
    totalHours += flightHours(legKm);
    legs += `<li><span>${order[i].flag} ${order[i].name}</span><span class="leg__arrow">→</span>
             <span>${order[i + 1].flag} ${order[i + 1].name}</span>
             <span class="leg__meta">${Math.round(legKm).toLocaleString()} km · ~${fmtHours(flightHours(legKm))}</span></li>`;
  }
  const multiRegion = new Set(names.map((n) => countryByName.get(n).region)).size > 1;
  host.innerHTML = `
    <div class="step__q">${multiRegion ? '🌐 Optimised round-the-world route' : '🧭 Your route'}</div>
    <p class="muted">Reordered to minimise total flying, looping back to Hong Kong.</p>
    <ol class="legs">${legs}</ol>
    <div class="rtw__totals">
      <span class="pill">${Math.round(km).toLocaleString()} km total</span>
      <span class="pill">~${fmtHours(totalHours)} in the air</span>
      <span class="pill">${names.length} countr${names.length === 1 ? 'y' : 'ies'}</span>
    </div>`;
}

function renderSummary() {
  const host = $('#summary');
  if (!state.breaks.length) {
    host.innerHTML = '<div class="step__q">📊 Year summary</div><p class="muted">Add a break above and your yearly totals will appear here.</p>';
    return;
  }
  const ordered = state.breaks.slice().sort((a, b) => dateOf(a.start) - dateOf(b.start));
  const leaveSet = new Set();
  const offSet = new Set();

  const rows = ordered.map((b) => {
    const leave = leaveDaysInRange(b.start, b.end);
    leave.forEach((d) => leaveSet.add(d));
    for (let d = dateOf(b.start); d <= dateOf(b.end); d = addDays(d, 1)) offSet.add(isoOf(d));
    const span = daysBetween(dateOf(b.start), dateOf(b.end)) + 1;
    const countries = b.countries.map((n) => countryByName.get(n).flag).join(' ') || '—';
    return `<tr>
      <td>${MONTH_NAMES[b.month]}</td>
      <td>${prettyDate(dateOf(b.start))} → ${prettyDate(dateOf(b.end))}</td>
      <td class="num">${leave.length}</td>
      <td class="num">${span}</td>
      <td>${countries}</td>
    </tr>`;
  }).join('');

  const totalLeave = leaveSet.size;
  const totalOff = offSet.size;
  const ratio = totalLeave ? (totalOff / totalLeave).toFixed(2) : '∞';

  host.innerHTML = `
    <div class="step__q">📊 Year summary — 2027</div>
    <table class="summary-table">
      <thead><tr><th>Month</th><th>Break</th><th>Leave</th><th>Days off</th><th>Countries</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals">
      <div class="total total--leave"><div class="total__num">${totalLeave}</div><div class="total__lbl">leave days used all year</div></div>
      <div class="total total--off"><div class="total__num">${totalOff}</div><div class="total__lbl">total days off gained</div></div>
      <div class="total total--ratio"><div class="total__num">${ratio}×</div><div class="total__lbl">every 1 leave day buys ${ratio} days off</div></div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Flow: reveal each step as its prerequisite is met, and gently scroll to a
// step the moment it unlocks so the app feels like a guided conversation.
// ---------------------------------------------------------------------------

function visibility() {
  const anyCountry = state.breaks.some((b) => b.countries.length);
  return {
    'step-month': true,
    'step-breaks': state.month !== null,
    'step-plan': state.breaks.length > 0,
    'step-journey': anyCountry,
    'step-summary': state.breaks.length > 0,
  };
}

function updateFlow(scrollTo) {
  const vis = visibility();
  let unlocked = null;
  for (const id of Object.keys(vis)) {
    const el = document.getElementById(id);
    el.classList.toggle('step--hidden', !vis[id]);
    if (vis[id] && !prevVisible[id]) unlocked = id;
    prevVisible[id] = vis[id];
  }
  const targetId = { breaks: 'step-breaks', plan: 'step-plan', journey: 'step-journey' }[scrollTo];
  const target = targetId && vis[targetId] ? targetId : unlocked;
  if (target) {
    const el = document.getElementById(target);
    requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
}

function render(scrollTo) {
  renderMonthPicker();
  renderOpportunities();
  renderPlan();
  renderAvatar();
  renderJourney();
  renderSummary();
  updateFlow(scrollTo);
}

document.addEventListener('DOMContentLoaded', () => render());
