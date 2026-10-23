import { useEffect, useRef, useState } from "react"
import { Buddy, Icon, NarrationButton, Scene } from "./MeadowArt"
import { narration } from "./narration"
import EmotionGame, {
  EmotionMap,
  FeelingsCheckIn,
  RewardShop,
  RewardCollection,
  CalmCorner,
  MeadowDisplay,
} from "./EmotionGame"
import { adventures, useMeadow } from "./meadowState"
import type { AdventureId } from "./meadowState"

type Activity = "slide" | "cloud"
type Screen = "map" | Activity | "stickers" | "emotion" | "shop" | "calm"

const extraActivities: {
  id: Activity
  title: string
  tag: string
  description: string
  color: string
  reward: string
}[] = [
  {
    id: "slide",
    title: "Wiggly Slide",
    tag: "MOVE & GROOVE",
    description: "Shake out the wiggles! Gentle movement to refresh your body.",
    color: "peach",
    reward: "Wonderful Wiggler",
  },
  {
    id: "cloud",
    title: "Cloud Catcher",
    tag: "BREATHE & RELAX",
    description: "Float with gentle clouds. Take comfortable, calm breaths.",
    color: "blue",
    reward: "Cloud Friend",
  },
]

export default function App() {
  const meadow = useMeadow()
  const [screen, setScreen] = useState<Screen>("map")
  const [welcome, setWelcome] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [grownupOpen, setGrownupOpen] = useState(false)
  const [name, setName] = useState(() => meadow.state.profile.name || "")
  const [avatar, setAvatar] = useState(() => meadow.state.profile.avatar || 0)
  const [active, setActive] = useState<Activity>("slide")
  const [stage, setStage] = useState(0)
  const [movement, setMovement] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [breathing, setBreathing] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [help, setHelp] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)

  const completed = meadow.state.completed
  const stars = meadow.state.stars
  const tokens = meadow.state.tokens
  const sound = meadow.state.soundEnabled

  useEffect(() => {
    document.title = "Moodie Meadows — Emotional Learning Game"
  }, [])

  useEffect(() => {
    narration.stop()
    titleRef.current?.focus()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [screen])

  useEffect(() => {
    if (meadow.state.profile.name && !name) {
      setName(meadow.state.profile.name)
    }
  }, [meadow.state.profile.name, name])

  useEffect(() => {
    if (!breathing || paused || screen !== "cloud") return
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(timer)
  }, [breathing, paused, screen])

  useEffect(() => {
    if (seconds >= 24) setBreathing(false)
  }, [seconds])

  const colors = ["#f7cd64", "#c6b3dc", "#b5cda0"]

  function enterExtra(id: Activity) {
    setActive(id)
    setStage(0)
    setMovement(null)
    setPaused(false)
    setSeconds(0)
    setBreathing(false)
    setScreen(id)
  }

  function finishExtra() {
    meadow.completeActivity(active)
    setScreen("map")
    setBreathing(false)
  }

  function toggleSound() {
    const next = !sound
    meadow.setSoundEnabled(next)
    if (!next) {
      narration.stop()
    }
  }

  function playEmotion(id: AdventureId, replay = false) {
    if (!meadow.isUnlocked(id)) return
    meadow.begin(id, replay)
    setScreen("emotion")
  }

  function continueEmotion() {
    const pending = adventures.find(
      (a) => meadow.isUnlocked(a.id) && !meadow.state.completed.includes(a.id),
    )
    const saved = meadow.state.current
    const target =
      meadow.state.runs[saved]?.phase !== "finish" && meadow.state.runs[saved]
        ? saved
        : pending?.id || "anger"

    playEmotion(target)
  }

  const currentExtra = extraActivities.find((a) => a.id === active) || extraActivities[0]

  return (
    <div className="app-shell">
      {/* Top Navigation Bar */}
      <header className="topbar">
        <button
          className="brand"
          onClick={() => setScreen("map")}
          aria-label="Moodie Meadows Home"
        >
          <span className="brand-icon">
            <Icon name="flower" size={28} />
          </span>
          <span>
            Moodie Meadows
            <small>EMOTIONAL LEARNING ADVENTURE</small>
          </span>
        </button>

        <nav aria-label="Main game navigation">
          <button
            className={screen === "map" ? "nav-button active" : "nav-button"}
            onClick={() => setScreen("map")}
            aria-label="Adventure Map"
          >
            <Icon name="home" size={20} />
            <span>Map</span>
          </button>

          <button
            className={screen === "stickers" ? "nav-button active" : "nav-button"}
            onClick={() => setScreen("stickers")}
            aria-label="My Sticker Book"
          >
            <Icon name="book" size={20} />
            <span>Sticker Book</span>
            {completed.length > 0 && <b className="nav-count">{completed.length}</b>}
          </button>

          <button
            className={screen === "shop" ? "nav-button active" : "nav-button"}
            onClick={() => setScreen("shop")}
            aria-label="Reward Shop"
          >
            <Icon name="star" size={20} />
            <span>Reward Shop</span>
          </button>
        </nav>

        <div className="header-right">
          {/* Token Balance */}
          <span
            className="meadow-token-balance"
            aria-live="polite"
            aria-label={`${tokens} Meadow Tokens`}
            title="Meadow Tokens"
          >
            <span className="token-coin">🪙</span>
            <b>{tokens}</b>
          </span>

          {/* Stars Counter */}
          <span
            className="star-total"
            aria-live="polite"
            aria-label={`${stars} of 15 Exploration Stars`}
            title="Exploration Stars"
          >
            <span className="star-icon">⭐</span>
            <b>{stars} / 15</b>
          </span>

          {/* Sound Toggle */}
          <button
            className={`sound-button ${sound ? "sound-on" : ""}`}
            onClick={toggleSound}
            aria-label={sound ? "Narration sound is on. Tap to mute." : "Narration sound is muted. Tap to turn on."}
            title={sound ? "Narration Sound ON" : "Narration Sound MUTED"}
          >
            <Icon name="sound" size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content">
        <div ref={titleRef} tabIndex={-1} className="sr-only">
          {screen === "map" ? "Meadow Adventure Map" : screen}
        </div>

        {/* SCREEN: HOME ADVENTURE MAP */}
        {screen === "map" && (
          <>
            {/* Playful Child-Friendly Adventure Banner */}
            <section className="adventure-game-banner" aria-label="Meadow Adventure Hub">
              <div className="banner-left">
                <div className="banner-mascot-badge" aria-hidden="true">
                  <Buddy color="#f7cd64" mood="happy" />
                </div>
                <div className="banner-welcome-text">
                  <span className="banner-eyebrow">★ EMOTION ADVENTURE WORLD</span>
                  <h1>
                    {completed.length > 0 ? (
                      <>
                        Welcome back, <span>{name.trim() || "explorer"}!</span>
                      </>
                    ) : (
                      <>
                        Welcome to <span>Moodie Meadows!</span>
                      </>
                    )}
                  </h1>
                  <p>Play 5 landmark mini-games, learn big feeling skills, and collect stars!</p>
                </div>
              </div>

              <div className="banner-right">
                {(() => {
                  const pending = adventures.find(
                    (a) => meadow.isUnlocked(a.id) && !meadow.state.completed.includes(a.id),
                  )
                  const saved = meadow.state.current
                  const nextTarget =
                    meadow.state.runs[saved]?.phase !== "finish" && meadow.state.runs[saved]
                      ? saved
                      : pending?.id || "anger"
                  const nextAdv = adventures.find((a) => a.id === nextTarget) || adventures[0]

                  return (
                    <button
                      className="banner-continue-btn"
                      onClick={continueEmotion}
                      aria-label={`${completed.length > 0 ? "Continue Adventure" : "Start Adventure"}. Next: ${nextAdv.title} with ${nextAdv.mascot}`}
                    >
                      <span className="continue-play-icon" aria-hidden="true">▶</span>
                      <div className="continue-play-text">
                        <strong>{completed.length > 0 ? "CONTINUE ADVENTURE" : "START ADVENTURE"}</strong>
                        <small>Next: {nextAdv.title} ({nextAdv.mascot})</small>
                      </div>
                      <Icon name="arrow" size={20} />
                    </button>
                  )
                })()}

                <NarrationButton
                  text={`Welcome to Moodie Meadows! Follow the adventure trail to explore feelings with Ember, Moss, Ripple, Nimbus, and Sunny! Tap Continue Adventure to play.`}
                  id="hero-intro"
                  label="welcome narration"
                />
              </div>
            </section>

            {/* Illustrated Interactive Adventure Map - PRIMARY VISUAL FOCUS */}
            <EmotionMap
              meadow={meadow}
              play={(id, replay) => playEmotion(id, replay ?? meadow.state.completed.includes(id))}
              shop={() => setScreen("shop")}
              calm={() => setScreen("calm")}
            />

            {/* Daily Feelings Check-In (Moved below map per child-first game layout) */}
            <FeelingsCheckIn meadow={meadow} />

            {/* Display Decorated Meadow Accessories */}
            <MeadowDisplay meadow={meadow} />

            {/* Gentle Extra Play Activities (Movement & Breathing) */}
            <section className="adventure-section" aria-label="Gentle Extra Play">
              <div className="section-heading">
                <div>
                  <div className="eyebrow small">GENTLE EXTRA PLAY</div>
                  <h2>Movement & Relaxation</h2>
                  <p>Shake out the wiggles or float with gentle clouds anytime.</p>
                </div>
              </div>

              <div className="activity-grid">
                {extraActivities.map((a, i) => (
                  <button
                    key={a.id}
                    className={`activity-card ${a.color}`}
                    onClick={() => enterExtra(a.id)}
                    aria-label={`Play ${a.title}: ${a.description}`}
                  >
                    <div className="card-art">
                      <span className="activity-number">0{i + 1}</span>
                      <Scene type={a.id} />
                      {meadow.state.completedActivities.includes(a.id) && (
                        <span className="complete-badge">Explored!</span>
                      )}
                    </div>
                    <div className="card-body">
                      <span className="card-tag">{a.tag}</span>
                      <h3>{a.title}</h3>
                      <p>{a.description}</p>
                      <span className="card-link">
                        <span>Let’s play</span>
                        <Icon name="arrow" size={18} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Adult & Grown-Up Settings Accordion (Separated from child play) */}
            <section className="grownup-accordion-section" aria-label="Grown-Ups and Profile Settings">
              <button
                className="grownup-toggle-btn"
                onClick={() => setGrownupOpen(!grownupOpen)}
                aria-expanded={grownupOpen}
              >
                <span>⚙️ Grown-Ups & Settings</span>
                <Icon name={grownupOpen ? "check" : "arrow"} size={16} />
              </button>

              {grownupOpen && (
                <div className="grownup-panel-content">
                  <div className="profile-edit-box">
                    <h4>Player Profile</h4>
                    <p>Customize the explorer name and avatar (saved locally on this device).</p>
                    <div className="avatar-pick-row">
                      {colors.map((color, i) => (
                        <button
                          key={color}
                          aria-label={`Avatar option ${i + 1}`}
                          aria-pressed={avatar === i}
                          className={avatar === i ? "selected-avatar" : ""}
                          onClick={() => {
                            setAvatar(i)
                            meadow.saveProfile(name, i)
                          }}
                        >
                          <Buddy color={color} />
                        </button>
                      ))}
                    </div>

                    <div className="name-input-row">
                      <label htmlFor="grownup-name">Explorer Name:</label>
                      <input
                        id="grownup-name"
                        maxLength={20}
                        placeholder="First name or nickname"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          meadow.saveProfile(e.target.value, avatar)
                        }}
                      />
                    </div>
                  </div>

                  <div className="privacy-note-box">
                    <h4>About Moodie Meadows</h4>
                    <p>
                      Moodie Meadows is an educational emotional learning game designed for children aged 6–10. All progress, tokens, stars, and check-ins are saved strictly in this browser’s local storage. No personal data or speech audio is ever transmitted to external servers.
                    </p>
                    <button className="text-link-btn" onClick={() => setHelp(true)}>
                      Read full parent & caregiver guide
                    </button>
                  </div>

                  <div className="danger-zone-box">
                    <h4>Reset Progress</h4>
                    <p>Clear all earned tokens, stars, and unlocked landmarks to start completely fresh.</p>
                    <button
                      className="danger-reset-btn"
                      onClick={() => setConfirmReset(true)}
                    >
                      Reset All Progress
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* SCREEN: EMOTION GAME MINI-GAME */}
        {screen === "emotion" && (
          <EmotionGame
            meadow={meadow}
            home={() => setScreen("map")}
            shop={() => setScreen("shop")}
            play={playEmotion}
          />
        )}

        {/* SCREEN: REWARD SHOP */}
        {screen === "shop" && (
          <RewardShop
            meadow={meadow}
            home={() => setScreen("map")}
            book={() => setScreen("stickers")}
          />
        )}

        {/* SCREEN: STICKER BOOK */}
        {screen === "stickers" && (
          <RewardCollection
            meadow={meadow}
            shop={() => setScreen("shop")}
          />
        )}

        {/* SCREEN: CALM CORNER */}
        {screen === "calm" && (
          <CalmCorner
            home={() => setScreen("map")}
            breathe={() => enterExtra("cloud")}
          />
        )}

        {/* SCREEN: GENTLE MOVEMENT (SLIDE) */}
        {screen === "slide" && (
          <section className={`play-area ${currentExtra.color}`} aria-label="Wiggly Slide Movement Game">
            <div className="play-top">
              <button className="text-button" onClick={() => setScreen("map")}>
                <Icon name="home" size={18} /> Back to map
              </button>
              <span>{currentExtra.tag}</span>
              <button className="text-button" onClick={() => setPaused(!paused)}>
                {paused ? "Keep playing" : "Take a break"}
              </button>
            </div>

            <div className="play-heading">
              <span className="eyebrow small">GENTLE MOVEMENT</span>
              <h1>Wiggly Slide</h1>
            </div>

            <div className="movement-game">
              <div className="step-dots">
                {[0, 1, 2].map((i) => (
                  <span className={i <= stage ? "filled" : ""} key={i}>
                    {i < stage ? <Icon name="check" size={17} /> : i + 1}
                  </span>
                ))}
              </div>

              <div className="movement-scene">
                <Scene type="slide" />
                <div className={`moving-buddy ${movement ? "wiggling" : ""}`}>
                  <Buddy color={colors[avatar]} />
                </div>
              </div>

              <h2>
                {[
                  "Wake up your wiggles!",
                  "Reach for the warm sunshine!",
                  "Find your comfy calm.",
                ][stage]}
              </h2>

              <p>
                {[
                  "Shake your hands or wiggle your fingers. Seated wiggles count too!",
                  "Stretch your arms gently up high. Take a slow, deep breath.",
                  "Let your shoulders soften. Move gently, or enjoy a quiet moment.",
                ][stage]}
              </p>

              <div className="choice-row">
                {[
                  "Wiggle with Pip",
                  "Gentle stretch",
                  "Comfy quiet break",
                ].map((m, i) => (
                  <button
                    key={m}
                    className={`movement-choice ${movement === m ? "chosen" : ""}`}
                    onClick={() => setMovement(m)}
                  >
                    <Icon name={["flower", "star", "heart"][i]} />
                    <span>{m}</span>
                  </button>
                ))}
              </div>

              {movement && (
                <div className="feedback success" role="status">
                  <strong>Wonderful movement! Make it your own.</strong>
                  <p>When your body feels refreshed, let’s continue.</p>
                  <button
                    className="primary"
                    onClick={() => {
                      if (stage === 2) finishExtra()
                      else {
                        setStage((s) => s + 1)
                        setMovement(null)
                      }
                    }}
                  >
                    <span>{stage === 2 ? "Finish Activity" : "Next Stage"}</span>
                    <Icon name="arrow" />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SCREEN: GENTLE BREATHING (CLOUD) */}
        {screen === "cloud" && (
          <section className="play-area blue" aria-label="Cloud Catcher Gentle Breathing">
            <div className="play-top">
              <button className="text-button" onClick={() => setScreen("map")}>
                <Icon name="home" size={18} /> Back to map
              </button>
              <span>{currentExtra.tag}</span>
              <button className="text-button" onClick={() => setPaused(!paused)}>
                {paused ? "Keep playing" : "Take a break"}
              </button>
            </div>

            <div className="play-heading">
              <span className="eyebrow small">BREATHE & RELAX</span>
              <h1>Cloud Catcher</h1>
            </div>

            <div className="breathing-game">
              <p>Follow the floating cloud. Let your breaths be soft and natural.</p>
              <div
                className={`breathing-cloud ${breathing ? "breathing" : ""}`}
                style={{ animationPlayState: paused ? "paused" : "running" }}
              >
                <Scene type="cloud" />
              </div>

              <h2 aria-live="polite">
                {seconds >= 24
                  ? "A lovely, peaceful moment of calm."
                  : breathing
                    ? seconds % 8 < 4
                      ? "Breathe in gently…"
                      : "Breathe out slowly…"
                    : "Let’s float with gentle breaths."}
              </h2>

              <p>
                {seconds >= 24
                  ? "Notice how your body feels. All feelings are welcome."
                  : `${Math.min(Math.floor(seconds / 8) + 1, 3)} of 3 breaths · Stop whenever you feel calm.`}
              </p>

              <div className="choice-row breathing-controls">
                <button
                  className="primary"
                  onClick={() => setBreathing(!breathing)}
                >
                  <Icon name="heart" />
                  <span>
                    {breathing
                      ? "Pause breathing"
                      : seconds
                        ? "Keep breathing"
                        : "Start breathing"}
                  </span>
                </button>

                <button
                  className="secondary"
                  onClick={finishExtra}
                  aria-label="Finish breathing and collect sticker"
                >
                  <Icon name="star" />
                  <span>I'm ready to finish</span>
                </button>
              </div>

              <NarrationButton
                text="Follow the cloud gently. Breathe in as the cloud grows, and breathe out as it softens. You can stop whenever your body feels ready."
                id="cloud-breathe-guide"
                label="breathing guidance"
                className="mt-4"
              />
            </div>
          </section>
        )}
      </main>

      {/* Confirmation Reset Modal */}
      {confirmReset && (
        <div className="modal-backdrop">
          <section
            className="welcome-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <button
              className="close-button"
              aria-label="Close dialog"
              onClick={() => setConfirmReset(false)}
            >
              ×
            </button>
            <Icon name="refresh" size={42} />
            <h2 id="reset-title">Start a Fresh Adventure?</h2>
            <p>
              This will clear your saved tokens, stars, and unlocked landmarks on this browser so you can start from the beginning.
            </p>
            <div className="choice-row">
              <button
                className="secondary"
                onClick={() => setConfirmReset(false)}
              >
                Keep My Progress
              </button>
              <button
                className="primary danger-btn"
                onClick={() => {
                  meadow.resetProgress()
                  setConfirmReset(false)
                  setScreen("map")
                }}
              >
                Yes, Start Fresh
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Caregiver Guide Modal */}
      {help && (
        <div className="modal-backdrop">
          <section
            className="welcome-modal grownup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
          >
            <button
              className="close-button"
              aria-label="Close note"
              onClick={() => setHelp(false)}
            >
              ×
            </button>
            <Icon name="heart" size={38} />
            <h2 id="help-title">A Space for Every Feeling.</h2>
            <p>
              Moodie Meadows helps children aged 6–10 recognize emotional states (Anger, Stress, Sadness, Anxiety, Happiness) and practice evidence-based coping skills (deep breathing, kit packing, empathetic listening, sensory grounding, and gratitude).
            </p>
            <p>
              Children learn by playing interactive mini-games, not through multiple-choice quizzes. There are no right or wrong feelings, no countdown timers, and no punishments.
            </p>
            <p>
              All game progress and virtual rewards are stored in the browser on this device. No personal information is gathered or shared.
            </p>
            <button className="primary" onClick={() => setHelp(false)}>
              Back to the Adventure <Icon name="arrow" />
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
