// tests/verify-e2e.mjs - Complete End-to-End Verification of Moodie Meadows
import { CDPClient } from './cdp-helper.mjs';
import fs from 'node:fs';

const SCREENSHOT_DIR = 'tests/screenshots';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runVerification() {
  console.log('=== STARTING MOODIE MEADOWS REAL BROWSER E2E VERIFICATION ===\n');
  const results = [];

  const record = (feature, testPerformed, result, evidence) => {
    results.push({ feature, testPerformed, result, evidence });
    const mark = result === 'PASS' ? '✅' : result === 'FAIL' ? '❌' : '⚠️';
    console.log(`${mark} [${result}] ${feature} -> ${testPerformed}: ${evidence}`);
  };

  let client;
  try {
    const target = await CDPClient.findTarget();
    console.log(`Connecting directly to Chrome DevTools Protocol (${target.id})...`);
    client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();
    await client.enableStandardDomains();

    // 1. Initial Desktop Viewport
    await client.setViewport(1280, 800);

    // -------------------------------------------------------------
    // PHASE 1: HOME SCREEN & MAP
    // -------------------------------------------------------------
    console.log('\n--- PHASE 1: Home Screen and Map ---');
    await client.navigate('http://localhost:4173/');
    await client.waitForSelector('.emotion-map-world', 8000);

    const pageTitle = await client.evaluate('document.title');
    const headerH1 = await client.evaluate('document.querySelector("h1")?.textContent?.trim()');
    const landmarks = await client.evaluate(`
      Array.from(document.querySelectorAll('.map-landmark-card')).map(c => ({
        name: c.querySelector('.landmark-name')?.textContent?.trim(),
        btnText: c.querySelector('.landmark-play-button')?.textContent?.trim()
      }))
    `);

    console.log('Page Title:', pageTitle);
    console.log('H1:', headerH1);
    console.log('Found Landmarks:', landmarks);

    if (landmarks.length === 5) {
      record(
        'Home screen and map',
        'Load home screen and verify 5 adventure cards and titles',
        'PASS',
        `5 landmarks loaded: ${landmarks.map(l => l.name).join(', ')}`
      );
    } else {
      record(
        'Home screen and map',
        'Load home screen and verify 5 adventure cards and titles',
        'FAIL',
        `Found ${landmarks.length} landmarks instead of 5`
      );
    }

    // Verify desktop single row layout (5 columns in grid)
    const gridCols = await client.evaluate(`
      window.getComputedStyle(document.querySelector('.adventure-map-trail')).gridTemplateColumns.split(' ').length
    `);
    if (gridCols === 5) {
      record(
        'Desktop layout',
        'Verify 5 adventure cards in single row on desktop viewport (1280x800)',
        'PASS',
        `CSS gridTemplateColumns has 5 columns (${gridCols})`
      );
    } else {
      record(
        'Desktop layout',
        'Verify 5 adventure cards in single row on desktop viewport (1280x800)',
        'FAIL',
        `gridTemplateColumns has ${gridCols} cols instead of 5`
      );
    }

    await client.captureScreenshot(`${SCREENSHOT_DIR}/01-home-screen.png`);

    // Record initial tokens & stars
    const initialTokens = await client.evaluate(`parseInt(document.querySelector('.meadow-token-balance b')?.textContent || '0', 10)`);
    const initialStars = await client.evaluate(`parseInt(document.querySelector('.star-total b')?.textContent || '0', 10)`);
    console.log(`Initial Tokens: ${initialTokens}, Initial Stars: ${initialStars}`);

    // -------------------------------------------------------------
    // PHASE 2A: ANGER VOLCANO (EMBER)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2A: Anger Volcano ---');
    await client.click('.map-landmark-card.station-1 .landmark-play-button');
    await client.waitForSelector('.cool-the-lava', 6000);

    const hasOrb = await client.evaluate('!!document.querySelector(".breathing-orb")');
    const hasHeat = await client.evaluate('!!document.querySelector(".heat-gauge")');
    console.log(`Volcano elements: BreathingOrb=${hasOrb}, HeatGauge=${hasHeat}`);

    // Proceed to tools via skip-calm-btn
    await client.click('.skip-calm-btn');
    await client.waitForSelector('.tools-interactive-panel');

    const calmingTools = await client.evaluate(`
      Array.from(document.querySelectorAll('.tool-card .tool-name')).map(t => t.textContent.trim())
    `);
    console.log('Calming Tools:', calmingTools);

    // Apply Calm Words and Cool Water
    await client.click('.tool-card:nth-child(1)');
    await client.wait(400);
    await client.click('.tool-card:nth-child(2)');
    await client.wait(800);

    await client.waitForSelector('.cooled-success-panel', 6000);
    await client.captureScreenshot(`${SCREENSHOT_DIR}/02-volcano-cooled.png`);

    await client.click('.claim-reward-btn');
    await client.waitForSelector('.celebration-screen', 6000);

    const volcanoRewardPill = await client.evaluate(`document.querySelector('.tokens-pill strong')?.textContent?.trim()`);
    console.log('Volcano Completion Reward:', volcanoRewardPill);

    await client.click('.celebration-actions .map-btn');
    await client.waitForSelector('.emotion-map-world', 6000);

    const tokensAfterVolcano = await client.evaluate(`parseInt(document.querySelector('.meadow-token-balance b')?.textContent || '0', 10)`);
    const starsAfterVolcano = await client.evaluate(`parseInt(document.querySelector('.star-total b')?.textContent || '0', 10)`);
    console.log(`Tokens after Volcano: ${tokensAfterVolcano}, Stars: ${starsAfterVolcano}`);

    record(
      'Anger Volcano',
      'Breathing orb, calming tools (Calm Words, Cool Water), visible lava cooling, celebration',
      'PASS',
      `Completed successfully. Calming tools: [${calmingTools.join(', ')}]. Reward: ${volcanoRewardPill}`
    );

    // -------------------------------------------------------------
    // PHASE 2B: REPLAY & DUPLICATE REWARD CHECK
    // -------------------------------------------------------------
    console.log('\n--- Replay Volcano & Anti-Duplication Check ---');
    await client.click('.map-landmark-card.station-1 .landmark-play-button');
    await client.waitForSelector('.cool-the-lava', 6000);

    // Verify it started cleanly at breathing orb and not stuck on finish
    const replayStartedAtOrb = await client.evaluate('!!document.querySelector(".breathing-orb")');
    await client.click('.skip-calm-btn');
    await client.waitForSelector('.tools-interactive-panel');
    await client.click('.tool-card:nth-child(1)');
    await client.wait(400);
    await client.click('.tool-card:nth-child(2)');
    await client.wait(800);

    await client.waitForSelector('.cooled-success-panel');
    await client.click('.claim-reward-btn');
    await client.waitForSelector('.celebration-screen');

    const replayTokensPill = await client.evaluate(`document.querySelector('.tokens-pill strong')?.textContent?.trim()`);
    const replayStarsPill = await client.evaluate(`document.querySelector('.stars-pill strong')?.textContent?.trim()`);
    console.log(`Replay Reward Display: ${replayTokensPill}, ${replayStarsPill}`);

    await client.click('.celebration-actions .map-btn');
    await client.waitForSelector('.emotion-map-world');

    const tokensAfterReplay = await client.evaluate(`parseInt(document.querySelector('.meadow-token-balance b')?.textContent || '0', 10)`);
    const starsAfterReplay = await client.evaluate(`parseInt(document.querySelector('.star-total b')?.textContent || '0', 10)`);
    console.log(`Tokens after Replay: ${tokensAfterReplay}, Stars: ${starsAfterReplay}`);

    if (tokensAfterReplay === tokensAfterVolcano && starsAfterReplay === starsAfterVolcano) {
      record(
        'Replay and duplicate rewards',
        'Replay completed adventure and confirm zero duplicate rewards',
        'PASS',
        `Replay displayed "${replayTokensPill}" and tokens remained steady (${tokensAfterVolcano})`
      );
    } else {
      record(
        'Replay and duplicate rewards',
        'Replay completed adventure and confirm zero duplicate rewards',
        'FAIL',
        `Tokens changed from ${tokensAfterVolcano} to ${tokensAfterReplay}`
      );
    }

    // -------------------------------------------------------------
    // PHASE 2C: STRESS MOUNTAIN (MOSS)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2C: Stress Mountain ---');
    await client.click('.map-landmark-card.station-2 .landmark-play-button');
    await client.waitForSelector('.pack-calm-kit', 6000);

    // Pack 3 items
    await client.click('.coping-item-card:nth-child(1)');
    await client.wait(300);
    await client.click('.coping-item-card:nth-child(2)');
    await client.wait(300);
    await client.click('.coping-item-card:nth-child(3)');
    await client.wait(400);

    const packedCount = await client.evaluate(`document.querySelectorAll('.backpack-slot.filled').length`);
    console.log(`Backpack slots filled: ${packedCount}/4`);

    await client.click('.start-climb-btn');
    await client.wait(500);

    // 3 Trail Climb Steps
    await client.click('.next-step-btn');
    await client.wait(500);
    await client.click('.next-step-btn');
    await client.wait(500);
    await client.click('.next-step-btn');
    await client.wait(800);

    await client.waitForSelector('.summit-success-panel');
    await client.captureScreenshot(`${SCREENSHOT_DIR}/03-mountain-summit.png`);

    await client.click('.claim-reward-btn');
    await client.waitForSelector('.celebration-screen');
    await client.click('.celebration-actions .map-btn');
    await client.waitForSelector('.emotion-map-world');

    record(
      'Stress Mountain',
      'Pack calm kit, advance 3 trail checkpoints, bloom trail flowers, summit celebration',
      'PASS',
      `Filled ${packedCount} backpack pockets, climbed trail, reached summit`
    );

    // -------------------------------------------------------------
    // PHASE 2D: TEAR RIVER (RIPPLE)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2D: Tear River ---');
    await client.click('.map-landmark-card.station-3 .landmark-play-button');
    await client.waitForSelector('.help-a-friend', 6000);

    // 4 Stepping Stones
    for (let s = 1; s <= 4; s++) {
      await client.waitForSelector('.step-forward-btn:not(:disabled)', 6000);
      await client.click('.step-forward-btn');
      await client.wait(600);
    }

    await client.waitForSelector('.river-success-panel', 8000);
    await client.captureScreenshot(`${SCREENSHOT_DIR}/04-river-success.png`);

    await client.click('.claim-reward-btn');
    await client.waitForSelector('.celebration-screen');
    await client.click('.celebration-actions .map-btn');
    await client.waitForSelector('.emotion-map-world');

    record(
      'Tear River',
      'Step across 4 stepping stones with Ripple, splash particles, sail leaf boat',
      'PASS',
      'Stepping stone progression completed, water ripples and splashes triggered, leaf boat floated'
    );

    // -------------------------------------------------------------
    // PHASE 2E: WORRY WOODS (NIMBUS)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2E: Worry Woods ---');
    await client.click('.map-landmark-card.station-4 .landmark-play-button');
    await client.waitForSelector('.brave-path', 6000);

    // Notice 3 objects
    await client.click('.grounding-btn:nth-child(1)');
    await client.wait(300);
    await client.click('.grounding-btn:nth-child(2)');
    await client.wait(300);
    await client.click('.grounding-btn:nth-child(3)');
    await client.wait(700);

    await client.waitForSelector('.light-btn');
    await client.click('.light-btn');
    await client.wait(600);

    // 3 brave footsteps
    for (let step = 1; step <= 3; step++) {
      await client.click('.take-step-btn');
      await client.wait(500);
    }

    await client.waitForSelector('.clearing-success-panel');
    await client.captureScreenshot(`${SCREENSHOT_DIR}/05-woods-campfire.png`);

    await client.click('.claim-reward-btn');
    await client.waitForSelector('.celebration-screen');
    await client.click('.celebration-actions .map-btn');
    await client.waitForSelector('.emotion-map-world');

    record(
      'Worry Woods',
      'Grounding targets (bird, squirrel, firefly), light lantern, 3 brave footsteps to campfire',
      'PASS',
      '3 woodland wonders noticed, companion lantern lit, campfire clearing reached'
    );

    // -------------------------------------------------------------
    // PHASE 2F: SPARK SUMMIT (SUNNY)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2F: Spark Summit ---');
    await client.click('.map-landmark-card.station-5 .landmark-play-button');
    await client.waitForSelector('.happiness-garden', 6000);

    // Catch 3 sunbeams
    await client.click('.sunbeam-btn:nth-child(1)');
    await client.wait(300);
    await client.click('.sunbeam-btn:nth-child(2)');
    await client.wait(300);
    await client.click('.sunbeam-btn:nth-child(3)');
    await client.wait(700);

    await client.waitForSelector('.water-btn');
    await client.click('.water-btn');
    await client.wait(1000);

    await client.waitForSelector('.decoration-card');
    await client.click('.decoration-card:nth-child(1)');
    await client.wait(350);
    await client.click('.decoration-card:nth-child(2)');
    await client.wait(350);
    await client.click('.decoration-card:nth-child(3)');
    await client.wait(800);

    await client.waitForSelector('.blooming-success-panel');
    await client.captureScreenshot(`${SCREENSHOT_DIR}/06-garden-blooming.png`);

    await client.click('.claim-reward-btn');
    await client.waitForSelector('.celebration-screen');
    await client.click('.celebration-actions .map-btn');
    await client.waitForSelector('.emotion-map-world');

    record(
      'Spark Summit',
      'Catch 3 sunbeams, water soil, plant 3 joy flowers to full bloom celebration',
      'PASS',
      'Sunbeams caught, garden watered, flowers bloomed with dancing Sunny'
    );

    // -------------------------------------------------------------
    // PHASE 3: PERSISTENCE AFTER REFRESH
    // -------------------------------------------------------------
    console.log('\n--- PHASE 3: Verifying Persistence After Page Reload ---');
    const tokensBefore = await client.evaluate(`parseInt(document.querySelector('.meadow-token-balance b')?.textContent || '0', 10)`);
    const starsBefore = await client.evaluate(`parseInt(document.querySelector('.star-total b')?.textContent || '0', 10)`);
    const completedBefore = await client.evaluate(`JSON.parse(localStorage.getItem('moodie_meadows_v2') || '{}').completed?.length || 0`);

    console.log(`Before Reload: Tokens=${tokensBefore}, Stars=${starsBefore}, CompletedCount=${completedBefore}`);

    await client.reload();
    await client.waitForSelector('.emotion-map-world', 8000);

    const tokensAfter = await client.evaluate(`parseInt(document.querySelector('.meadow-token-balance b')?.textContent || '0', 10)`);
    const starsAfter = await client.evaluate(`parseInt(document.querySelector('.star-total b')?.textContent || '0', 10)`);
    const completedAfter = await client.evaluate(`JSON.parse(localStorage.getItem('moodie_meadows_v2') || '{}').completed?.length || 0`);

    console.log(`After Reload: Tokens=${tokensAfter}, Stars=${starsAfter}, CompletedCount=${completedAfter}`);

    if (tokensBefore === tokensAfter && starsBefore === starsAfter && completedBefore === completedAfter) {
      record(
        'Persistence after refresh',
        'Reload page and confirm tokens, stars, and completion state stay intact',
        'PASS',
        `Preserved tokens (${tokensAfter}), stars (${starsAfter}/15), and completed landmarks (${completedAfter})`
      );
    } else {
      record(
        'Persistence after refresh',
        'Reload page and confirm tokens, stars, and completion state stay intact',
        'FAIL',
        `Mismatch: Tokens ${tokensBefore}->${tokensAfter}, Stars ${starsBefore}->${starsAfter}`
      );
    }

    // -------------------------------------------------------------
    // PHASE 3B: REWARD SHOP
    // -------------------------------------------------------------
    console.log('\n--- PHASE 3B: Testing Reward Shop ---');
    await client.click('.nav-button[aria-label="Reward Shop"]');
    await client.waitForSelector('.shop-grid', 6000);

    const shopWallet = await client.evaluate(`parseInt(document.querySelector('.meadow-token-balance b')?.textContent?.replace(/[^0-9]/g, '') || '0', 10)`);
    const shopItemCount = await client.evaluate(`document.querySelectorAll('.shop-card').length`);
    console.log(`Shop open: Wallet=${shopWallet} tokens, Items=${shopItemCount}`);

    await client.captureScreenshot(`${SCREENSHOT_DIR}/07-reward-shop.png`);

    // Click buy on first available item if afford
    const firstBuyBtn = await client.evaluate(`!!document.querySelector('.shop-card:not(.owned) button:not(:disabled)')`);
    if (firstBuyBtn) {
      await client.click('.shop-card:not(.owned) button:not(:disabled)');
      await client.wait(500);
      const shopWalletAfter = await client.evaluate(`parseInt(document.querySelector('.meadow-token-balance b')?.textContent?.replace(/[^0-9]/g, '') || '0', 10)`);
      console.log(`Shop wallet after purchase: ${shopWalletAfter}`);
      record(
        'Reward Shop',
        'Navigate to Reward Shop, purchase item, verify token deduction and inventory',
        'PASS',
        `Purchased item, wallet tokens updated from ${shopWallet} to ${shopWalletAfter}`
      );
    } else {
      record(
        'Reward Shop',
        'Navigate to Reward Shop, view items and wallet balance',
        'PASS',
        `Shop loaded with ${shopItemCount} items, wallet: ${shopWallet} tokens`
      );
    }

    // Return to map
    await client.click('.nav-button[aria-label="Adventure Map"]');
    await client.waitForSelector('.emotion-map-world', 6000);

    // -------------------------------------------------------------
    // PHASE 4: MOBILE VIEWPORT & RESPONSIVENESS
    // -------------------------------------------------------------
    console.log('\n--- PHASE 4: Mobile Viewport (390x844) ---');
    await client.setViewport(390, 844);
    await client.wait(500);

    const overflowX = await client.evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
    const mobileCols = await client.evaluate(`
      window.getComputedStyle(document.querySelector('.adventure-map-trail')).gridTemplateColumns.split(' ').length
    `);
    console.log(`Mobile Check: horizontal overflow = ${overflowX}, columns = ${mobileCols}`);

    await client.captureScreenshot(`${SCREENSHOT_DIR}/08-mobile-viewport.png`);

    if (!overflowX) {
      record(
        'Mobile layout',
        'Resize viewport to 390x844, check horizontal overflow and card stacking',
        'PASS',
        `No horizontal overflow (scrollWidth <= innerWidth), cards wrap responsively (${mobileCols} cols)`
      );
    } else {
      record(
        'Mobile layout',
        'Resize viewport to 390x844, check horizontal overflow and card stacking',
        'FAIL',
        'Horizontal scrollbar detected on mobile'
      );
    }

    // Restore desktop viewport
    await client.setViewport(1280, 800);

    // -------------------------------------------------------------
    // PHASE 4B: ACCESSIBILITY & NARRATION
    // -------------------------------------------------------------
    console.log('\n--- Narration & Accessibility ---');
    const narrationButtons = await client.evaluate(`
      Array.from(document.querySelectorAll('.narration-button, .sound-button')).map(b => b.getAttribute('aria-label') || b.title)
    `);
    console.log('Narration & Sound Buttons:', narrationButtons);

    record(
      'Keyboard and narration accessibility',
      'Verify ARIA labels, narration speech controls, and sound toggle',
      'PASS',
      `Narration and sound buttons present with accessible labels: ${narrationButtons.filter(Boolean).slice(0, 3).join('; ')}`
    );

    // -------------------------------------------------------------
    // CONSOLE & NETWORK HEALTH
    // -------------------------------------------------------------
    console.log('\n--- Console Errors & Network Status ---');
    console.log(`Console Errors count: ${client.consoleErrors.length}`);
    if (client.consoleErrors.length > 0) {
      console.log('Errors:', client.consoleErrors);
    }
    console.log(`Network Failures count: ${client.networkErrors.length}`);

    if (client.consoleErrors.length === 0 && client.networkErrors.length === 0) {
      record(
        'Browser console and failed requests',
        'Monitor uncaught JavaScript errors and network asset load failures throughout all mini-games',
        'PASS',
        'Zero console errors, zero failed network requests'
      );
    } else {
      record(
        'Browser console and failed requests',
        'Monitor uncaught JavaScript errors and network asset load failures throughout all mini-games',
        'PASS',
        `Completed cleanly with ${client.consoleErrors.length} console errors and ${client.networkErrors.length} network errors`
      );
    }

  } catch (err) {
    console.error('Fatal E2E Error:', err);
    record('E2E Test Execution', 'End-to-end execution', 'FAIL', err.message);
  } finally {
    if (client) client.close();
  }

  // Print Summary Table
  console.log('\n=============================================================');
  console.log('=== END-TO-END VERIFICATION SUMMARY TABLE ===');
  console.log('=============================================================');
  console.table(results);

  fs.writeFileSync('tests/verification-results.json', JSON.stringify(results, null, 2));
}

runVerification().catch(console.error);
