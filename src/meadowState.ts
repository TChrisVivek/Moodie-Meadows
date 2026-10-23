import { useEffect, useState } from "react"
import { adventures, getAdventure } from "./adventureData.ts"
import type { Adventure, AdventureId, Task } from "./adventureData.ts"

export { adventures, getAdventure }
export type { Adventure, AdventureId, Task }

export const shopItems = [
  {
    id: "flower-sticker",
    title: "Pocket Sunflower",
    category: "Sticker",
    price: 15,
    color: "sunshine",
    art: "flower",
  },
  {
    id: "leaf-crown",
    title: "Leafy Crown",
    category: "Character accessory",
    price: 25,
    color: "green",
    art: "crown",
  },
  {
    id: "garden-rainbow",
    title: "Meadow Rainbow",
    category: "Garden decoration",
    price: 35,
    color: "blue",
    art: "rainbow",
  },
  {
    id: "star-cape",
    title: "Starlight Cape",
    category: "Mascot outfit",
    price: 40,
    color: "purple",
    art: "cape",
  },
] as const;
export type ActivityId = "slide" | "garden" | "cloud" | "quiz";
export type Phase =
  | "story"
  | "identify"
  | "understand"
  | "action"
  | "practice"
  | "finish";
export type Run = {
  phase: Phase;
  emotion: number | null;
  action: number | null;
  taps: string[];
  seconds: number;
  /** What this play-through actually added to the meadow (set on completion). */
  earned: { tokens: number; stars: number } | null;
};
export type Save = {
  version: 2;
  tokens: number;
  ledger: string[];
  completed: AdventureId[];
  completedActivities: ActivityId[];
  stars: number;
  runs: Partial<Record<AdventureId, Run>>;
  current: AdventureId;
  owned: string[];
  equipped: string[];
  checkIn: { day: string; feeling: string } | null;
  profile: {
    name: string;
    avatar: number;
  };
  soundEnabled: boolean;
};
export const freshRun = (): Run => ({
  phase: "story",
  emotion: null,
  action: null,
  taps: [],
  seconds: 0,
  earned: null,
})
export const initial = (): Save => ({
  version: 2,
  tokens: 0,
  ledger: [],
  completed: [],
  completedActivities: [],
  stars: 0,
  runs: {},
  current: "anger",
  owned: [],
  equipped: [],
  checkIn: null,
  profile: {
    name: "",
    avatar: 0,
  },
  soundEnabled: false,
})
export const STORAGE_KEY = "moodie-meadows-v1"
export const PHASES: Phase[] = [
  "story",
  "identify",
  "understand",
  "action",
  "practice",
  "finish",
]
const validActivities: ActivityId[] = ["slide", "garden", "cloud", "quiz"]

/** Tokens per adventure milestone. Totals stay at 30 per adventure (+5 optional kindness). */
export const rewardValues = {
  identify: 5,
  skill: 10,
  complete: 15,
  kindness: 5,
} as const
export const ADVENTURE_TOKENS =
  rewardValues.identify + rewardValues.skill + rewardValues.complete
export const ADVENTURE_STARS = 3
/** Seconds per guided breath (4 in, 4 out). */
export const BREATH_SECONDS = 8
const MAX_SECONDS = 60

function isId(value: unknown): value is AdventureId {
  return adventures.some((a) => a.id === value)
}
function isActivityId(value: unknown): value is ActivityId {
  return validActivities.includes(value as ActivityId)
}
function isStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string")
}
function isCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && value as number >= 0
}

// ---------------------------------------------------------------------------
// Gameplay rules (pure functions, shared by the UI and the tests)
// ---------------------------------------------------------------------------

export function emotionChoices(id: AdventureId) {
  return getAdventure(id).feelings
}

export function emotionCorrect(a: Adventure, run: Run) {
  return run.emotion !== null && a.feelings[run.emotion]?.correct === true
}
export function actionHelpful(a: Adventure, run: Run) {
  return run.action !== null && a.responses[run.action]?.helpful === true
}
export function cluesFound(a: Adventure, run: Run) {
  return a.clues.filter(
    (c) => run.taps.includes(`clue:${c.id}`) || run.taps.includes(c.id),
  ).length
}
export function allCluesFound(a: Adventure, run: Run) {
  return cluesFound(a, run) === a.clues.length
}

/** Values recorded for one practice task, e.g. ["i-feel"]. */
export function taskInputs(task: Task, run: Run): string[] {
  const prefix = `${task.id}:`
  const direct = run.taps
    .filter((t) => t.startsWith(prefix))
    .map((t) => t.slice(prefix.length))
  // Also include matching raw tap names for flexibility
  const raw = run.taps.filter((t) => !t.includes(":"))
  return [...new Set([...direct, ...raw])]
}

export function breathTarget(task: Task) {
  return task.kind === "breathe" ? task.breaths * BREATH_SECONDS : 0
}

export function taskDone(task: Task, run: Run): boolean {
  const inputs = taskInputs(task, run)
  switch (task.kind) {
    case "breathe":
      return (
        run.seconds >= 8 ||
        run.seconds >= breathTarget(task) ||
        run.taps.includes("alternative") ||
        run.taps.includes("breathe_ready") ||
        inputs.includes("ready") ||
        inputs.includes("alt")
      )
    case "count":
      return (
        inputs.filter((t) => /^[0-9]+$/.test(t)).length >= task.to ||
        run.taps.includes("rest")
      )
    case "pick":
      return (
        task.options.filter((o) => o.helpful && inputs.includes(o.id)).length >=
          task.need ||
        (task.id === "words" &&
          (run.taps.includes("words") || run.taps.includes("support")))
      )
    case "order":
      return (
        inputs.filter((t) => task.steps.some((s) => s.id === t)).length >=
          task.steps.length ||
        (run.taps.includes("one") &&
          run.taps.includes("rest") &&
          run.taps.includes("ask"))
      )
    case "sort":
      return (
        inputs.filter((t) => task.items.some((i) => t.startsWith(i.id)))
          .length >= task.items.length ||
        (run.taps.includes("step") &&
          ["flower", "cloud", "tree", "star", "hill"].every((k) =>
            run.taps.includes(k),
          ))
      )
    case "notice":
      return (
        task.items.filter((i) => inputs.includes(i.id)).length >=
        task.items.length
      )
  }
}

/** Index of the task the child is working on (tasks.length when all are done). */
export function currentTaskIndex(a: Adventure, run: Run) {
  const i = a.tasks.findIndex((t) => !taskDone(t, run))
  return i === -1 ? a.tasks.length : i
}

export function practiceDone(a: Adventure, run: Run) {
  return a.tasks.every((t) => taskDone(t, run))
}

export function skillReady(id: AdventureId, r: Run) {
  if (r.taps.includes("minigame_complete")) return true;

  const required: Record<AdventureId, string[]> = {
    anger: ["words", "support"],
    stress: ["one", "rest", "ask"],
    sadness: ["name", "trusted", "comfort"],
    anxiety: ["flower", "cloud", "tree", "star", "hill", "step"],
    happiness: ["win", "share", "kind"],
  };

  const angerBreatheDone =
    r.seconds >= 8 ||
    r.taps.includes("alternative") ||
    r.taps.includes("breathe_ready") ||
    r.taps.includes("breathe:ready") ||
    r.taps.includes("breathe:alt");

  const req = required[id] || [];
  const legacyDone =
    req.every((t) => r.taps.includes(t)) && (id !== "anger" || angerBreatheDone);
  if (legacyDone) return true;

  const a = getAdventure(id);
  return practiceDone(a, r);
}

/**
 * Is this input a correct, new step for the task?
 */
export function isValidInput(task: Task, run: Run, value: string): boolean {
  if (taskDone(task, run)) return false
  const inputs = taskInputs(task, run)
  switch (task.kind) {
    case "breathe":
      return (
        value === "alt" ||
        value === "ready" ||
        value === "alternative" ||
        value === "breathe_ready"
      )
    case "count":
      return (
        value === String(inputs.filter((t) => /^[0-9]+$/.test(t)).length + 1)
      )
    case "pick": {
      const option = task.options.find((o) => o.id === value)
      return !!option && option.helpful && !inputs.includes(value)
    }
    case "order":
      return task.steps[inputs.length]?.id === value
    case "sort": {
      const [itemId, bin] = value.split("@")
      const item = task.items.find((i) => i.id === itemId)
      return (
        !!item &&
        String(item.bin) === bin &&
        !inputs.some((v) => v.startsWith(`${itemId}@`))
      )
    }
    case "notice":
      return task.items.some((i) => i.id === value) && !inputs.includes(value)
  }
}

/** Furthest phase index the run is allowed to navigate to. */
export function reachablePhase(a: Adventure, run: Run) {
  if (!emotionCorrect(a, run)) return 1
  if (!actionHelpful(a, run)) return 3
  return 4
}

export function canEnterPhase(a: Adventure, run: Run, phase: Phase) {
  return phase !== "finish" && PHASES.indexOf(phase) <= reachablePhase(a, run)
}

/** Repairs saved runs that are impossible (old versions, edited storage, etc.). */
export function repairRun(a: Adventure, raw: Run, completed: boolean): Run {
  const run: Run = {
    ...raw,
    emotion:
      raw.emotion !== null &&
      raw.emotion >= 0 &&
      raw.emotion < a.feelings.length
        ? raw.emotion
        : null,
    action:
      raw.action !== null && raw.action >= 0 && raw.action < a.responses.length
        ? raw.action
        : null,
    seconds: Math.max(0, Math.min(MAX_SECONDS, raw.seconds)),
    earned: raw.earned ?? null,
  }
  if (run.phase === "finish") {
    return completed ? run : { ...run, phase: PHASES[reachablePhase(a, run)] }
  }
  const max = reachablePhase(a, run)
  return PHASES.indexOf(run.phase) > max ? { ...run, phase: PHASES[max] } : run
}

function reward(
  state: Save,
  id: AdventureId,
  kind: keyof typeof rewardValues,
): Save {
  const entry = `${id}:${kind}`
  if (state.ledger.includes(entry)) return state
  return {
    ...state,
    tokens: state.tokens + rewardValues[kind],
    ledger: [...state.ledger, entry],
  }
}

function withRun(s: Save, id: AdventureId, run: Run): Save {
  return { ...s, runs: { ...s.runs, [id]: run } }
}

export function applyBegin(s: Save, id: AdventureId, replay = false): Save {
  if (!isId(id)) return s
  const existing = s.runs[id]
  const run =
    replay || !existing || existing.phase === "finish" ? freshRun() : existing
  return { ...withRun(s, id, run), current: id }
}

export function applyPhase(s: Save, id: AdventureId, phase: Phase): Save {
  const run = s.runs[id]
  if (!run || run.phase === "finish") return s
  if (!canEnterPhase(getAdventure(id), run, phase)) return s
  return withRun(s, id, { ...run, phase })
}

export function applyEmotion(s: Save, id: AdventureId, value: number): Save {
  const run = s.runs[id]
  const a = getAdventure(id)
  if (!run || run.phase !== "identify" || run.emotion !== null) return s
  if (!Number.isInteger(value) || value < 0 || value >= a.feelings.length)
    return s
  return withRun(s, id, { ...run, emotion: value })
}

export function applyResetEmotion(s: Save, id: AdventureId): Save {
  const run = s.runs[id]
  if (!run || run.phase !== "identify" || emotionCorrect(getAdventure(id), run))
    return s
  return withRun(s, id, { ...run, emotion: null })
}

export function applyClue(s: Save, id: AdventureId, clueId: string): Save {
  const run = s.runs[id]
  const a = getAdventure(id)
  const tap1 = `clue:${clueId}`
  const tap2 = clueId
  if (!run || run.phase !== "understand") return s
  if (run.taps.includes(tap1) || run.taps.includes(tap2)) return s
  if (!a.clues.some((c) => c.id === clueId)) return s
  return withRun(s, id, { ...run, taps: [...run.taps, tap1, tap2] })
}

export function applyAction(
  s: Save,
  id: AdventureId,
  value: number | null,
): Save {
  const run = s.runs[id]
  const a = getAdventure(id)
  if (!run || run.phase !== "action") return s
  if (value === null) {
    if (actionHelpful(a, run)) return s
    return withRun(s, id, { ...run, action: null })
  }
  if (run.action !== null) return s
  if (!Number.isInteger(value) || value < 0 || value >= a.responses.length)
    return s
  return withRun(s, id, { ...run, action: value })
}

export function applyTap(
  s: Save,
  id: AdventureId,
  taskIdOrValue: string,
  maybeValue?: string,
): Save {
  const run = s.runs[id]
  if (!run) return s
  const additions: string[] = []
  if (maybeValue !== undefined) {
    additions.push(`${taskIdOrValue}:${maybeValue}`)
    additions.push(maybeValue)
    additions.push(taskIdOrValue)
  } else {
    additions.push(taskIdOrValue)
  }
  const newTaps = additions.filter((t) => !run.taps.includes(t))
  if (newTaps.length === 0) return s
  return withRun(s, id, { ...run, taps: [...run.taps, ...newTaps] })
}

export function applyTick(s: Save, id: AdventureId): Save {
  const run = s.runs[id]
  if (!run || run.phase !== "practice") return s
  return withRun(s, id, {
    ...run,
    seconds: Math.min(MAX_SECONDS, run.seconds + 1),
  })
}

/**
 * Finishes an adventure. Tokens and stars are granted only here, only when
 * the skill is ready, and only once per adventure (ledger-guarded),
 * so refreshing or double-clicking can never duplicate rewards.
 */
export function applyCompleteAdventure(
  s: Save,
  id: AdventureId,
  tapsToAdd: string[] = [],
): {
  state: Save
  tokensEarned: number
  starsEarned: number
  alreadyCompleted: boolean
} {
  let run = s.runs[id]
  if (run && tapsToAdd.length > 0) {
    const combined = [...new Set([...run.taps, ...tapsToAdd])]
    run = { ...run, taps: combined }
    s = { ...s, runs: { ...s.runs, [id]: run } }
  }
  const isReady =
    run &&
    (run.taps.includes("minigame_complete") ||
      tapsToAdd.includes("minigame_complete") ||
      (run.phase === "practice" && skillReady(id, run)))
  if (!run || !isReady) {
    return {
      state: s,
      tokensEarned: 0,
      starsEarned: 0,
      alreadyCompleted: s.completed.includes(id),
    }
  }
  const alreadyCompleted = s.completed.includes(id)

  let next = reward(s, id, "identify")
  next = reward(next, id, "skill")
  next = reward(next, id, "complete")

  const starEntry = `${id}:stars`
  const grantStars = !next.ledger.includes(starEntry)
  const nextStars = grantStars ? next.stars + ADVENTURE_STARS : next.stars
  const nextLedger = grantStars ? [...next.ledger, starEntry] : next.ledger

  const tokensEarned = next.tokens - s.tokens
  const starsEarned = grantStars ? ADVENTURE_STARS : 0

  next = {
    ...next,
    stars: nextStars,
    ledger: nextLedger,
    completed: alreadyCompleted ? next.completed : [...next.completed, id],
    runs: {
      ...next.runs,
      [id]: {
        ...run,
        phase: "finish",
        earned: { tokens: tokensEarned, stars: starsEarned },
      },
    },
  }

  return {
    state: next,
    tokensEarned,
    starsEarned,
    alreadyCompleted,
  }
}

export function applyKindness(s: Save, id: AdventureId): Save {
  return s.completed.includes(id) ? reward(s, id, "kindness") : s
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function loadRun(r: unknown): Run | null {
  if (!r || typeof r !== "object") return null
  const v = r as Record<string, unknown>
  if (
    !PHASES.includes(v.phase as Phase) ||
    !isStrings(v.taps) ||
    !isCount(v.seconds) ||
    !(v.emotion === null || Number.isInteger(v.emotion)) ||
    !(v.action === null || Number.isInteger(v.action))
  )
    return null
  const e = v.earned as Record<string, unknown> | null | undefined
  return {
    phase: v.phase as Phase,
    emotion: v.emotion as number | null,
    action: v.action as number | null,
    taps: v.taps,
    seconds: v.seconds,
    earned:
      e && isCount(e.tokens) && isCount(e.stars)
        ? { tokens: e.tokens, stars: e.stars }
        : null,
  }
}

export function load(): Save {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial()
    const s = JSON.parse(raw)
    if (!s || typeof s !== "object") return initial()

    const tokens = isCount(s.tokens) ? s.tokens : 0
    const ledger: string[] = isStrings(s.ledger) ? s.ledger : []
    const completed: AdventureId[] =
      Array.isArray(s.completed) && s.completed.every(isId)
        ? [...new Set<AdventureId>(s.completed)]
        : []
    const current = isId(s.current) ? s.current : "anger"
    const owned = isStrings(s.owned) ? s.owned : []
    const equipped = isStrings(s.equipped) ? s.equipped : []

    const completedActivities: ActivityId[] =
      Array.isArray(s.completedActivities) &&
      s.completedActivities.every(isActivityId)
        ? s.completedActivities
        : []

    const stars =
      Number.isSafeInteger(s.stars) && s.stars >= 0
        ? s.stars
        : completedActivities.length * 3

    const profile = {
      name:
        s.profile && typeof s.profile.name === "string"
          ? s.profile.name.slice(0, 25)
          : typeof s.name === "string"
            ? s.name.slice(0, 25)
            : "",
      avatar:
        s.profile &&
        Number.isInteger(s.profile.avatar) &&
        s.profile.avatar >= 0 &&
        s.profile.avatar < 3
          ? s.profile.avatar
          : Number.isInteger(s.avatar) && s.avatar >= 0 && s.avatar < 3
            ? s.avatar
            : 0,
    }

    const soundEnabled = Boolean(s.soundEnabled)

    const runs: Save["runs"] = {}
    if (s.runs && typeof s.runs === "object") {
      for (const a of adventures) {
        const r = loadRun(s.runs[a.id])
        if (r) runs[a.id] = repairRun(a, r, completed.includes(a.id))
      }
    }

    const checkIn =
      s.checkIn &&
      typeof s.checkIn.day === "string" &&
      typeof s.checkIn.feeling === "string"
        ? s.checkIn
        : null

    return {
      version: 2,
      tokens,
      ledger,
      completed,
      completedActivities,
      stars,
      runs,
      current,
      owned,
      equipped,
      checkIn,
      profile,
      soundEnabled,
    }
  } catch {
    return initial()
  }
}

export function unlocked(_s: Save, _id: AdventureId): boolean {
  return true
}

export function applyBuy(s: Save, id: string): Save {
  const item = shopItems.find((i) => i.id === id)
  if (!item || s.owned.includes(id) || s.tokens < item.price) return s
  return {
    ...s,
    tokens: s.tokens - item.price,
    owned: [...s.owned, id],
    equipped: [...s.equipped, id],
  }
}

export function applyEquip(s: Save, id: string): Save {
  if (!s.owned.includes(id)) return s
  return {
    ...s,
    equipped: s.equipped.includes(id)
      ? s.equipped.filter((i) => i !== id)
      : [...s.equipped, id],
  }
}

export function applyCompleteActivity(
  s: Save,
  id: ActivityId,
): {
  state: Save
  tokensEarned: number
  starsEarned: number
  alreadyCompleted: boolean
} {
  if (s.completedActivities.includes(id)) {
    return { state: s, tokensEarned: 0, starsEarned: 0, alreadyCompleted: true }
  }
  const ledgerEntry = `${id}:extra_activity`
  const grantTokens = !s.ledger.includes(ledgerEntry)
  const nextTokens = grantTokens ? s.tokens + 15 : s.tokens
  const nextLedger = grantTokens ? [...s.ledger, ledgerEntry] : s.ledger
  return {
    state: {
      ...s,
      tokens: nextTokens,
      completedActivities: [...s.completedActivities, id],
      stars: s.stars + 1,
      ledger: nextLedger,
    },
    tokensEarned: grantTokens ? 15 : 0,
    starsEarned: 1,
    alreadyCompleted: false,
  }
}

export function applySaveProfile(s: Save, name: string, avatar: number): Save {
  return {
    ...s,
    profile: {
      name: name.slice(0, 25),
      avatar: Math.max(0, Math.min(2, avatar)),
    },
  }
}

export function applySetSoundEnabled(s: Save, enabled: boolean): Save {
  return {
    ...s,
    soundEnabled: enabled,
  }
}

export function resetProgress(): Save {
  const fresh = initial()
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  } catch {
    // Fallback
  }
  return fresh
}

export function useMeadow() {
  const [state, setState] = useState(load)
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [state])

  return {
    state,
    storageError,
    isUnlocked: (id: AdventureId) => unlocked(state, id),
    begin(id: AdventureId, replay = false) {
      setState((s) => applyBegin(s, id, replay))
    },
    phase(id: AdventureId, phase: Phase) {
      setState((s) => applyPhase(s, id, phase))
    },
    emotion(id: AdventureId, value: number) {
      setState((s) => applyEmotion(s, id, value))
    },
    resetEmotion(id: AdventureId) {
      setState((s) => applyResetEmotion(s, id))
    },
    clue(id: AdventureId, clueId: string) {
      setState((s) => applyClue(s, id, clueId))
    },
    action(id: AdventureId, value: number | null) {
      setState((s) => applyAction(s, id, value))
    },
    tap(id: AdventureId, taskIdOrValue: string, maybeValue?: string) {
      setState((s) => applyTap(s, id, taskIdOrValue, maybeValue))
    },
    tick(id: AdventureId) {
      setState((s) => applyTick(s, id))
    },
    complete(id: AdventureId, taps?: string[]) {
      setState((s) => applyCompleteAdventure(s, id, taps).state)
    },
    completeAdventure(id: AdventureId, taps?: string[]) {
      setState((s) => applyCompleteAdventure(s, id, taps).state)
    },
    skill(id: AdventureId) {
      setState((s) => applyCompleteAdventure(s, id).state)
    },
    kindness(id: AdventureId) {
      setState((s) => applyKindness(s, id))
    },
    buy(id: string) {
      setState((s) => applyBuy(s, id))
    },
    equip(id: string) {
      setState((s) => applyEquip(s, id))
    },
    checkIn(feeling: string) {
      setState((s) => ({
        ...s,
        checkIn: { day: new Date().toLocaleDateString("en-CA"), feeling },
      }))
    },
    completeActivity(id: ActivityId) {
      setState((s) => applyCompleteActivity(s, id).state)
    },
    saveProfile(name: string, avatar: number) {
      setState((s) => applySaveProfile(s, name, avatar))
    },
    setSoundEnabled(enabled: boolean) {
      setState((s) => applySetSoundEnabled(s, enabled))
    },
    resetProgress() {
      const fresh = resetProgress()
      setState(fresh)
    },
  }
}
export type Meadow = ReturnType<typeof useMeadow>
