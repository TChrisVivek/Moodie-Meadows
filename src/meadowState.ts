import { useEffect, useState } from "react"

export const adventures = [
  {
    id: "anger",
    title: "Anger Volcano",
    short: "Pause & use words",
    color: "peach",
    mascot: "Ember",
    tint: "#edb29b",
    mood: "angry",
    feeling: "Angry",
    story:
      "Ember was building a toy town. A friend took the little red truck without asking. Ember wants it back!",
    clues:
      "Ember says, “I feel angry!” Their cheeks feel hot, their fists feel tight, and their heart beats fast. Having a toy taken can feel unfair.",
    validation:
      "It is okay to feel angry. You can feel angry and still choose a safe action.",
    actions: [
      "Grab the truck and push",
      "Pause, then say “I’m using that. Please give it back.”",
      "Break the toy town",
    ],
    helpful: 1,
    explanation:
      "Pausing gives Ember time to choose. Clear words can help solve the problem. If the friend won’t listen, Ember can ask a trusted adult for help.",
    skill: "Pause, breathe, and speak",
    practice:
      "Help Ember take three comfortable breaths. Then try some calm words.",
    next: "I can pause, notice my body, use words, and ask a trusted adult for help.",
    kindness: "Offer to take turns with the truck when Ember is finished.",
    sticker: "Brave Little Ember",
  },
  {
    id: "stress",
    title: "Stress Mountain",
    short: "One small step",
    color: "green",
    mascot: "Moss",
    tint: "#b6c99b",
    mood: "worried",
    feeling: "Stressed",
    story:
      "Moss has a worksheet, a messy desk, and a school bag to pack. “There’s too much to do!” says Moss.",
    clues:
      "Lots of tasks can make Moss feel stressed. Their shoulders feel tight and their thoughts race. It can be hard to know where to begin.",
    validation:
      "Feeling stressed is normal. You don’t have to do everything all at once.",
    actions: [
      "Try to do everything at once",
      "Keep going without any rest",
      "Choose one small task and ask for support",
    ],
    helpful: 2,
    explanation:
      "One small step makes the mountain feel smaller. A short break and support from a trusted adult can help too.",
    skill: "Make a little-step plan",
    practice: "Build Moss a plan. Tap the steps in a helpful order.",
    next: "I can break a big task into small steps, take a break, and ask for support.",
    kindness: "Offer to help Moss put one pencil away.",
    sticker: "Little-Step Moss",
  },
  {
    id: "sadness",
    title: "Sadness River",
    short: "Feel it & share it",
    color: "blue",
    mascot: "Ripple",
    tint: "#afccdd",
    mood: "sad",
    feeling: "Sad",
    story:
      "Ripple sees friends playing a game without them. Ripple wanted to join in and sits quietly beside the river.",
    clues:
      "Feeling left out can bring sadness. Ripple’s chest feels heavy, their eyes feel watery, and they have less energy.",
    validation:
      "Sadness is okay. Ripple doesn’t have to smile before they are ready.",
    actions: [
      "Tell someone trusted “I feel sad and left out.”",
      "Say “I’m not allowed to be sad.”",
      "Hide everyone’s game",
    ],
    helpful: 0,
    explanation:
      "Naming sadness and sharing it with someone trusted can help Ripple feel supported. They can also choose a comforting activity.",
    skill: "Name, share, and find comfort",
    practice:
      "Help Ripple find words, choose support, and pick something comforting.",
    next: "I can say “I feel sad,” talk with someone trusted, and choose a little comfort.",
    kindness: "Ask Ripple “Would you like company, or a little space?”",
    sticker: "Caring Ripple",
  },
  {
    id: "anxiety",
    title: "Anxiety Cloud Kingdom",
    short: "Ground & take a step",
    color: "purple",
    mascot: "Nimbus",
    tint: "#c7b9df",
    mood: "worried",
    feeling: "Nervous",
    story:
      "Nimbus will speak in class tomorrow. “What if I forget my words?” they wonder. The words haven’t even been spoken yet!",
    clues:
      "Thinking about something uncertain can bring worry. Nimbus has a fluttery tummy, sweaty hands, and a fast heartbeat.",
    validation:
      "Feeling nervous is normal. You can take small steps with support.",
    actions: [
      "Keep every worry a secret",
      "Breathe gently, notice five things, and ask a trusted adult to practise",
      "Tell yourself you must never make mistakes",
    ],
    helpful: 1,
    explanation:
      "Noticing things nearby can bring attention to right now. Gentle breaths and practising with a trusted adult may help. It’s okay if some worry stays.",
    skill: "Notice five & take one step",
    practice:
      "Take a comfortable breath if you like. Find five things in the cloud kingdom, then choose one small step.",
    next: "I can notice five things around me, take one small step, and talk to a trusted adult.",
    kindness: "Tell Nimbus “I can listen while you practise one sentence.”",
    sticker: "Brave Cloud Nimbus",
  },
  {
    id: "happiness",
    title: "Happiness Sunshine Garden",
    short: "Notice & share joy",
    color: "sunshine",
    mascot: "Sunny",
    tint: "#f7cd64",
    mood: "happy",
    feeling: "Happy",
    story:
      "Sunny finally grew a tiny sunflower after watering it for days. A little green leaf peeks out. “I did it!” says Sunny.",
    clues:
      "A small win can bring happiness. Sunny smiles, feels warm inside, and wants to bounce! Happiness can also feel quiet and peaceful.",
    validation:
      "Happy moments are lovely to notice. You don’t have to feel happy all the time.",
    actions: [
      "Say nobody else can enjoy the flower",
      "Say only big wins count",
      "Celebrate the little leaf and share the moment",
    ],
    helpful: 2,
    explanation:
      "Small wins matter. Sharing a happy moment and showing kindness can help us connect with others.",
    skill: "Grow a little joy",
    practice: "Help Sunny notice a small win, share it, and do something kind.",
    next: "I can enjoy small wins, notice good moments, and share kindness without expecting a prize.",
    kindness: "Invite a meadow friend to enjoy the little sunflower too.",
    sticker: "Sunshine Sharer",
  },
] as const

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
] as const
export type AdventureId = typeof adventures[number]["id"]
export type ActivityId = "slide" | "garden" | "cloud" | "quiz"
export type Phase =
  | "story"
  | "identify"
  | "understand"
  | "action"
  | "practice"
  | "finish"
export type Run = {
  phase: Phase
  emotion: number | null
  action: number | null
  taps: string[]
  seconds: number
}
export type Save = {
  version: 2
  tokens: number
  ledger: string[]
  completed: AdventureId[]
  completedActivities: ActivityId[]
  stars: number
  runs: Partial<Record<AdventureId, Run>>
  current: AdventureId
  owned: string[]
  equipped: string[]
  checkIn: { day: string; feeling: string } | null
  profile: {
    name: string
    avatar: number
  }
  soundEnabled: boolean
}
export const freshRun = (): Run => ({
  phase: "story",
  emotion: null,
  action: null,
  taps: [],
  seconds: 0,
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
const key = "moodie-meadows-v1"
const phases: Phase[] = [
  "story",
  "identify",
  "understand",
  "action",
  "practice",
  "finish",
]
const validActivities: ActivityId[] = ["slide", "garden", "cloud", "quiz"]

function isId(value: unknown): value is AdventureId {
  return adventures.some((a) => a.id === value)
}
function isActivityId(value: unknown): value is ActivityId {
  return validActivities.includes(value as ActivityId)
}
function isStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string")
}

export function load(): Save {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return initial()
    const s = JSON.parse(raw)
    if (!s || typeof s !== "object") return initial()

    // Base validation for common fields
    const tokens =
      Number.isSafeInteger(s.tokens) && s.tokens >= 0 ? s.tokens : 0
    const ledger = isStrings(s.ledger) ? s.ledger : []
    const completed =
      Array.isArray(s.completed) && s.completed.every(isId) ? s.completed : []
    const current = isId(s.current) ? s.current : "anger"
    const owned = isStrings(s.owned) ? s.owned : []
    const equipped = isStrings(s.equipped) ? s.equipped : []

    // V2 persistence fields with graceful backward compatibility for V1 data
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
        s.profile && Number.isInteger(s.profile.avatar) && s.profile.avatar >= 0 && s.profile.avatar < 3
          ? s.profile.avatar
          : Number.isInteger(s.avatar) && s.avatar >= 0 && s.avatar < 3
            ? s.avatar
            : 0,
    }

    const soundEnabled = Boolean(s.soundEnabled)

    const runs: Save["runs"] = {}
    if (s.runs && typeof s.runs === "object") {
      for (const a of adventures) {
        const r = s.runs[a.id]
        if (
          r &&
          phases.includes(r.phase) &&
          isStrings(r.taps) &&
          Number.isInteger(r.seconds) &&
          r.seconds >= 0 &&
          (r.emotion === null || Number.isInteger(r.emotion)) &&
          (r.action === null || Number.isInteger(r.action))
        ) {
          runs[a.id] = { ...r, seconds: Math.min(24, r.seconds) }
        }
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

const values = { identify: 5, skill: 10, complete: 15, kindness: 5 } as const
function reward(state: Save, id: AdventureId, kind: keyof typeof values): Save {
  const entry = `${id}:${kind}`
  if (state.ledger.includes(entry)) return state
  return {
    ...state,
    tokens: state.tokens + values[kind],
    ledger: [...state.ledger, entry],
  }
}

// Allows open, flexible exploration so children in distress can directly select
// any emotion adventure, while keeping pedagogical recommendations visible.
export function unlocked(_s: Save, _id: AdventureId): boolean {
  return true
}

export const STORAGE_KEY = "moodie-meadows-v1"

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
): { state: Save; tokensEarned: number; starsEarned: number; alreadyCompleted: boolean } {
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

  const updateRun = (id: AdventureId, fn: (run: Run) => Run) => {
    setState((s) => {
      const run = fn(s.runs[id] || freshRun())
      const next = { ...s, runs: { ...s.runs, [id]: run } }
      // A skill earns its tokens as soon as it is practised, even before finishing.
      return run.phase === "practice" && skillReady(id, run)
        ? reward(next, id, "skill")
        : next
    })
  }

  return {
    state,
    storageError,
    isUnlocked: (id: AdventureId) => unlocked(state, id),
    begin(id: AdventureId, replay = false) {
      setState((s) => ({
        ...s,
        current: id,
        runs: {
          ...s.runs,
          [id]: replay ? freshRun() : s.runs[id] || freshRun(),
        },
      }))
    },
    phase(id: AdventureId, phase: Phase) {
      updateRun(id, (r) => ({ ...r, phase }))
    },
    emotion(id: AdventureId, value: number) {
      setState((s) => {
        const r = s.runs[id]
        if (!r || r.phase !== "identify" || r.emotion !== null) return s
        const expected = adventures.find((a) => a.id === id)!.feeling
        const choices = emotionChoices(id)
        const next = {
          ...s,
          runs: { ...s.runs, [id]: { ...r, emotion: value } },
        }
        return choices[value]?.label === expected
          ? reward(next, id, "identify")
          : next
      })
    },
    resetEmotion(id: AdventureId) {
      updateRun(id, (r) => ({ ...r, emotion: null }))
    },
    action(id: AdventureId, value: number | null) {
      updateRun(id, (r) => ({ ...r, action: value }))
    },
    tap(id: AdventureId, value: string) {
      updateRun(id, (r) =>
        r.taps.includes(value) ? r : { ...r, taps: [...r.taps, value] },
      )
    },
    tick(id: AdventureId) {
      updateRun(id, (r) => ({ ...r, seconds: Math.min(24, r.seconds + 1) }))
    },
    skill(id: AdventureId) {
      setState((s) => {
        const r = s.runs[id]
        if (!r || r.phase !== "practice" || !skillReady(id, r)) return s
        const next = reward(reward(s, id, "skill"), id, "complete")
        return {
          ...next,
          completed: next.completed.includes(id)
            ? next.completed
            : [...next.completed, id],
          runs: { ...next.runs, [id]: { ...r, phase: "finish" } },
        }
      })
    },
    kindness(id: AdventureId) {
      setState((s) =>
        s.completed.includes(id) ? reward(s, id, "kindness") : s,
      )
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

export function emotionChoices(id: AdventureId) {
  const all = [
    { label: "Angry", mood: "angry", tint: "#edb29b" },
    { label: "Stressed", mood: "worried", tint: "#b6c99b" },
    { label: "Sad", mood: "sad", tint: "#afccdd" },
    { label: "Nervous", mood: "worried", tint: "#c7b9df" },
    { label: "Happy", mood: "happy", tint: "#f7cd64" },
  ]
  return all.filter(
    (c) =>
      c.label !== (id === "happiness" ? "Stressed" : "Happy") ||
      c.label === adventures.find((a) => a.id === id)!.feeling,
  )
}

export function skillReady(id: AdventureId, r: Run) {
  const required = {
    anger: ["words", "support"],
    stress: ["one", "rest", "ask"],
    sadness: ["name", "trusted", "comfort"],
    anxiety: ["flower", "cloud", "tree", "star", "hill", "step"],
    happiness: ["win", "share", "kind"],
  }[id]

  // For anger, children can finish if they took gentle breaths (>=8s or >=24s),
  // chose softening hands, OR clicked "I'm ready" (breathe_ready).
  // This eliminates the usability trap where children get stuck if they pause the breath timer.
  const angerBreatheDone =
    r.seconds >= 8 ||
    r.taps.includes("alternative") ||
    r.taps.includes("breathe_ready")

  return (
    required.every((t) => r.taps.includes(t)) &&
    (id !== "anger" || angerBreatheDone)
  )
}
