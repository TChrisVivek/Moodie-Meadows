import test from "node:test"

import assert from "node:assert/strict"

// Mock localStorage for Node.js test environment

class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }

  clear() {
    this.store = {}
  }
}

const mockStorage = new LocalStorageMock()

globalThis.localStorage = mockStorage

globalThis.window = { localStorage: mockStorage }

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
  applyBegin,
  applyPhase,
  applyEmotion,
  applyClue,
  applyAction,
  applyTap,
  applyTick,
  applyCompleteAdventure,
  applyKindness,
  ADVENTURE_TOKENS,
  ADVENTURE_STARS,
} from "../src/meadowState.ts"

test("1. meadowState: initial state contains v2 schema with persistence fields", () => {
  const state = initial()

  assert.equal(state.version, 2)

  assert.equal(state.tokens, 0)

  assert.equal(state.stars, 0)

  assert.deepEqual(state.completedActivities, [])

  assert.equal(state.soundEnabled, false)

  assert.deepEqual(state.profile, { name: "", avatar: 0 })

  assert.deepEqual(state.owned, [])

  assert.deepEqual(state.equipped, [])

  assert.deepEqual(state.ledger, [])

  assert.equal(state.current, "anger")
})

test("2. meadowState: unlocked() allows open-world direct access to all 5 emotions", () => {
  const state = initial()

  assert.equal(
    unlocked(state, "anger"),
    true,
    "Anger Volcano should be unlocked",
  )

  assert.equal(
    unlocked(state, "stress"),
    true,
    "Stress Mountain should be unlocked",
  )

  assert.equal(
    unlocked(state, "sadness"),
    true,
    "Tear River should be unlocked",
  )

  assert.equal(
    unlocked(state, "anxiety"),
    true,
    "Worry Woods should be unlocked",
  )

  assert.equal(
    unlocked(state, "happiness"),
    true,
    "Spark Summit should be unlocked",
  )

  assert.equal(adventures.length, 5, "Exactly 5 SEL emotion adventures present")
})

test("3. meadowState: skillReady() supports completion and early exit without trapping children", () => {
  // Empty run -> not ready

  const emptyRun = {
    phase: "practice",
    emotion: 0,
    action: 1,
    taps: [],
    seconds: 0,
  }

  assert.equal(skillReady("anger", emptyRun), false)

  // Anger Volcano requires words and support taps

  const tappedRun = {
    phase: "practice",
    emotion: 0,
    action: 1,
    taps: ["words", "support"],
    seconds: 0,
  }

  assert.equal(
    skillReady("anger", tappedRun),
    false,
    "Not ready yet without breath timer or early exit",
  )

  // Ready via mindful completion (>= 8 seconds breathing)

  const mindfulRun = { ...tappedRun, seconds: 8 }

  assert.equal(
    skillReady("anger", mindfulRun),
    true,
    "Mindful 8s breath completes skill",
  )

  // Ready via full 24 seconds

  const fullRun = { ...tappedRun, seconds: 24 }

  assert.equal(skillReady("anger", fullRun), true, "Full 24s completes skill")

  // Ready via child clicking "I feel calmer now · I\'m ready" (breathe_ready tap) - early exit fix

  const earlyReadyRun = {
    ...tappedRun,
    seconds: 3,
    taps: ["words", "support", "breathe_ready"],
  }

  assert.equal(
    skillReady("anger", earlyReadyRun),
    true,
    "Child can exit early when feeling calm without getting stuck",
  )

  // Ready via alternative comfort gesture

  const altRun = {
    ...tappedRun,
    seconds: 2,
    taps: ["words", "support", "alternative"],
  }

  assert.equal(
    skillReady("anger", altRun),
    true,
    "Child can use gentle alternative gesture",
  )
})

test("4. meadowState: applyCompleteActivity() persists rewards and prevents duplicate earnings", () => {
  let state = initial()

  // First completion of Cloud Catcher breathing activity

  const res1 = applyCompleteActivity(state, "cloud")

  assert.equal(res1.alreadyCompleted, false)

  assert.equal(res1.tokensEarned, 15, "Earned 15 extra activity tokens")

  assert.equal(res1.starsEarned, 1, "Earned 1 extra activity star")

  assert.equal(res1.state.tokens, 15)

  assert.equal(res1.state.stars, 1)

  assert.ok(res1.state.completedActivities.includes("cloud"))

  assert.ok(res1.state.ledger.includes("cloud:extra_activity"))

  // Re-opening and completing the same activity again

  const res2 = applyCompleteActivity(res1.state, "cloud")

  assert.equal(res2.alreadyCompleted, true)

  assert.equal(res2.tokensEarned, 0, "No duplicate tokens granted on replay")

  assert.equal(res2.starsEarned, 0, "No duplicate stars granted on replay")

  assert.equal(res2.state.tokens, 15, "Token balance remained 15")

  assert.equal(res2.state.stars, 1, "Star count remained 1")

  assert.equal(res2.state.completedActivities.length, 1)
})

test("5. meadowState: load() handles missing, corrupted, or legacy v1 data safely", () => {
  mockStorage.clear()

  // 1) Completely empty storage -> clean initial state

  const fromEmpty = load()

  assert.equal(fromEmpty.version, 2)

  assert.equal(fromEmpty.tokens, 0)

  // 2) Corrupt JSON in storage -> does not crash, falls back to initial

  mockStorage.setItem(STORAGE_KEY, "{invalid json")

  const fromCorrupt = load()

  assert.equal(fromCorrupt.version, 2)

  assert.equal(fromCorrupt.tokens, 0)

  // 3) Legacy V1 state migration

  const legacyV1 = {
    tokens: 45,

    ledger: ["anger:identify", "anger:skill"],

    completed: ["anger"],

    current: "anger",

    owned: ["crown"],

    equipped: ["crown"],

    checkIn: { day: "2026-10-14", feeling: "Happy" },

    name: "Little Robin",

    avatar: 1,
  }

  mockStorage.setItem(STORAGE_KEY, JSON.stringify(legacyV1))

  const migrated = load()

  assert.equal(migrated.version, 2, "Migrated to version 2")

  assert.equal(migrated.tokens, 45, "Retained 45 tokens")

  assert.deepEqual(
    migrated.completed,
    ["anger"],
    "Retained completed adventures",
  )

  assert.deepEqual(migrated.owned, ["crown"], "Retained owned items")

  assert.deepEqual(migrated.equipped, ["crown"], "Retained equipped items")

  assert.deepEqual(
    migrated.profile,
    { name: "Little Robin", avatar: 1 },
    "Migrated profile name and avatar",
  )

  assert.deepEqual(
    migrated.completedActivities,
    [],
    "Safely initialized completed activities",
  )

  assert.equal(migrated.stars, 0, "Safely initialized stars")

  assert.equal(migrated.soundEnabled, false, "Safely initialized sound toggle")
})

test("6. meadowState: shop purchases deduct tokens, equip/unequip toggles, and prevents overspend", () => {
  let state = initial()

  state.tokens = 30 // 30 tokens

  const crownItem = shopItems.find((i) => i.id === "leaf-crown")

  assert.ok(crownItem, "Leaf-crown item exists in shop")

  assert.equal(crownItem.price, 25)

  // Purchase crown

  state = applyBuy(state, "leaf-crown")

  assert.equal(state.tokens, 5, "Deducted 25 tokens, 5 remaining")

  assert.ok(
    state.owned.includes("leaf-crown"),
    "Leaf-crown added to owned items",
  )

  assert.ok(
    state.equipped.includes("leaf-crown"),
    "Leaf-crown automatically equipped on purchase",
  )

  // Try to purchase something that costs 40 when balance is only 5

  state = applyBuy(state, "star-cape")

  assert.equal(
    state.tokens,
    5,
    "Cannot afford star-cape; token balance unchanged",
  )

  assert.ok(!state.owned.includes("star-cape"), "Star cape was not purchased")

  // Unequip crown

  state = applyEquip(state, "leaf-crown")

  assert.ok(!state.equipped.includes("leaf-crown"), "Leaf-crown unequipped")

  // Re-equip crown

  state = applyEquip(state, "leaf-crown")

  assert.ok(state.equipped.includes("leaf-crown"), "Leaf-crown re-equipped")
})

test("7. meadowState: profile updates and sound toggle persist", () => {
  let state = initial()

  const inputLongName = "Super Explorer Extraordinaire Child"

  state = applySaveProfile(state, inputLongName, 2)

  assert.equal(
    state.profile.name,
    inputLongName.slice(0, 25),
    "Truncated to 25 chars safely",
  )

  assert.equal(state.profile.avatar, 2)

  state = applySetSoundEnabled(state, true)

  assert.equal(state.soundEnabled, true)

  // Save to storage

  mockStorage.setItem(STORAGE_KEY, JSON.stringify(state))

  // Reload and verify

  const loaded = load()

  assert.equal(loaded.profile.name, inputLongName.slice(0, 25))

  assert.equal(loaded.profile.avatar, 2)

  assert.equal(loaded.soundEnabled, true)
})

test("8. meadowState: resetProgress() resets back to clean state and overwrites storage", () => {
  let state = initial()

  state.tokens = 90

  state.stars = 4

  state.completedActivities = ["cloud", "garden"]

  state.owned = ["crown"]

  mockStorage.setItem(STORAGE_KEY, JSON.stringify(state))

  const fresh = resetProgress()

  assert.equal(fresh.version, 2)

  assert.equal(fresh.tokens, 0)

  assert.equal(fresh.stars, 0)

  assert.deepEqual(fresh.completedActivities, [])

  assert.deepEqual(fresh.owned, [])

  // Check storage directly

  const fromStorage = load()

  assert.equal(fromStorage.tokens, 0)

  assert.deepEqual(fromStorage.completedActivities, [])
})

test("9. meadowState: emotionChoices provides age-appropriate feeling alternatives", () => {
  const angerChoices = emotionChoices("anger")

  assert.ok(angerChoices.some((c) => c.label === "Angry"))

  assert.ok(angerChoices.length >= 3)
})

test("10. meadowState: all 5 adventures have correct titles and mascots per brief", () => {
  const expected = [
    { id: "anger", title: "Anger Volcano", mascot: "Ember" },

    { id: "stress", title: "Stress Mountain", mascot: "Moss" },

    { id: "sadness", title: "Tear River", mascot: "Ripple" },

    { id: "anxiety", title: "Worry Woods", mascot: "Nimbus" },

    { id: "happiness", title: "Spark Summit", mascot: "Sunny" },
  ]

  for (const exp of expected) {
    const adv = adventures.find((a) => a.id === exp.id)

    assert.ok(adv, `Adventure ${exp.id} exists`)

    assert.equal(adv.title, exp.title)

    assert.equal(adv.mascot, exp.mascot)
  }
})

test("11. meadowState: Anger Volcano complete gameplay loop awards 30 tokens & 3 stars", () => {
  let state = initial()

  state = applyBegin(state, "anger")

  assert.equal(state.runs.anger.phase, "story")

  // Move to identify

  state = applyPhase(state, "anger", "identify")

  assert.equal(state.runs.anger.phase, "identify")

  // Choose Angry (correct)

  state = applyEmotion(state, "anger", 0)

  assert.equal(state.tokens, 0, "Tokens not awarded mid-adventure")

  // Move to understand

  state = applyPhase(state, "anger", "understand")

  state = applyClue(state, "anger", "cheeks")

  state = applyClue(state, "anger", "fists")

  state = applyClue(state, "anger", "heart")

  // Move to action

  state = applyPhase(state, "anger", "action")

  state = applyAction(state, "anger", 1) // helpful response

  // Move to practice

  state = applyPhase(state, "anger", "practice")

  // Mindful breathing

  for (let i = 0; i < 8; i++) {
    state = applyTick(state, "anger")
  }

  state = applyTap(state, "anger", "words")

  state = applyTap(state, "anger", "support")

  assert.equal(skillReady("anger", state.runs.anger), true, "Practice is ready")

  // Complete adventure

  const res = applyCompleteAdventure(state, "anger")

  assert.equal(res.alreadyCompleted, false)

  assert.equal(res.tokensEarned, 30, "Earned 30 Meadow Tokens on completion")

  assert.equal(res.starsEarned, 3, "Earned 3 stars on completion")

  assert.equal(res.state.tokens, 30)

  assert.equal(res.state.stars, 3)

  assert.ok(res.state.completed.includes("anger"))

  assert.equal(res.state.runs.anger.phase, "finish")
})

test("12. meadowState: Replaying Anger Volcano does not award duplicate tokens or stars", () => {
  let state = initial()

  state = applyBegin(state, "anger")

  state = applyPhase(state, "anger", "identify")

  state = applyEmotion(state, "anger", 0)

  state = applyPhase(state, "anger", "understand")

  state = applyClue(state, "anger", "cheeks")

  state = applyClue(state, "anger", "fists")

  state = applyClue(state, "anger", "heart")

  state = applyPhase(state, "anger", "action")

  state = applyAction(state, "anger", 1)

  state = applyPhase(state, "anger", "practice")

  state = applyTap(state, "anger", "breathe_ready")

  state = applyTap(state, "anger", "words")

  state = applyTap(state, "anger", "support")

  const firstComp = applyCompleteAdventure(state, "anger")

  assert.equal(firstComp.tokensEarned, 30)

  assert.equal(firstComp.starsEarned, 3)

  // Replay

  let replayState = applyBegin(firstComp.state, "anger", true)

  assert.equal(replayState.runs.anger.phase, "story")

  assert.equal(replayState.tokens, 30, "Existing tokens preserved")

  assert.equal(replayState.stars, 3, "Existing stars preserved")

  replayState = applyPhase(replayState, "anger", "identify")

  replayState = applyEmotion(replayState, "anger", 0)

  replayState = applyPhase(replayState, "anger", "understand")

  replayState = applyClue(replayState, "anger", "cheeks")

  replayState = applyClue(replayState, "anger", "fists")

  replayState = applyClue(replayState, "anger", "heart")

  replayState = applyPhase(replayState, "anger", "action")

  replayState = applyAction(replayState, "anger", 1)

  replayState = applyPhase(replayState, "anger", "practice")

  replayState = applyTap(replayState, "anger", "breathe_ready")

  replayState = applyTap(replayState, "anger", "words")

  replayState = applyTap(replayState, "anger", "support")

  const secondComp = applyCompleteAdventure(replayState, "anger")

  assert.equal(secondComp.alreadyCompleted, true)

  assert.equal(
    secondComp.tokensEarned,
    0,
    "Zero duplicate tokens granted on replay",
  )

  assert.equal(
    secondComp.starsEarned,
    0,
    "Zero duplicate stars granted on replay",
  )

  assert.equal(secondComp.state.tokens, 30)

  assert.equal(secondComp.state.stars, 3)
})

test("13. meadowState: Stress Mountain gameplay loop and task completion", () => {
  let state = initial()

  state = applyBegin(state, "stress")

  state = applyPhase(state, "stress", "identify")

  state = applyEmotion(state, "stress", 0)

  state = applyPhase(state, "stress", "understand")

  state = applyClue(state, "stress", "shoulders")

  state = applyClue(state, "stress", "thoughts")

  state = applyClue(state, "stress", "stuck")

  state = applyPhase(state, "stress", "action")

  state = applyAction(state, "stress", 1)

  state = applyPhase(state, "stress", "practice")

  state = applyTap(state, "stress", "one")

  state = applyTap(state, "stress", "rest")

  state = applyTap(state, "stress", "ask")

  assert.equal(skillReady("stress", state.runs.stress), true)

  const comp = applyCompleteAdventure(state, "stress")

  assert.equal(comp.tokensEarned, 30)

  assert.equal(comp.starsEarned, 3)

  assert.ok(comp.state.completed.includes("stress"))
})

test("14. meadowState: Tear River gameplay loop and task completion", () => {
  let state = initial()

  state = applyBegin(state, "sadness")

  state = applyPhase(state, "sadness", "identify")

  state = applyEmotion(state, "sadness", 0)

  state = applyPhase(state, "sadness", "understand")

  state = applyClue(state, "sadness", "chest")

  state = applyClue(state, "sadness", "eyes")

  state = applyClue(state, "sadness", "tired")

  state = applyPhase(state, "sadness", "action")

  state = applyAction(state, "sadness", 0)

  state = applyPhase(state, "sadness", "practice")

  state = applyTap(state, "sadness", "name")

  state = applyTap(state, "sadness", "trusted")

  state = applyTap(state, "sadness", "comfort")

  assert.equal(skillReady("sadness", state.runs.sadness), true)

  const comp = applyCompleteAdventure(state, "sadness")

  assert.equal(comp.tokensEarned, 30)

  assert.equal(comp.starsEarned, 3)

  assert.ok(comp.state.completed.includes("sadness"))
})

test("15. meadowState: Worry Woods gameplay loop and task completion", () => {
  let state = initial()

  state = applyBegin(state, "anxiety")

  state = applyPhase(state, "anxiety", "identify")

  state = applyEmotion(state, "anxiety", 0)

  state = applyPhase(state, "anxiety", "understand")

  state = applyClue(state, "anxiety", "tummy")

  state = applyClue(state, "anxiety", "hands")

  state = applyClue(state, "anxiety", "whatif")

  state = applyPhase(state, "anxiety", "action")

  state = applyAction(state, "anxiety", 1)

  state = applyPhase(state, "anxiety", "practice")

  state = applyTap(state, "anxiety", "flower")

  state = applyTap(state, "anxiety", "cloud")

  state = applyTap(state, "anxiety", "tree")

  state = applyTap(state, "anxiety", "star")

  state = applyTap(state, "anxiety", "hill")

  state = applyTap(state, "anxiety", "step")

  assert.equal(skillReady("anxiety", state.runs.anxiety), true)

  const comp = applyCompleteAdventure(state, "anxiety")

  assert.equal(comp.tokensEarned, 30)

  assert.equal(comp.starsEarned, 3)

  assert.ok(comp.state.completed.includes("anxiety"))
})

test("16. meadowState: Spark Summit gameplay loop and task completion", () => {
  let state = initial()

  state = applyBegin(state, "happiness")

  state = applyPhase(state, "happiness", "identify")

  state = applyEmotion(state, "happiness", 0)

  state = applyPhase(state, "happiness", "understand")

  state = applyClue(state, "happiness", "smile")

  state = applyClue(state, "happiness", "warm")

  state = applyClue(state, "happiness", "bouncy")

  state = applyPhase(state, "happiness", "action")

  state = applyAction(state, "happiness", 2)

  state = applyPhase(state, "happiness", "practice")

  state = applyTap(state, "happiness", "win")

  state = applyTap(state, "happiness", "share")

  state = applyTap(state, "happiness", "kind")

  assert.equal(skillReady("happiness", state.runs.happiness), true)

  const comp = applyCompleteAdventure(state, "happiness")

  assert.equal(comp.tokensEarned, 30)

  assert.equal(comp.starsEarned, 3)

  assert.ok(comp.state.completed.includes("happiness"))
})

test("17. meadowState: Optional kindness bonus grants 5 tokens without duplication", () => {
  let state = initial()

  state = applyBegin(state, "anger")

  state.completed = ["anger"]

  // Claim kindness bonus

  state = applyKindness(state, "anger")

  assert.equal(state.tokens, 5, "Earned 5 kindness tokens")

  assert.ok(state.ledger.includes("anger:kindness"))

  // Try claiming again

  state = applyKindness(state, "anger")

  assert.equal(state.tokens, 5, "No duplicate kindness tokens granted")
})

test("18. meadowState: Full persistence round-trip saves and reloads state accurately", () => {
  mockStorage.clear()

  let state = initial()

  state.tokens = 60

  state.stars = 6

  state.completed = ["anger", "stress"]

  state.ledger = [
    "anger:identify",
    "anger:skill",
    "anger:complete",
    "anger:stars",
    "stress:identify",
    "stress:skill",
    "stress:complete",
    "stress:stars",
  ]

  state.profile = { name: "Alex", avatar: 1 }

  state.soundEnabled = true

  mockStorage.setItem(STORAGE_KEY, JSON.stringify(state))

  const restored = load()

  assert.equal(restored.tokens, 60)

  assert.equal(restored.stars, 6)

  assert.deepEqual(restored.completed, ["anger", "stress"])

  assert.deepEqual(restored.profile, { name: "Alex", avatar: 1 })

  assert.equal(restored.soundEnabled, true)
})

test("19. mini-games: Anger Volcano (Cool the Lava) mini-game awards 30 tokens & 3 stars", () => {
  let state = initial()
  state = applyBegin(state, "anger")
  state = applyTap(state, "anger", "words")
  state = applyTap(state, "anger", "support")
  state = applyTap(state, "anger", "breathe_ready")
  state = applyTap(state, "anger", "minigame_complete")

  assert.equal(skillReady("anger", state.runs.anger), true, "Cool the Lava mini-game completed")
  const result = applyCompleteAdventure(state, "anger")
  assert.equal(result.tokensEarned, 30)
  assert.equal(result.starsEarned, 3)
  assert.ok(result.state.completed.includes("anger"))
  assert.equal(result.state.tokens, 30)
  assert.equal(result.state.stars, 3)
})

test("20. mini-games: Stress Mountain (Pack Your Calm Kit) mini-game awards 30 tokens & 3 stars", () => {
  let state = initial()
  state = applyBegin(state, "stress")
  state = applyTap(state, "stress", "one")
  state = applyTap(state, "stress", "rest")
  state = applyTap(state, "stress", "ask")
  state = applyTap(state, "stress", "minigame_complete")

  assert.equal(skillReady("stress", state.runs.stress), true, "Pack Your Calm Kit completed")
  const result = applyCompleteAdventure(state, "stress")
  assert.equal(result.tokensEarned, 30)
  assert.equal(result.starsEarned, 3)
  assert.ok(result.state.completed.includes("stress"))
  assert.equal(result.state.tokens, 30)
  assert.equal(result.state.stars, 3)
})

test("21. mini-games: Tear River (Help a Friend) mini-game awards 30 tokens & 3 stars", () => {
  let state = initial()
  state = applyBegin(state, "sadness")
  state = applyTap(state, "sadness", "name")
  state = applyTap(state, "sadness", "trusted")
  state = applyTap(state, "sadness", "comfort")
  state = applyTap(state, "sadness", "minigame_complete")

  assert.equal(skillReady("sadness", state.runs.sadness), true, "Help a Friend completed")
  const result = applyCompleteAdventure(state, "sadness")
  assert.equal(result.tokensEarned, 30)
  assert.equal(result.starsEarned, 3)
  assert.ok(result.state.completed.includes("sadness"))
  assert.equal(result.state.tokens, 30)
  assert.equal(result.state.stars, 3)
})

test("22. mini-games: Worry Woods (Find the Brave Path) mini-game awards 30 tokens & 3 stars", () => {
  let state = initial()
  state = applyBegin(state, "anxiety")
  state = applyTap(state, "anxiety", "flower")
  state = applyTap(state, "anxiety", "cloud")
  state = applyTap(state, "anxiety", "tree")
  state = applyTap(state, "anxiety", "star")
  state = applyTap(state, "anxiety", "hill")
  state = applyTap(state, "anxiety", "step")
  state = applyTap(state, "anxiety", "minigame_complete")

  assert.equal(skillReady("anxiety", state.runs.anxiety), true, "Find the Brave Path completed")
  const result = applyCompleteAdventure(state, "anxiety")
  assert.equal(result.tokensEarned, 30)
  assert.equal(result.starsEarned, 3)
  assert.ok(result.state.completed.includes("anxiety"))
  assert.equal(result.state.tokens, 30)
  assert.equal(result.state.stars, 3)
})

test("23. mini-games: Spark Summit (Grow a Happiness Garden) mini-game awards 30 tokens & 3 stars", () => {
  let state = initial()
  state = applyBegin(state, "happiness")
  state = applyTap(state, "happiness", "win")
  state = applyTap(state, "happiness", "share")
  state = applyTap(state, "happiness", "kind")
  state = applyTap(state, "happiness", "minigame_complete")

  assert.equal(skillReady("happiness", state.runs.happiness), true, "Grow a Happiness Garden completed")
  const result = applyCompleteAdventure(state, "happiness")
  assert.equal(result.tokensEarned, 30)
  assert.equal(result.starsEarned, 3)
  assert.ok(result.state.completed.includes("happiness"))
  assert.equal(result.state.tokens, 30)
  assert.equal(result.state.stars, 3)
})

test("24. mini-games: Replaying any completed mini-game awards zero duplicate tokens or stars", () => {
  let state = initial()
  state = applyBegin(state, "anger")
  state = applyTap(state, "anger", "minigame_complete")
  const first = applyCompleteAdventure(state, "anger")
  assert.equal(first.tokensEarned, 30)
  assert.equal(first.starsEarned, 3)

  // Replay
  let replay = applyBegin(first.state, "anger", true)
  replay = applyTap(replay, "anger", "minigame_complete")
  const second = applyCompleteAdventure(replay, "anger")
  assert.equal(second.alreadyCompleted, true)
  assert.equal(second.tokensEarned, 0, "No duplicate tokens on replay")
  assert.equal(second.starsEarned, 0, "No duplicate stars on replay")
  assert.equal(second.state.tokens, 30, "Tokens balance strictly conserved")
  assert.equal(second.state.stars, 3, "Star balance strictly conserved")
})

test("25. mini-games: run.earned records what each play-through added (drives the celebration screen)", () => {
  let state = initial()
  state = applyBegin(state, "anger")
  state = applyTap(state, "anger", "minigame_complete")
  const first = applyCompleteAdventure(state, "anger")
  assert.deepEqual(
    first.state.runs.anger.earned,
    { tokens: ADVENTURE_TOKENS, stars: ADVENTURE_STARS },
    "First completion records the full reward for this run",
  )

  let replay = applyBegin(first.state, "anger", true)
  assert.equal(replay.runs.anger.earned, null, "Replay starts with no earned record")
  replay = applyTap(replay, "anger", "minigame_complete")
  const second = applyCompleteAdventure(replay, "anger")
  assert.deepEqual(
    second.state.runs.anger.earned,
    { tokens: 0, stars: 0 },
    "Replay completion records zero earned, so the celebration shows a replay",
  )
})

