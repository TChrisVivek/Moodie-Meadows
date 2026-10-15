import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node.js test environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new LocalStorageMock();
globalThis.localStorage = mockStorage;
globalThis.window = { localStorage: mockStorage };

import {
  initial,
  load,
  unlocked,
  skillReady,
  emotionChoices,
  adventures,
  shopItems,
  STORAGE_KEY,
  applyBuy,
  applyEquip,
  applyCompleteActivity,
  applySaveProfile,
  applySetSoundEnabled,
  resetProgress,
} from '../src/meadowState.ts';

test('1. meadowState: initial state contains v2 schema with persistence fields', () => {
  const state = initial();
  assert.equal(state.version, 2);
  assert.equal(state.tokens, 0);
  assert.equal(state.stars, 0);
  assert.deepEqual(state.completedActivities, []);
  assert.equal(state.soundEnabled, false);
  assert.deepEqual(state.profile, { name: '', avatar: 0 });
  assert.deepEqual(state.owned, []);
  assert.deepEqual(state.equipped, []);
  assert.deepEqual(state.ledger, []);
  assert.equal(state.current, 'anger');
});

test('2. meadowState: unlocked() allows open-world direct access to all 5 emotions', () => {
  const state = initial();
  assert.equal(unlocked(state, 'anger'), true, 'Anger Volcano should be unlocked');
  assert.equal(unlocked(state, 'stress'), true, 'Stress Mountain should be unlocked');
  assert.equal(unlocked(state, 'sadness'), true, 'Tear River should be unlocked');
  assert.equal(unlocked(state, 'anxiety'), true, 'Worry Woods should be unlocked');
  assert.equal(unlocked(state, 'happiness'), true, 'Spark Summit should be unlocked');
  assert.equal(adventures.length, 5, 'Exactly 5 SEL emotion adventures present');
});

test('3. meadowState: skillReady() supports completion and early exit without trapping children', () => {
  // Empty run -> not ready
  const emptyRun = { phase: 'practice', emotion: 0, action: 1, taps: [], seconds: 0 };
  assert.equal(skillReady('anger', emptyRun), false);

  // Anger Volcano requires words and support taps
  const tappedRun = { phase: 'practice', emotion: 0, action: 1, taps: ['words', 'support'], seconds: 0 };
  assert.equal(skillReady('anger', tappedRun), false, 'Not ready yet without breath timer or early exit');

  // Ready via mindful completion (>= 8 seconds breathing)
  const mindfulRun = { ...tappedRun, seconds: 8 };
  assert.equal(skillReady('anger', mindfulRun), true, 'Mindful 8s breath completes skill');

  // Ready via full 24 seconds
  const fullRun = { ...tappedRun, seconds: 24 };
  assert.equal(skillReady('anger', fullRun), true, 'Full 24s completes skill');

  // Ready via child clicking "I feel calmer now · I\'m ready" (breathe_ready tap) - early exit fix
  const earlyReadyRun = { ...tappedRun, seconds: 3, taps: ['words', 'support', 'breathe_ready'] };
  assert.equal(skillReady('anger', earlyReadyRun), true, 'Child can exit early when feeling calm without getting stuck');

  // Ready via alternative comfort gesture
  const altRun = { ...tappedRun, seconds: 2, taps: ['words', 'support', 'alternative'] };
  assert.equal(skillReady('anger', altRun), true, 'Child can use gentle alternative gesture');
});

test('4. meadowState: applyCompleteActivity() persists rewards and prevents duplicate earnings', () => {
  let state = initial();

  // First completion of Cloud Catcher breathing activity
  const res1 = applyCompleteActivity(state, 'cloud');
  assert.equal(res1.alreadyCompleted, false);
  assert.equal(res1.tokensEarned, 15, 'Earned 15 extra activity tokens');
  assert.equal(res1.starsEarned, 1, 'Earned 1 extra activity star');
  assert.equal(res1.state.tokens, 15);
  assert.equal(res1.state.stars, 1);
  assert.ok(res1.state.completedActivities.includes('cloud'));
  assert.ok(res1.state.ledger.includes('cloud:extra_activity'));

  // Re-opening and completing the same activity again
  const res2 = applyCompleteActivity(res1.state, 'cloud');
  assert.equal(res2.alreadyCompleted, true);
  assert.equal(res2.tokensEarned, 0, 'No duplicate tokens granted on replay');
  assert.equal(res2.starsEarned, 0, 'No duplicate stars granted on replay');
  assert.equal(res2.state.tokens, 15, 'Token balance remained 15');
  assert.equal(res2.state.stars, 1, 'Star count remained 1');
  assert.equal(res2.state.completedActivities.length, 1);
});

test('5. meadowState: load() handles missing, corrupted, or legacy v1 data safely', () => {
  mockStorage.clear();

  // 1) Completely empty storage -> clean initial state
  const fromEmpty = load();
  assert.equal(fromEmpty.version, 2);
  assert.equal(fromEmpty.tokens, 0);

  // 2) Corrupt JSON in storage -> does not crash, falls back to initial
  mockStorage.setItem(STORAGE_KEY, '{invalid json');
  const fromCorrupt = load();
  assert.equal(fromCorrupt.version, 2);
  assert.equal(fromCorrupt.tokens, 0);

  // 3) Legacy V1 state migration
  const legacyV1 = {
    tokens: 45,
    ledger: ['anger:identify', 'anger:skill'],
    completed: ['anger'],
    current: 'anger',
    owned: ['crown'],
    equipped: ['crown'],
    checkIn: { day: '2026-10-14', feeling: 'Happy' },
    name: 'Little Robin',
    avatar: 1,
  };
  mockStorage.setItem(STORAGE_KEY, JSON.stringify(legacyV1));

  const migrated = load();
  assert.equal(migrated.version, 2, 'Migrated to version 2');
  assert.equal(migrated.tokens, 45, 'Retained 45 tokens');
  assert.deepEqual(migrated.completed, ['anger'], 'Retained completed adventures');
  assert.deepEqual(migrated.owned, ['crown'], 'Retained owned items');
  assert.deepEqual(migrated.equipped, ['crown'], 'Retained equipped items');
  assert.deepEqual(migrated.profile, { name: 'Little Robin', avatar: 1 }, 'Migrated profile name and avatar');
  assert.deepEqual(migrated.completedActivities, [], 'Safely initialized completed activities');
  assert.equal(migrated.stars, 0, 'Safely initialized stars');
  assert.equal(migrated.soundEnabled, false, 'Safely initialized sound toggle');
});

test('6. meadowState: shop purchases deduct tokens, equip/unequip toggles, and prevents overspend', () => {
  let state = initial();
  state.tokens = 30; // 30 tokens

  const crownItem = shopItems.find((i) => i.id === 'leaf-crown');
  assert.ok(crownItem, 'Leaf-crown item exists in shop');
  assert.equal(crownItem.price, 25);

  // Purchase crown
  state = applyBuy(state, 'leaf-crown');
  assert.equal(state.tokens, 5, 'Deducted 25 tokens, 5 remaining');
  assert.ok(state.owned.includes('leaf-crown'), 'Leaf-crown added to owned items');
  assert.ok(state.equipped.includes('leaf-crown'), 'Leaf-crown automatically equipped on purchase');

  // Try to purchase something that costs 40 when balance is only 5
  state = applyBuy(state, 'star-cape');
  assert.equal(state.tokens, 5, 'Cannot afford star-cape; token balance unchanged');
  assert.ok(!state.owned.includes('star-cape'), 'Star cape was not purchased');

  // Unequip crown
  state = applyEquip(state, 'leaf-crown');
  assert.ok(!state.equipped.includes('leaf-crown'), 'Leaf-crown unequipped');

  // Re-equip crown
  state = applyEquip(state, 'leaf-crown');
  assert.ok(state.equipped.includes('leaf-crown'), 'Leaf-crown re-equipped');
});

test('7. meadowState: profile updates and sound toggle persist', () => {
  let state = initial();
  const inputLongName = 'Super Explorer Extraordinaire Child';
  state = applySaveProfile(state, inputLongName, 2);
  assert.equal(state.profile.name, inputLongName.slice(0, 25), 'Truncated to 25 chars safely');
  assert.equal(state.profile.avatar, 2);

  state = applySetSoundEnabled(state, true);
  assert.equal(state.soundEnabled, true);

  // Save to storage
  mockStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  // Reload and verify
  const loaded = load();
  assert.equal(loaded.profile.name, inputLongName.slice(0, 25));
  assert.equal(loaded.profile.avatar, 2);
  assert.equal(loaded.soundEnabled, true);
});

test('8. meadowState: resetProgress() resets back to clean state and overwrites storage', () => {
  let state = initial();
  state.tokens = 90;
  state.stars = 4;
  state.completedActivities = ['cloud', 'garden'];
  state.owned = ['crown'];
  mockStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  const fresh = resetProgress();
  assert.equal(fresh.version, 2);
  assert.equal(fresh.tokens, 0);
  assert.equal(fresh.stars, 0);
  assert.deepEqual(fresh.completedActivities, []);
  assert.deepEqual(fresh.owned, []);

  // Check storage directly
  const fromStorage = load();
  assert.equal(fromStorage.tokens, 0);
  assert.deepEqual(fromStorage.completedActivities, []);
});

test('9. meadowState: emotionChoices provides age-appropriate feeling alternatives', () => {
  const angerChoices = emotionChoices('anger');
  assert.ok(angerChoices.some((c) => c.label === 'Angry'));
  assert.ok(angerChoices.length >= 3);
});
