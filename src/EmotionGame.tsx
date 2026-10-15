import { useEffect, useRef, useState } from "react"
import { Buddy, Icon, NarrationButton } from "./MeadowArt"
import {
  adventures,
  emotionChoices,
  freshRun,
  shopItems,
  skillReady,
} from "./meadowState"
import type { AdventureId, Meadow } from "./meadowState"
import "./emotion-game.css"

type CommonProps = {
  meadow: Meadow
  home: () => void
}

function LocationArt({ id }: { id: AdventureId }) {
  return (
    <svg className="location-art" viewBox="0 0 400 190" aria-hidden="true">
      <g fill="white" opacity=".75">
        <path d="M24 48q-1-15 15-13 3-23 26-13 18-5 20 15 17-3 18 13Z" />
        <path d="M289 49q0-14 16-15 7-25 28-12 18-1 20 18 18 0 19 11Z" />
      </g>
      <circle cx="329" cy="40" r="21" fill="#f4d789" />
      <path d="M0 146Q80 92 175 143T400 139V190H0" fill="#c5dba9" />
      <path d="M0 173Q104 134 223 164T400 153V190H0" fill="#aaca91" />
      {id === "anger" && (
        <>
          <path d="m88 157 66-111 48 5 75 106Z" fill="#c7a69a" />
          <path
            d="m137 73 17-27 48 5 25 40-34-12-18 11-15-16Z"
            fill="#f0b19b"
          />
          <ellipse cx="178" cy="48" rx="25" ry="7" fill="#b58c7d" />
          <path
            d="M174 30q-10-9 2-17m17 18q12-13 1-23"
            fill="none"
            stroke="#ecd1c3"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect x="282" y="145" width="40" height="19" rx="5" fill="#d58e7a" />
          <circle cx="290" cy="165" r="5" fill="#777c63" />
          <circle cx="316" cy="165" r="5" fill="#777c63" />
        </>
      )}
      {id === "stress" && (
        <>
          <path d="m55 153 85-119 87 119Z" fill="#a9b99e" />
          <path d="m161 153 85-133 100 133Z" fill="#bec6b0" />
          <path d="m222 58 24-38 30 40-23-9-14 9Z" fill="#fbf9ec" />
          <path
            d="M225 168q-77-15-38-40t21-36"
            fill="none"
            stroke="#f5e8c6"
            strokeWidth="14"
          />
        </>
      )}
      {id === "sadness" && (
        <>
          <path
            d="M185 126q-75 25 9 38t-38 35"
            fill="none"
            stroke="#9ac4d8"
            strokeWidth="48"
          />
          <path
            d="m137 151 24 2m39 15 26 3"
            fill="none"
            stroke="#e5f3f4"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M74 147V95" stroke="#9b9f75" strokeWidth="6" />
          <path d="M73 73q-45 22-13 44 21 19 42-2 22-35-29-42" fill="#a4bf91" />
        </>
      )}
      {id === "anxiety" && (
        <>
          <path
            d="M106 127q-20-33 17-40 2-39 39-34 17-26 45-6 38-16 48 22 40 1 36 32 25 12 10 28Z"
            fill="#fffafc"
          />
          <path
            d="M155 86V53l18-14 18 14v33m22 0V39l17-15 18 15v47"
            fill="#d8c6e8"
          />
          <path
            d="m137 157 4-13 5 13 13 1-11 7 3 12-10-7-10 7 3-12-11-7Z"
            fill="#f4d78b"
          />
        </>
      )}
      {id === "happiness" && (
        <>
          {[100, 167, 250, 309].map((x, i) => (
            <g key={x} transform={`translate(${x} ${133 + (i % 2) * 20})`}>
              <path
                d="M0 0v30m0-6q-25-12-17-16 17 0 17 16"
                fill="#85aa72"
                stroke="#85aa72"
                strokeWidth="3"
              />
              {[0, 60, 120].map((r) => (
                <ellipse
                  key={r}
                  rx="9"
                  ry="22"
                  fill={i % 2 ? "#f4d782" : "#eebba9"}
                  transform={`rotate(${r})`}
                />
              ))}
              <circle r="9" fill="#b39a63" />
            </g>
          ))}
        </>
      )}
    </svg>
  )
}

function RewardArt({ art }: { art: string }) {
  return (
    <svg viewBox="0 0 150 130" className="reward-art" aria-hidden="true">
      {art === "flower" && (
        <>
          <path
            d="M76 72v47m0-22q-34-12-27-23 25 3 27 23m0 11q29-9 23-24-22 1-23 24"
            fill="#9eb87b"
            stroke="#8ca56e"
            strokeWidth="3"
          />
          {[0, 60, 120].map((r) => (
            <ellipse
              key={r}
              cx="75"
              cy="49"
              rx="16"
              ry="36"
              fill="#f1d17b"
              transform={`rotate(${r} 75 49)`}
            />
          ))}
          <circle cx="75" cy="49" r="17" fill="#b5a070" />
          <path
            d="M68 51q7 8 14 0"
            fill="none"
            stroke="#5e6650"
            strokeWidth="2"
          />
        </>
      )}
      {art === "crown" && (
        <>
          <path
            d="m34 61 13 35h61l11-35-28 15-16-26-15 27Z"
            fill="#b4cb8f"
            stroke="#8fa76c"
            strokeWidth="3"
          />
          {[40, 75, 111].map((x) => (
            <path
              key={x}
              d={`M${x} 62q-18-22 0-32 19 12 0 32`}
              fill="#9fb97b"
            />
          ))}
          <path d="M50 95h53" stroke="#e7c570" strokeWidth="6" />
        </>
      )}
      {art === "rainbow" && (
        <>
          {["#e9b5a8", "#f0d58e", "#aec5a0", "#b4c8db", "#c8b6d8"].map(
            (c, i) => (
              <path
                key={c}
                d={`M${28 + i * 9} 100a${47 - i * 9} ${47 - i * 9} 0 0 1 ${94 - i * 18} 0`}
                fill="none"
                stroke={c}
                strokeWidth="9"
              />
            ),
          )}
          <ellipse cx="31" cy="104" rx="26" ry="12" fill="#fffdf7" />
          <ellipse cx="119" cy="104" rx="26" ry="12" fill="#fffdf7" />
        </>
      )}
      {art === "cape" && (
        <>
          <path
            d="m53 35-25 78q47 20 96-2L98 35 76 49Z"
            fill="#baa5cf"
            stroke="#9c84b5"
            strokeWidth="3"
          />
          <path
            d="m72 68 5-10 5 10 12 1-9 8 2 12-10-6-10 6 2-12-9-8Z"
            fill="#f5dda0"
          />
          <path
            d="M55 35q21 20 43 0"
            fill="none"
            stroke="#e9d5ef"
            strokeWidth="9"
          />
        </>
      )}
    </svg>
  )
}

export function EmotionMap({
  meadow,
  play,
  shop,
  calm,
}: {
  meadow: Meadow
  play: (id: AdventureId) => void
  shop: () => void
  calm: () => void
}) {
  const { state } = meadow
  return (
    <section className="emotion-map">
      <div className="section-heading">
        <div>
          <div className="eyebrow small">
            FIVE PLACES. EVERY FEELING WELCOME.
          </div>
          <h2>Your feelings adventure</h2>
          <p>Meet a friend. Learn a little. Grow at your own pace.</p>
        </div>
        <span className="map-count">{state.completed.length} / 5 explored</span>
      </div>
      <div
        className="map-progress"
        role="progressbar"
        aria-label="Emotion adventures completed"
        aria-valuenow={state.completed.length}
        aria-valuemin={0}
        aria-valuemax={5}
      >
        {adventures.map((a) => (
          <span
            key={a.id}
            className={state.completed.includes(a.id) ? "done" : ""}
          />
        ))}
      </div>
      <div className="emotion-locations">
        {adventures.map((a, i) => {
          const done = state.completed.includes(a.id)
          const inProgress =
            state.runs[a.id]?.phase && state.runs[a.id]?.phase !== "finish"
          const isRecommended = i === 0 && !state.completed.length
          return (
            <button
              key={a.id}
              className={`location-card ${a.color} ${done ? "location-done" : ""}`}
              onClick={() => play(a.id)}
              aria-label={`${a.title}: Meet ${a.mascot}. ${
                done
                  ? "Explored, click to replay"
                  : inProgress
                    ? "In progress, click to continue"
                    : isRecommended
                      ? "Recommended starting place, click to explore"
                      : "Ready to explore, click to play"
              }`}
            >
              <div className="location-picture">
                <LocationArt id={a.id} />
                <span className="location-index">
                  {done ? <Icon name="check" size={16} /> : `0${i + 1}`}
                </span>
                <div className="location-mascot">
                  <Buddy color={a.tint} mood={a.mood} />
                </div>
              </div>
              <div className="location-info">
                <span className="card-tag">{a.short}</span>
                <h3>{a.title}</h3>
                <p>Meet {a.mascot}</p>
                <span className="location-status">
                  {done
                    ? "Explored · Replay"
                    : inProgress
                      ? "In progress · Continue"
                      : isRecommended
                        ? "Recommended first · Let’s play"
                        : "Ready to explore · Let’s play"}
                  <Icon name="arrow" size={17} />
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="meadow-shortcuts">
        <button onClick={shop}>
          <span className="shortcut-icon">
            <Icon name="star" />
          </span>
          <span>
            <strong>The Little Reward Shop</strong>
            <small>Virtual treasures. Just for fun.</small>
          </span>
          <Icon name="arrow" size={19} />
        </button>
        <button onClick={calm}>
          <span className="shortcut-icon lavender">
            <Icon name="heart" />
          </span>
          <span>
            <strong>A Quiet Little Corner</strong>
            <small>Breathe, notice, or take a break.</small>
          </span>
          <Icon name="arrow" size={19} />
        </button>
      </div>
    </section>
  )
}

export function FeelingsCheckIn({ meadow }: { meadow: Meadow }) {
  const today = new Date().toLocaleDateString("en-CA")
  const chosen =
    meadow.state.checkIn?.day === today ? meadow.state.checkIn.feeling : null
  const options = [
    { label: "Happy", mood: "happy", tint: "#f7cd64" },
    { label: "Sad", mood: "sad", tint: "#afccdd" },
    { label: "Angry", mood: "angry", tint: "#edb29b" },
    { label: "Worried", mood: "worried", tint: "#c7b9df" },
    { label: "Not sure", mood: "calm", tint: "#b6c99b" },
  ]
  return (
    <section className="check-in">
      <div className="check-in-header">
        <div>
          <span className="eyebrow small">A LITTLE HELLO TO YOURSELF</span>
          <h2>How are you feeling today?</h2>
          <p>Any feeling is okay. You can skip or change your choice.</p>
        </div>
        <NarrationButton
          text="How are you feeling today? Any feeling is okay. You can choose happy, sad, angry, worried, or not sure."
          id="check-in-prompt"
          label="check-in guidance"
        />
      </div>
      <div className="check-in-options">
        {options.map((o) => (
          <button
            key={o.label}
            aria-pressed={chosen === o.label}
            onClick={() => meadow.checkIn(o.label)}
          >
            <Buddy mood={o.mood} color={o.tint} />
            <span>{o.label}</span>
          </button>
        ))}
      </div>
      {chosen && (
        <p className="check-in-message" role="status">
          Thank you for noticing.{" "}
          {chosen === "Not sure"
            ? "You don’t need a name for every feeling."
            : `It’s okay to feel ${chosen.toLowerCase()}.`}{" "}
          You can talk to a trusted adult if you’d like support.
        </p>
      )}
    </section>
  )
}

export default function EmotionGame({
  meadow,
  home,
  shop,
  play,
}: CommonProps & {
  shop: () => void
  play: (id: AdventureId, replay?: boolean) => void
}) {
  const id = meadow.state.current
  const a = adventures.find((a) => a.id === id)!
  const run = meadow.state.runs[id] || freshRun()
  const [paused, setPaused] = useState(false)
  const [breathing, setBreathing] = useState(false)
  const focus = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    focus.current?.focus()
    setBreathing(false)
    setPaused(false)
  }, [id, run.phase])
  useEffect(() => {
    if (!breathing || paused || run.seconds >= 24 || run.phase !== "practice")
      return
    const timer = window.setInterval(() => meadow.tick(id), 1000)
    return () => window.clearInterval(timer)
  }, [breathing, paused, run.seconds, id, run.phase])
  const choices = emotionChoices(id)
  const chosen = run.emotion === null ? null : choices[run.emotion]
  const right = chosen?.label === a.feeling
  const goodAction = run.action === a.helpful
  const earned = (kind: string) => meadow.state.ledger.includes(`${id}:${kind}`)
  const advance = (phase: Parameters<Meadow["phase"]>[1]) =>
    meadow.phase(id, phase)
  const tap = (value: string) => meadow.tap(id, value)
  const has = (value: string) => run.taps.includes(value)
  const stepNames = [
    "Meet",
    "Notice",
    "Understand",
    "Choose",
    "Practise",
    "Celebrate",
  ]
  const phaseIndex = [
    "story",
    "identify",
    "understand",
    "action",
    "practice",
    "finish",
  ].indexOf(run.phase)
  const nextAdventure = adventures[adventures.findIndex((v) => v.id === id) + 1]
  function skillButton(key: string, text: string, disabled = false) {
    return (
      <button
        className={`skill-choice ${has(key) ? "skill-done" : ""}`}
        disabled={disabled || has(key)}
        onClick={() => tap(key)}
      >
        {has(key) ? <Icon name="check" /> : <Icon name="flower" />}
        <span>{text}</span>
      </button>
    )
  }
  return (
    <section className={`emotion-game play-area ${a.color}`}>
      <div className="play-top">
        <button className="text-button" onClick={home}>
          <Icon name="home" size={18} /> Back to meadow
        </button>
        <span>WITH {a.mascot.toUpperCase()} · 2–4 MINUTES</span>
        <button className="text-button" onClick={() => setPaused(!paused)}>
          {paused ? "Keep playing" : "Take a break"}
        </button>
      </div>
      <div className="emotion-game-inner">
        <div
          className="adventure-steps"
          aria-label={`Step ${phaseIndex + 1} of 6: ${stepNames[phaseIndex]}`}
        >
          {stepNames.map((name, i) => (
            <span key={name} className={i <= phaseIndex ? "reached" : ""}>
              <b>{i < phaseIndex ? <Icon name="check" size={13} /> : i + 1}</b>
              <small>{name}</small>
            </span>
          ))}
        </div>
        <h1 ref={focus} tabIndex={-1}>
          {a.title}
        </h1>
        {paused ? (
          <div className="pause-panel">
            <Buddy color={a.tint} mood="calm" />
            <h2>There’s room for a pause.</h2>
            <p>
              You can rest, get some water, or find a trusted adult. Your
              progress is saved on this device.
            </p>
            <button className="primary" onClick={() => setPaused(false)}>
              I’m ready to play <Icon name="arrow" />
            </button>
            <button className="secondary" onClick={home}>
              Home for now
            </button>
          </div>
        ) : (
          <>
            {run.phase === "story" && (
              <>
                <div className="story-landscape">
                  <LocationArt id={id} />
                  <div className="story-mascot">
                    <Buddy mood={a.mood} color={a.tint} />
                  </div>
                  <span className="story-name">Hello, I’m {a.mascot}!</span>
                </div>
                <span className="eyebrow">LET’S MEET A MEADOW FRIEND</span>
                <div className="story-heading-row">
                  <h2>A little moment in {a.mascot}’s day</h2>
                  <NarrationButton
                    text={`${a.mascot}’s story: ${a.story}`}
                    id={`story-${id}`}
                    label={`${a.mascot}’s story`}
                  />
                </div>
                <p className="story-text">{a.story}</p>
                <button className="primary" onClick={() => advance("identify")}>
                  How might {a.mascot} feel? <Icon name="arrow" />
                </button>
              </>
            )}
            {run.phase === "identify" && (
              <>
                <div className="small-mascot">
                  <Buddy color={a.tint} mood={a.mood} />
                </div>
                <h2>How do you think {a.mascot} feels?</h2>
                <p className="story-text">{a.story}</p>
                <div className="emotion-answer-grid">
                  {choices.map((c, i) => (
                    <button
                      key={c.label}
                      className={`answer-card ${
                        run.emotion === i ? (right ? "right" : "retry") : ""
                      }`}
                      disabled={run.emotion !== null}
                      onClick={() => meadow.emotion(id, i)}
                    >
                      <Buddy color={c.tint} mood={c.mood} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
                {chosen && (
                  <div
                    className={`feedback ${right ? "success" : "gentle"}`}
                    role="status"
                  >
                    <strong>
                      {right
                        ? `Yes, ${a.mascot} tells us “I feel ${a.feeling.toLowerCase()}.”`
                        : "A thoughtful guess. Let’s look at the clues."}
                    </strong>
                    <p>
                      {right
                        ? a.validation
                        : `${a.clues} Another person might feel differently. Let’s find the word ${a.mascot} uses.`}
                    </p>
                    {right && (
                      <span className="token-notice">
                        5 identification tokens ·{" "}
                        {meadow.state.completed.includes(id) ? "already saved · replaying for fun" : "saved to your meadow"}
                      </span>
                    )}
                    <button
                      className="primary"
                      onClick={() =>
                        right ? advance("understand") : meadow.resetEmotion(id)
                      }
                    >
                      {right ? "Notice the body clues" : "Try Again"}{" "}
                      <Icon name="arrow" />
                    </button>
                  </div>
                )}
              </>
            )}
            {run.phase === "understand" && (
              <>
                <div className="small-mascot">
                  <Buddy color={a.tint} mood={a.mood} />
                </div>
                <span className="eyebrow">A FEELING HAS A STORY</span>
                <h2>What might the body be saying?</h2>
                <p className="story-text">{a.clues}</p>
                <div className="validation-card">
                  <Icon name="heart" />
                  <p>
                    {a.validation} Faces and bodies give clues, but asking
                    kindly helps us know.
                  </p>
                </div>
                <button className="primary" onClick={() => advance("action")}>
                  Help {a.mascot} choose <Icon name="arrow" />
                </button>
              </>
            )}
            {run.phase === "action" && (
              <>
                <div className="small-mascot">
                  <Buddy color={a.tint} mood={a.mood} />
                </div>
                <h2>What could {a.mascot} try?</h2>
                <p className="story-text">
                  Choose a safe, caring response. The feeling itself is never
                  wrong.
                </p>
                <div className="action-options">
                  {a.actions.map((text, i) => (
                    <button
                      className={`skill-choice ${
                        run.action === i ? "action-selected" : ""
                      }`}
                      disabled={run.action !== null}
                      onClick={() => meadow.action(id, i)}
                      key={text}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{text}</span>
                    </button>
                  ))}
                </div>
                {run.action !== null && (
                  <div
                    className={`feedback ${goodAction ? "success" : "gentle"}`}
                    role="status"
                  >
                    <strong>
                      {goodAction
                        ? "That’s a caring choice."
                        : "Let’s try a safer way."}
                    </strong>
                    <p>
                      {goodAction
                        ? a.explanation
                        : `That choice could make things harder. ${a.validation} What if we paused, used words, or asked for support?`}
                    </p>
                    <button
                      className="primary"
                      onClick={() =>
                        goodAction
                          ? advance("practice")
                          : meadow.action(id, null)
                      }
                    >
                      {goodAction ? "Let’s practise together" : "Try Again"}
                      <Icon name="arrow" />
                    </button>
                  </div>
                )}
              </>
            )}
            {run.phase === "practice" && (
              <>
                <span className="eyebrow">
                  A LITTLE PRACTICE, NOT PERFECTION
                </span>
                <h2>{a.skill}</h2>
                <p className="story-text">{a.practice}</p>
                {id === "anger" && (
                  <>
                    <div
                      className={`breathing-flower ${
                        breathing && !paused && run.seconds < 24
                          ? "flower-growing"
                          : ""
                      }`}
                    >
                      <RewardArt art="flower" />
                    </div>
                    <h3 className="breath-prompt" aria-live="polite">
                      {run.seconds >= 24
                        ? "Three gentle breaths. Lovely."
                        : breathing
                          ? run.seconds % 8 < 4
                            ? "Breathe in gently…"
                            : "Breathe out slowly…"
                          : "Let the flower guide you."}
                    </h3>
                    <p className="practice-caption">
                      {Math.floor(run.seconds / 8)} of 3 breaths. Keep breathing
                      comfortably. Stop if it doesn’t feel right.
                    </p>
                    {run.seconds < 24 && !has("alternative") && !has("breathe_ready") && (
                      <div className="choice-row">
                        <button
                          className="secondary"
                          onClick={() => setBreathing(!breathing)}
                        >
                          {breathing ? "Pause breaths" : "Start gentle breaths"}
                        </button>
                        <button
                          className="secondary"
                          onClick={() => {
                            tap("breathe_ready")
                            setBreathing(false)
                          }}
                        >
                          <Icon name="check" size={17} /> I feel calmer now · I'm ready
                        </button>
                        <button
                          className="secondary"
                          onClick={() => {
                            tap("alternative")
                            setBreathing(false)
                          }}
                        >
                          Breathing isn’t for me · soften my hands instead
                        </button>
                      </div>
                    )}
                    {(has("breathe_ready") || run.seconds >= 8) && !has("alternative") && (
                      <p role="status" className="practice-caption ready-caption">
                        <Icon name="check" size={16} /> Lovely pause! You listened to your body. Tap the practice phrases below to finish.
                      </p>
                    )}
                    {has("alternative") && (
                      <p role="status" className="practice-caption">
                        Let your hands soften if that feels comfortable. Rest
                        them in your lap. Different tools help different people.
                      </p>
                    )}
                    <div className="skill-list">
                      {skillButton(
                        "words",
                        "Practise: “I feel angry. I’m using that. Please give it back.”",
                      )}
                      {skillButton(
                        "support",
                        "If I still need help, I can ask a trusted adult.",
                      )}
                    </div>
                  </>
                )}
                {id === "stress" && (
                  <>
                    <div className="practice-illustration">
                      <LocationArt id={id} />
                    </div>
                    <div className="skill-list">
                      {skillButton(
                        "one",
                        "1. Choose one small step: put one book in the bag.",
                      )}
                      {skillButton(
                        "rest",
                        "2. Rest my shoulders and take a short break.",
                        !has("one"),
                      )}
                      {skillButton(
                        "ask",
                        "3. Ask a trusted adult to plan the next small step.",
                        !has("rest"),
                      )}
                    </div>
                    <p className="practice-caption">
                      One step, a pause, then support. You don’t need to climb
                      the whole mountain at once.
                    </p>
                  </>
                )}
                {id === "sadness" && (
                  <div className="comfort-practice">
                    <div className="small-mascot">
                      <Buddy color={a.tint} mood="sad" />
                    </div>
                    <div className="skill-list">
                      {skillButton(
                        "name",
                        "Give the feeling words: “I feel sad and left out.”",
                      )}
                      {skillButton(
                        "trusted",
                        "Ask a trusted adult: “Can we talk for a little while?”",
                        !has("name"),
                      )}
                    </div>
                    {has("trusted") && (
                      <>
                        <h3>Choose a little comfort for Ripple.</h3>
                        <div className="choice-row">
                          {[
                            "Draw a picture",
                            "Read with someone",
                            "Sit somewhere cosy",
                          ].map((text) => (
                            <button
                              key={text}
                              className="secondary"
                              disabled={has("comfort")}
                              onClick={() => tap("comfort")}
                            >
                              {text}
                            </button>
                          ))}
                        </div>
                        {has("comfort") && (
                          <p role="status">
                            A kind choice. Sadness might stay for a while, and
                            that’s okay.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
                {id === "anxiety" && (
                  <>
                    <div
                      className="grounding-board"
                      aria-label="Find five things in the cloud kingdom"
                    >
                      {[
                        { id: "flower", name: "A flower", icon: "flower" },
                        { id: "cloud", name: "A soft cloud", icon: "cloud" },
                        { id: "tree", name: "A leafy tree", icon: "tree" },
                        { id: "star", name: "A little star", icon: "star" },
                        { id: "hill", name: "A green hill", icon: "hill" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          aria-pressed={has(item.id)}
                          onClick={() => tap(item.id)}
                        >
                          <GroundingIcon kind={item.icon} />
                          <span>{item.name}</span>
                          {has(item.id) && <Icon name="check" size={18} />}
                        </button>
                      ))}
                    </div>
                    <p className="practice-caption">
                      {
                        ["flower", "cloud", "tree", "star", "hill"].filter(has)
                          .length
                      }{" "}
                      of 5 noticed. Look around your own space too, if you like.
                    </p>
                    {["flower", "cloud", "tree", "star", "hill"].every(has) && (
                      <div className="skill-list">
                        {skillButton(
                          "step",
                          "One small step: say one sentence to a trusted adult before class.",
                        )}
                      </div>
                    )}
                  </>
                )}
                {id === "happiness" && (
                  <>
                    <div className="joy-garden">
                      {["win", "share", "kind"].map((key, i) => (
                        <span key={key} className={has(key) ? "joy-bloom" : ""}>
                          <GroundingIcon kind={has(key) ? "flower" : "hill"} />
                          <small>{["Notice", "Share", "Be kind"][i]}</small>
                        </span>
                      ))}
                    </div>
                    <div className="skill-list">
                      {skillButton(
                        "win",
                        "Notice the small win: “A leaf grew! My care helped.”",
                      )}
                      {skillButton(
                        "share",
                        "Share the moment: “Look at my little sunflower!”",
                        !has("win"),
                      )}
                      {skillButton(
                        "kind",
                        "Show kindness: offer a friend a turn with the watering can.",
                        !has("share"),
                      )}
                    </div>
                  </>
                )}
                {skillReady(id, run) && (
                  <div className="feedback success" role="status">
                    <strong>You tried a new tool!</strong>
                    <p>
                      Different strategies work for different people. If a
                      feeling is still big, talk to a trusted adult. You don’t
                      have to handle it alone.
                    </p>
                    <span className="token-notice">10 practice tokens saved. Your effort matters.</span>
                    <button
                      className="primary"
                      onClick={() => meadow.skill(id)}
                    >
                      {earned("complete")
                        ? "Finish replay · rewards already saved"
                        : "Finish adventure · 15 tokens"}{" "}
                      <Icon name="star" />
                    </button>
                    <small className="replay-note">
                      10 saved for practising + 15 for finishing. Already earned
                      rewards won’t be added again.
                    </small>
                  </div>
                )}
              </>
            )}
            {run.phase === "finish" && (
              <>
                <div className="finish-character">
                  <Buddy color={a.tint} mood="happy" />
                </div>
                <span className="eyebrow">A LITTLE ADVENTURE. A NEW TOOL.</span>
                <h2>You grew with {a.mascot}!</h2>
                <div className="recap-grid">
                  <div>
                    <Icon name="flower" />
                    <h3>What did I learn?</h3>
                    <p>
                      {a.skill}. {a.validation}
                    </p>
                  </div>
                  <div>
                    <Icon name="heart" />
                    <h3>What could I try next time?</h3>
                    <p>{a.next}</p>
                  </div>
                </div>
                <div className="token-breakdown">
                  <span>
                    Notice a feeling <b>5</b>
                  </span>
                  <span>
                    Practise a skill <b>10</b>
                  </span>
                  <span>
                    Finish the adventure <b>15</b>
                  </span>
                  <strong>30 Meadow Tokens earned & saved</strong>
                  <small>
                    Only once per adventure. No tokens are ever lost for
                    mistakes.
                  </small>
                </div>
                <div className="kindness-bonus">
                  <Icon name="heart" />
                  <h3>
                    A little extra kindness? <small>Optional · 5 tokens</small>
                  </h3>
                  <p>{a.kindness}</p>
                  <button
                    className="secondary"
                    disabled={earned("kindness")}
                    onClick={() => meadow.kindness(id)}
                  >
                    {earned("kindness")
                      ? "Kindness shared · 5 tokens saved"
                      : "Try this kind action with our friend"}
                  </button>
                </div>
                <div className="choice-row">
                  <button
                    className="primary"
                    onClick={() =>
                      nextAdventure ? play(nextAdventure.id) : home()
                    }
                  >
                    {nextAdventure
                      ? "Continue Adventure"
                      : "Back to the meadow"}
                    <Icon name="arrow" />
                  </button>
                  <button className="secondary" onClick={shop}>
                    Visit reward shop
                  </button>
                  <button className="secondary" onClick={() => play(id, true)}>
                    Replay · just for fun
                  </button>
                </div>
                <p className="practice-caption">
                  {nextAdventure
                    ? `${nextAdventure.title} is now open!`
                    : "You explored all five places. Every feeling still belongs."}{" "}
                  Your {a.sticker} sticker is in your book.
                </p>
              </>
            )}
            <p className="safety-note">
              All feelings belong. You can pause, use words, or ask a trusted
              adult for help.
            </p>
          </>
        )}
      </div>
    </section>
  )
}

function GroundingIcon({ kind }: { kind: string }) {
  if (kind === "flower" || kind === "star")
    return <Icon name={kind} size={42} />
  return (
    <svg
      viewBox="0 0 64 64"
      width="42"
      height="42"
      fill="none"
      aria-hidden="true"
    >
      {kind === "cloud" ? (
        <path
          d="M11 45q-11-18 7-22 2-20 21-13 16-2 17 17 17 7 3 19Z"
          fill="#fcfcff"
          stroke="#a6bbcf"
          strokeWidth="2"
        />
      ) : kind === "tree" ? (
        <>
          <path d="M32 32v27" stroke="#9b9f75" strokeWidth="5" />
          <path
            d="M32 5q-28 0-23 26 2 21 24 14 26 6 24-17Q55 4 32 5"
            fill="#a9c593"
          />
        </>
      ) : (
        <>
          <circle cx="47" cy="16" r="9" fill="#efd58b" />
          <path d="M3 53 25 16l17 27 8-12 13 22Z" fill="#b1c99a" />
        </>
      )}
    </svg>
  )
}

export function RewardShop({
  meadow,
  home,
  book,
}: CommonProps & { book: () => void }) {
  const [message, setMessage] = useState("")
  return (
    <section className="reward-shop sticker-page">
      <span className="eyebrow">SMALL TREASURES. NO REAL MONEY.</span>
      <h1>The Little Reward Shop</h1>
      <p>
        Everything is virtual and optional. Your adventures never cost tokens.
      </p>
      <div className="shop-balance">
        <Icon name="star" />
        <strong>{meadow.state.tokens} Meadow Tokens</strong>
        <span>to spend or save</span>
      </div>
      <div className="shop-grid">
        {shopItems.map((item) => {
          const owned = meadow.state.owned.includes(item.id)
          const equipped = meadow.state.equipped.includes(item.id)
          const afford = meadow.state.tokens >= item.price
          return (
            <article
              key={item.id}
              className={`shop-item ${item.color} ${owned ? "purchased" : ""}`}
            >
              <div className="shop-art">
                <RewardArt art={item.art} />
                {owned && (
                  <span>
                    <Icon name="check" size={15} /> Yours!
                  </span>
                )}
              </div>
              <span className="card-tag">{item.category}</span>
              <h2>{item.title}</h2>
              <p>{item.price} Meadow Tokens</p>
              <button
                className={owned ? "secondary" : "primary"}
                disabled={!owned && !afford}
                onClick={() => {
                  if (owned) {
                    meadow.equip(item.id)
                    setMessage(
                      equipped
                        ? `${item.title} tucked safely into your book.`
                        : `${item.title} is now on display!`,
                    )
                  } else {
                    meadow.buy(item.id)
                    setMessage(
                      `${item.title} is yours! It’s in your book and on display.`,
                    )
                  }
                }}
              >
                {owned
                  ? equipped
                    ? "Tuck into my book"
                    : "Display in my meadow"
                  : afford
                    ? `Get for ${item.price} tokens`
                    : `Save ${item.price - meadow.state.tokens} more tokens`}
              </button>
            </article>
          )
        })}
      </div>
      <p role="status" className="shop-message">
        {message || "Take your time. There’s no rush to collect anything."}
      </p>
      <div className="choice-row">
        <button className="primary" onClick={book}>
          See my collection <Icon name="book" />
        </button>
        <button className="secondary" onClick={home}>
          Back to meadow
        </button>
      </div>
    </section>
  )
}

export function RewardCollection({
  meadow,
  shop,
}: {
  meadow: Meadow
  shop: () => void
}) {
  return (
    <section className="saved-collection">
      <h2>My emotion adventure friends</h2>
      <p>Little reminders of the skills you’ve practised.</p>
      <div className="collection-friends">
        {adventures.map((a) => (
          <article
            className={`collection-friend ${a.color} ${
              meadow.state.completed.includes(a.id) ? "collected" : ""
            }`}
            key={a.id}
          >
            <div>
              {meadow.state.completed.includes(a.id) ? (
                <Buddy color={a.tint} mood="happy" />
              ) : (
                <Icon name="flower" size={50} />
              )}
            </div>
            <h3>{a.sticker}</h3>
            <p>
              {meadow.state.completed.includes(a.id)
                ? a.skill
                : `Waiting in ${a.title}`}
            </p>
          </article>
        ))}
      </div>
      <h2>My little treasures</h2>
      {meadow.state.owned.length ? (
        <div className="treasure-shelf">
          {shopItems
            .filter((i) => meadow.state.owned.includes(i.id))
            .map((item) => (
              <article className={item.color} key={item.id}>
                <RewardArt art={item.art} />
                <h3>{item.title}</h3>
                <p>{item.category}</p>
                <button
                  className="secondary"
                  onClick={() => meadow.equip(item.id)}
                >
                  {meadow.state.equipped.includes(item.id)
                    ? "On display · tuck away"
                    : "Display in meadow"}
                </button>
              </article>
            ))}
        </div>
      ) : (
        <p>
          Your shop treasures will live here. Collecting is always optional.
        </p>
      )}
      <button className="secondary" onClick={shop}>
        Visit the reward shop <Icon name="arrow" />
      </button>
    </section>
  )
}

export function MeadowDisplay({ meadow }: { meadow: Meadow }) {
  const items = shopItems.filter((item) =>
    meadow.state.equipped.includes(item.id),
  )
  if (!items.length) return null
  return (
    <section className="meadow-display">
      <div>
        <span className="eyebrow small">MADE A LITTLE MORE YOU</span>
        <h3>Your meadow treasures</h3>
      </div>
      <div className="display-friend">
        <Buddy color="#f7cd64" />
        {items.some((i) => i.art === "crown") && (
          <span className="equipped-crown">
            <RewardArt art="crown" />
          </span>
        )}
        {items.some((i) => i.art === "cape") && (
          <span className="equipped-cape">
            <RewardArt art="cape" />
          </span>
        )}
      </div>
      {items
        .filter((i) => i.art !== "crown" && i.art !== "cape")
        .map((item) => (
          <div className="display-item" key={item.id}>
            <RewardArt art={item.art} />
            <small>{item.title}</small>
          </div>
        ))}
    </section>
  )
}

export function CalmCorner({
  home,
  breathe,
}: {
  home: () => void
  breathe: () => void
}) {
  const [noticed, setNoticed] = useState<string[]>([])
  return (
    <section className="calm-corner play-area purple">
      <div className="play-top">
        <button className="text-button" onClick={home}>
          <Icon name="home" /> Back to meadow
        </button>
        <span>NO TOKENS NEEDED. ALWAYS OPEN.</span>
      </div>
      <div className="emotion-game-inner">
        <div className="small-mascot">
          <Buddy color="#c7b9df" mood="calm" />
        </div>
        <span className="eyebrow">A QUIET LITTLE CORNER</span>
        <h1>A moment, just for you.</h1>
        <p className="story-text">
          You don’t need to change your feeling. Try a tool, rest, or ask a
          trusted adult to sit with you.
        </p>
        <div className="calm-narration-row">
          <button className="primary" onClick={breathe}>
            Breathe with the cloud <Icon name="heart" />
          </button>
          <NarrationButton
            text="A moment, just for you. You don’t need to change your feeling. Try a tool, rest, or ask a trusted adult to sit with you. Notice five things around you, and tap a leaf for each one."
            id="calm-corner-voice"
            label="Calm Corner message"
          />
        </div>
        <div className="grounding-practice">
          <h2>Five little things, right here.</h2>
          <p>
            Notice five things around you. Tap a leaf for each one. No need to
            tell us what you see.
          </p>
          <div className="grounding-leaves">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                aria-label={`Notice thing ${i + 1}`}
                aria-pressed={noticed.includes(String(i))}
                onClick={() =>
                  setNoticed((n) =>
                    n.includes(String(i)) ? n : [...n, String(i)],
                  )
                }
              >
                <Icon
                  name={noticed.includes(String(i)) ? "check" : "flower"}
                  size={32}
                />
              </button>
            ))}
          </div>
          <p role="status">
            {noticed.length === 5
              ? "Five things noticed. You’re here, right now. How about one gentle stretch?"
              : `${noticed.length} of 5 noticed. Go at your own pace.`}
          </p>
          <button className="secondary" onClick={() => setNoticed([])}>
            Notice five again
          </button>
        </div>
        <p className="safety-note">
          Different tools help different people. If you still feel upset, find a
          trusted adult. Breathing should be comfortable; stop if it isn’t.
        </p>
      </div>
    </section>
  )
}
