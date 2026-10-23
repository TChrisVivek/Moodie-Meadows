import React from "react"
import { Buddy, Icon, NarrationControls } from "../MeadowArt"
import type { Adventure } from "../adventureData"

type Props = {
  adventure: Adventure
  tokensEarned: number
  starsEarned: number
  alreadyCompleted: boolean
  onContinue: () => void
  onReplay: () => void
  onNext?: () => void
}

export default function MiniGameCelebration({
  adventure,
  tokensEarned,
  starsEarned,
  alreadyCompleted,
  onContinue,
  onReplay,
  onNext,
}: Props) {
  const displayTokens = alreadyCompleted ? 0 : tokensEarned
  const displayStars = alreadyCompleted ? 0 : starsEarned

  const celebrationText = alreadyCompleted
    ? `You completed ${adventure.title} again! You're becoming a master of exploring big feelings.`
    : `Hooray! You completed ${adventure.title}! You earned 30 Meadow Tokens and 3 shiny stars!`

  return (
    <div className="celebration-screen" role="region" aria-label="Celebration and Rewards">
      <div className="celebration-confetti" aria-hidden="true">
        <span>✨</span>
        <span>🎉</span>
        <span>⭐</span>
        <span>🌟</span>
        <span>🎈</span>
        <span>🌸</span>
        <span>✨</span>
      </div>

      <div className="celebration-card">
        <div className="celebration-mascot-row">
          <div className="celebration-mascot bounce-happy">
            <Buddy color={adventure.tint} mood="happy" />
          </div>
        </div>

        <div className="celebration-header">
          <span className="celebration-badge">ADVENTURE COMPLETE!</span>
          <h1>Wonderful Job, Explorer!</h1>
          <NarrationControls
            text={`${celebrationText} ${adventure.learned}`}
            id={`celebrate-${adventure.id}`}
            label="celebration message"
          />
        </div>

        <p className="celebration-subtext">
          {alreadyCompleted
            ? `You explored ${adventure.title} again! Repetition helps our feelings brain grow strong.`
            : `You helped ${adventure.mascot} understand and calm their big feelings.`}
        </p>

        {/* Reward Showcase */}
        <div className="rewards-showcase">
          <div className="reward-pill tokens-pill">
            <span className="pill-icon">🪙</span>
            <div className="pill-info">
              <strong>+{alreadyCompleted ? "0 (Replay)" : "30"} Tokens</strong>
              <small>Meadow Tokens</small>
            </div>
          </div>

          <div className="reward-pill stars-pill">
            <span className="pill-icon">⭐</span>
            <div className="pill-info">
              <strong>+{alreadyCompleted ? "0" : "3"} Stars</strong>
              <small>Exploration Stars</small>
            </div>
          </div>

          <div className="reward-pill sticker-pill">
            <span className="pill-icon">🏷️</span>
            <div className="pill-info">
              <strong>{adventure.sticker}</strong>
              <small>Sticker Unlocked!</small>
            </div>
          </div>
        </div>

        {/* What I Learned Card */}
        <div className="learned-card">
          <div className="learned-icon">
            <Icon name="heart" size={24} />
          </div>
          <div className="learned-body">
            <strong>What we learned today:</strong>
            <p>{adventure.learned}</p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="celebration-actions">
          {onNext && (
            <button
              className="primary-action-btn next-btn"
              onClick={onNext}
              aria-label="Play next emotion adventure"
            >
              <span>Next Adventure</span>
              <Icon name="arrow" size={22} />
            </button>
          )}

          <button
            className="secondary-action-btn map-btn"
            onClick={onContinue}
            aria-label="Return to the Interactive Meadow Map"
          >
            <Icon name="home" size={20} />
            <span>Back to Map</span>
          </button>

          <button
            className="secondary-action-btn replay-btn"
            onClick={onReplay}
            aria-label="Play this adventure again"
          >
            <Icon name="refresh" size={18} />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  )
}
