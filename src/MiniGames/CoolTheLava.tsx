import React, { useState, useEffect, useRef } from "react"
import { Buddy, Icon, NarrationControls } from "../MeadowArt"
import { narration } from "../narration"
import type { Adventure } from "../adventureData"

type Props = {
  adventure: Adventure
  onComplete: (data: { taps: string[] }) => void
}

type Tool = {
  id: string
  name: string
  icon: string
  detail: string
  cue: string
  feedback: string
}

const TOOLS: Tool[] = [
  {
    id: "words",
    name: "Calm Words",
    icon: "💬",
    detail: "Say how you feel gently.",
    cue: "Calm words: Say what you feel gently without shouting.",
    feedback: "Wonderful! Using calm words helps friends understand you.",
  },
  {
    id: "support",
    name: "Cool Water",
    icon: "💧",
    detail: "Take a soothing sip or splash.",
    cue: "Cool water: Sips and splashes help cool down hot feelings.",
    feedback: "So refreshing! Cool water settles your body temperature.",
  },
  {
    id: "hands",
    name: "Relax Your Hands",
    icon: "🤲",
    detail: "Open tight fists and soften.",
    cue: "Relax your hands: Open fists and let your shoulders soften.",
    feedback: "Great job! Letting your hands relax tells your brain you are safe.",
  },
]

export default function CoolTheLava({ adventure, onComplete }: Props) {
  // Game states: "breathe" -> "action" -> "cooled"
  const [stage, setStage] = useState<"breathe" | "action" | "cooled">("breathe")
  const [breaths, setBreaths] = useState(0)
  const [orbPhase, setOrbPhase] = useState<"idle" | "inhale" | "exhale">("idle")
  const [heat, setHeat] = useState(100)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [appliedTools, setAppliedTools] = useState<string[]>([])
  const [coolingSplash, setCoolingSplash] = useState(false)
  const [feedback, setFeedback] = useState<string>(
    "Ember is feeling super heated! Tap the breathing orb to take slow, cooling breaths together."
  )
  const timerRef = useRef<number | null>(null)

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  // Start breathing cycle with voice cues
  function startBreathCycle() {
    if (orbPhase !== "idle") return

    setOrbPhase("inhale")
    setFeedback("Breathe in slowly... Fill your belly with cool meadow air.")
    narration.speak("Breathe in slowly... Fill your belly with cool meadow air.", "lava-inhale")

    timerRef.current = window.setTimeout(() => {
      setOrbPhase("exhale")
      setFeedback("Breathe out gently... Puff the hot steam away.")
      narration.speak("Breathe out gently... Puff the hot steam away.", "lava-exhale")

      timerRef.current = window.setTimeout(() => {
        setOrbPhase("idle")
        const nextBreaths = breaths + 1
        setBreaths(nextBreaths)
        const nextHeat = Math.max(25, 100 - nextBreaths * 25)
        setHeat(nextHeat)

        if (nextBreaths >= 3) {
          setFeedback("Lovely slow breaths! The volcano is calming down. Tap a calming tool below to cool the rest!")
          narration.speak("The volcano is calming down! Tap a calming tool below.", "lava-tools")
          setStage("action")
        } else {
          setFeedback(`Nice gentle breath (${nextBreaths} of 3). The volcano heat is dropping!`)
        }
      }, 4000)
    }, 4000)
  }

  // Early ready shortcut
  function skipToCalmAction() {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setOrbPhase("idle")
    setHeat(35)
    setStage("action")
    setFeedback("You're ready! Let’s choose a calming action to cool the remaining lava.")
    narration.speak("You're ready! Choose a calming action below.", "lava-ready")
  }

  // Handle applying a calming tool to the volcano
  function applyTool(tool: Tool) {
    if (appliedTools.includes(tool.id)) return

    setCoolingSplash(true)
    setTimeout(() => setCoolingSplash(false), 900)

    const nextApplied = [...appliedTools, tool.id]
    setAppliedTools(nextApplied)
    setSelectedTool(tool)
    setFeedback(tool.feedback)
    narration.speak(tool.cue, `tool-${tool.id}`)

    const nextHeat = Math.max(0, heat - 25)
    setHeat(nextHeat)

    if (nextHeat === 0 || nextApplied.length >= 2) {
      setTimeout(() => {
        setHeat(0)
        setStage("cooled")
        setFeedback("Puffff... Cool spring water! The volcano is completely peaceful, green, and blooming now!")
        narration.speak("The volcano is cool and quiet! You helped Ember calm big feelings.", "lava-done")
      }, 600)
    }
  }

  // Finish mini-game
  function handleFinish() {
    onComplete({
      taps: ["words", "support", "breathe_ready", "minigame_complete"],
    })
  }

  return (
    <div className="minigame-container cool-the-lava" role="region" aria-label="Anger Volcano: Cool the Lava Mini-Game">
      {/* Floating Storybook Instruction Bar */}
      <div className="minigame-instruction-bar">
        <div className="instruction-text">
          <span className="step-tag">
            {stage === "breathe"
              ? `STEP 1: SLOW BREATHS (${breaths}/3)`
              : stage === "action"
                ? `STEP 2: CALMING ACTIONS (${appliedTools.length}/2)`
                : "STEP 3: VOLCANO IS COOL!"}
          </span>
          <h2>
            {stage === "breathe"
              ? "Breathe Gently with Ember to Cool the Lava!"
              : stage === "action"
                ? "Tap a Calming Action to Settle the Volcano!"
                : "The Volcano is Cool, Green and Peaceful!"}
          </h2>
        </div>
        <NarrationControls
          text={
            stage === "breathe"
              ? "Help Ember cool the volcano! Tap the orb to take slow breaths and lower the heat."
              : stage === "action"
                ? "Tap a calming action below: Calm Words, Cool Water, or Relax Your Hands."
                : "The volcano is cool and peaceful! Great job calming big feelings."
          }
          id="lava-narration"
          label="game instructions"
        />
      </div>

      {/* Main Living Game World Area */}
      <div className="lava-scene-wrapper storybook-world">
        {/* Floating Game Heat Meter HUD */}
        <div className="heat-gauge" role="meter" aria-valuenow={heat} aria-valuemin={0} aria-valuemax={100} aria-label="Volcano heat level">
          <span className="gauge-label">
            {heat > 60 ? "🔥 Super Hot Lava" : heat > 20 ? "⛅ Cooling Down..." : "🌸 Cool Spring Water"}
          </span>
          <div className="gauge-track">
            <div
              className={`gauge-fill ${heat > 50 ? "hot" : heat > 15 ? "warm" : "cool"}`}
              style={{ width: `${heat}%` }}
            />
          </div>
          <span className="gauge-percent">{heat}% Heat</span>
        </div>

        {/* Rich Layered Volcano Landscape */}
        <div className="volcano-visual-stage">
          <svg className="volcano-svg" viewBox="0 0 680 340" aria-hidden="true">
            {/* Sky gradient background */}
            <defs>
              <linearGradient id="volcanoSkyHot" x1="0%" y1="0%" x2="0%" y2="1">
                <stop offset="0%" stopColor="#fde0d2" />
                <stop offset="60%" stopColor="#fcefe6" />
                <stop offset="100%" stopColor="#edf3e6" />
              </linearGradient>
              <linearGradient id="volcanoSkyCool" x1="0%" y1="0%" x2="0%" y2="1">
                <stop offset="0%" stopColor="#e1f5fe" />
                <stop offset="60%" stopColor="#f1f8e9" />
                <stop offset="100%" stopColor="#dcedc8" />
              </linearGradient>
              <radialGradient id="craterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff3e0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect
              width="680"
              height="340"
              fill={heat > 40 ? "url(#volcanoSkyHot)" : "url(#volcanoSkyCool)"}
              rx="28"
            />

            {/* Distant soft mountain ridges */}
            <path d="M0 250 Q160 195 340 235 T680 215 L680 340 L0 340 Z" fill="#cfdec5" />
            <path d="M0 270 Q200 230 420 260 T680 255 L680 340 L0 340 Z" fill="#b9d2ac" />

            {/* Sunbeams or warm volcanic clouds */}
            <circle cx="580" cy="60" r="36" fill="#fff9c4" opacity="0.85" />
            <circle cx="580" cy="60" r="24" fill="#ffe082" />

            {/* Volcano Mountain Silhouette */}
            <path
              d="M150 320 L260 100 L420 100 L530 320 Z"
              fill={heat > 50 ? "#8d5d4d" : "#6d615c"}
            />
            {/* Textured lava veins running down sides */}
            {heat > 25 && (
              <g className="lava-veins" opacity={heat / 100}>
                <path d="M280 100 Q255 160 230 255" stroke="#ff7043" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M400 100 Q425 170 450 265" stroke="#ff9800" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M340 100 Q355 190 330 295" stroke="#ffa726" strokeWidth="5" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* Crater Rim */}
            <ellipse cx="340" cy="100" rx="80" ry="24" fill="#4e342e" />

            {/* Crater Contents: Boiling Magma or Sparkling Spring Water */}
            {heat > 0 ? (
              <>
                <ellipse
                  cx="340"
                  cy="100"
                  rx={Math.max(30, (heat / 100) * 70)}
                  ry={Math.max(10, (heat / 100) * 20)}
                  fill={heat > 50 ? "#ff5722" : "#ff9800"}
                  className={heat > 50 ? "bubbling-lava" : ""}
                />
                <ellipse cx="340" cy="100" rx="50" ry="12" fill="url(#craterGlow)" />
              </>
            ) : (
              /* Transformed Cool Spring Water! */
              <g className="spring-water-calm pop-in">
                <ellipse cx="340" cy="100" rx="72" ry="20" fill="#4fc3f7" />
                <ellipse cx="340" cy="100" rx="56" ry="15" fill="#81d4fa" />
                <ellipse cx="325" cy="98" rx="12" ry="6" fill="#81c784" /> {/* Lilypad */}
                <circle cx="355" cy="101" r="4" fill="#ff7043" /> {/* Little swimming goldfish */}
              </g>
            )}

            {/* Dynamic Animated Smoke vs Cool Fresh Steam */}
            {heat > 60 ? (
              <g className="smoke-puffs">
                <circle cx="320" cy="70" r="16" fill="#bcaaa4" opacity="0.75" />
                <circle cx="365" cy="52" r="20" fill="#a1887f" opacity="0.65" />
                <circle cx="335" cy="25" r="24" fill="#8d6e63" opacity="0.5" />
              </g>
            ) : (
              <g className="steam-puffs">
                <path d="M320 80 Q305 50 325 25 T315 5" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
                <path d="M365 75 Q380 45 360 20 T375 0" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.85" />
              </g>
            )}

            {/* Environmental Response 1: Floating Calm Words Speech Bubble */}
            {appliedTools.includes("words") && (
              <g className="floating-calm-words pop-in" transform="translate(380, 50)">
                <rect x="0" y="0" width="130" height="32" rx="16" fill="#ffffff" stroke="#81c784" strokeWidth="2" />
                <text x="65" y="20" textAnchor="middle" fill="#2e7d32" fontSize="13" fontWeight="bold">
                  “I feel calm now”
                </text>
              </g>
            )}

            {/* Environmental Response 2: Fresh Blooming Meadow Greenery & Flowers */}
            {(heat <= 50 || appliedTools.includes("hands")) && (
              <g className="volcano-greening">
                {/* Ivy vines on slopes */}
                <path d="M210 300 Q240 230 270 170" stroke="#66bb6a" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M470 300 Q445 220 415 160" stroke="#81c784" strokeWidth="6" fill="none" strokeLinecap="round" />
                {/* Sprouting wild flowers */}
                <circle cx="210" cy="295" r="9" fill="#f48fb1" />
                <circle cx="210" cy="295" r="3.5" fill="#fff59d" />
                <circle cx="255" cy="305" r="8" fill="#ba68c8" />
                <circle cx="255" cy="305" r="3.5" fill="#fff59d" />
                <circle cx="425" cy="300" r="10" fill="#ffb74d" />
                <circle cx="425" cy="300" r="3.5" fill="#ffffff" />
                <circle cx="475" cy="290" r="9" fill="#4dd0e1" />
                <circle cx="475" cy="290" r="3.5" fill="#fff59d" />
              </g>
            )}

            {/* Environmental Response 3: Animated cooling water splash burst */}
            {coolingSplash && (
              <g className="cooling-splash-effect">
                <circle cx="340" cy="100" r="42" fill="#80deea" opacity="0.6" />
                <circle cx="305" cy="90" r="8" fill="#ffffff" />
                <circle cx="375" cy="92" r="9" fill="#ffffff" />
                <circle cx="340" cy="70" r="7" fill="#80deea" />
              </g>
            )}
          </svg>

          {/* Expressive Ember Mascot Reacting to Heat */}
          <div className={`ember-companion ${heat > 60 ? "ember-tense" : heat === 0 ? "celebrating bounce-happy" : "ember-calming"}`}>
            <Buddy
              color="#edb29b"
              mood={heat > 60 ? "angry" : heat > 0 ? "calm" : "happy"}
            />
            <span className="character-label">
              {heat > 60 ? "Ember 🔥 Tense" : heat > 0 ? "Ember ⛅ Calming" : "Ember 🌸 Peaceful!"}
            </span>
          </div>
        </div>

        {/* Dynamic Interactive Stage Controls */}
        {stage === "breathe" && (
          <div className="breathing-interactive-panel storybook-controls">
            {/* Animated Breathing Orb */}
            <div
              className={`breathing-orb ${orbPhase}`}
              onClick={startBreathCycle}
              role="button"
              tabIndex={0}
              aria-label={
                orbPhase === "idle"
                  ? "Tap to take a slow breath with Ember"
                  : orbPhase === "inhale"
                    ? "Inhaling slowly"
                    : "Exhaling gently"
              }
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && startBreathCycle()}
            >
              <div className="orb-core">
                <span className="orb-text">
                  {orbPhase === "idle"
                    ? "Tap to Breathe"
                    : orbPhase === "inhale"
                      ? "Breathe In..."
                      : "Breathe Out..."}
                </span>
                <span className="orb-sparkle">✧</span>
              </div>
            </div>

            {/* 3 Breath Milestone Dots */}
            <div className="breath-progress-dots" aria-label={`Breath ${breaths} of 3`}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`dot ${i < breaths ? "completed" : i === breaths ? "current" : ""}`}
                >
                  {i < breaths ? "✓" : i + 1}
                </span>
              ))}
            </div>

            {/* Large Tactile Buttons */}
            <div className="breathing-action-buttons">
              <button
                className="primary-play-btn pulse-glow"
                onClick={startBreathCycle}
                disabled={orbPhase !== "idle"}
                aria-label={breaths === 0 ? "Start Slow Breath" : "Take Next Gentle Breath"}
              >
                <Icon name="heart" size={24} />
                <span>{breaths === 0 ? "Start Slow Breath" : "Next Gentle Breath"}</span>
              </button>

              <button
                className="secondary-calm-btn skip-calm-btn"
                onClick={skipToCalmAction}
                aria-label="I feel calmer now, proceed to calming tools"
              >
                <span>I feel calmer now · Ready</span>
                <Icon name="arrow" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Calming Tools Activity */}
        {stage === "action" && (
          <div className="tools-interactive-panel storybook-controls">
            <div className="tools-tray-header">
              <h3>Choose a Calming Action</h3>
              <p>Tap a tool below to cool down Ember’s volcano:</p>
            </div>

            <div className="tools-tray">
              {TOOLS.map((t) => {
                const isApplied = appliedTools.includes(t.id)
                const isSelected = selectedTool?.id === t.id
                return (
                  <button
                    key={t.id}
                    className={`tool-card ${isSelected ? "selected" : ""} ${isApplied ? "applied" : "pulse-card"}`}
                    disabled={isApplied}
                    onClick={() => applyTool(t)}
                    aria-label={`${t.name}: ${t.detail}. ${isApplied ? "Already used" : "Tap to use"}`}
                  >
                    <span className="tool-icon">{t.icon}</span>
                    <strong className="tool-name">{t.name}</strong>
                    <span className="tool-short-desc">{t.detail}</span>
                    {isApplied ? (
                      <span className="applied-badge">✓ Used</span>
                    ) : (
                      <span className="apply-tool-action">Tap to Apply</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Stage 3: Cooled Volcano Celebration */}
        {stage === "cooled" && (
          <div className="cooled-success-panel storybook-controls">
            <div className="success-banner">
              <span className="success-icon">🌈</span>
              <h3>The Volcano is Cool & Quiet!</h3>
              <p>
                Ember feels peaceful. You used slow breaths, cool water, and calm words to cool down big feelings.
              </p>
            </div>

            <button
              className="primary-play-btn claim-reward-btn pulse-glow"
              onClick={handleFinish}
              aria-label="Collect adventure stars and view celebration"
            >
              <span>Collect Adventure Stars!</span>
              <Icon name="star" size={24} />
            </button>
          </div>
        )}

        {/* Supportive Feedback Message */}
        {feedback && (
          <div className="minigame-live-feedback" role="status" aria-live="polite">
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}
