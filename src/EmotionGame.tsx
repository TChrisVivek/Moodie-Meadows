import React, { useEffect, useRef, useState } from "react"
import { Buddy, Icon, NarrationButton, NarrationControls } from "./MeadowArt"
import { LocationArt, RewardArt } from "./AdventureArt"
import {
  adventures,
  freshRun,
  shopItems,
} from "./meadowState"
import type { AdventureId, Meadow } from "./meadowState"
import CoolTheLava from "./MiniGames/CoolTheLava"
import PackCalmKit from "./MiniGames/PackCalmKit"
import HelpAFriend from "./MiniGames/HelpAFriend"
import BravePath from "./MiniGames/BravePath"
import HappinessGarden from "./MiniGames/HappinessGarden"
import MiniGameCelebration from "./MiniGames/MiniGameCelebration"
import "./emotion-game.css"

type CommonProps = {
  meadow: Meadow
  home: () => void
}

const LANDMARK_ACTIONS: Record<
  AdventureId,
  { description: string; buttonText: string }
> = {
  anger: {
    description: "Take slow breaths with Ember and cool the bubbling lava.",
    buttonText: "Play Volcano",
  },
  stress: {
    description: "Pack Moss’s calm kit and hike the scenic trail to the summit.",
    buttonText: "Play Mountain",
  },
  sadness: {
    description: "Hop across caring stepping stones to comfort Ripple.",
    buttonText: "Play River",
  },
  anxiety: {
    description: "Notice friendly creatures and light Nimbus’s brave lantern path.",
    buttonText: "Play Woods",
  },
  happiness: {
    description: "Catch dancing sunbeams and grow Sunny’s blooming garden.",
    buttonText: "Play Garden",
  },
}

/**
 * Illustrated Interactive Adventure Map
 * Shows the 5 emotional learning landmarks along a winding storybook trail.
 */
export function EmotionMap({
  meadow,
  play,
  shop,
  calm,
}: {
  meadow: Meadow
  play: (id: AdventureId, replay?: boolean) => void
  shop: () => void
  calm: () => void
}) {
  const { state } = meadow
  const completedCount = state.completed.length

  // Find the next recommended adventure in order
  const recommended =
    adventures.find((a) => !state.completed.includes(a.id)) || adventures[0]

  return (
    <section className="emotion-map-world" aria-label="Interactive Meadow Adventure Map">
      {/* Adventure Map Header */}
      <div className="map-world-header">
        <div className="map-title-copy">
          <span className="eyebrow small">FIVE MEADOW LANDMARKS</span>
          <h2>The Adventure Trail</h2>
          <p>Follow the winding cobblestone path to explore feelings and collect stars!</p>
        </div>
        <div className="map-stars-badge" aria-label={`${completedCount * 3} of 15 stars earned`}>
          <span className="star-icon">⭐</span>
          <strong>{completedCount * 3} / 15 Stars Collected</strong>
        </div>
      </div>

      {/* Illustrated Winding Trail Container */}
      <div className="world-trail-wrapper">
        {/* SVG Decorative Winding Trail Line for wide view */}
        <svg
          className="trail-connector-svg"
          viewBox="0 0 1100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 110,50 Q 250,15 360,50 T 630,50 T 890,50 T 1000,50"
            fill="none"
            stroke="#f5e9c9"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M 110,50 Q 250,15 360,50 T 630,50 T 890,50 T 1000,50"
            fill="none"
            stroke="#d8c078"
            strokeWidth="6"
            strokeDasharray="10 14"
            strokeLinecap="round"
          />
        </svg>

        {/* 5 Landmark Stations along the Trail */}
        <div className="adventure-map-trail">
          {adventures.map((a, index) => {
            const isDone = state.completed.includes(a.id)
            const isNext = a.id === recommended.id && !isDone
            const inProgress =
              state.runs[a.id]?.phase && state.runs[a.id]?.phase !== "finish"
            const landmarkMeta = LANDMARK_ACTIONS[a.id]

            return (
              <article
                key={a.id}
                className={`map-landmark-card station-${index + 1} ${a.color} ${
                  isDone ? "completed" : ""
                } ${isNext ? "recommended" : ""}`}
              >
                {/* Visual Landscape Art & Big Mascot */}
                <div
                  className="landmark-visual"
                  onClick={() => play(a.id, isDone)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${a.title}`}
                  onKeyDown={(e) => e.key === "Enter" && play(a.id, isDone)}
                >
                  <LocationArt id={a.id} />
                  <div className="landmark-mascot-avatar">
                    <Buddy color={a.tint} mood={isDone ? "happy" : a.mood} />
                  </div>

                  <span className="station-number-badge">
                    {isDone ? "✓" : `0${index + 1}`}
                  </span>

                  {isNext && (
                    <span className="recommended-ribbon" aria-label="Recommended next adventure">
                      ★ PLAY NEXT ★
                    </span>
                  )}
                </div>

                {/* Landmark Details & Large Play Action */}
                <div className="landmark-body">
                  <div className="landmark-header-row">
                    <h3 className="landmark-name">{a.title}</h3>
                    <div
                      className="landmark-stars"
                      aria-label={isDone ? "3 of 3 stars" : "0 of 3 stars"}
                    >
                      <span className={isDone ? "star-earned" : "star-empty"}>★</span>
                      <span className={isDone ? "star-earned" : "star-empty"}>★</span>
                      <span className={isDone ? "star-earned" : "star-empty"}>★</span>
                    </div>
                  </div>

                  <p className="landmark-hint">{landmarkMeta.description}</p>

                  <button
                    className={`landmark-play-button ${
                      isDone ? "replay" : isNext ? "pulse" : ""
                    }`}
                    onClick={() => play(a.id, isDone)}
                    aria-label={`${isDone ? "Play Again" : landmarkMeta.buttonText} for ${a.title}`}
                  >
                    <Icon name={isDone ? "refresh" : "arrow"} size={22} />
                    <span>
                      {isDone ? "Play Again" : inProgress ? "Continue" : landmarkMeta.buttonText}
                    </span>
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* Helpful Shortcuts below Map */}
      <div className="meadow-shortcuts">
        <button
          className="shortcut-btn shop-shortcut"
          onClick={shop}
          aria-label="Visit the Little Reward Shop"
        >
          <span className="shortcut-icon gold">
            <Icon name="star" />
          </span>
          <div className="shortcut-text">
            <strong>The Reward Shop</strong>
            <small>Decorations & outfits for your meadow</small>
          </div>
          <Icon name="arrow" size={19} />
        </button>

        <button
          className="shortcut-btn calm-shortcut"
          onClick={calm}
          aria-label="Open the Quiet Calm Corner"
        >
          <span className="shortcut-icon lavender">
            <Icon name="heart" />
          </span>
          <div className="shortcut-text">
            <strong>A Quiet Little Corner</strong>
            <small>Gentle breathing and 5-thing notice</small>
          </div>
          <Icon name="arrow" size={19} />
        </button>
      </div>
    </section>
  )
}

/**
 * Daily Feelings Check-In
 */
export function FeelingsCheckIn({ meadow }: { meadow: Meadow }) {
  const today = new Date().toLocaleDateString("en-CA")
  const chosen = meadow.state.checkIn?.day === today ? meadow.state.checkIn.feeling : null
  const options = [
    { label: "Happy", mood: "happy", tint: "#f7cd64" },
    { label: "Sad", mood: "sad", tint: "#afccdd" },
    { label: "Angry", mood: "angry", tint: "#edb29b" },
    { label: "Worried", mood: "worried", tint: "#c7b9df" },
    { label: "Calm", mood: "calm", tint: "#b6c99b" },
  ] as const

  return (
    <section className="check-in" aria-label="Daily Feelings Check-In">
      <div className="check-in-header">
        <div>
          <span className="eyebrow small">A LITTLE HELLO TO YOURSELF</span>
          <h2>How are you feeling today?</h2>
          <p>Every feeling is welcome. You can choose whatever feels true right now.</p>
        </div>
        <NarrationControls
          text="How are you feeling today? Any feeling is okay. You can choose happy, sad, angry, worried, or calm."
          id="check-in-prompt"
          label="check-in guidance"
        />
      </div>

      <div className="check-in-options">
        {options.map((o) => (
          <button
            key={o.label}
            className={`check-in-btn ${chosen === o.label ? "selected" : ""}`}
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
          Thank you for noticing your feelings. It’s completely okay to feel{" "}
          <strong>{chosen.toLowerCase()}</strong>. You can share with a trusted grown-up whenever you like.
        </p>
      )}
    </section>
  )
}

/**
 * Main Controller for Active Emotion Adventure
 * Directly renders the corresponding real playable mini-game!
 */
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
  const a = adventures.find((adv) => adv.id === id) || adventures[0]
  const run = meadow.state.runs[id] || freshRun()
  const [paused, setPaused] = useState(false)
  const isCompleted = run.phase === "finish"
  const alreadyCompleted = meadow.state.ledger.includes(`${id}:complete`)

  const currentIndex = adventures.findIndex((v) => v.id === id)
  const nextAdventure = adventures[currentIndex + 1]

  // Complete the mini-game, record taps, and award rewards safely
  function handleMiniGameComplete(data: { taps: string[] }) {
    meadow.completeAdventure(id, data.taps)
  }

  return (
    <section className={`emotion-game-screen play-area ${a.color}`} role="region" aria-label={`${a.title} Game Screen`}>
      {/* Game Screen Top Navigation Bar */}
      <div className="play-top">
        <button className="text-button back-map-btn" onClick={home} aria-label="Return to the Interactive Map">
          <Icon name="home" size={20} />
          <span>Back to Map</span>
        </button>

        <span className="adventure-top-title">
          {a.title.toUpperCase()} · PLAYING WITH {a.mascot.toUpperCase()}
        </span>

        <button
          className="text-button pause-toggle-btn"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Resume playing" : "Take a pause"}
        >
          {paused ? "Keep Playing" : "Take a Break"}
        </button>
      </div>

      <div className="emotion-game-wrapper">
        {paused ? (
          <div className="pause-panel">
            <Buddy color={a.tint} mood="calm" />
            <h2>A Little Pause is Always Okay.</h2>
            <p>
              Relax your shoulders, take a sip of water, or stretch gently. Your progress is saved!
            </p>
            <div className="choice-row">
              <button className="primary-play-btn" onClick={() => setPaused(false)}>
                <span>I’m Ready to Play</span>
                <Icon name="arrow" size={20} />
              </button>
              <button className="secondary" onClick={home}>
                Back to Map for Now
              </button>
            </div>
          </div>
        ) : isCompleted ? (
          /* Celebration & Reward Screen */
          <MiniGameCelebration
            adventure={a}
            tokensEarned={30}
            starsEarned={3}
            alreadyCompleted={alreadyCompleted}
            onContinue={home}
            onReplay={() => {
              meadow.begin(id, true)
            }}
            onNext={nextAdventure ? () => play(nextAdventure.id, meadow.state.completed.includes(nextAdventure.id)) : undefined}
          />
        ) : (
          /* Active Playable Mini-Game for This Location */
          <>
            {id === "anger" && (
              <CoolTheLava adventure={a} onComplete={handleMiniGameComplete} />
            )}
            {id === "stress" && (
              <PackCalmKit adventure={a} onComplete={handleMiniGameComplete} />
            )}
            {id === "sadness" && (
              <HelpAFriend adventure={a} onComplete={handleMiniGameComplete} />
            )}
            {id === "anxiety" && (
              <BravePath adventure={a} onComplete={handleMiniGameComplete} />
            )}
            {id === "happiness" && (
              <HappinessGarden adventure={a} onComplete={handleMiniGameComplete} />
            )}
          </>
        )}
      </div>
    </section>
  )
}

/**
 * Reward Shop Component
 */
export function RewardShop({
  meadow,
  home,
  book,
}: {
  meadow: Meadow
  home: () => void
  book: () => void
}) {
  const [message, setMessage] = useState<string>("")
  return (
    <section className="shop-section play-area" aria-label="The Little Reward Shop">
      <div className="play-top">
        <button className="text-button" onClick={home} aria-label="Back to meadow map">
          <Icon name="home" /> Back to map
        </button>
        <span className="shop-tokens-badge">🪙 {meadow.state.tokens} Meadow Tokens Available</span>
      </div>
      <div className="shop-inner">
        <div className="shop-heading">
          <span className="eyebrow small">FUN VIRTUAL TREASURES</span>
          <h1>The Little Reward Shop</h1>
          <p>Spend the tokens you earned in mini-games on cozy decorations and outfits!</p>
        </div>

        <div className="shop-grid">
          {shopItems.map((item) => {
            const owned = meadow.state.owned.includes(item.id)
            const equipped = meadow.state.equipped.includes(item.id)
            const afford = meadow.state.tokens >= item.price

            return (
              <article className={`shop-card ${item.color} ${owned ? "owned" : ""}`} key={item.id}>
                <div className="card-art-box">
                  <RewardArt art={item.art} />
                  {owned && <span className="owned-tag">✓ Collected</span>}
                </div>
                <h3>{item.title}</h3>
                <span className="category-tag">{item.category}</span>
                <p className="price-tag">{item.price} tokens</p>
                <button
                  className={`primary ${owned ? "secondary" : ""}`}
                  disabled={!owned && !afford}
                  onClick={() => {
                    if (owned) {
                      meadow.equip(item.id)
                      setMessage(`${item.title} is now ${equipped ? "stored away" : "on display in your meadow"}!`)
                    } else if (afford) {
                      meadow.buy(item.id)
                      setMessage(`Hooray! ${item.title} is yours! It’s ready to display in your meadow.`)
                    }
                  }}
                  aria-label={
                    owned
                      ? equipped
                        ? `Store ${item.title}`
                        : `Display ${item.title} in meadow`
                      : afford
                        ? `Buy ${item.title} for ${item.price} tokens`
                        : `Needs ${item.price - meadow.state.tokens} more tokens`
                  }
                >
                  {owned
                    ? equipped
                      ? "Put in Book"
                      : "Display in Meadow"
                    : afford
                      ? `Get for ${item.price} Tokens`
                      : `Save ${item.price - meadow.state.tokens} More`}
                </button>
              </article>
            )
          })}
        </div>

        {message && (
          <p role="status" className="shop-status-message">
            {message}
          </p>
        )}

        <div className="choice-row mt-6">
          <button className="primary" onClick={book}>
            See My Sticker Book <Icon name="book" />
          </button>
          <button className="secondary" onClick={home}>
            Back to Meadow
          </button>
        </div>
      </div>
    </section>
  )
}

/**
 * Sticker Book / Collection
 */
export function RewardCollection({
  meadow,
  shop,
}: {
  meadow: Meadow
  shop: () => void
}) {
  return (
    <section className="saved-collection" aria-label="My Sticker Book">
      <div className="collection-header">
        <h1>My Adventure Sticker Book</h1>
        <p>Badges and stickers you unlocked by exploring feelings in the meadow.</p>
      </div>

      <div className="collection-friends">
        {adventures.map((a) => {
          const isDone = meadow.state.completed.includes(a.id)
          return (
            <article
              className={`collection-friend ${a.color} ${isDone ? "collected" : "locked"}`}
              key={a.id}
            >
              <div className="friend-art">
                {isDone ? (
                  <Buddy color={a.tint} mood="happy" />
                ) : (
                  <span className="locked-icon">🔒</span>
                )}
              </div>
              <h3>{a.sticker}</h3>
              <span className="location-name">{a.title}</span>
              <p>{isDone ? a.skill : "Play this adventure to unlock sticker!"}</p>
              {isDone && <span className="star-badge">★★★ Explored</span>}
            </article>
          )
        })}
      </div>

      <div className="shop-link-card">
        <h3>Looking for more decorations?</h3>
        <p>Use your tokens in the Reward Shop to get crowns, capes, and rainbows.</p>
        <button className="primary" onClick={shop}>
          Visit the Reward Shop <Icon name="star" />
        </button>
      </div>
    </section>
  )
}

/**
 * Meadow Display for Owned/Equipped Accessories
 */
export function MeadowDisplay({ meadow }: { meadow: Meadow }) {
  const items = shopItems.filter((item) => meadow.state.equipped.includes(item.id))
  if (!items.length) return null

  return (
    <section className="meadow-display" aria-label="Meadow Treasures On Display">
      <div>
        <span className="eyebrow small">YOUR DECORATED MEADOW</span>
        <h3>Treasures On Display</h3>
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

/**
 * Quiet Calm Corner
 */
export function CalmCorner({
  home,
  breathe,
}: {
  home: () => void
  breathe: () => void
}) {
  const [noticed, setNoticed] = useState<string[]>([])

  return (
    <section className="calm-corner play-area purple" aria-label="A Quiet Little Corner">
      <div className="play-top">
        <button className="text-button" onClick={home} aria-label="Back to meadow map">
          <Icon name="home" /> Back to map
        </button>
        <span>ALWAYS OPEN · NO TOKENS NEEDED</span>
      </div>

      <div className="emotion-game-inner">
        <div className="small-mascot">
          <Buddy color="#c7b9df" mood="calm" />
        </div>
        <span className="eyebrow">A QUIET LITTLE CORNER</span>
        <h1>A Peaceful Moment, Just for You</h1>
        <p className="story-text">
          Every feeling belongs. Take a quiet breath, notice what is around you, or ask a trusted grown-up to sit with you.
        </p>

        <div className="calm-narration-row">
          <button className="primary" onClick={breathe}>
            Breathe with the Cloud <Icon name="heart" />
          </button>
          <NarrationControls
            text="A moment, just for you. You don’t need to change your feeling. Notice five things around you, and tap a leaf for each one."
            id="calm-corner-voice"
            label="Calm Corner message"
          />
        </div>

        <div className="grounding-practice">
          <h2>Five little things, right here.</h2>
          <p>Notice five things around you. Tap a leaf for each one.</p>
          <div className="grounding-leaves">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                className={noticed.includes(String(i)) ? "noticed" : ""}
                aria-label={`Notice thing ${i + 1}`}
                aria-pressed={noticed.includes(String(i))}
                onClick={() =>
                  setNoticed((n) => (n.includes(String(i)) ? n : [...n, String(i)]))
                }
              >
                <Icon name={noticed.includes(String(i)) ? "check" : "flower"} size={32} />
              </button>
            ))}
          </div>

          <p role="status">
            {noticed.length === 5
              ? "Five things noticed! You are here, safe and sound right now."
              : `${noticed.length} of 5 noticed. Go at your own pace.`}
          </p>

          <button className="secondary" onClick={() => setNoticed([])}>
            Notice Five Again
          </button>
        </div>
      </div>
    </section>
  )
}
