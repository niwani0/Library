'use strict';

// ---------------------------------------------------------------------------
// Date helpers (all local-time; ISO strings built by hand to avoid UTC drift)
// ---------------------------------------------------------------------------

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const holidaySet = new Set(HOLIDAYS.map((h) => h.date));
const holidayByDate = new Map(HOLIDAYS.map((h) => [h.date, h]));

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

// Count working days strictly between the end of one run and the start of the next.
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
    // Grow outward from the anchor run, bridging up to 3 neighbours each side.
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

  // Best efficiency first; for ties prefer the longer break, then fewer leaves.
  candidates.sort((a, b) => {
    if (b.ratio !== a.ratio) return b.ratio - a.ratio;
    if (b.span !== a.span) return b.span - a.span;
    return a.leave - b.leave;
  });

  // Drop a candidate fully contained in an already-kept, more-efficient one.
  const kept = [];
  for (const c of candidates) {
    const cs = dateOf(c.start), ce = dateOf(c.end);
    const covered = kept.some((k) => dateOf(k.start) <= cs && dateOf(k.end) >= ce);
    if (!covered) kept.push(c);
  }
  return kept.slice(0, 5);
}

// Return the exact working (leave) days inside an inclusive [startIso, endIso] range.
function leaveDaysInRange(startIso, endIso) {
  const out = [];
  for (let d = dateOf(startIso); d <= dateOf(endIso); d = addDays(d, 1)) {
    if (isWorkday(d)) out.push(isoOf(d));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Feature 10: one-leave long-weekend wins. A holiday on Thursday becomes a
// four-day weekend by taking the Friday; a Tuesday holiday by taking the Monday.
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

// Cruise ~850 km/h plus ~1.5h for taxi/climb/descent; a friendly estimate, not an ETA.
function flightHours(km) {
  return km / 850 + 1.5;
}

function fmtHours(h) {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return mins ? `${whole}h ${mins}m` : `${whole}h`;
}

const countryByName = new Map();
for (const region of Object.keys(REGIONS)) {
  for (const c of REGIONS[region]) countryByName.set(c.name, { ...c, region });
}

// ---------------------------------------------------------------------------
// Feature 8: order selected countries into an efficient round-the-world loop
// starting and ending in Hong Kong. Nearest-neighbour, then 2-opt clean-up.
// ---------------------------------------------------------------------------

function nodesFor(names) {
  return [{ name: 'Hong Kong', flag: '🇭🇰', lat: HK.lat, lng: HK.lng, hk: true }]
    .concat(names.map((n) => countryByName.get(n)));
}

function routeDistance(order) {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) {
    total += haversineKm(order[i], order[i + 1]);
  }
  return total;
}

function optimiseRoute(names) {
  const nodes = nodesFor(names);
  if (nodes.length <= 2) {
    const loop = nodes.concat([nodes[0]]);
    return { order: loop, km: routeDistance(loop) };
  }

  // Nearest-neighbour tour from Hong Kong.
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
  tour.push(nodes[0]); // close the loop back to Hong Kong

  // 2-opt: reverse segments while it shortens the closed loop (endpoints fixed).
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
// Plan state. One trip per month; each trip stores its date range, leave days
// and any selected countries.
// ---------------------------------------------------------------------------

const plan = {}; // month index -> { start, end, countries: [] }
const ui = { month: null, region: null, focusCountry: null };

function tripLeaveDays(trip) {
  return leaveDaysInRange(trip.start, trip.end);
}

function allSelectedCountries() {
  const names = [];
  for (const m of Object.keys(plan)) {
    for (const n of plan[m].countries) if (!names.includes(n)) names.push(n);
  }
  return names;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const $ = (sel) => document.querySelector(sel);

function renderMonthPicker() {
  const wrap = $('#month-picker');
  wrap.innerHTML = '';
  for (let m = 0; m < 12; m++) {
    const btn = document.createElement('button');
    btn.className = 'chip' + (ui.month === m ? ' chip--active' : '') + (plan[m] ? ' chip--planned' : '');
    btn.textContent = MONTH_NAMES[m].slice(0, 3);
    btn.onclick = () => { ui.month = m; ui.region = null; renderAll(); };
    wrap.appendChild(btn);
  }
}

function renderOpportunities() {
  const host = $('#opportunities');
  if (ui.month === null) {
    host.innerHTML = '<p class="muted">Pick a month above to see its best leave-maximising breaks. 🗓️</p>';
    return;
  }
  const opps = opportunitiesForMonth(ui.month);
  const bridges = opps.filter((o) => o.leave > 0);
  const freebies = opps.filter((o) => o.leave === 0);

  let html = `<h3>Best maximisers in ${MONTH_NAMES[ui.month]} 2027</h3>`;
  if (!opps.length) {
    html += '<p class="muted">No public holidays anchor this month — a plain leave day here buys exactly one day off.</p>';
  }

  const card = (o, i) => {
    const s = dateOf(o.start), e = dateOf(o.end);
    const leaveDays = leaveDaysInRange(o.start, o.end);
    const planned = plan[ui.month] && plan[ui.month].start === o.start && plan[ui.month].end === o.end;
    const ratioLabel = o.leave === 0
      ? `<span class="pill pill--free">Free! ${o.span} days off, 0 leave</span>`
      : `<span class="pill">Take ${o.leave} → get ${o.span} days off</span>
         <span class="pill pill--ratio">1 leave buys ${(o.span / o.leave).toFixed(1)} days</span>`;
    return `
      <div class="opp ${planned ? 'opp--planned' : ''}">
        <div class="opp__range">${prettyDate(s)} → ${prettyDate(e)}</div>
        <div class="opp__pills">${ratioLabel}</div>
        <div class="opp__leave">Leave days: ${leaveDays.length ? leaveDays.map((d) => prettyDate(dateOf(d))).join(', ') : '— none —'}</div>
        <button class="btn ${planned ? 'btn--on' : ''}" data-add="${i}">
          ${planned ? '✓ In your plan' : '➕ Add to plan'}
        </button>
      </div>`;
  };

  if (bridges.length) {
    html += '<div class="opp-grid">' + bridges.map((o) => card(o, opps.indexOf(o))).join('') + '</div>';
  }
  if (freebies.length) {
    html += '<h4>Free long weekends (0 leave)</h4>';
    html += '<div class="opp-grid">' + freebies.map((o) => card(o, opps.indexOf(o))).join('') + '</div>';
  }
  host.innerHTML = html;

  host.querySelectorAll('[data-add]').forEach((b) => {
    b.onclick = () => {
      const o = opps[Number(b.dataset.add)];
      plan[ui.month] = { start: o.start, end: o.end, countries: plan[ui.month] ? plan[ui.month].countries : [] };
      renderAll();
    };
  });
}

function renderAdjuster() {
  const host = $('#adjuster');
  if (ui.month === null || !plan[ui.month]) { host.innerHTML = ''; return; }
  const trip = plan[ui.month];
  const s = dateOf(trip.start), e = dateOf(trip.end);
  const leave = tripLeaveDays(trip);
  const span = daysBetween(s, e) + 1;
  host.innerHTML = `
    <h3>Fine-tune your ${MONTH_NAMES[ui.month]} break</h3>
    <div class="adjuster">
      <div class="adjuster__side">
        <span class="muted">Before</span>
        <div><button class="btn btn--round" data-adj="start-1">－</button>
        <button class="btn btn--round" data-adj="start+1">＋</button></div>
      </div>
      <div class="adjuster__mid">
        <div class="adjuster__range">${prettyDate(s)} → ${prettyDate(e)}</div>
        <div class="adjuster__stats">
          <span class="pill">${span} days off</span>
          <span class="pill">${leave.length} leave day${leave.length === 1 ? '' : 's'}</span>
          ${leave.length ? `<span class="pill pill--ratio">1 leave buys ${(span / leave.length).toFixed(1)} days</span>` : '<span class="pill pill--free">All free</span>'}
        </div>
      </div>
      <div class="adjuster__side">
        <span class="muted">After</span>
        <div><button class="btn btn--round" data-adj="end-1">－</button>
        <button class="btn btn--round" data-adj="end+1">＋</button></div>
      </div>
    </div>
    <button class="btn btn--ghost" data-adj="remove">🗑️ Remove this break</button>`;

  host.querySelectorAll('[data-adj]').forEach((b) => {
    b.onclick = () => {
      const act = b.dataset.adj;
      if (act === 'remove') { delete plan[ui.month]; renderAll(); return; }
      if (act === 'start-1') trip.start = isoOf(addDays(dateOf(trip.start), 1));
      if (act === 'start+1') trip.start = isoOf(addDays(dateOf(trip.start), -1));
      if (act === 'end-1') trip.end = isoOf(addDays(dateOf(trip.end), -1));
      if (act === 'end+1') trip.end = isoOf(addDays(dateOf(trip.end), 1));
      if (dateOf(trip.start) > dateOf(trip.end)) trip.start = trip.end;
      renderAll();
    };
  });
}

function renderRegions() {
  const host = $('#region-picker');
  if (ui.month === null) { host.innerHTML = ''; return; }
  host.innerHTML = '<h3>Where to go? Pick a region</h3><div class="chips" id="region-chips"></div>';
  const chips = $('#region-chips');
  for (const region of Object.keys(REGIONS)) {
    const btn = document.createElement('button');
    btn.className = 'chip' + (ui.region === region ? ' chip--active' : '');
    btn.textContent = region;
    btn.onclick = () => { ui.region = region; renderCountries(); renderRegions(); };
    chips.appendChild(btn);
  }
}

function renderCountries() {
  const host = $('#countries');
  if (ui.month === null || !ui.region) { host.innerHTML = ''; return; }
  const monthNum = ui.month + 1;
  const list = REGIONS[ui.region];
  const recommended = list.filter((c) => c.months.includes(monthNum));
  const others = list.filter((c) => !c.months.includes(monthNum));
  const selected = plan[ui.month] ? plan[ui.month].countries : [];

  const card = (c, rec) => {
    const km = haversineKm(HK, c);
    const on = selected.includes(c.name);
    return `
      <div class="country ${on ? 'country--on' : ''}" data-country="${c.name}">
        <div class="country__flag">${c.flag}</div>
        <div class="country__body">
          <div class="country__name">${c.name} ${rec ? '<span class="tag tag--rec">in season</span>' : '<span class="tag">off-peak</span>'}</div>
          <div class="country__blurb">${c.blurb}</div>
          <div class="country__meta">✈️ ${Math.round(km).toLocaleString()} km from HK · ~${fmtHours(flightHours(km))} · 👗 ${c.dress.name} ${c.dress.emoji}</div>
        </div>
        <div class="country__pick">${on ? '✓' : '+'}</div>
      </div>`;
  };

  let html = `<h3>${ui.region} in ${MONTH_NAMES[ui.month]}</h3>`;
  html += recommended.length
    ? '<h4>Recommended right now</h4><div class="country-grid">' + recommended.map((c) => card(c, true)).join('') + '</div>'
    : '<p class="muted">Nothing is peak-season here this month — but these are still open:</p>';
  if (others.length) {
    html += '<h4 class="muted-h">Also possible</h4><div class="country-grid">' + others.map((c) => card(c, false)).join('') + '</div>';
  }
  host.innerHTML = html;

  host.querySelectorAll('[data-country]').forEach((el) => {
    const name = el.dataset.country;
    el.onclick = () => {
      if (!plan[ui.month]) {
        // Selecting a country before a break exists seeds a minimal one-day trip.
        const seed = isoOf(new Date(YEAR, ui.month, 1));
        plan[ui.month] = { start: seed, end: seed, countries: [] };
      }
      const arr = plan[ui.month].countries;
      const idx = arr.indexOf(name);
      if (idx >= 0) arr.splice(idx, 1);
      else { arr.push(name); ui.focusCountry = name; }
      renderAll();
    };
    el.onmouseenter = () => { ui.focusCountry = name; renderAvatar(); };
  });
}

// Cute avatar that "wears" the traditional dress of the focused country.
function renderAvatar() {
  const host = $('#avatar');
  const names = allSelectedCountries();
  const focus = ui.focusCountry && countryByName.get(ui.focusCountry)
    ? countryByName.get(ui.focusCountry)
    : (names.length ? countryByName.get(names[names.length - 1]) : null);

  const dress = focus ? focus.dress : { name: 'travel pyjamas', emoji: '🧳' };
  const flag = focus ? focus.flag : '🌏';
  const caption = focus
    ? `Dressed for <b>${focus.name}</b> — ${dress.name} ${dress.emoji}`
    : 'Pick a country and I\'ll try on the outfit!';

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

function renderRTW() {
  const host = $('#rtw');
  const names = allSelectedCountries();
  if (names.length === 0) { host.innerHTML = ''; return; }
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
    <h3>${multiRegion ? '🌐 Optimised round-the-world route' : '🧭 Your route'}</h3>
    <p class="muted">Reordered to minimise total flying, looping back to Hong Kong.</p>
    <ol class="legs">${legs}</ol>
    <div class="rtw__totals">
      <span class="pill">${Math.round(km).toLocaleString()} km total</span>
      <span class="pill">~${fmtHours(totalHours)} in the air</span>
      <span class="pill">${names.length} countr${names.length === 1 ? 'y' : 'ies'}</span>
    </div>`;
}

function renderWins() {
  const host = $('#wins');
  const wins = longWeekendWins();
  const thursday = wins.filter((w) => w.kind === 'thursday');
  const tuesday = wins.filter((w) => w.kind === 'tuesday');
  const winCard = (w) => {
    const d = dateOf(w.date);
    return `<div class="win">
      <div class="win__day">${DOW_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}</div>
      <div class="win__name">${w.name}</div>
      <div class="win__tip">Take the ${w.takeLabel} (${prettyDate(dateOf(w.take))}) → <b>4-day weekend for 1 leave</b></div>
    </div>`;
  };
  host.innerHTML = `
    <h3>⚡ One-leave long-weekend wins</h3>
    <p class="muted">${thursday.length} holiday${thursday.length === 1 ? '' : 's'} land on a Thursday in 2027 — add the Friday and each becomes a four-day weekend for a single leave day.</p>
    <div class="win-grid">${thursday.map(winCard).join('')}</div>
    ${tuesday.length ? `<h4>Bonus — Tuesday holidays (take the Monday)</h4><div class="win-grid">${tuesday.map(winCard).join('')}</div>` : ''}`;
}

function renderSummary() {
  const host = $('#summary');
  const months = Object.keys(plan).map(Number).sort((a, b) => a - b);
  if (!months.length) {
    host.innerHTML = '<h3>📊 Year summary</h3><p class="muted">Add a break to a month and your yearly totals will appear here.</p>';
    return;
  }
  const leaveSet = new Set();
  let totalOff = 0;
  const rows = months.map((m) => {
    const trip = plan[m];
    const leave = tripLeaveDays(trip);
    leave.forEach((d) => leaveSet.add(d));
    const span = daysBetween(dateOf(trip.start), dateOf(trip.end)) + 1;
    totalOff += span;
    const countries = trip.countries.map((n) => countryByName.get(n).flag).join(' ') || '—';
    return `<tr>
      <td>${MONTH_NAMES[m]}</td>
      <td>${prettyDate(dateOf(trip.start))} → ${prettyDate(dateOf(trip.end))}</td>
      <td class="num">${leave.length}</td>
      <td class="num">${span}</td>
      <td>${countries}</td>
    </tr>`;
  }).join('');

  const totalLeave = leaveSet.size;
  const ratio = totalLeave ? (totalOff / totalLeave).toFixed(2) : '∞';

  host.innerHTML = `
    <h3>📊 Year summary — 2027</h3>
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

function renderAll() {
  renderMonthPicker();
  renderOpportunities();
  renderAdjuster();
  renderRegions();
  renderCountries();
  renderAvatar();
  renderRTW();
  renderWins();
  renderSummary();
}

document.addEventListener('DOMContentLoaded', renderAll);
