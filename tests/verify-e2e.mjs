// tests/verify-e2e.mjs - Complete End-to-End Verification of Moodie Meadows
//
// Requires the production preview server: `npm run build && npm run preview -- --port 4173`
// (override the URL with E2E_BASE_URL).
//
// Determinism rules followed here:
//  - Runs in an isolated, throwaway browser profile (see cdp-helper.mjs), and
//    additionally clears ONLY this app's localStorage key before starting, so
//    every run begins as a genuinely fresh player.
//  - Every assertion waits for an observable state (DOM class, text, saved
//    data) instead of sleeping for a fixed time.
//  - Token/star/completion numbers are read from the app's real saved state
//    AND the on-screen HUD at the same moment, and must agree.
import { CDPClient, launchIsolatedBrowser } from './cdp-helper.mjs';
import fs from 'node:fs';

const BASE_URL = (process.env.E2E_BASE_URL || 'http://localhost:4173/').replace(/\/?$/, '/');
const SCREENSHOT_DIR = 'tests/screenshots';
const RESULTS_FILE = 'tests/verification-results.json';

// ---------------------------------------------------------------------------
// Derive the storage key and reward constants from the app source, so the test
// can never silently read the wrong key (the previous suite read a key the app
// never wrote, which is why it reported "0 completed landmarks").
// ---------------------------------------------------------------------------
const stateSource = fs.readFileSync('src/meadowState.ts', 'utf8');
function sourceConst(regex, name) {
  const m = stateSource.match(regex);
  if (!m) throw new Error(`Could not read ${name} from src/meadowState.ts; update tests/verify-e2e.mjs.`);
  return m[1];
}
const STORAGE_KEY = sourceConst(/export const STORAGE_KEY\s*=\s*["']([^"']+)["']/, 'STORAGE_KEY');
const ADVENTURE_STARS = Number(sourceConst(/export const ADVENTURE_STARS\s*=\s*(\d+)/, 'ADVENTURE_STARS'));
const rewardBlock = sourceConst(/export const rewardValues\s*=\s*\{([^}]*)\}/, 'rewardValues');
const rewardOf = (k) => Number((rewardBlock.match(new RegExp(`${k}\\s*:\\s*(\\d+)`)) || [])[1]);
const ADVENTURE_TOKENS = rewardOf('identify') + rewardOf('skill') + rewardOf('complete');
if (!Number.isInteger(ADVENTURE_TOKENS) || ADVENTURE_TOKENS <= 0) {
  throw new Error('Could not derive ADVENTURE_TOKENS from rewardValues in src/meadowState.ts');
}

const ADVENTURES = [
  { id: 'anger', station: 1, name: 'Anger Volcano' },
  { id: 'stress', station: 2, name: 'Stress Mountain' },
  { id: 'sadness', station: 3, name: 'Tear River' },
  { id: 'anxiety', station: 4, name: 'Worry Woods' },
  { id: 'happiness', station: 5, name: 'Spark Summit' },
];

/** One evaluate call → saved state + HUD read at the same instant. */
const SNAPSHOT_JS = `(() => {
  const raw = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
  let saved = null;
  try { saved = raw ? JSON.parse(raw) : null; } catch { saved = null; }
  const firstInt = (sel) => {
    const t = document.querySelector(sel)?.textContent;
    if (t == null) return null;
    const m = t.match(/\\d+/);
    return m ? parseInt(m[0], 10) : null;
  };
  return {
    hasSave: !!saved,
    hudTokens: firstInt('.meadow-token-balance b'),
    hudStars: firstInt('.star-total b'),
    savedTokens: saved ? saved.tokens : null,
    savedStars: saved ? saved.stars : null,
    completed: saved && Array.isArray(saved.completed) ? saved.completed : [],
    completedActivities: saved && Array.isArray(saved.completedActivities) ? saved.completedActivities : [],
    owned: saved && Array.isArray(saved.owned) ? saved.owned : [],
    onMap: !!document.querySelector('.emotion-map-world'),
    completedCards: document.querySelectorAll('.map-landmark-card.completed').length,
  };
})()`;

/** Internal consistency of a snapshot, independent of expected values. */
function consistencyProblems(s) {
  const problems = [];
  if (!s.hasSave) problems.push(`no saved state under "${STORAGE_KEY}"`);
  if (s.hudTokens !== s.savedTokens) problems.push(`HUD tokens ${s.hudTokens} != saved ${s.savedTokens}`);
  if (s.hudStars !== s.savedStars) problems.push(`HUD stars ${s.hudStars} != saved ${s.savedStars}`);
  if (new Set(s.completed).size !== s.completed.length) problems.push(`duplicate ids in completed: ${s.completed}`);
  const expectedStars = s.completed.length * ADVENTURE_STARS + s.completedActivities.length;
  if (s.savedStars !== expectedStars) {
    problems.push(`stars ${s.savedStars} != ${s.completed.length} completed x ${ADVENTURE_STARS} + ${s.completedActivities.length} activities`);
  }
  if (s.onMap && s.completedCards !== s.completed.length) {
    problems.push(`map shows ${s.completedCards} completed cards but save has ${s.completed.length}`);
  }
  return problems;
}

const fmt = (s) =>
  `tokens=${s.savedTokens} (HUD ${s.hudTokens}), stars=${s.savedStars} (HUD ${s.hudStars}), completed=[${s.completed.join(', ')}]`;

async function runVerification() {
  console.log('=== STARTING MOODIE MEADOWS REAL BROWSER E2E VERIFICATION ===\n');
  console.log(`Base URL: ${BASE_URL}  |  Storage key: ${STORAGE_KEY}  |  Reward/adventure: ${ADVENTURE_TOKENS} tokens, ${ADVENTURE_STARS} stars\n`);
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const results = [];
  const record = (feature, testPerformed, passed, evidence) => {
    const result = passed ? 'PASS' : 'FAIL';
    results.push({ feature, testPerformed, result, evidence });
    console.log(`${passed ? '✅' : '❌'} [${result}] ${feature} -> ${testPerformed}: ${evidence}`);
  };

  // Preflight: fail clearly if the preview server is not running.
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`❌ Preview server not reachable at ${BASE_URL} (${err.message}).`);
    console.error('   Start it with: npm run build && npm run preview -- --port 4173');
    process.exitCode = 1;
    return;
  }

  let browser;
  let client;
  try {
    browser = await launchIsolatedBrowser();
    console.log(`Launched isolated headless browser (port ${browser.port}, temp profile ${browser.profileDir})`);
    const target = await CDPClient.findTarget(browser.port);
    client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();
    await client.enableStandardDomains();

    /** Waits until HUD and saved state agree, then returns the snapshot. */
    const settledSnapshot = async (timeoutMs = 6000) => {
      const deadline = Date.now() + timeoutMs;
      let snap;
      do {
        snap = await client.evaluate(SNAPSHOT_JS);
        if (consistencyProblems(snap).length === 0) return snap;
        await client.wait(100);
      } while (Date.now() < deadline);
      return snap; // caller reports the inconsistency
    };

    /** Asserts a snapshot is consistent AND matches expected totals. */
    const expectState = (snap, { tokens, stars, completed }) => {
      const problems = consistencyProblems(snap);
      if (snap.savedTokens !== tokens) problems.push(`expected ${tokens} tokens, got ${snap.savedTokens}`);
      if (snap.savedStars !== stars) problems.push(`expected ${stars} stars, got ${snap.savedStars}`);
      const want = [...completed].sort().join(',');
      const got = [...snap.completed].sort().join(',');
      if (want !== got) problems.push(`expected completed [${want}], got [${got}]`);
      return problems;
    };

    const readCelebrationPills = () =>
      client.evaluate(`({
        tokens: document.querySelector('.tokens-pill strong')?.textContent?.trim() || '',
        stars: document.querySelector('.stars-pill strong')?.textContent?.trim() || '',
      })`);

    const finishAndReturnToMap = async () => {
      await client.click('.claim-reward-btn');
      await client.waitForSelector('.celebration-screen');
      const pills = await readCelebrationPills();
      await client.click('.celebration-actions .map-btn');
      await client.waitForSelector('.emotion-map-world');
      return pills;
    };

    const openAdventure = async (station, rootSelector) => {
      await client.click(`.map-landmark-card.station-${station} .landmark-play-button`);
      await client.waitForSelector(rootSelector);
    };

    // ---------------------------------------------------------------
    // PHASE 0: FRESH PLAYER (clear only this app's storage key)
    // ---------------------------------------------------------------
    console.log('\n--- PHASE 0: Fresh player setup ---');
    await client.setViewport(1280, 800);
    await client.navigate(BASE_URL);
    await client.evaluate(`localStorage.removeItem(${JSON.stringify(STORAGE_KEY)})`);
    await client.reload();
    await client.waitForSelector('.emotion-map-world');
    const freshSnap = await settledSnapshot();
    const freshProblems = expectState(freshSnap, { tokens: 0, stars: 0, completed: [] });
    record(
      'Fresh player state',
      'Isolated profile + cleared app key starts at 0 tokens, 0 stars, no completed adventures',
      freshProblems.length === 0,
      freshProblems.length ? freshProblems.join('; ') : fmt(freshSnap),
    );

    // ---------------------------------------------------------------
    // PHASE 1: HOME SCREEN & MAP
    // ---------------------------------------------------------------
    console.log('\n--- PHASE 1: Home Screen and Map ---');
    const landmarks = await client.evaluate(`
      Array.from(document.querySelectorAll('.map-landmark-card')).map(c => c.querySelector('.landmark-name')?.textContent?.trim())
    `);
    const expectedNames = ADVENTURES.map((a) => a.name);
    record(
      'Home screen and map',
      'Load home screen and verify 5 adventure cards and titles',
      JSON.stringify(landmarks) === JSON.stringify(expectedNames),
      `Landmarks: ${landmarks.join(', ')}`,
    );

    const gridCols = await client.evaluate(
      `window.getComputedStyle(document.querySelector('.adventure-map-trail')).gridTemplateColumns.split(' ').length`,
    );
    record(
      'Desktop layout',
      'Verify 5 adventure cards in single row on desktop viewport (1280x800)',
      gridCols === 5,
      `CSS gridTemplateColumns has ${gridCols} columns`,
    );
    await client.captureScreenshot(`${SCREENSHOT_DIR}/01-home-screen.png`);

    // ---------------------------------------------------------------
    // Mini-game drivers (each waits on the game's own state changes)
    // ---------------------------------------------------------------
    const playVolcano = async () => {
      await openAdventure(1, '.cool-the-lava');
      const hasOrb = await client.evaluate('!!document.querySelector(".breathing-orb")');
      await client.click('.skip-calm-btn');
      await client.waitForSelector('.tools-interactive-panel');
      const tools = await client.evaluate(
        `Array.from(document.querySelectorAll('.tool-card .tool-name')).map(t => t.textContent.trim())`,
      );
      for (let n = 1; n <= 2; n++) {
        await client.click('.tool-card:not(.applied)');
        await client.waitForCount('.tool-card.applied', n);
      }
      await client.waitForSelector('.cooled-success-panel');
      return { hasOrb, tools };
    };

    const playMountain = async () => {
      await openAdventure(2, '.pack-calm-kit');
      for (let n = 1; n <= 3; n++) {
        await client.click('.coping-item-card:not(.packed)');
        await client.waitForCount('.backpack-slot.filled', n);
      }
      await client.click('.start-climb-btn');
      await client.click('.next-step-btn');
      await client.waitForText('.next-step-btn', '(2 of 3)');
      await client.click('.next-step-btn');
      await client.waitForText('.next-step-btn', 'Summit');
      await client.click('.next-step-btn');
      await client.waitForSelector('.summit-success-panel');
    };

    const playRiver = async () => {
      await openAdventure(3, '.help-a-friend');
      for (let s = 1; s <= 4; s++) {
        await client.click('.step-forward-btn'); // click() waits until not disabled (not hopping)
        const nextTag = s < 4 ? `STEP ${s + 1} OF 4` : 'ACROSS THE RIVER';
        await client.waitForText('.river-instruction-hud .step-tag', nextTag);
      }
      await client.waitForSelector('.river-success-panel');
    };

    const playWoods = async () => {
      await openAdventure(4, '.brave-path');
      for (let n = 1; n <= 3; n++) {
        await client.click('.grounding-btn:not(.found)');
        await client.waitForCount('.grounding-btn.found', n);
      }
      await client.click('.light-btn');
      await client.click('.take-step-btn');
      await client.waitForText('.take-step-btn', '(2 of 3)');
      await client.click('.take-step-btn');
      await client.waitForText('.take-step-btn', '(3 of 3)');
      await client.click('.take-step-btn');
      await client.waitForSelector('.clearing-success-panel');
    };

    const playGarden = async () => {
      await openAdventure(5, '.happiness-garden');
      for (let n = 1; n <= 3; n++) {
        await client.click('.sunbeam-btn:not(.collected)');
        await client.waitForCount('.sunbeam-btn.collected', n);
      }
      await client.click('.water-btn');
      await client.waitForSelector('.decoration-card');
      for (let n = 1; n <= 3; n++) {
        await client.click('.decoration-card:not(.planted)');
        await client.waitForCount('.decoration-card.planted', n);
      }
      await client.waitForSelector('.blooming-success-panel');
    };

    const firstTimePillsOk = (p) => p.tokens === `+${ADVENTURE_TOKENS} Tokens` && p.stars === `+${ADVENTURE_STARS} Stars`;

    // ---------------------------------------------------------------
    // PHASE 2A: ANGER VOLCANO — genuine first-time reward
    // ---------------------------------------------------------------
    console.log('\n--- PHASE 2A: Anger Volcano (first time) ---');
    const volcano = await playVolcano();
    await client.captureScreenshot(`${SCREENSHOT_DIR}/02-volcano-cooled.png`);
    const volcanoPills = await finishAndReturnToMap();
    const afterVolcano = await settledSnapshot();
    const volcanoProblems = expectState(afterVolcano, { tokens: ADVENTURE_TOKENS, stars: ADVENTURE_STARS, completed: ['anger'] });
    if (!firstTimePillsOk(volcanoPills)) volcanoProblems.push(`celebration showed "${volcanoPills.tokens}" / "${volcanoPills.stars}"`);
    if (!volcano.hasOrb) volcanoProblems.push('breathing orb missing');
    record(
      'Anger Volcano (first-time reward)',
      `Fresh player completes Anger Volcano and earns exactly +${ADVENTURE_TOKENS} tokens / +${ADVENTURE_STARS} stars`,
      volcanoProblems.length === 0,
      volcanoProblems.length
        ? volcanoProblems.join('; ')
        : `Celebration "${volcanoPills.tokens}", "${volcanoPills.stars}"; tools [${volcano.tools.join(', ')}]; ${fmt(afterVolcano)}`,
    );

    // ---------------------------------------------------------------
    // PHASE 2B: REPLAY — no duplicate rewards
    // ---------------------------------------------------------------
    console.log('\n--- PHASE 2B: Replay Anger Volcano ---');
    const replay = await playVolcano();
    const replayPills = await finishAndReturnToMap();
    const afterReplay = await settledSnapshot();
    const replayProblems = expectState(afterReplay, { tokens: ADVENTURE_TOKENS, stars: ADVENTURE_STARS, completed: ['anger'] });
    if (!replay.hasOrb) replayProblems.push('replay did not restart at the breathing orb');
    if (replayPills.tokens !== '+0 (Replay) Tokens' || replayPills.stars !== '+0 Stars') {
      replayProblems.push(`replay celebration showed "${replayPills.tokens}" / "${replayPills.stars}"`);
    }
    record(
      'Replay and duplicate rewards',
      'Replay the completed adventure; celebration shows +0 and totals stay unchanged',
      replayProblems.length === 0,
      replayProblems.length ? replayProblems.join('; ') : `Celebration "${replayPills.tokens}", "${replayPills.stars}"; ${fmt(afterReplay)}`,
    );

    // ---------------------------------------------------------------
    // PHASE 2C–2F: Remaining four adventures (first-time each)
    // ---------------------------------------------------------------
    const remaining = [
      { adv: ADVENTURES[1], play: playMountain, shot: '03-mountain-summit.png', what: 'Pack calm kit, 3 trail checkpoints, summit' },
      { adv: ADVENTURES[2], play: playRiver, shot: '04-river-success.png', what: 'Cross 4 stepping stones with Ripple' },
      { adv: ADVENTURES[3], play: playWoods, shot: '05-woods-campfire.png', what: 'Notice 3 forest friends, light lantern, 3 brave steps' },
      { adv: ADVENTURES[4], play: playGarden, shot: '06-garden-blooming.png', what: 'Catch 3 sunbeams, water, plant 3 joy flowers' },
    ];
    const done = ['anger'];
    for (const { adv, play, shot, what } of remaining) {
      console.log(`\n--- ${adv.name} ---`);
      await play();
      await client.captureScreenshot(`${SCREENSHOT_DIR}/${shot}`);
      const pills = await finishAndReturnToMap();
      done.push(adv.id);
      const snap = await settledSnapshot();
      const problems = expectState(snap, {
        tokens: ADVENTURE_TOKENS * done.length,
        stars: ADVENTURE_STARS * done.length,
        completed: done,
      });
      if (!firstTimePillsOk(pills)) problems.push(`celebration showed "${pills.tokens}" / "${pills.stars}"`);
      record(
        adv.name,
        `${what}; first-time reward credited once`,
        problems.length === 0,
        problems.length ? problems.join('; ') : `Celebration "${pills.tokens}", "${pills.stars}"; ${fmt(snap)}`,
      );
    }

    // ---------------------------------------------------------------
    // PHASE 3: PERSISTENCE AFTER REFRESH
    // ---------------------------------------------------------------
    console.log('\n--- PHASE 3: Persistence after reload ---');
    const expectedAll = {
      tokens: ADVENTURE_TOKENS * ADVENTURES.length,
      stars: ADVENTURE_STARS * ADVENTURES.length,
      completed: ADVENTURES.map((a) => a.id),
    };
    const beforeReload = await settledSnapshot();
    await client.reload();
    await client.waitForSelector('.emotion-map-world');
    const afterReload = await settledSnapshot();
    const persistProblems = [
      ...expectState(beforeReload, expectedAll).map((p) => `before reload: ${p}`),
      ...expectState(afterReload, expectedAll).map((p) => `after reload: ${p}`),
    ];
    record(
      'Persistence after refresh',
      'Reload page; tokens, stars and completed adventures (saved state, HUD and map) are identical and correct',
      persistProblems.length === 0,
      persistProblems.length
        ? persistProblems.join('; ')
        : `${fmt(afterReload)}; map shows ${afterReload.completedCards}/5 completed`,
    );

    // ---------------------------------------------------------------
    // PHASE 3B: REWARD SHOP
    // ---------------------------------------------------------------
    console.log('\n--- PHASE 3B: Reward Shop ---');
    await client.click('.nav-button[aria-label="Reward Shop"]');
    await client.waitForSelector('.shop-grid');
    await client.captureScreenshot(`${SCREENSHOT_DIR}/07-reward-shop.png`);
    const shopBefore = await settledSnapshot();
    const item = await client.evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('.shop-card:not(.owned)'));
      const idx = cards.findIndex(c => { const b = c.querySelector('button'); return b && !b.disabled; });
      if (idx < 0) return null;
      const card = cards[idx];
      card.setAttribute('data-e2e-buy', '1');
      return { title: card.querySelector('h3')?.textContent?.trim(), price: parseInt(card.querySelector('.price-tag')?.textContent || '', 10) };
    })()`);
    const shopProblems = [];
    let shopEvidence = '';
    if (!item || !Number.isInteger(item.price)) {
      shopProblems.push(`no affordable item found with ${shopBefore.savedTokens} tokens`);
    } else {
      await client.click('[data-e2e-buy="1"] button');
      await client.waitForFunction(
        `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '{}').owned?.length === ${shopBefore.owned.length + 1}`,
      );
      await client.waitForSelector('[data-e2e-buy="1"].owned');
      const shopAfter = await settledSnapshot();
      shopProblems.push(...consistencyProblems({ ...shopAfter, onMap: false }));
      if (shopAfter.savedTokens !== shopBefore.savedTokens - item.price) {
        shopProblems.push(`tokens ${shopBefore.savedTokens} -> ${shopAfter.savedTokens}, expected -${item.price}`);
      }
      if (shopAfter.savedStars !== shopBefore.savedStars) shopProblems.push('stars changed after purchase');
      shopEvidence = `Bought "${item.title}" for ${item.price}; tokens ${shopBefore.savedTokens} -> ${shopAfter.savedTokens} (HUD ${shopAfter.hudTokens}); owned ${shopAfter.owned.length}`;
    }
    record(
      'Reward Shop',
      'Buy an affordable item; exact price deducted, item marked owned, HUD matches saved state',
      shopProblems.length === 0,
      shopProblems.length ? shopProblems.join('; ') : shopEvidence,
    );

    await client.click('.nav-button[aria-label="Adventure Map"]');
    await client.waitForSelector('.emotion-map-world');

    // ---------------------------------------------------------------
    // PHASE 4: MOBILE VIEWPORT
    // ---------------------------------------------------------------
    console.log('\n--- PHASE 4: Mobile Viewport (390x844) ---');
    await client.setViewport(390, 844);
    await client.waitForFunction(`document.documentElement.clientWidth <= 390`);
    const overflowX = await client.evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
    const mobileCols = await client.evaluate(
      `window.getComputedStyle(document.querySelector('.adventure-map-trail')).gridTemplateColumns.split(' ').length`,
    );
    await client.captureScreenshot(`${SCREENSHOT_DIR}/08-mobile-viewport.png`);
    record(
      'Mobile layout',
      'Resize viewport to 390x844, check horizontal overflow and card stacking',
      !overflowX && mobileCols < 5,
      `horizontal overflow=${overflowX}, grid columns=${mobileCols}`,
    );
    await client.setViewport(1280, 800);

    // ---------------------------------------------------------------
    // PHASE 4B: ACCESSIBILITY & NARRATION
    // ---------------------------------------------------------------
    const narrationButtons = await client.evaluate(`
      Array.from(document.querySelectorAll('.narration-button, .sound-button')).map(b => b.getAttribute('aria-label') || b.title || '')
    `);
    const labelled = narrationButtons.filter(Boolean);
    record(
      'Keyboard and narration accessibility',
      'Narration and sound controls exist and every one has an accessible label',
      labelled.length > 0 && labelled.length === narrationButtons.length,
      `${labelled.length}/${narrationButtons.length} labelled, e.g. ${labelled.slice(0, 2).join('; ')}`,
    );

    // ---------------------------------------------------------------
    // CONSOLE & NETWORK HEALTH
    // ---------------------------------------------------------------
    if (client.consoleErrors.length) console.log('Console errors:', client.consoleErrors);
    record(
      'Browser console and failed requests',
      'No uncaught JavaScript errors or failed network requests during the whole run',
      client.consoleErrors.length === 0 && client.networkErrors.length === 0,
      `${client.consoleErrors.length} console errors, ${client.networkErrors.length} failed requests`,
    );
  } catch (err) {
    console.error('Fatal E2E Error:', err);
    record('E2E Test Execution', 'End-to-end execution', false, err.message);
  } finally {
    if (client) client.close();
    if (browser) await browser.close();
  }

  console.log('\n=============================================================');
  console.log('=== END-TO-END VERIFICATION SUMMARY TABLE ===');
  console.log('=============================================================');
  console.table(results);

  const failed = results.filter((r) => r.result !== 'PASS').length;
  console.log(`\n${results.length - failed}/${results.length} checks passed.`);
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  if (failed > 0) process.exitCode = 1;
}

runVerification().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
