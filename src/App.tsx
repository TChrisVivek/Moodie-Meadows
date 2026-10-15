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

type Activity = "slide" | "garden" | "cloud" | "quiz"
type Screen = "map" | Activity | "stickers" | "results" | "emotion" | "shop" | "calm"
const activities: {
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
    description: "Wiggle out your feelings. Let’s get moving!",
    color: "peach",
    reward: "Wonderful Wiggler",
  },
  {
    id: "garden",
    title: "Feelings Garden",
    tag: "NOTICE & EXPLORE",
    description: "Every feeling has a place to grow.",
    color: "green",
    reward: "Feeling Finder",
  },
  {
    id: "cloud",
    title: "Cloud Catcher",
    tag: "BREATHE & RELAX",
    description: "Slow down and float with the clouds.",
    color: "blue",
    reward: "Cloud Friend",
  },
  {
    id: "quiz",
    title: "Feelings Quiz",
    tag: "THINK & DISCOVER",
    description: "A little curiosity. A lot of discovery!",
    color: "purple",
    reward: "Kind Explorer",
  },
]
const questions = [
  {
    text: "Pip has a big smile and is bouncing up and down. How might Pip feel?",
    options: ["Happy", "Sad", "Worried"],
    moods: ["happy", "sad", "worried"],
    answer: 0,
    why: "A smile and a bouncy body can be clues that Pip feels happy. We can ask Pip to be sure!",
  },
  {
    text: "Luna’s favourite toy broke. Her eyes are watery. How might she feel?",
    options: ["Excited", "Sad", "Calm"],
    moods: ["happy", "sad", "calm"],
    answer: 1,
    why: "Luna might feel sad about her toy. It’s okay to cry or ask someone for a hug.",
  },
  {
    text: "A new friend is visiting. Sam’s tummy feels fluttery. What might help?",
    options: ["Hide the feeling", "Take a slow breath", "Be unkind"],
    moods: ["worried", "calm", "angry"],
    answer: 1,
    why: "Slow, comfortable breaths can help when we feel nervous. A trusted grown-up can help too.",
  },
  {
    text: "Milo’s fists are tight and his eyebrows squeeze together. How might he feel?",
    options: ["Sleepy", "Happy", "Angry"],
    moods: ["calm", "happy", "angry"],
    answer: 2,
    why: "Tight fists can be a clue that Milo feels angry. Anger is okay; hurting others is not.",
  },
  {
    text: "Two friends go on a tall slide. One feels excited, one feels scared. Is that okay?",
    options: [
      "Only excited is okay",
      "Both feelings are okay",
      "They must feel the same",
    ],
    moods: ["happy", "calm", "worried"],
    answer: 1,
    why: "Yes! People can feel differently about the same thing. All feelings are welcome.",
  },
  {
    text: "You feel frustrated with a tricky puzzle. What could you try?",
    options: [
      "Take a little break",
      "Throw the pieces",
      "Say “I can never do it”",
    ],
    moods: ["calm", "angry", "sad"],
    answer: 0,
    why: "A break can give your brain some space. You can try again or ask for help when you’re ready.",
  },
  {
    text: "Nova is yawning after a busy day. What might her body need?",
    options: ["More noise", "A race", "Some quiet rest"],
    moods: ["angry", "happy", "calm"],
    answer: 2,
    why: "Yawning can mean our body needs rest. Listening to our bodies is a kind thing to do.",
  },
  {
    text: "A friend is sitting alone with a sad face. What could you do?",
    options: [
      "Tell them not to feel sad",
      "Ask “Would you like company?”",
      "Laugh at them",
    ],
    moods: ["worried", "happy", "angry"],
    answer: 1,
    why: "Offering company is caring. Your friend can choose company or a little space.",
  },
]

export default function App() {
  const meadow = useMeadow()
  const [screen, setScreen] = useState<Screen>("map")
  const [started, setStarted] = useState(false)
  const [welcome, setWelcome] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [name, setName] = useState(() => meadow.state.profile.name || "")
  const [avatar, setAvatar] = useState(() => meadow.state.profile.avatar || 0)
  const completed = meadow.state.completedActivities
  const stars = meadow.state.stars
  const sound = meadow.state.soundEnabled
  const [active, setActive] = useState<Activity>("slide")
  const [stage, setStage] = useState(0)
  const [movement, setMovement] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [order, setOrder] = useState(() => questions.map((_, i) => i))
  const [question, setQuestion] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const scored = useRef(new Set<number>())
  const [breathing, setBreathing] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [help, setHelp] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = "Moodie Meadows"
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

  function enter(id: Activity) {
    setActive(id)
    setStage(0)
    setMovement(null)
    setPaused(false)
    setScore(0)
    setQuestion(0)
    setSelected(null)
    scored.current.clear()
    const nextOrder = id === "garden" ? [0, 1, 3] : questions.map((_, i) => i)
    for (let i = nextOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[nextOrder[i], nextOrder[j]] = [nextOrder[j], nextOrder[i]]
    }
    setOrder(nextOrder)
    setSeconds(0)
    setBreathing(false)
    setScreen(id)
  }

  function finish() {
    meadow.completeActivity(active)
    setScreen("results")
    setBreathing(false)
  }

  function toggleSound() {
    const next = !sound
    meadow.setSoundEnabled(next)
    if (!next) {
      narration.stop()
    }
  }

  function answer(i: number) {
    if (selected !== null) return
    setSelected(i)
    const isCorrect = i === questions[order[question]].answer
    if (isCorrect && !scored.current.has(question)) {
      scored.current.add(question)
      setScore((s) => s + 1)
    }
    if (sound) {
      const speechText = isCorrect
        ? `Lovely thinking! ${questions[order[question]].why}`
        : `Let’s look a little closer. That’s a thoughtful try. ${questions[order[question]].why}`
      narration.speak(speechText, `quiz-answer-${question}`)
    }
  }
  function next() {
    if (question + 1 === (screen === "garden" ? 3 : 8)) finish()
    else {
      setQuestion((q) => q + 1)
      setSelected(null)
    }
  }
  const current = questions[order[question]]
  const correct = selected === current.answer
  const activity = activities.find((a) => a.id === active)!
  const count = screen === "garden" ? 3 : 8
  function playEmotion(id: AdventureId, replay = false) {
    if (!meadow.isUnlocked(id)) return
    meadow.begin(id, replay)
    setStarted(true)
    setScreen("emotion")
  }
  function continueEmotion() {
    const pending = adventures.find(
      (a) => meadow.isUnlocked(a.id) && !meadow.state.completed.includes(a.id),
    )
    const saved = meadow.state.current
    playEmotion(
      meadow.state.runs[saved]?.phase !== "finish" && meadow.state.runs[saved]
        ? saved
        : pending?.id || "anger",
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => setScreen("map")}
          aria-label="Moodie Meadows home"
        >
          <span className="brand-icon">
            <Icon name="flower" size={30} />
          </span>
          <span>
            Moodie Meadows<small>A LITTLE WORLD OF FEELINGS</small>
          </span>
        </button>
        <nav aria-label="Main navigation">
          <button
            className={screen === "map" ? "nav-button active" : "nav-button"}
            onClick={() => setScreen("map")}
          >
            <Icon name="home" /> <span>The Meadow</span>
          </button>
          <button
            className={
              screen === "stickers" ? "nav-button active" : "nav-button"
            }
            onClick={() => setScreen("stickers")}
          >
            <Icon name="book" />
            <span>My Sticker Book</span>
            {completed.length > 0 && (
              <b className="nav-count">{completed.length}</b>
            )}
          </button>
          <button
            className={screen === "shop" ? "nav-button active" : "nav-button"}
            onClick={() => setScreen("shop")}
          >
            <Icon name="star" />
            <span>Reward Shop</span>
          </button>
        </nav>
        <div className="header-right">
          <span
            className="meadow-token-balance"
            aria-live="polite"
            aria-label={`${meadow.state.tokens} Meadow Tokens`}
          >
            <span className="token-coin">
              <Icon name="flower" size={19} />
            </span>
            <strong>{meadow.state.tokens}</strong>
            <span>
              Meadow
              <br />
              Tokens
            </span>
          </span>
          <span className="star-total">
            <Icon name="star" size={20} /> {stars}
            <span>stars</span>
          </span>
          <button
            className={`sound-button ${sound ? "on" : ""}`}
            aria-label={
              sound
                ? "Turn voice feedback and narration off"
                : "Turn voice feedback and narration on"
            }
            aria-pressed={sound}
            onClick={toggleSound}
          >
            <Icon name="sound" />
            {!sound && <span className="mute-line" />}
          </button>
        </div>
      </header>
      <main ref={titleRef} tabIndex={-1}>
        {meadow.storageError && (
          <p className="storage-warning" role="alert">
            Your browser can’t save right now. You can still play, but new
            tokens and progress may be lost when you close or refresh this page.
          </p>
        )}
        {screen === "map" && (
          <>
            <div className="eyebrow">
              <span className="tiny-flower">✳</span> BIG FEELINGS. LITTLE
              ADVENTURES.
            </div>
            <section className="hero">
              <div className="hero-copy">
                <div className="welcome-label">
                  A happy little place to be you
                </div>
                <h1>
                  {started ||
                  meadow.state.completed.length > 0 ||
                  meadow.state.completedActivities.length > 0 ||
                  meadow.state.runs.anger ? (
                    <>
                      Welcome back,
                      <br />
                      <span>{name.trim() || "little explorer"}.</span>
                    </>
                  ) : (
                    <>
                      Little adventures.
                      <br />
                      <span>Big feelings.</span>
                    </>
                  )}
                </h1>
                <p>
                  Wiggle, wonder, breathe, and grow.
                  <br />
                  Let’s explore the wonderful world of feelings!
                </p>
                <div className="hero-action-row">
                  <button
                    className="primary"
                    onClick={() =>
                      started || meadow.state.runs.anger
                        ? continueEmotion()
                        : setWelcome(true)
                    }
                  >
                    {started || meadow.state.runs.anger
                      ? "Continue Adventure"
                      : "Start Adventure"}{" "}
                    <Icon name="arrow" size={21} />
                  </button>
                  <NarrationButton
                    text={`Welcome to Moodie Meadows! Little adventures, big feelings. Wiggle, wonder, breathe, and grow. Let’s explore the wonderful world of feelings!`}
                    id="hero-intro"
                    label="welcome message"
                  />
                </div>
                <div className="hero-note">
                  <Icon name="heart" size={15} /> Every feeling is welcome here.
                </div>
              </div>
              <div className="hero-art">
                <Scene type="slide" hero />
                <div className="hero-buddy">
                  <Buddy color="#f6ce68" />
                </div>
                <div className="hero-bubble">
                  Hello, little explorer!<span>Let’s grow together.</span>
                </div>
                <span className="art-spark one">✧</span>
                <span className="art-spark two">✧</span>
              </div>
            </section>
            <FeelingsCheckIn meadow={meadow} />
            <EmotionMap
              meadow={meadow}
              play={(id) =>
                playEmotion(id, meadow.state.completed.includes(id))
              }
              shop={() => setScreen("shop")}
              calm={() => setScreen("calm")}
            />
            <MeadowDisplay meadow={meadow} />
            <section className="adventure-section">
              <div className="section-heading">
                <div>
                  <div className="eyebrow small">
                    YOUR ORIGINAL MEADOW FAVOURITES
                  </div>
                  <h2>A little extra play</h2>
                  <p>Pick a little adventure. Follow your curiosity.</p>
                </div>
                <span className="choose-note">
                  <span>↙</span> There’s no wrong place to start
                </span>
              </div>
              <div className="activity-grid">
                {activities.map((a, i) => (
                  <button
                    key={a.id}
                    className={`activity-card ${a.color}`}
                    onClick={() => {
                      setStarted(true)
                      enter(a.id)
                    }}
                  >
                    <div className="card-art">
                      <span className="activity-number">
                        {completed.includes(a.id) ? (
                          <Icon name="check" size={16} />
                        ) : (
                          `0${i + 1}`
                        )}
                      </span>
                      <Scene type={a.id} />
                      {completed.includes(a.id) && (
                        <span className="complete-badge">Explored!</span>
                      )}
                    </div>
                    <div className="card-body">
                      <span className="card-tag">{a.tag}</span>
                      <h3>{a.title}</h3>
                      <p>{a.description}</p>
                      <span className="card-link">
                        {completed.includes(a.id) ? "Play again" : "Let’s play"}{" "}
                        <span>
                          <Icon name="arrow" size={18} />
                        </span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
            <section className="bottom-grid">
              <div className="journey-panel">
                <div className="journey-icon">
                  <Icon name="star" size={28} />
                </div>
                <div className="journey-content">
                  <div className="journey-title">
                    <h3>Your extra-play journey</h3>
                    <span>{completed.length} of 4 explored</span>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${completed.length * 25}%` }} />
                  </div>
                  <p>
                    {completed.length === 4
                      ? "You explored the whole meadow. Play again whenever you like!"
                      : "Every little step helps you grow. Go at your own pace."}
                  </p>
                </div>
                <div className="mini-stickers">
                  {activities.map((a) => (
                    <span
                      key={a.id}
                      className={completed.includes(a.id) ? "earned" : ""}
                    >
                      <Icon
                        name={completed.includes(a.id) ? "star" : "flower"}
                        size={22}
                      />
                    </span>
                  ))}
                </div>
              </div>
              <button className="kindness-panel" onClick={() => setHelp(true)}>
                <Icon name="heart" size={25} />
                <span>
                  <strong>A little reminder</strong>
                  <span>
                    All feelings are okay.
                    <br />
                    And you don’t have to figure them out alone.
                  </span>
                </span>
              </button>
            </section>
          </>
        )}
        {screen === "emotion" && (
          <EmotionGame
            meadow={meadow}
            home={() => setScreen("map")}
            shop={() => setScreen("shop")}
            play={playEmotion}
          />
        )}
        {screen === "shop" && (
          <RewardShop
            meadow={meadow}
            home={() => setScreen("map")}
            book={() => setScreen("stickers")}
          />
        )}
        {screen === "calm" && (
          <CalmCorner
            home={() => setScreen("map")}
            breathe={() => enter("cloud")}
          />
        )}
        {(screen === "slide" ||
          screen === "cloud" ||
          screen === "garden" ||
          screen === "quiz") && (
          <section className={`play-area ${activity.color}`}>
            <div className="play-top">
              <button
                className="text-button"
                onClick={() => {
                  setScreen("map")
                  setBreathing(false)
                }}
              >
                <Icon name="home" size={18} /> Back to meadow
              </button>
              <span>{activity.tag}</span>
              <button
                className="text-button"
                onClick={() => setPaused(!paused)}
              >
                {paused ? "Keep playing" : "Take a break"}
              </button>
            </div>
            <div className="play-heading">
              <span className="eyebrow small">A LITTLE ADVENTURE</span>
              <h1>{activity.title}</h1>
            </div>
            {paused ? (
              <div className="pause-panel">
                <Buddy mood="calm" color="#c6b3dc" />
                <h2>A little pause is always okay.</h2>
                <p>Relax your shoulders. Come back whenever you’re ready.</p>
                <button className="primary" onClick={() => setPaused(false)}>
                  I’m ready to play <Icon name="arrow" />
                </button>
              </div>
            ) : (
              <>
                {screen === "slide" && (
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
                      <div
                        className={`moving-buddy ${movement ? "wiggling" : ""}`}
                      >
                        <Buddy color={colors[avatar]} />
                      </div>
                    </div>
                    <span className="eyebrow small">
                      STAGE {stage + 1} OF 3
                    </span>
                    <h2>
                      {
                        [
                          "Wake up your wiggles!",
                          "Reach for the sunshine!",
                          "Find your comfy calm.",
                        ][stage]
                      }
                    </h2>
                    <p>
                      {
                        [
                          "Shake your hands or wiggle your fingers. Seated wiggles work too!",
                          "Stretch your arms in a way that feels comfy. Small stretches count!",
                          "Let your shoulders soften. Move gently, or choose a quiet moment.",
                        ][stage]
                      }
                    </p>
                    <div className="choice-row">
                      {[
                        "Wiggle with Pip",
                        "Do a gentle stretch",
                        "Take a quiet break",
                      ].map((m, i) => (
                        <button
                          key={m}
                          className={`movement-choice ${
                            movement === m ? "chosen" : ""
                          }`}
                          onClick={() => setMovement(m)}
                        >
                          <Icon name={["flower", "star", "heart"][i]} />
                          {m}
                        </button>
                      ))}
                    </div>
                    {movement && (
                      <div className="feedback success" role="status">
                        <strong>
                          {movement.includes("break")
                            ? "Rest is a lovely choice."
                            : "Wonderful! Make the movement your own."}
                        </strong>
                        <p>When your body feels ready, let’s move along.</p>
                        <button
                          className="primary"
                          onClick={() => {
                            if (stage === 2) finish()
                            else {
                              setStage((s) => s + 1)
                              setMovement(null)
                            }
                          }}
                        >
                          {stage === 2 ? "Finish adventure" : "Next stage"}
                          <Icon name="arrow" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {(screen === "quiz" || screen === "garden") && (
                  <div className="quiz-game">
                    <div className="quiz-progress">
                      <span>
                        Question {question + 1} of {count}
                      </span>
                      <span>{score} discoveries</span>
                    </div>
                    <div className="progress-track">
                      <span
                        style={{ width: `${((question + 1) / count) * 100}%` }}
                      />
                    </div>
                    <div className="quiz-question-row">
                      <h2>{current.text}</h2>
                      <NarrationButton
                        text={`${current.text}. Look for clues. Options: ${current.options.join(", ")}.`}
                        id={`question-${question}`}
                        label="question and options"
                      />
                    </div>
                    <p className="question-hint">
                      Look for clues. Choose what you think.
                    </p>
                    <div className="answer-grid">
                      {current.options.map((option, i) => (
                        <button
                          key={`${question}-${i}`}
                          disabled={selected !== null}
                          className={`answer-card ${
                            selected === i ? (correct ? "right" : "retry") : ""
                          }`}
                          onClick={() => answer(i)}
                        >
                          <Buddy
                            mood={current.moods[i]}
                            color={colors[i]}
                            kind={i === 1 ? "bunny" : "blob"}
                          />
                          <span>{option}</span>
                          {selected === i && (
                            <span className="answer-mark">
                              {correct ? <Icon name="check" /> : "Let’s think"}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    {selected !== null && (
                      <div
                        className={`feedback ${correct ? "success" : "gentle"}`}
                        role="status"
                      >
                        <strong>
                          {correct
                            ? "Lovely thinking, little explorer!"
                            : "Let’s look a little closer."}
                        </strong>
                        <p>
                          {correct
                            ? current.why
                            : "That’s a thoughtful try. " + current.why}
                        </p>
                        <button
                          className="primary"
                          onClick={() => (correct ? next() : setSelected(null))}
                        >
                          {correct
                            ? question === count - 1
                              ? "See my discoveries"
                              : "Next Question"
                            : "Try Again"}
                          <Icon name="arrow" />
                        </button>
                      </div>
                    )}
                    <p className="safety-note">
                      Faces give us clues, but asking kindly helps us
                      understand.
                    </p>
                  </div>
                )}
                {screen === "cloud" && (
                  <div className="breathing-game">
                    <p>
                      Follow the cloud. Let your breath be gentle, never forced.
                    </p>
                    <div
                      className={`breathing-cloud ${
                        breathing ? "breathing" : ""
                      }`}
                      style={{
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    >
                      <Scene type="cloud" />
                    </div>
                    <h2 aria-live="polite">
                      {seconds >= 24
                        ? "A lovely little moment of calm."
                        : breathing
                          ? seconds % 8 < 4
                            ? "Breathe in gently…"
                            : "Breathe out slowly…"
                          : "Let’s float for gentle breaths."}
                    </h2>
                    <p>
                      {seconds >= 24
                        ? "Notice how your body feels. Every feeling is still welcome."
                        : `${Math.min(Math.floor(seconds / 8) + 1, 3)} of 3 breaths · You can finish whenever you feel ready.`}
                    </p>
                    <div className="choice-row breathing-controls">
                      <button
                        className="primary"
                        onClick={() => setBreathing(!breathing)}
                      >
                        {breathing
                          ? "Pause breathing"
                          : seconds
                            ? "Keep breathing"
                            : "Start breathing"}
                        <Icon name="heart" />
                      </button>
                      <button
                        className="secondary"
                        onClick={finish}
                        aria-label="Finish breathing and collect sticker"
                      >
                        <Icon name="star" /> I'm ready to finish · Collect sticker
                      </button>
                    </div>
                    <NarrationButton
                      text="Follow the cloud gently. Breathe in as the cloud grows, and breathe out as it softens. You can stop whenever your body feels ready."
                      id="cloud-breathe-guide"
                      label="breathing guidance"
                      className="mt-4"
                    />
                  </div>
                )}
              </>
            )}
          </section>
        )}
        {screen === "results" && (
          <section className={`results-panel ${activity.color}`}>
            <div className="result-stars">
              {[0, 1, 2].map((i) => (
                <Icon name="star" size={45} key={i} />
              ))}
            </div>
            <div className="reward-buddy">
              <Buddy color={colors[avatar]} />
            </div>
            <span className="eyebrow">LOOK AT YOU GROW!</span>
            <h1>
              A little adventure.
              <br />A lovely discovery.
            </h1>
            <p>
              {active === "quiz" || active === "garden"
                ? `You made ${score} feeling discoveries. `
                : "You listened to your body. "}
              Every step is something to celebrate.
            </p>
            <div className="reward-label">
              <Icon name="book" />
              <span>
                <strong>{activity.reward}</strong> sticker unlocked · 3 stars
              </span>
            </div>
            <div className="choice-row">
              <button className="primary" onClick={() => setScreen("map")}>
                Continue <Icon name="arrow" />
              </button>
              <button className="secondary" onClick={() => enter(active)}>
                Replay
              </button>
              <button
                className="secondary"
                onClick={() => setScreen("stickers")}
              >
                My Sticker Book
              </button>
            </div>
            <p className="safety-note">
              Replays are for fun. Your sticker and stars stay safe!
            </p>
          </section>
        )}
        {screen === "stickers" && (
          <section className="sticker-page">
            <span className="eyebrow">LITTLE MOMENTS, LOVELY MEMORIES</span>
            <h1>My Sticker Book</h1>
            <p>
              Not prizes for being perfect. Little reminders that you tried.
            </p>
            <RewardCollection meadow={meadow} shop={() => setScreen("shop")} />
            <h2 className="original-stickers-heading">
              Your original meadow activity friends
            </h2>
            <div className="sticker-grid">
              {activities.map((a, i) => (
                <div
                  className={`sticker-slot ${a.color} ${
                    completed.includes(a.id) ? "unlocked" : "locked"
                  }`}
                  key={a.id}
                >
                  <div className="sticker-image">
                    {completed.includes(a.id) ? (
                      <Buddy
                        color={colors[i % 3]}
                        mood={i === 2 ? "calm" : "happy"}
                      />
                    ) : (
                      <Icon name="flower" size={70} />
                    )}
                  </div>
                  <h3>{a.reward}</h3>
                  <p>
                    {completed.includes(a.id)
                      ? "A little discovery, made by you."
                      : `Explore ${a.title} to find this friend.`}
                  </p>
                  <button className="secondary" onClick={() => enter(a.id)}>
                    {completed.includes(a.id) ? "Play again" : "Let’s explore"}{" "}
                    <Icon name="arrow" size={17} />
                  </button>
                </div>
              ))}
            </div>
            <button className="primary" onClick={() => setScreen("map")}>
              Back to the meadow <Icon name="home" />
            </button>
            <p className="safety-note">
              All your stickers, stars, Meadow Tokens, and treasures are saved
              safely on this device. You can return and continue anytime!
            </p>
          </section>
        )}
        <footer>
          <span>
            <Icon name="flower" size={18} /> A little play. A little learning. A
            whole lot of you.
          </span>
          <div className="footer-links">
            <button onClick={() => setHelp(true)}>
              A note for grown-ups <Icon name="heart" size={16} />
            </button>
            <button
              onClick={() => setConfirmReset(true)}
              className="footer-reset-btn"
              aria-label="Reset all meadow progress"
            >
              <Icon name="refresh" size={15} /> Reset meadow
            </button>
          </div>
        </footer>
      </main>
      {welcome && (
        <div className="modal-backdrop">
          <section
            className="welcome-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
          >
            <button
              className="close-button"
              aria-label="Close welcome"
              onClick={() => setWelcome(false)}
            >
              ×
            </button>
            <div className="welcome-buddy">
              <Buddy color={colors[avatar]} />
            </div>
            <span className="eyebrow">YOUR ADVENTURE STARTS HERE</span>
            <h2 id="welcome-title">Hello, little explorer!</h2>
            <p>Pick a meadow friend to come along.</p>
            <div className="avatar-row">
              {colors.map((color, i) => (
                <button
                  key={color}
                  aria-label={`Choose ${["sunshine", "lavender", "leaf"][i]} friend`}
                  aria-pressed={avatar === i}
                  className={avatar === i ? "selected-avatar" : ""}
                  onClick={() => setAvatar(i)}
                >
                  <Buddy color={color} />
                </button>
              ))}
            </div>
            <label htmlFor="player-name">
              What shall we call you? <span>(optional)</span>
            </label>
            <input
              autoFocus
              id="player-name"
              maxLength={20}
              placeholder="Your first name or a made-up name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setStarted(true)
                  setWelcome(false)
                }
              }}
            />
            <button
              className="primary"
              onClick={() => {
                meadow.saveProfile(name, avatar)
                setStarted(true)
                setWelcome(false)
              }}
            >
              Let’s explore the meadow <Icon name="arrow" />
            </button>
            <p className="safety-note">
              No name needed. Just bring your curiosity.
            </p>
          </section>
        </div>
      )}
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
            <h2 id="reset-title">Start a fresh adventure?</h2>
            <p>
              This will clear your saved tokens, stars, and stickers on this
              browser so you can explore the meadow from the very beginning.
            </p>
            <div className="choice-row">
              <button
                className="secondary"
                onClick={() => setConfirmReset(false)}
              >
                Keep my progress
              </button>
              <button
                className="primary danger-btn"
                onClick={() => {
                  meadow.resetProgress()
                  setConfirmReset(false)
                  setScreen("map")
                }}
              >
                Yes, start fresh
              </button>
            </div>
          </section>
        </div>
      )}
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
            <h2 id="help-title">Room for every feeling.</h2>
            <p>
              This meadow helps children notice emotions and try gentle ways to
              care for themselves. Feelings aren’t right or wrong. Quiz answers
              explore clues and caring choices, not a child’s own feelings.
            </p>
            <p>
              Children can skip, rest, or move in a way that works for their
              body. Breathing should feel comfortable; stop if it doesn’t. A
              trusted adult is always a good person to turn to.
            </p>
            <p>
              No personal stories needed. Optional names stay only in this play
              session. Meadow Tokens, emotion adventure progress, rewards, and
              the latest optional feelings check-in are saved in this browser on
              this device. Nothing is sent to a server.
            </p>
            <button className="primary" onClick={() => setHelp(false)}>
              Back to the adventure <Icon name="arrow" />
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
