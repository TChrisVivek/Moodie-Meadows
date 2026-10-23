import React, { useState } from "react"
import { Buddy, Icon, NarrationControls } from "../MeadowArt"
import type { Adventure } from "../adventureData"
import { narration } from "../narration"

type Props = {
  adventure: Adventure
  onComplete: (data: { taps: string[] }) => void
}

type GroundingItem = {
  id: string
  name: string
  icon: string
  detail: string
  cue: string
  pos: { x: number; y: number }
}

const GROUNDING_ITEMS: GroundingItem[] = [
  {
    id: "bird",
    name: "Singing Bird",
    icon: "🐦",
    detail: "Hear the cheerful chirping song up in the branches.",
    cue: "Singing bird: Hear the cheerful chirping song in the tree.",
    pos: { x: 195, y: 75 },
  },
  {
    id: "squirrel",
    name: "Friendly Squirrel",
    icon: "🐿️",
    detail: "Watch the fluffy tail gather little pinecones.",
    cue: "Friendly squirrel: Watch the fluffy tail gathering pinecones.",
    pos: { x: 420, y: 155 },
  },
  {
    id: "firefly",
    name: "Golden Firefly",
    icon: "✨",
    detail: "Notice the soft, warm golden glow by the moss.",
    cue: "Golden firefly: Notice the soft, warm golden glow.",
    pos: { x: 270, y: 220 },
  },
]

export default function BravePath({ adventure, onComplete }: Props) {
  // Game stages: "grounding" -> "lantern" -> "path" -> "clearing"
  const [stage, setStage] = useState<"grounding" | "lantern" | "path" | "clearing">("grounding")
  const [foundItems, setFoundItems] = useState<string[]>([])
  const [lanternLit, setLanternLit] = useState(false)
  const [pathSteps, setPathSteps] = useState(0)
  const [feedback, setFeedback] = useState<string>(
    "Tap 3 friendly forest objects to ground your senses."
  )

  // Handle finding grounding items
  function findItem(item: GroundingItem) {
    if (foundItems.includes(item.id)) return

    const nextFound = [...foundItems, item.id]
    setFoundItems(nextFound)
    const feedbackText = `Noticed ${item.name}! (${nextFound.length} of 3 found)`
    setFeedback(feedbackText)
    narration.speak(item.cue, `ground-${item.id}`)

    if (nextFound.length >= 3) {
      setTimeout(() => {
        setFeedback("All 3 friendly things noticed! Now tap the lantern to light our path.")
        narration.speak("All 3 friendly things noticed! Now tap the lantern to light our path.", "woods-light-ready")
        setStage("lantern")
      }, 500)
    }
  }

  // Handle lighting the lantern
  function lightLantern() {
    setLanternLit(true)
    setStage("path")
    const feedbackText = "The lantern is glowing warm and bright! Tap the glowing footprints to take gentle brave steps."
    setFeedback(feedbackText)
    narration.speak(feedbackText)
  }

  // Handle taking brave path steps
  function takeStep() {
    if (pathSteps < 2) {
      const nextStep = pathSteps + 1
      setPathSteps(nextStep)
      const text =
        nextStep === 1
          ? "Step 1: Taking one small step. You don't have to rush through feelings."
          : "Step 2: Breathe gently. Every step forward builds quiet bravery."
      setFeedback(text)
      narration.speak(text)
    } else {
      setPathSteps(3)
      setStage("clearing")
      const text = "Hooray! Nimbus reached the warm campfire clearing with meadow friends!"
      setFeedback(text)
      narration.speak(text)
    }
  }

  function handleFinish() {
    onComplete({
      taps: ["flower", "cloud", "tree", "star", "hill", "step", "minigame_complete"],
    })
  }

  return (
    <div className="minigame-container brave-path" role="region" aria-label="Worry Woods: Find the Brave Path Mini-Game">
      {/* Floating Storybook Instruction Bar */}
      <div className="minigame-instruction-bar woods-instruction-hud">
        <div className="instruction-text">
          <span className="step-tag">
            {stage === "grounding"
              ? `STEP 1: GROUND YOUR SENSES (${foundItems.length}/3)`
              : stage === "lantern"
                ? "STEP 2: LIGHT COMPANION LANTERN"
                : stage === "path"
                  ? `STEP 3: GENTLE BRAVE STEPS (${pathSteps + 1}/3)`
                  : "SAFE IN THE WARM CLEARING"}
          </span>
          <h2>
            {stage === "grounding"
              ? "Find 3 Friendly Things in the Woods!"
              : stage === "lantern"
                ? "Light the Warm Companion Lantern!"
                : stage === "path"
                  ? "Take Gentle Brave Steps Forward!"
                  : "Nimbus Reached the Cozy Meadow Campfire!"}
          </h2>
        </div>
        <NarrationControls
          text={
            stage === "grounding"
              ? "Light Nimbus’s brave path! Tap three friendly forest objects to ground your senses."
              : stage === "lantern"
                ? "Tap the lantern to light your way with a trusted friend. You don't have to face worry alone."
                : stage === "path"
                  ? "Tap the glowing footprints. Big worries shrink when we take manageable small steps."
                  : "Hooray! You guided Nimbus gently through the woods to the warm campfire clearing."
          }
          id="woods-narration"
          label="game instructions"
        />
      </div>

      <div className="woods-scene-wrapper storybook-world">
        {/* Layered Enchanting Forest Stage */}
        <div className="woods-stage">
          <svg className="woods-svg" viewBox="0 0 740 360" aria-hidden="true">
            <defs>
              <linearGradient id="twilightSky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={stage === "clearing" ? "#ffe082" : lanternLit ? "#311b92" : "#1a237e"} />
                <stop offset="60%" stopColor={stage === "clearing" ? "#ffcc80" : lanternLit ? "#4527a0" : "#283593"} />
                <stop offset="100%" stopColor={stage === "clearing" ? "#b39ddb" : lanternLit ? "#5e35b1" : "#3949ab"} />
              </linearGradient>

              <radialGradient id="lanternRadialLight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff9c4" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#ffe082" stopOpacity="0.6" />
                <stop offset="80%" stopColor="#ffd54f" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffca28" stopOpacity="0" />
              </radialGradient>

              <filter id="woodsGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Twilight Sky */}
            <rect width="740" height="360" fill="url(#twilightSky)" rx="24" />

            {/* Glowing Golden Moon */}
            <circle
              cx="640"
              cy="60"
              r="34"
              fill={stage === "clearing" ? "#fff59d" : "#fffde7"}
              opacity="0.95"
              filter="url(#woodsGlow)"
            />

            {/* Background Mountain Peaks */}
            <polygon points="50,220 180,90 310,220" fill="#283593" opacity="0.3" />
            <polygon points="230,230 380,80 530,230" fill="#1a237e" opacity="0.25" />

            {/* Deep Layered Pine and Oak Trees */}
            {[40, 130, 220, 340, 470, 580, 670].map((x, i) => (
              <g key={x} className="forest-tree" opacity={0.4 + (i % 3) * 0.25}>
                <rect x={x + 18} y={110} width={18} height={180} fill="#263238" rx="4" />
                <polygon points={`${x + 27},25 ${x - 25},130 ${x + 79},130`} fill="#37474f" />
                <polygon points={`${x + 27},70 ${x - 20},165 ${x + 74},165`} fill="#455a64" />
              </g>
            ))}

            {/* Fore-forest Oak with Large Branch (where Blue Jay sits) */}
            <g transform="translate(140, 50)">
              <rect x="40" y="50" width="28" height="220" rx="8" fill="#3e2723" />
              {/* Branch spreading right */}
              <path d="M55 90 Q100 80 145 95" stroke="#3e2723" strokeWidth="12" strokeLinecap="round" fill="none" />
              {/* Foliage Canopy */}
              <ellipse cx="50" cy="50" rx="65" ry="45" fill="#2e7d32" opacity="0.9" />
              <ellipse cx="90" cy="45" rx="55" ry="40" fill="#388e3c" opacity="0.85" />
            </g>

            {/* Hollow Tree Trunk on Right (where Squirrel peeks out) */}
            <g transform="translate(410, 110)">
              <rect x="0" y="20" width="40" height="180" rx="10" fill="#4e342e" />
              {/* Hollow knot */}
              <ellipse cx="20" cy="70" rx="14" ry="18" fill="#212121" />
            </g>

            {/* Mossy Forest Floor */}
            <path d="M0 270 Q190 235 380 255 T740 245 L740 360 L0 360 Z" fill="#33691e" opacity="0.85" />
            <path d="M0 290 Q240 260 450 280 T740 275 L740 360 L0 360 Z" fill="#1b5e20" />

            {/* Mossy Boulders */}
            <ellipse cx="260" cy="305" rx="35" ry="20" fill="#546e7a" />
            <ellipse cx="260" cy="300" rx="32" ry="16" fill="#689f38" opacity="0.6" />

            {/* 3 Interactive Grounding Objects right inside the scenery! */}
            {GROUNDING_ITEMS.map((item) => {
              const isFound = foundItems.includes(item.id)
              return (
                <g
                  key={item.id}
                  className={`scenery-grounding-target ${isFound ? "target-found" : "target-waiting"}`}
                  transform={`translate(${item.pos.x}, ${item.pos.y})`}
                  onClick={() => findItem(item)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.name}: ${item.detail}. ${isFound ? "Noticed!" : "Tap to notice"}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") findItem(item)
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {/* Glowing pulsing aura if not yet found */}
                  {!isFound && (
                    <circle cx="16" cy="16" r="26" fill="#fff59d" opacity="0.4" className="pulse-aura" />
                  )}

                  {/* Circular badge */}
                  <circle
                    cx="16"
                    cy="16"
                    r="22"
                    fill={isFound ? "#e8f5e9" : "#ffffff"}
                    stroke={isFound ? "#4caf50" : "#ffd54f"}
                    strokeWidth={isFound ? 3 : 2.5}
                    filter="url(#woodsGlow)"
                  />

                  {/* Emoji / Icon */}
                  <text x="16" y="23" textAnchor="middle" fontSize="20">
                    {item.icon}
                  </text>

                  {/* Found Checkmark */}
                  {isFound && (
                    <circle cx="30" cy="6" r="9" fill="#4caf50" />
                  )}
                  {isFound && (
                    <text x="30" y="10" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                      ✓
                    </text>
                  )}
                </g>
              )
            })}

            {/* Radial Lantern Glow effect expanding across the scene */}
            {lanternLit && (
              <circle
                cx="330"
                cy="230"
                r={stage === "clearing" ? "360" : "180"}
                fill="url(#lanternRadialLight)"
                className="glowing-radial-aura"
              />
            )}

            {/* Lantern Post on the Trail */}
            <g transform="translate(320, 185)" className={lanternLit ? "lantern-post-lit" : ""}>
              <line x1="12" y1="0" x2="12" y2="85" stroke="#3e2723" strokeWidth="6" strokeLinecap="round" />
              <line x1="12" y1="12" x2="30" y2="12" stroke="#3e2723" strokeWidth="4" strokeLinecap="round" />
              {/* Hanging Lantern */}
              <g transform="translate(24, 12)">
                <rect x="-8" y="0" width="16" height="24" rx="4" fill="#4e342e" />
                <rect
                  x="-6"
                  y="4"
                  width="12"
                  height="16"
                  rx="2"
                  fill={lanternLit ? "#ffeb3b" : "#cfd8dc"}
                />
                {lanternLit && (
                  <circle cx="0" cy="12" r="16" fill="#fff59d" opacity="0.6" filter="url(#woodsGlow)" />
                )}
              </g>
            </g>

            {/* Glowing Cobblestone Trail */}
            {(stage === "path" || stage === "clearing") && (
              <g className="glowing-trail-group">
                {[
                  { cx: 160, cy: 305, active: pathSteps >= 0, label: "Step 1" },
                  { cx: 280, cy: 295, active: pathSteps >= 1, label: "Step 2" },
                  { cx: 410, cy: 290, active: pathSteps >= 2, label: "Step 3" },
                  { cx: 540, cy: 285, active: pathSteps >= 3, label: "Clearing" },
                ].map((pt, i) => (
                  <g
                    key={i}
                    className={`trail-footstep ${pt.active ? "step-illuminated" : "step-dark"}`}
                    onClick={() => {
                      if (stage === "path" && i === pathSteps) takeStep()
                    }}
                    role="button"
                    tabIndex={stage === "path" && i === pathSteps ? 0 : -1}
                    aria-label={`${pt.label}. ${pt.active ? "Stepped" : "Tap to step forward"}`}
                    style={{ cursor: stage === "path" && i === pathSteps ? "pointer" : "default" }}
                  >
                    {pt.active && (
                      <ellipse
                        cx={pt.cx}
                        cy={pt.cy}
                        rx="26"
                        ry="15"
                        fill="none"
                        stroke="#fff59d"
                        strokeWidth="3"
                        className="pulse-aura"
                      />
                    )}
                    <ellipse
                      cx={pt.cx}
                      cy={pt.cy}
                      rx="20"
                      ry="11"
                      fill={pt.active ? "#fff59d" : "#7e57c2"}
                      stroke={pt.active ? "#fbc02d" : "#5e35b1"}
                      strokeWidth="3"
                    />
                    <text
                      x={pt.cx}
                      y={pt.cy + 4}
                      textAnchor="middle"
                      fill={pt.active ? "#5d4037" : "#d1c4e9"}
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {i + 1}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* Cozy Campfire at the Clearing */}
            {stage === "clearing" && (
              <g transform="translate(580, 240)" className="campfire-group pop-in">
                {/* Fire Glow */}
                <circle cx="25" cy="20" r="45" fill="#ffe082" opacity="0.4" filter="url(#woodsGlow)" />
                {/* Logs */}
                <ellipse cx="25" cy="30" rx="30" ry="12" fill="#4e342e" />
                {/* Flames */}
                <polygon points="12,30 25,0 38,30" fill="#ff5722" />
                <polygon points="16,30 25,8 34,30" fill="#ff9800" />
                <polygon points="20,30 25,16 30,30" fill="#ffeb3b" />
                {/* Roasting Marshmallow Stick */}
                <line x1="-10" y1="5" x2="20" y2="18" stroke="#8d6e63" strokeWidth="3" strokeLinecap="round" />
                <rect x="15" y="14" width="8" height="6" rx="2" fill="#ffffff" />
              </g>
            )}
          </svg>

          {/* Nimbus Companion Character */}
          <div
            className={`nimbus-companion mood-${stage === "clearing" ? "happy" : lanternLit ? "calm" : "worried"}`}
            style={{
              left:
                stage === "grounding" || stage === "lantern"
                  ? "8%"
                  : pathSteps === 0
                    ? "18%"
                    : pathSteps === 1
                      ? "34%"
                      : pathSteps === 2
                        ? "52%"
                        : "72%",
              bottom: "16%",
            }}
          >
            <Buddy
              color="#c7b9df"
              mood={stage === "clearing" ? "happy" : lanternLit ? "calm" : "worried"}
            />
            <span className="character-label">
              Nimbus {stage === "clearing" ? "🏕️" : lanternLit ? "🏮" : "💭"}
            </span>
          </div>
        </div>

        {/* Phase 1: Grounding Action Tray */}
        {stage === "grounding" && (
          <div className="grounding-action-panel storybook-controls">
            <div className="grounding-buttons-grid">
              {GROUNDING_ITEMS.map((item) => {
                const isFound = foundItems.includes(item.id)
                return (
                  <button
                    key={item.id}
                    className={`grounding-btn ${isFound ? "found" : "pulse-card"}`}
                    onClick={() => findItem(item)}
                    aria-label={`${item.name}: ${item.detail}. ${isFound ? "Noticed!" : "Tap to notice"}`}
                  >
                    <span className="grounding-emoji">{item.icon}</span>
                    <div className="grounding-info">
                      <strong>{item.name}</strong>
                      <small>{item.detail}</small>
                    </div>
                    {isFound ? (
                      <span className="found-tag">✓ Noticed</span>
                    ) : (
                      <span className="tap-tag">Tap to Notice</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Phase 2: Lantern Light Action */}
        {stage === "lantern" && (
          <div className="lantern-action-panel storybook-controls">
            <div className="lantern-prompt-card">
              <span className="lantern-icon-large">🏮</span>
              <h3>Light the Brave Companion Lantern</h3>
              <p>
                A friend or trusted grown-up makes big worries feel gentle. Tap below to fill the woods with warm golden light!
              </p>
              <button
                className="primary-play-btn light-btn pulse-glow"
                onClick={lightLantern}
                aria-label="Light the companion lantern"
              >
                <span>Light the Lantern</span>
                <Icon name="star" size={22} />
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Stepping on Brave Footsteps */}
        {stage === "path" && (
          <div className="path-action-panel storybook-controls">
            <div className="step-prompt-card">
              <h3>Take Gentle Brave Steps</h3>
              <p>
                {pathSteps === 0
                  ? "Step 1: One small, gentle step forward."
                  : pathSteps === 1
                    ? "Step 2: Breathe gently. Worries shrink with each small step."
                    : "Step 3: Campfire clearing is right ahead!"}
              </p>
              <button
                className="primary-play-btn take-step-btn pulse-glow"
                onClick={takeStep}
                aria-label="Take the next brave step forward"
              >
                <span>Take Brave Step ({pathSteps + 1} of 3)</span>
                <Icon name="arrow" size={22} />
              </button>
            </div>
          </div>
        )}

        {/* Phase 4: Clearing Success */}
        {stage === "clearing" && (
          <div className="clearing-success-panel storybook-controls">
            <div className="success-banner">
              <span className="success-icon">🏕️</span>
              <h3>Safe and Warm by the Campfire!</h3>
              <p>
                Nimbus reached the cozy clearing by noticing friendly things and taking one gentle step at a time!
              </p>
            </div>

            <button
              className="primary-play-btn claim-reward-btn pulse-glow"
              onClick={handleFinish}
              aria-label="Collect rewards and view celebration"
            >
              <span>Collect Adventure Stars!</span>
              <Icon name="star" size={24} />
            </button>
          </div>
        )}

        {/* Live Feedback Toast */}
        {feedback && (
          <div className="minigame-live-feedback" role="status" aria-live="polite">
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}
