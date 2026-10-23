import React, { useState } from "react"
import { Buddy, Icon, NarrationControls } from "../MeadowArt"
import type { Adventure } from "../adventureData"
import { narration } from "../narration"

type Props = {
  adventure: Adventure
  onComplete: (data: { taps: string[] }) => void
}

type GardenItem = {
  id: string
  name: string
  icon: string
  color: string
  meaning: string
  cue: string
}

const DECORATIONS: GardenItem[] = [
  {
    id: "flower",
    name: "Sunflower",
    icon: "🌻",
    color: "#fbc02d",
    meaning: "Celebrate small wins and proud effort!",
    cue: "Sunflower: Celebrate small wins and proud effort!",
  },
  {
    id: "heart",
    name: "Heart Sprout",
    icon: "💖",
    color: "#ec407a",
    meaning: "Share joy and kind words with friends!",
    cue: "Heart sprout: Share joy and kind words with friends!",
  },
  {
    id: "butterfly",
    name: "Butterfly",
    icon: "🦋",
    color: "#ab47bc",
    meaning: "Enjoy playful laughter and fun times!",
    cue: "Butterfly: Enjoy playful laughter and happy moments!",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    icon: "🌈",
    color: "#42a5f5",
    meaning: "Notice bright things that make each day special!",
    cue: "Rainbow: Notice bright things that make each day special!",
  },
]

export default function HappinessGarden({ adventure, onComplete }: Props) {
  // Game stages: "sunshine" -> "water" -> "decorate" -> "blooming"
  const [stage, setStage] = useState<"sunshine" | "water" | "decorate" | "blooming">("sunshine")
  const [sunbeamsCollected, setSunbeamsCollected] = useState(0)
  const [watered, setWatered] = useState(false)
  const [isWatering, setIsWatering] = useState(false)
  const [plantedItems, setPlantedItems] = useState<(GardenItem | null)[]>([null, null, null, null])
  const [selectedDeco, setSelectedDeco] = useState<GardenItem | null>(null)
  const [feedback, setFeedback] = useState<string>(
    "Sunny wants to grow a happiness garden. Tap 3 dancing sunbeams to collect sunshine!"
  )

  // Floating sunbeam positions in the sky
  const SUNBEAM_POSITIONS = [
    { x: 230, y: 70 },
    { x: 380, y: 55 },
    { x: 530, y: 80 },
  ]

  // Collect sunshine sparks
  function collectSunbeam(index: number) {
    if (sunbeamsCollected > index) return

    const nextCount = sunbeamsCollected + 1
    setSunbeamsCollected(nextCount)
    const text = `Caught a warm sunbeam! (${nextCount} of 3 collected)`
    setFeedback(text)
    narration.speak(`Caught sunbeam ${nextCount}!`)

    if (nextCount >= 3) {
      setTimeout(() => {
        setFeedback("All 3 sunshine sparks gathered! Now tap the watering can to nourish the soil.")
        narration.speak("All 3 sunshine sparks gathered! Now water the garden soil.")
        setStage("water")
      }, 500)
    }
  }

  // Water the garden soil with shower animation
  function waterSoil() {
    setIsWatering(true)
    setTimeout(() => {
      setWatered(true)
      setIsWatering(false)
      setStage("decorate")
      const text = "Fresh sparkle water sprinkled! Now plant joy flowers and butterflies in the plots."
      setFeedback(text)
      narration.speak(text)
    }, 800)
  }

  // Plant a joy decoration in a plot
  function plantItem(plotIndex: number, item: GardenItem) {
    const nextPlots = [...plantedItems]
    nextPlots[plotIndex] = item
    setPlantedItems(nextPlots)
    setSelectedDeco(null)
    const text = `Planted ${item.name}! ${item.meaning}`
    setFeedback(text)
    narration.speak(item.cue, `garden-${item.id}`)

    // Check if at least 3 plots are planted to bloom
    const plantedCount = nextPlots.filter(Boolean).length
    if (plantedCount >= 3) {
      setTimeout(() => {
        setStage("blooming")
        const bloomText = "Look at your garden bloom! Sunny is dancing with joy."
        setFeedback(bloomText)
        narration.speak(bloomText, "garden-blooming")
      }, 500)
    }
  }

  function handleFinish() {
    onComplete({
      taps: ["win", "share", "kind", "minigame_complete"],
    })
  }

  return (
    <div className="minigame-container happiness-garden" role="region" aria-label="Spark Summit: Grow a Happiness Garden Mini-Game">
      {/* Floating Storybook Instruction Bar */}
      <div className="minigame-instruction-bar garden-instruction-hud">
        <div className="instruction-text">
          <span className="step-tag">
            {stage === "sunshine"
              ? `STEP 1: CATCH SUNSHINE (${sunbeamsCollected}/3)`
              : stage === "water"
                ? "STEP 2: SPRINKLE WATER"
                : stage === "decorate"
                  ? `STEP 3: PLANT JOY FLOWERS (${plantedItems.filter(Boolean).length}/4)`
                  : "GARDEN IN FULL BLOOM!"}
          </span>
          <h2>
            {stage === "sunshine"
              ? "Catch 3 Dancing Sunbeams in the Sky!"
              : stage === "water"
                ? "Sprinkle Sparkle Water onto the Soil!"
                : stage === "decorate"
                  ? "Choose Joy Flowers to Plant in the Garden!"
                  : "Sunny’s Happiness Garden is in Full Bloom!"}
          </h2>
        </div>
        <NarrationControls
          text={
            stage === "sunshine"
              ? "Grow Sunny’s garden! Tap 3 dancing sunshine sparks in the sky."
              : stage === "water"
                ? "Tap the watering can to sprinkle sparkle water onto the garden soil."
                : stage === "decorate"
                  ? "Place flowers, hearts, and butterflies into the garden to celebrate joy."
                  : "Hooray! The happiness garden is in full bloom. Joy grows when we share kindness with friends."
          }
          id="garden-narration"
          label="game instructions"
        />
      </div>

      <div className="garden-scene-wrapper storybook-world">
        {/* Rich Layered Garden SVG Stage */}
        <div className="garden-stage">
          <svg className="garden-svg" viewBox="0 0 740 360" aria-hidden="true">
            <defs>
              <linearGradient id="summitSky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fff9c4" />
                <stop offset="45%" stopColor="#fffde7" />
                <stop offset="100%" stopColor="#e8f5e9" />
              </linearGradient>

              <linearGradient id="soilBoxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#795548" />
                <stop offset="100%" stopColor="#4e342e" />
              </linearGradient>

              <filter id="gardenGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Bright Golden Sky */}
            <rect width="740" height="360" fill="url(#summitSky)" rx="24" />

            {/* Radiant Smiling Sun in Upper Left */}
            <g transform="translate(90, 75)">
              <circle cx="0" cy="0" r="42" fill="#fff59d" opacity="0.6" filter="url(#gardenGlow)" />
              <circle cx="0" cy="0" r="32" fill="#fdd835" />
              <circle cx="0" cy="0" r="24" fill="#fbc02d" />
              {/* Sun Rays */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1={38 * Math.cos((angle * Math.PI) / 180)}
                  y1={38 * Math.sin((angle * Math.PI) / 180)}
                  x2={52 * Math.cos((angle * Math.PI) / 180)}
                  y2={52 * Math.sin((angle * Math.PI) / 180)}
                  stroke="#f57f17"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              ))}
              {/* Sun Smile */}
              <circle cx="-7" cy="-5" r="3" fill="#5d4037" />
              <circle cx="7" cy="-5" r="3" fill="#5d4037" />
              <path d="M-9 5 Q0 15 9 5" stroke="#5d4037" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>

            {/* Vibrant Double Rainbow across the Valley */}
            <path
              d="M320 230 A180 180 0 0 1 720 230"
              fill="none"
              stroke="#ff8a80"
              strokeWidth="7"
              opacity="0.75"
            />
            <path
              d="M326 230 A174 174 0 0 1 714 230"
              fill="none"
              stroke="#ffd54f"
              strokeWidth="7"
              opacity="0.75"
            />
            <path
              d="M332 230 A168 168 0 0 1 708 230"
              fill="none"
              stroke="#81c784"
              strokeWidth="7"
              opacity="0.75"
            />
            <path
              d="M338 230 A162 162 0 0 1 702 230"
              fill="none"
              stroke="#4fc3f7"
              strokeWidth="7"
              opacity="0.75"
            />
            <path
              d="M344 230 A156 156 0 0 1 696 230"
              fill="none"
              stroke="#ba68c8"
              strokeWidth="7"
              opacity="0.75"
            />

            {/* Rolling Mountain Summit Ridges */}
            <path d="M0 220 Q220 160 440 190 T740 175 L740 360 L0 360 Z" fill="#c5e1a5" opacity="0.7" />
            <path d="M0 245 Q200 200 420 225 T740 210 L740 360 L0 360 Z" fill="#aed581" />

            {/* Raised Storybook Garden Bed Wooden Box */}
            <rect x="180" y="225" width="520" height="115" rx="16" fill="url(#soilBoxGrad)" />
            <rect x="190" y="235" width="500" height="95" rx="12" fill={watered ? "#3e2723" : "#4e342e"} />

            {/* 4 Soil Planting Beds */}
            {[235, 360, 485, 610].map((cx, i) => (
              <g key={i}>
                <ellipse
                  cx={cx}
                  cy="282"
                  rx="48"
                  ry="26"
                  fill={watered ? "#2b1d0c" : "#3e2723"}
                  stroke="#8d6e63"
                  strokeWidth="3"
                />
                {watered && (
                  <circle cx={cx - 15} cy="275" r="2.5" fill="#80deea" opacity="0.8" />
                )}
                {watered && (
                  <circle cx={cx + 18} cy="285" r="2" fill="#80deea" opacity="0.8" />
                )}
              </g>
            ))}

            {/* Floating Dancing Sunbeams (Stage 1) */}
            {stage === "sunshine" &&
              SUNBEAM_POSITIONS.map((pos, i) => {
                const isCollected = sunbeamsCollected > i
                if (isCollected) return null
                return (
                  <g
                    key={i}
                    className="floating-sunbeam-spark pulse-aura"
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => collectSunbeam(i)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Floating sunbeam spark ${i + 1}. Tap to collect!`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") collectSunbeam(i)
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <circle cx="16" cy="16" r="28" fill="#fff59d" opacity="0.5" filter="url(#gardenGlow)" />
                    <circle cx="16" cy="16" r="18" fill="#fdd835" />
                    <text x="16" y="23" textAnchor="middle" fontSize="20">
                      ☀️
                    </text>
                  </g>
                )
              })}

            {/* Watering Shower Effect (Stage 2) */}
            {isWatering && (
              <g className="watering-can-stream" transform="translate(240, 160)">
                {/* Blue Water Droplets Showering Down */}
                {[0, 60, 120, 180, 240, 300, 360].map((dx, i) => (
                  <line
                    key={i}
                    x1={dx + 20}
                    y1="10"
                    x2={dx + 15}
                    y2="85"
                    stroke="#4fc3f7"
                    strokeWidth="3.5"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                  />
                ))}
              </g>
            )}

            {/* Butterflies fluttering in Blooming stage */}
            {stage === "blooming" && (
              <g className="fluttering-butterflies">
                <text x="320" y="160" fontSize="24" className="flutter-1">
                  🦋
                </text>
                <text x="490" y="140" fontSize="26" className="flutter-2">
                  🦋
                </text>
                <text x="620" y="170" fontSize="22" className="flutter-3">
                  ✨
                </text>
              </g>
            )}
          </svg>

          {/* Sunny Companion Mascot */}
          <div
            className={`sunny-companion mood-happy ${stage === "blooming" ? "dancing-celebration" : ""}`}
            style={{ left: "6%", bottom: "16%" }}
          >
            <Buddy color="#f7cd64" mood="happy" />
            <span className="character-label">
              Sunny {stage === "blooming" ? "🌻" : watered ? "💧" : "☀️"}
            </span>
          </div>

          {/* 4 Interactive Plots on the Soil Bed */}
          <div className="garden-plots-overlay">
            {[0, 1, 2, 3].map((plotIndex) => {
              const item = plantedItems[plotIndex]
              return (
                <div
                  key={plotIndex}
                  className={`garden-plot-spot ${item ? "planted" : "empty"}`}
                  onClick={() => {
                    if (selectedDeco && !item) {
                      plantItem(plotIndex, selectedDeco)
                    } else if (stage === "decorate" && !item) {
                      // Pick next unplanted decoration
                      const available = DECORATIONS.find(
                        (d) => !plantedItems.some((p) => p?.id === d.id)
                      )
                      if (available) plantItem(plotIndex, available)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    item
                      ? `${item.name} blooming in plot ${plotIndex + 1}`
                      : `Empty plot ${plotIndex + 1}. Tap to plant selected decoration.`
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (selectedDeco && !item) plantItem(plotIndex, selectedDeco)
                    }
                  }}
                >
                  {item ? (
                    <div className="blooming-item-display pop-in">
                      <span className="blooming-emoji">{item.icon}</span>
                      <span className="blooming-sparkle">✨</span>
                      <strong className="plot-item-name">{item.name}</strong>
                    </div>
                  ) : (
                    <span className="plot-placeholder">
                      {stage === "decorate"
                        ? selectedDeco
                          ? "Tap to Plant"
                          : `Plot ${plotIndex + 1}`
                        : "Soil Bed"}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Phase 1: Catch Sunbeams Tray */}
        {stage === "sunshine" && (
          <div className="sunshine-action-panel storybook-controls">
            <p className="tray-hint">
              Tap the 3 floating sunbeams in the sky or buttons below to collect warm sunshine sparks:
            </p>
            <div className="sunbeams-row">
              {[0, 1, 2].map((i) => {
                const isCollected = sunbeamsCollected > i
                return (
                  <button
                    key={i}
                    className={`sunbeam-btn ${isCollected ? "collected" : "floating pulse-card"}`}
                    disabled={isCollected}
                    onClick={() => collectSunbeam(i)}
                    aria-label={`Sunbeam ${i + 1}. ${isCollected ? "Collected" : "Tap to collect"}`}
                  >
                    <span className="sunbeam-icon">☀️</span>
                    <span>{isCollected ? "✓ Collected!" : `Catch Spark ${i + 1}`}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Phase 2: Water Soil Action */}
        {stage === "water" && (
          <div className="water-action-panel storybook-controls">
            <div className="watering-can-prompt">
              <span className="can-icon">🚿</span>
              <h3>Sprinkle Kindness Water</h3>
              <p>Water helps seeds of joy and friendship take root in our meadow.</p>
              <button
                className="primary-play-btn water-btn pulse-glow"
                onClick={waterSoil}
                disabled={isWatering}
                aria-label="Water the garden soil"
              >
                <span>{isWatering ? "Sprinkling Water..." : "Water the Garden"}</span>
                <Icon name="heart" size={22} />
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Choose Joy Items to Plant */}
        {stage === "decorate" && (
          <div className="decorate-action-panel storybook-controls">
            <p className="tray-hint">
              Tap a joy decoration below to plant it directly into the garden:
            </p>
            <div className="decorations-tray">
              {DECORATIONS.map((item) => {
                const isPlanted = plantedItems.some((p) => p?.id === item.id)
                const isSelected = selectedDeco?.id === item.id

                return (
                  <button
                    key={item.id}
                    className={`decoration-card ${isPlanted ? "planted" : "pulse-card"} ${isSelected ? "selected" : ""}`}
                    disabled={isPlanted}
                    onClick={() => {
                      setSelectedDeco(item)
                      const emptyIndex = plantedItems.findIndex((p) => p === null)
                      if (emptyIndex !== -1) {
                        plantItem(emptyIndex, item)
                      }
                    }}
                    aria-label={`${item.name}: ${item.meaning}. ${isPlanted ? "Already planted" : "Tap to plant"}`}
                  >
                    <span className="deco-icon-circle" style={{ background: item.color }}>
                      {item.icon}
                    </span>
                    <div className="deco-meta">
                      <strong>{item.name}</strong>
                      <small>{item.meaning}</small>
                    </div>
                    {isPlanted ? (
                      <span className="planted-check">✓ Planted</span>
                    ) : (
                      <span className="plant-action">+ Plant</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Phase 4: Blooming Success */}
        {stage === "blooming" && (
          <div className="blooming-success-panel storybook-controls">
            <div className="success-banner">
              <span className="success-icon">🌻</span>
              <h3>Your Happiness Garden is in Full Bloom!</h3>
              <p>
                Sunny is dancing with joy! Your garden is blooming with kindness and smiles.
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
