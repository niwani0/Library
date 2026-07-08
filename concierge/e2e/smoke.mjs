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
const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
page.setDefaultTimeout(15000);

// ---- Happy path ----
await page.goto(BASE);
// Type a question via keyboard DURING the welcome reveal — it must queue, not vanish
await page.getByPlaceholder('Tell me in your own words…').fill('why do you need my information?');
await page.keyboard.press('Enter');
await page.getByText('Fair question.').waitFor();
check('free text typed mid-reveal is queued and answered', true);
await page.getByText('what brings you to us today').waitFor();
check('welcome opens with the goal question', true);
await page.screenshot({ path: `${SHOTS}/01-welcome.png` });

// Free text goal (exercise the interpreter through the UI)
await page.getByPlaceholder('Tell me in your own words…').fill('I travel a lot and get paid in dollars');
await page.getByRole('button', { name: 'Send' }).click();
await page.getByText('where does your annual income sit').waitFor();
check('free-text goal understood, income asked', true);

await page.getByRole('button', { name: '£25k – £75k' }).click();
await page.getByText('HSBC Global Money').waitFor();
check('international goal → HSBC Global Money recommended', true);
await page.screenshot({ path: `${SHOTS}/02-recommendation.png` });

// Why-we-ask side channel
await page.getByRole('button', { name: 'Open this account' }).click();
await page.getByLabel('Full legal name').waitFor();
await page.getByPlaceholder('Ask a question at any time…').fill('why do you need my details?');
await page.getByRole('button', { name: 'Send' }).last().click();
await page.getByText('protects you as much as it protects us').waitFor();
check('why-question answered with reassurance', true);

// Identity form
await page.getByLabel('Full legal name').fill('Amelia Chen');
await page.getByLabel('Date of birth').fill('1990-04-12');
await page.getByLabel('Nationality').fill('British');
await page.getByLabel('Country of residence').fill('United Kingdom');
await page.getByLabel('Residential address').fill('12 Harbour Street, London, N1 4AB');
await page.getByLabel('Email').fill('amelia@example.com');
await page.getByLabel('Phone').fill('+44 7700 900123');
await page.screenshot({ path: `${SHOTS}/03-identity.png` });
await page.getByRole('button', { name: 'Continue' }).click();

// Document form
await page.getByLabel('Document number').waitFor();
await page.getByLabel('Document number').fill('X1234567');
await page.getByLabel('Expiry date').fill('2030-05-01');
await page.getByLabel('Issuing country').fill('United Kingdom');
await page.getByRole('button', { name: 'Submit document' }).click();

// Financial form — check pre-filled income band
await page.getByLabel('Occupation').waitFor();
const preset = await page.getByLabel('Annual income').inputValue();
check('income band pre-filled from discovery', preset === '25k-75k');
await page.getByLabel('Occupation').fill('Architect');
await page.getByLabel('Expected monthly pay-in (£)').fill('4000');
await page.getByRole('button', { name: 'Continue' }).click();

// Tax form
await page.getByLabel('Country of tax residency').waitFor();
await page.getByLabel('Country of tax residency').fill('United Kingdom');
await page.getByRole('radio', { name: 'No' }).check();
await page.getByRole('button', { name: 'Continue' }).click();

// Review
await page.getByText('A quick look before we make it official').waitFor();
const reviewText = await page.locator('.prompt-card').innerText();
check('review masks full date of birth', !reviewText.includes('1990-04-12') && reviewText.includes('1990'));
await page.screenshot({ path: `${SHOTS}/04-review.png` });

// Edit a section from the review and come straight back
await page
  .locator('.review-section', { hasText: 'About you' })
  .getByRole('button', { name: 'Change' })
  .click();
await page.getByLabel('Full legal name').waitFor();
check(
  'review edit reopens the form pre-filled',
  (await page.getByLabel('Full legal name').inputValue()) === 'Amelia Chen',
);
await page.getByLabel('Residential address').fill('4 New Wharf Road, London, E1 6AN');
await page.getByRole('button', { name: 'Continue' }).click();
await page.getByText('Updated — here is everything once more.').waitFor();
const editedReview = await page.locator('.prompt-card').innerText();
check('edited address shows in the refreshed review', editedReview.includes('4 New Wharf Road'));
await page.getByRole('button', { name: 'Everything is correct' }).click();

// Consent — button disabled until required ticked
await page.getByText('The agreements').waitFor();
const consentBtn = page.getByRole('button', { name: 'Agree and open my account' });
check('consent gated until required ticks', await consentBtn.isDisabled());
await page.getByLabel(/Terms & key facts/).check();
await page.getByLabel(/Data processing/).check();
await consentBtn.click();

// Funding
await page.getByText('A first deposit?').waitFor();
await page.screenshot({ path: `${SHOTS}/05-funding.png` });
await page.getByRole('button', { name: '£500' }).click();

// Completion
await page.getByRole('heading', { name: 'Welcome to HSBC.' }).waitFor();
const completion = await page.locator('.completion-card').innerText();
check('completion shows account number', /\d{8}/.test(completion));
check('completion shows sort code', completion.includes('40-05-15'));
await page.screenshot({ path: `${SHOTS}/06-complete.png` });

// ---- Decline path is neutral ----
const page2 = await browser.newPage({ viewport: { width: 1024, height: 900 } });
page2.setDefaultTimeout(15000);
await page2.goto(BASE);
await page2.getByRole('button', { name: 'Day-to-day banking' }).click();
await page2.getByRole('button', { name: 'Under £25k' }).click();
await page2.getByRole('button', { name: 'Open this account' }).click();
await page2.getByLabel('Full legal name').fill('Victor Sanction');
await page2.getByLabel('Date of birth').fill('1985-02-02');
await page2.getByLabel('Nationality').fill('British');
await page2.getByLabel('Country of residence').fill('United Kingdom');
await page2.getByLabel('Residential address').fill('9 Long Acre Road, Manchester, M1 5GD');
await page2.getByLabel('Email').fill('victor@example.com');
await page2.getByLabel('Phone').fill('+44 7700 900456');
await page2.getByRole('button', { name: 'Continue' }).click();
await page2.getByLabel('Document number').fill('Y7654321');
await page2.getByLabel('Expiry date').fill('2031-01-01');
await page2.getByLabel('Issuing country').fill('United Kingdom');
await page2.getByRole('button', { name: 'Submit document' }).click();
await page2.getByLabel('Occupation').fill('Consultant');
await page2.getByLabel('Expected monthly pay-in (£)').fill('1500');
await page2.getByRole('button', { name: 'Continue' }).click();
await page2.getByLabel('Country of tax residency').fill('United Kingdom');
await page2.getByRole('radio', { name: 'No' }).check();
await page2.getByRole('button', { name: 'Continue' }).click();
await page2.getByRole('button', { name: 'Everything is correct' }).click();
await page2.getByLabel(/Terms & key facts/).check();
await page2.getByLabel(/Data processing/).check();
await page2.getByRole('button', { name: 'Agree and open my account' }).click();
await page2.getByText('not able to open an account').waitFor();
const body = await page2.locator('body').innerText();
check('decline is neutral (no sanction/risk words)', !/sanction|risk|watchlist|screening/i.test(body.replace('Victor Sanction', '')));
check('decline ends the conversation', body.includes('This conversation is complete.'));
check('journey bar is hidden after a decline', (await page2.locator('.journey').count()) === 0);
await page2.screenshot({ path: `${SHOTS}/07-declined.png` });

// ---- Mobile snapshot ----
const page3 = await browser.newPage({ viewport: { width: 380, height: 800 } });
await page3.goto(BASE);
await page3.getByText('what brings you to us today').waitFor();
await page3.screenshot({ path: `${SHOTS}/08-mobile.png` });
check('renders at 380px', true);

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);
