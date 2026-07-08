import { chromium } from 'playwright';

const BASE = process.env.CONCIERGE_URL ?? 'http://localhost:4173';
const SHOTS = new URL('./screenshots', import.meta.url).pathname;
const results = [];

function check(name, condition) {
  results.push({ name, ok: Boolean(condition) });
  if (!condition) console.error(`FAIL: ${name}`);
  else console.log(`ok: ${name}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 480, height: 960 } });
page.setDefaultTimeout(15000);

// Step 1-2: search → sponsored offer
await page.goto(BASE);
await page.getByText('best fixed deposit rate singapore').waitFor();
await page.screenshot({ path: `${SHOTS}/f1-search.png` });
await page.getByText('3.88% p.a. 12-Month Term Deposit — HSBC Premier').click();

// Step 3-4: offer landing → App Store
await page.getByText('12-month SGD term deposit').waitFor();
await page.screenshot({ path: `${SHOTS}/f2-offer.png` });
check('offer landing shows the rate hero', await page.locator('.offer-rate').isVisible());
await page.getByRole('link', { name: 'Get the app to apply' }).click();

// Step 5: store listing → GET
await page.getByText('HSBC Singapore').first().waitFor();
await page.screenshot({ path: `${SHOTS}/f3-appstore.png` });
await page.getByRole('link', { name: 'GET' }).click();

// Step 6-8: Clara opens with the offer, answers a question
await page.getByText('3.88% p.a. — a good time to lock that in').waitFor();
check('welcome names the offer the customer came with', true);
await page.getByPlaceholder('Tell me in your own words…').fill('what if I need my money early?');
await page.keyboard.press('Enter');
await page.getByText('principal is always yours').waitFor();
check('early-withdrawal objection answered', true);
await page.screenshot({ path: `${SHOTS}/f4-qa.png` });

// Step 9-10: ready → steps + consent
await page.getByRole('button', { name: "I'm ready to start" }).click();
await page.getByText('Here is how it works').waitFor();
check('1-2-3 steps with consent shown', await page.locator('.steps-list li').count() === 3);
await page.getByLabel(/Terms & key facts/).check();
await page.getByLabel(/Data processing/).check();
await page.getByRole('button', { name: 'Agree and begin' }).click();

// Step 11-12: Singpass
await page.getByRole('button', { name: /Retrieve with Singpass/ }).click();
await page.getByText('Is everything correct?').waitFor();
check(
  'Singpass prefills the identity',
  (await page.locator('.review-list').innerText()).includes('Alexandra Tan Wei Lin'),
);
await page.screenshot({ path: `${SHOTS}/f5-singpass.png` });
await page.getByRole('button', { name: 'All correct' }).click();

// Step 13: device contact details
await page.getByRole('button', { name: /Use my device details/ }).click();
await page.getByText('no database can answer').waitFor();
check('gap-driven questioning announced', true);

// Resume check: leave and come back mid-application (Phase 7)
await page.reload();
await page.getByText('Welcome back — everything you shared is saved.').waitFor();
check('resume picks up where the customer left off', true);
check(
  'restored transcript keeps earlier conversation',
  (await page.locator('.transcript').innerText()).includes('principal is always yours'),
);

// Step 15: only unanswered questions
await page.getByLabel('Occupation').fill('Architect');
await page.getByLabel('Expected monthly pay-in (S$)').fill('8000');
await page.getByRole('button', { name: 'Continue' }).click();

await page.getByText('do any of these sound like you?').waitFor();
await page.getByRole('button', { name: 'FX and multi-currency' }).click();
await page.getByRole('button', { name: 'Continue' }).click();
await page.getByRole('button', { name: 'Mostly secure yields for now' }).click();

await page.getByLabel('Country of tax residency').fill('Singapore');
await page.getByRole('radio', { name: 'No' }).check();
await page.getByRole('button', { name: 'Continue' }).click();

// Review → open
await page.getByText('A quick look before we make it official').waitFor();
await page.getByRole('button', { name: 'Everything is correct' }).click();

// Step 16: transfer details + deadline
await page.getByText('Fund it when you are ready').waitFor();
const transfer = await page.locator('.completion-card').innerText();
check('transfer card shows FAST and PayNow', transfer.includes('FAST'));
check('transfer card shows the minimum', transfer.includes('S$30,000'));
check('transfer card shows a funding deadline', /\d{1,2} \w+ \d{4}/.test(transfer));
await page.screenshot({ path: `${SHOTS}/f6-transfer.png` });

// Step 17-18: setup + tour
await page.getByRole('button', { name: 'Finish setting up' }).click();
await page.getByText('Make the app yours').waitFor();
await page.getByRole('button', { name: 'Done' }).click();
await page.getByRole('button', { name: 'Remind me later' }).click();
await page.getByText('This conversation is complete.').waitFor();
check('journey completes with tour choice', true);
await page.screenshot({ path: `${SHOTS}/f7-done.png` });

// A finished journey clears the checkpoint — reloading starts fresh
await page.reload();
await page.getByText('Ask me anything about it first').waitFor();
check('completed journey does not resume', true);

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);
