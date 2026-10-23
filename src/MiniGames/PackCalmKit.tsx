import React, { useState } from "react"
import { Buddy, Icon, NarrationControls } from "../MeadowArt"
import { narration } from "../narration"
import type { Adventure } from "../adventureData"

type Props = {
  adventure: Adventure
  onComplete: (data: { taps: string[] }) => void
}

type KitItem = {
  id: string
  name: string
  icon: string
  color: string
  why: string
  cue: string
}

const KIT_ITEMS: KitItem[] = [
  {
    id: "star",
    name: "Breathing Star",
    icon: "⭐",
    color: "#f6ce68",
    why: "Deep belly breaths to slow down racing thoughts.",
    cue: "Breathing star: Take a deep breath to steady your pace.",
  },
  {
    id: "water",
    name: "Cool Water",
    icon: "💧",
    color: "#80deea",
    why: "A fresh sip to recharge your body.",
    cue: "Cool water: Take a sip to refresh your energy.",
  },
  {
    id: "card",
    name: "Calm Break",
    icon: "⏸️",
    color: "#b39ddb",
    why: "A quick pause to climb step-by-step.",
    cue: "Calm break: Pause and take it one step at a time.",
  },
  {
    id: "pebble",
    name: "Soft Pebble",
    icon: "🪨",
    color: "#a5d6a7",
    why: "Hold a smooth stone to feel steady and calm.",
    cue: "Soft pebble: Hold a smooth stone to feel grounded.",
  },
]

export default function PackCalmKit({ adventure, onComplete }: Props) {
  // Game states: "pack" -> "climb" -> "summit"
  const [stage, setStage] = useState<"pack" | "climb" | "summit">("pack")
  const [backpack, setBackpack] = useState<KitItem[]>([])
  const [selectedItem, setSelectedItem] = useState<KitItem | null>(null)
  const [feedback, setFeedback] = useState<string>(
    "Tap coping items below to pack Moss’s hiking bag."
  )
  const [climbStep, setClimbStep] = useState(0)

  // Place item into backpack
  function addItem(item: KitItem) {
    if (backpack.some((i) => i.id === item.id)) return

    const nextKit = [...backpack, item]
    setBackpack(nextKit)
    setSelectedItem(null)
    setFeedback(`Packed ${item.name}! ${item.why}`)
    narration.speak(item.cue, `kit-${item.id}`)
  }

  // Remove item if child wants to switch
  function removeItem(itemId: string) {
    setBackpack(backpack.filter((i) => i.id !== itemId))
    setFeedback("Item removed. Pack what feels right to you.")
  }

  // Progress the mountain climb step by step
  function advanceClimb() {
    if (climbStep < 2) {
      const nextStep = climbStep + 1
      setClimbStep(nextStep)
      if (nextStep === 1) {
        setFeedback("Step 1: Moss pauses on a sunny rock and takes a sip of cool water.")
        narration.speak("Step 1: Moss pauses and takes a sip of cool water.", "climb-step1")
      } else if (nextStep === 2) {
        setFeedback("Step 2: Moss breathes with the star on the trail. Almost at the top!")
        narration.speak("Step 2: Breathe gently with the star. Almost there!", "climb-step2")
      }
    } else {
      setStage("summit")
      setFeedback("Hooray! Moss reached the mountain summit with their calm kit!")
      narration.speak("Hooray! You guided Moss to the mountain summit!", "climb-summit")
    }
  }

  function handleFinish() {
    onComplete({
      taps: ["one", "rest", "ask", "minigame_complete"],
    })
  }

  return (
    <div className="minigame-container pack-calm-kit" role="region" aria-label="Stress Mountain: Pack Your Calm Kit Mini-Game">
      {/* Floating Storybook Instruction Bar */}
      <div className="minigame-instruction-bar">
        <div className="instruction-text">
          <span className="step-tag">
            {stage === "pack"
              ? "STEP 1: PACK YOUR KIT"
              : stage === "climb"
                ? `STEP 2: CLIMB THE TRAIL (${climbStep + 1} OF 3)`
                : "STEP 3: SUMMIT REACHED"}
          </span>
          <h2>
            {stage === "pack"
              ? "Pack Moss’s Calm Kit!"
              : stage === "climb"
                ? "Climb the Mountain with Moss!"
                : "Moss Reached the Mountain Summit!"}
          </h2>
        </div>
        <NarrationControls
          text={
            stage === "pack"
              ? "Pack Moss’s calm kit! Tap items to pack the backpack, then climb the trail."
              : stage === "climb"
                ? "Look at Moss climbing! Taking small steps makes big mountains easy."
                : "Hooray! Moss reached the top. Small steps make big mountains manageable."
          }
          id="kit-narration"
          label="game instructions"
        />
      </div>

      <div className="mountain-scene-wrapper">
        {/* Layered Alpine Mountain Stage */}
        <div className="mountain-visual-stage">
          <svg className="mountain-path-svg" viewBox="0 0 650 320" aria-hidden="true">
            <defs>
              <linearGradient id="alpineSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8f5e9" />
                <stop offset="60%" stopColor="#f1f8e9" />
                <stop offset="100%" stopColor="#dcedc8" />
              </linearGradient>
            </defs>

            <rect width="650" height="320" fill="url(#alpineSky)" rx="24" />

            {/* Radiant Sun & Clouds */}
            <circle cx="560" cy="50" r="28" fill="#fff59d" />
            <circle cx="560" cy="50" r="18" fill="#fbc02d" />
            <ellipse cx="140" cy="65" rx="42" ry="16" fill="#ffffff" opacity="0.8" />
            <ellipse cx="160" cy="60" rx="30" ry="18" fill="#ffffff" opacity="0.9" />

            {/* Distant Snow-capped Mountain Ridges */}
            <polygon points="50,320 220,70 360,190 480,50 650,320" fill="#a5d6a7" />
            <polygon points="220,70 200,105 240,105" fill="#ffffff" /> {/* Snow cap 1 */}
            <polygon points="480,50 455,95 505,95" fill="#ffffff" />  {/* Snow cap 2 */}

            {/* Midground Green Peak */}
            <polygon points="120,320 310,110 490,320" fill="#81c784" />
            <polygon points="310,110 295,135 325,135" fill="#ffffff" opacity="0.9" />

            {/* Foreground Mountain Slope & Grassy Trail */}
            <path d="M0 320 Q160 210 380 240 T650 230 L650 320 L0 320 Z" fill="#66bb6a" />

            {/* Winding Trail with Stepping Stones */}
            <path
              d="M70 280 Q160 260 220 215 T380 160 T490 85"
              fill="none"
              stroke="#fff9c4"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d="M70 280 Q160 260 220 215 T380 160 T490 85"
              fill="none"
              stroke="#d7ccc8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="6 10"
            />

            {/* Trail Flowers Blooming with Progress */}
            {climbStep >= 1 && (
              <g className="trail-flower-1 pop-in">
                <circle cx="160" cy="245" r="7" fill="#ff80ab" />
                <circle cx="160" cy="245" r="3" fill="#fff59d" />
              </g>
            )}
            {climbStep >= 2 && (
              <g className="trail-flower-2 pop-in">
                <circle cx="360" cy="180" r="8" fill="#ffd54f" />
                <circle cx="360" cy="180" r="3.5" fill="#ffffff" />
                <circle cx="410" cy="140" r="7" fill="#ba68c8" />
                <circle cx="410" cy="140" r="3" fill="#fff59d" />
              </g>
            )}
            {stage === "summit" && (
              <g className="summit-sparkles pop-in">
                <circle cx="530" cy="70" r="4" fill="#ffffff" />
                <circle cx="470" cy="50" r="5" fill="#fff59d" />
                <circle cx="550" cy="95" r="4" fill="#80deea" />
              </g>
            )}

            {/* Checkpoint Stones */}
            <g
              className="checkpoint-stone-group"
              onClick={() => { if (stage === "climb" && climbStep === 0) advanceClimb() }}
              style={{ cursor: stage === "climb" && climbStep === 0 ? "pointer" : "default" }}
              role="button"
              tabIndex={stage === "climb" && climbStep === 0 ? 0 : -1}
              aria-label="Trail Checkpoint 1"
            >
              <circle cx="100" cy="275" r="18" fill={climbStep >= 0 ? "#81c784" : "#e0e0e0"} stroke="#388e3c" strokeWidth="3" />
              <text x="100" y="281" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">1</text>
            </g>

            <g
              className="checkpoint-stone-group"
              onClick={() => { if (stage === "climb" && climbStep === 1) advanceClimb() }}
              style={{ cursor: stage === "climb" && climbStep === 1 ? "pointer" : "default" }}
              role="button"
              tabIndex={stage === "climb" && climbStep === 1 ? 0 : -1}
              aria-label="Trail Checkpoint 2"
            >
              <circle cx="280" cy="190" r="18" fill={climbStep >= 1 ? "#81c784" : "#e0e0e0"} stroke="#388e3c" strokeWidth="3" />
              <text x="280" y="196" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">2</text>
            </g>

            <g
              className="checkpoint-stone-group"
              onClick={() => { if (stage === "climb" && climbStep === 2) advanceClimb() }}
              style={{ cursor: stage === "climb" && climbStep === 2 ? "pointer" : "default" }}
              role="button"
              tabIndex={stage === "climb" && climbStep === 2 ? 0 : -1}
              aria-label="Trail Checkpoint 3 (Summit)"
            >
              <circle cx="485" cy="88" r="18" fill={climbStep >= 2 ? "#81c784" : "#e0e0e0"} stroke="#388e3c" strokeWidth="3" />
              <text x="485" y="94" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">3</text>
            </g>

            {/* Summit Flag */}
            <line x1="505" y1="85" x2="505" y2="35" stroke="#4e342e" strokeWidth="4" />
            <polygon points="505,35 545,50 505,65" fill="#fbc02d" />
            <circle cx="505" cy="35" r="4" fill="#ffb300" />
          </svg>

          {/* Moss Climber in Action */}
          <div
            className={`moss-climber ${stage === "summit" ? "celebrating bounce-happy" : ""}`}
            style={{
              left:
                stage === "pack"
                  ? "8%"
                  : climbStep === 0
                    ? "12%"
                    : climbStep === 1
                      ? "40%"
                      : "70%",
              bottom:
                stage === "pack"
                  ? "15%"
                  : climbStep === 0
                    ? "14%"
                    : climbStep === 1
                      ? "40%"
                      : "68%",
            }}
          >
            <Buddy color="#b6c99b" mood={stage === "summit" ? "happy" : "calm"} />
            <span className="climber-speech">
              {stage === "pack"
                ? `Packing kit (${backpack.length}/4)`
                : climbStep === 0
                  ? "Taking step 1!"
                  : climbStep === 1
                    ? "Sip of water & feeling strong!"
                    : "Reached the summit!"}
            </span>
          </div>
        </div>

        {/* Stage 1: Living Backpack & Coping Tools */}
        {stage === "pack" && (
          <div className="packing-stage-wrapper">
            {/* Tactile Backpack Display */}
            <div className="backpack-container" role="region" aria-label="Moss's Hiking Backpack">
              <div className="backpack-header">
                <h3>🎒 Moss’s Hiking Backpack</h3>
                <span className="backpack-count">{backpack.length} / 4 items packed</span>
              </div>

              <div className="backpack-slots-grid">
                {[0, 1, 2, 3].map((index) => {
                  const item = backpack[index]
                  return (
                    <div
                      key={index}
                      className={`backpack-slot ${item ? "filled" : "empty"}`}
                      onClick={() => {
                        if (item) removeItem(item.id)
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={
                        item
                          ? `${item.name} packed in slot ${index + 1}. Tap to remove.`
                          : `Empty slot ${index + 1}.`
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && item) removeItem(item.id)
                      }}
                    >
                      {item ? (
                        <div className="packed-item-pill" style={{ borderColor: item.color }}>
                          <span className="packed-icon">{item.icon}</span>
                          <span className="packed-name">{item.name}</span>
                          <span className="remove-badge" title="Tap to remove">✕</span>
                        </div>
                      ) : (
                        <span className="slot-empty-label">Pocket {index + 1} Empty</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Ready to climb action */}
              {backpack.length >= 3 && (
                <button
                  className="primary-play-btn start-climb-btn"
                  onClick={() => {
                    setStage("climb")
                    setClimbStep(0)
                    setFeedback("Let’s start climbing! Moss has their calm kit ready.")
                    narration.speak("Let’s climb Stress Mountain! Moss is ready.", "start-climb")
                  }}
                  aria-label="Start climbing the mountain with Moss"
                >
                  <Icon name="arrow" size={22} />
                  <span>Start Mountain Climb with Moss!</span>
                </button>
              )}
            </div>

            {/* Coping Items Selection */}
            <div className="coping-items-tray">
              <div className="tray-header">
                <h4>Choose Helpful Coping Items:</h4>
                <small>Tap to pack into Moss’s bag</small>
              </div>

              <div className="items-list">
                {KIT_ITEMS.map((item) => {
                  const isPacked = backpack.some((i) => i.id === item.id)

                  return (
                    <button
                      key={item.id}
                      className={`coping-item-card ${isPacked ? "packed" : ""}`}
                      disabled={isPacked}
                      onClick={() => addItem(item)}
                      aria-label={`${item.name}: ${item.why}. ${isPacked ? "Already Packed" : "Tap to pack"}`}
                    >
                      <span className="item-icon-bubble" style={{ background: item.color }}>
                        {item.icon}
                      </span>
                      <div className="item-meta">
                        <strong>{item.name}</strong>
                        <p>{item.why}</p>
                      </div>
                      {isPacked ? (
                        <span className="packed-check">✓ Packed</span>
                      ) : (
                        <span className="pack-add-action">+ Pack</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Mountain Trail Climb Controls */}
        {stage === "climb" && (
          <div className="climb-controls storybook-controls">
            <button
              className="primary-play-btn next-step-btn pulse-glow"
              onClick={advanceClimb}
              aria-label="Take the next step up the mountain"
            >
              <span>{climbStep < 2 ? `Take Next Step (${climbStep + 1} of 3)` : "Reach Mountain Summit! 🏔️"}</span>
              <Icon name="arrow" size={22} />
            </button>
          </div>
        )}

        {/* Stage 3: Summit Viewpoint */}
        {stage === "summit" && (
          <div className="summit-success-panel storybook-controls">
            <div className="summit-banner">
              <span className="summit-icon">⛰️</span>
              <h3>You Reached the Summit of Stress Mountain!</h3>
              <p>
                Moss climbed the big mountain one gentle step at a time!
              </p>
              <div className="summit-badges">
                <span className="badge-tag">🎒 Kit Packed</span>
                <span className="badge-tag">👣 Small Steps</span>
                <span className="badge-tag">🌿 Calm Breathing</span>
              </div>
            </div>

            <button
              className="primary-play-btn claim-reward-btn pulse-glow"
              onClick={handleFinish}
              aria-label="Collect adventure stars and view celebration"
            >
              <span>Collect Adventure Stars!</span>
              <Icon name="star" size={22} />
            </button>
          </div>
        )}

        {/* Live Feedback */}
        {feedback && (
          <div className="minigame-live-feedback" role="status" aria-live="polite">
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}

