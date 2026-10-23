import React, { useState } from "react"
import { Buddy, Icon, NarrationControls } from "../MeadowArt"
import type { Adventure } from "../adventureData"
import { narration } from "../narration"

type Props = {
  adventure: Adventure
  onComplete: (data: { taps: string[] }) => void
}

type Stone = {
  id: number
  title: string
  icon: string
  action: string
  rippleReaction: string
  rippleMood: "sad" | "calm" | "happy"
  cue: string
}

const STONES: Stone[] = [
  {
    id: 1,
    title: "Sit Nearby",
    icon: "🪑",
    action: "“I’m right here with you. You're not alone.”",
    rippleReaction: "Ripple breathes gently. Having caring company makes sadness lighter.",
    rippleMood: "calm",
    cue: "Sit nearby: Let your friend know they don't have to be alone.",
  },
  {
    id: 2,
    title: "Listen Kindly",
    icon: "👂",
    action: "“Take your time. I’m here to listen.”",
    rippleReaction: "Ripple shares what happened. Listening kindly helps feelings feel safe.",
    rippleMood: "calm",
    cue: "Listen kindly: Listening gives big feelings a safe home.",
  },
  {
    id: 3,
    title: "Warm Comfort",
    icon: "🧣",
    action: "“Would you like a cozy blanket or a hug?”",
    rippleReaction: "Ripple smiles softly. Warm comfort brings soothing relief.",
    rippleMood: "calm",
    cue: "Warm comfort: A warm hug or blanket brings soothing comfort.",
  },
  {
    id: 4,
    title: "Float Leaf Boat",
    icon: "⛵",
    action: "“Let’s float a leaf boat down the stream together!”",
    rippleReaction: "Ripple beams happily! The colorful leaf boat glides down the stream.",
    rippleMood: "happy",
    cue: "Float leaf boat: Building something together brings hopeful smiles.",
  },
]

export default function HelpAFriend({ adventure, onComplete }: Props) {
  // Current position: 0 is sad riverbank, 1-4 are stepping stones, 5 is across the river
  const [currentStep, setCurrentStep] = useState(0)
  const [isHopping, setIsHopping] = useState(false)
  const [splashPos, setSplashPos] = useState<{ x: number; y: number } | null>(null)
  const [feedback, setFeedback] = useState<string>(
    "Ripple is feeling sad by the riverbank. Tap the first stepping stone to show caring support."
  )

  const activeStone = STONES[currentStep] || STONES[STONES.length - 1]

  function stepOnStone(stoneIndex: number) {
    if (stoneIndex !== currentStep || isHopping) return

    const stone = STONES[stoneIndex]
    const nextStep = currentStep + 1

    // Splash animation coordinates for stones
    const stoneCoords = [
      { x: 215, y: 195 },
      { x: 315, y: 135 },
      { x: 415, y: 205 },
      { x: 515, y: 145 },
    ]
    setSplashPos(stoneCoords[stoneIndex] || { x: 300, y: 160 })

    setIsHopping(true)
    narration.speak(stone.cue, `stone-${stone.id}`)
    setTimeout(() => {
      setCurrentStep(nextStep)
      setIsHopping(false)
      setFeedback(stone.rippleReaction)
    }, 450)
  }

  function handleFinish() {
    onComplete({
      taps: ["name", "trusted", "comfort", "minigame_complete"],
    })
  }

  return (
    <div className="minigame-container help-a-friend" role="region" aria-label="Tear River: Help a Friend Mini-Game">
      {/* Floating Storybook Instruction Bar */}
      <div className="minigame-instruction-bar river-instruction-hud">
        <div className="instruction-text">
          <span className="step-tag">
            {currentStep < 4
              ? `STEP ${currentStep + 1} OF 4: CARING SUPPORT`
              : "ACROSS THE RIVER · COMFORTED & LOVED"}
          </span>
          <h2>
            {currentStep < 4
              ? "Tap the Next Stepping Stone to Help Ripple Cross!"
              : "Ripple Reached the Sunny Meadow Bank!"}
          </h2>
        </div>
        <NarrationControls
          text={
            currentStep < 4
              ? `Step ${currentStep + 1}: ${activeStone.title}. ${activeStone.action}`
              : "Hooray! You guided Ripple safely across the river. Kindness and listening make all the difference."
          }
          id="river-narration"
          label="game instructions"
        />
      </div>

      <div className="river-scene-wrapper storybook-world">
        {/* Rich Layered River SVG Stage */}
        <div className="river-stage">
          <svg className="river-svg" viewBox="0 0 740 360" aria-hidden="true">
            <defs>
              <linearGradient id="riverSky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d8eef8" />
                <stop offset="60%" stopColor="#eaf4f4" />
                <stop offset="100%" stopColor="#d2ebd9" />
              </linearGradient>

              <linearGradient id="waterFlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#81c4e8" />
                <stop offset="50%" stopColor="#64b5f6" />
                <stop offset="100%" stopColor="#4ba3e3" />
              </linearGradient>

              <linearGradient id="leftBankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b2d8a0" />
                <stop offset="100%" stopColor="#95c782" />
              </linearGradient>

              <linearGradient id="rightBankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c5e1a5" />
                <stop offset="100%" stopColor="#dcedc8" />
              </linearGradient>

              <filter id="waterGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Sky */}
            <rect width="740" height="360" fill="url(#riverSky)" rx="24" />

            {/* Distant Hills */}
            <path d="M0 120 Q180 80 370 110 T740 90 L740 200 L0 200 Z" fill="#b0bec5" opacity="0.3" />
            <path d="M0 140 Q200 105 420 130 T740 120 L740 220 L0 220 Z" fill="#90a4ae" opacity="0.25" />

            {/* Left Bank (Misty Willow Bank) */}
            <path d="M0 0 L160 0 Q190 180 150 360 L0 360 Z" fill="url(#leftBankGrad)" />
            {/* Weeping Willow Trunk & Branches on Left Bank */}
            <rect x="25" y="80" width="18" height="120" rx="6" fill="#6d4c41" />
            <path
              d="M10 80 Q35 30 70 80 Q50 140 30 180 M20 90 Q45 40 85 90 Q70 150 50 190"
              stroke="#7cb342"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Right Bank (Sunny Flower Meadow) */}
            <path d="M570 0 Q530 180 560 360 L740 360 L740 0 Z" fill="url(#rightBankGrad)" />
            {/* Bright Sunshine on Right Bank */}
            <circle cx="680" cy="50" r="32" fill="#fff59d" opacity="0.8" />
            <circle cx="680" cy="50" r="22" fill="#fbc02d" opacity="0.9" />

            {/* Flowers on Right Bank */}
            <g transform="translate(630, 160)">
              <circle cx="0" cy="0" r="9" fill="#f48fb1" />
              <circle cx="0" cy="0" r="4" fill="#fff59d" />
              <line x1="0" y1="9" x2="0" y2="28" stroke="#7cb342" strokeWidth="3" />
            </g>
            <g transform="translate(670, 240)">
              <circle cx="0" cy="0" r="11" fill="#ba68c8" />
              <circle cx="0" cy="0" r="5" fill="#fff9c4" />
              <line x1="0" y1="11" x2="0" y2="32" stroke="#7cb342" strokeWidth="3" />
            </g>
            <g transform="translate(610, 290)">
              <circle cx="0" cy="0" r="10" fill="#ffb74d" />
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
              <line x1="0" y1="10" x2="0" y2="30" stroke="#7cb342" strokeWidth="3" />
            </g>

            {/* Gentle River Flowing */}
            <path
              d="M150 0 Q210 180 140 360 L570 360 Q520 180 580 0 Z"
              fill="url(#waterFlow)"
              opacity="0.92"
            />

            {/* River Wave Ripple Streams */}
            <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.75" className="river-current-lines">
              <path d="M190 70 Q240 85 300 70" />
              <path d="M330 170 Q390 185 450 170" />
              <path d="M220 280 Q280 295 350 280" />
              <path d="M380 90 Q430 100 480 90" />
              <path d="M260 140 Q310 150 360 140" />
              <path d="M420 260 Q470 270 520 260" />
            </g>

            {/* Blooming Lilypads on the River */}
            <g transform="translate(230, 100)">
              <ellipse cx="0" cy="0" rx="22" ry="12" fill="#558b2f" />
              <circle cx="-3" cy="-2" r="6" fill="#f8bbd0" />
              <circle cx="-3" cy="-2" r="3" fill="#ffffff" />
            </g>
            <g transform="translate(480, 290)">
              <ellipse cx="0" cy="0" rx="24" ry="14" fill="#558b2f" />
              <circle cx="2" cy="-2" r="7" fill="#f48fb1" />
              <circle cx="2" cy="-2" r="3" fill="#fff9c4" />
            </g>

            {/* Friendly Little Goldfish Swimming */}
            <g transform="translate(360, 240)" opacity="0.8">
              <ellipse cx="0" cy="0" rx="14" ry="7" fill="#ff7043" />
              <polygon points="-12,0 -20,-7 -20,7" fill="#ff8a65" />
              <circle cx="7" cy="-2" r="2" fill="#ffffff" />
            </g>

            {/* 4 Interactive Stepping Stones in River */}
            {[
              { cx: 215, cy: 195, rx: 44, ry: 26, id: 0, label: "Stone 1", icon: "🪑" },
              { cx: 315, cy: 135, rx: 46, ry: 28, id: 1, label: "Stone 2", icon: "👂" },
              { cx: 415, cy: 205, rx: 46, ry: 27, id: 2, label: "Stone 3", icon: "🧣" },
              { cx: 515, cy: 145, rx: 48, ry: 29, id: 3, label: "Stone 4", icon: "⛵" },
            ].map((stone) => {
              const isPassed = currentStep > stone.id
              const isCurrent = currentStep === stone.id
              return (
                <g
                  key={stone.id}
                  className={`river-stepping-stone ${isCurrent ? "active-stone" : ""} ${isPassed ? "passed-stone" : "future-stone"}`}
                  onClick={() => stepOnStone(stone.id)}
                  role="button"
                  tabIndex={isCurrent ? 0 : -1}
                  aria-label={`${stone.label}: ${STONES[stone.id]?.title}. ${isCurrent ? "Click to take this step!" : isPassed ? "Completed" : "Next"}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      stepOnStone(stone.id)
                    }
                  }}
                  style={{ cursor: isCurrent ? "pointer" : "default" }}
                >
                  {/* Water Ripple Ring under Active Stone */}
                  {isCurrent && (
                    <ellipse
                      cx={stone.cx}
                      cy={stone.cy + 6}
                      rx={stone.rx + 14}
                      ry={stone.ry + 9}
                      fill="none"
                      stroke="#ffe082"
                      strokeWidth="3.5"
                      opacity="0.9"
                      className="pulse-stone-ripple"
                    />
                  )}

                  {/* Stone Shadow */}
                  <ellipse
                    cx={stone.cx}
                    cy={stone.cy + 8}
                    rx={stone.rx}
                    ry={stone.ry}
                    fill="#37474f"
                    opacity="0.45"
                  />

                  {/* Stone Body */}
                  <ellipse
                    cx={stone.cx}
                    cy={stone.cy}
                    rx={stone.rx}
                    ry={stone.ry}
                    fill={isCurrent ? "#fff9c4" : isPassed ? "#b0bec5" : "#cfd8dc"}
                    stroke={isCurrent ? "#f57f17" : isPassed ? "#78909c" : "#90a4ae"}
                    strokeWidth={isCurrent ? 4.5 : 2.5}
                  />

                  {/* Stone Icon & Checkmark */}
                  {isPassed ? (
                    <text
                      x={stone.cx}
                      y={stone.cy + 7}
                      textAnchor="middle"
                      fill="#2e7d32"
                      fontSize="20"
                      fontWeight="bold"
                    >
                      ✓
                    </text>
                  ) : (
                    <text
                      x={stone.cx}
                      y={stone.cy + 6}
                      textAnchor="middle"
                      fontSize={isCurrent ? "20" : "16"}
                    >
                      {stone.icon}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Dynamic Splash Particles when hopping */}
            {isHopping && splashPos && (
              <g className="water-splash-particles" filter="url(#waterGlow)">
                <ellipse cx={splashPos.x} cy={splashPos.y + 10} rx="30" ry="14" fill="none" stroke="#ffffff" strokeWidth="3" />
                <circle cx={splashPos.x - 18} cy={splashPos.y - 12} r="4" fill="#e1f5fe" />
                <circle cx={splashPos.x + 18} cy={splashPos.y - 14} r="4.5" fill="#e1f5fe" />
                <circle cx={splashPos.x} cy={splashPos.y - 20} r="5" fill="#ffffff" />
              </g>
            )}

            {/* Floating Leaf Boat on Right Bank when finished */}
            {currentStep >= 4 && (
              <g transform="translate(565, 220)" className="floating-leaf-boat pop-in">
                {/* Green Leaf Hull */}
                <path d="M0 10 Q25 -10 65 5 Q40 22 0 10 Z" fill="#689f38" stroke="#33691e" strokeWidth="2" />
                {/* Twig Mast */}
                <line x1="30" y1="6" x2="30" y2="-28" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
                {/* Yellow Sail */}
                <polygon points="30,-26 55,-12 30,-4" fill="#fff176" stroke="#fbc02d" strokeWidth="2" />
                {/* Sparkle */}
                <circle cx="58" cy="-14" r="3" fill="#ffffff" />
              </g>
            )}
          </svg>

          {/* Ripple Avatar Moving Across River */}
          <div
            className={`ripple-companion ${isHopping ? "hopping-bounce" : ""} mood-${
              currentStep === 0 ? "sad" : currentStep < 4 ? "calm" : "happy"
            }`}
            style={{
              left:
                currentStep === 0
                  ? "7%"
                  : currentStep === 1
                    ? "27%"
                    : currentStep === 2
                      ? "40%"
                      : currentStep === 3
                        ? "54%"
                        : currentStep === 4
                          ? "68%"
                          : "82%",
              top:
                currentStep === 0
                  ? "44%"
                  : currentStep === 1
                    ? "48%"
                    : currentStep === 2
                      ? "30%"
                      : currentStep === 3
                        ? "50%"
                        : currentStep === 4
                          ? "34%"
                          : "38%",
            }}
          >
            <Buddy
              color="#afccdd"
              mood={currentStep === 0 ? "sad" : currentStep < 4 ? "calm" : "happy"}
            />
            <span className="character-label">
              Ripple {currentStep === 0 ? "💧" : currentStep < 4 ? "🌸" : "⛵"}
            </span>
          </div>
        </div>

        {/* Tactile Action HUD */}
        {currentStep < 4 ? (
          <div className="stones-action-panel storybook-controls">
            {/* 4 Stepping Stone Cards */}
            <div className="stones-sequence-grid">
              {STONES.map((stone, idx) => {
                const isCurrent = currentStep === idx
                const isPassed = currentStep > idx
                return (
                  <button
                    key={stone.id}
                    className={`stone-action-card ${isCurrent ? "current pulse-card" : isPassed ? "completed" : "locked"}`}
                    onClick={() => stepOnStone(idx)}
                    disabled={idx !== currentStep || isHopping}
                    aria-label={`Step ${idx + 1}: ${stone.title}. ${isCurrent ? "Tap to step!" : isPassed ? "Completed" : "Locked"}`}
                  >
                    <span className="stone-card-icon">{stone.icon}</span>
                    <strong className="stone-card-title">{stone.title}</strong>
                    <span className="stone-card-status">
                      {isPassed ? "✓ Done" : isCurrent ? "Tap Step!" : `Step ${idx + 1}`}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="active-stone-action-bar">
              <p className="stone-action-quote">{activeStone.action}</p>
              <button
                className="primary-play-btn step-forward-btn pulse-glow"
                onClick={() => stepOnStone(currentStep)}
                disabled={isHopping}
                aria-label={`Step onto stone ${currentStep + 1}: ${activeStone.title}`}
              >
                <span>Take Step {currentStep + 1}: {activeStone.title}</span>
                <Icon name="arrow" size={22} />
              </button>
            </div>
          </div>
        ) : (
          <div className="river-success-panel storybook-controls">
            <div className="success-banner">
              <span className="success-icon">⛵</span>
              <h3>Ripple Feels Warm, Loved & Supported!</h3>
              <p>
                By sitting close, listening kindly, and offering comfort, you helped Ripple feel safe and happy again!
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
