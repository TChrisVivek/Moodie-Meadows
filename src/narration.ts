// Narration engine for Moodie Meadows using Web Speech API
// Provides accessible, child-friendly read-aloud controls with voice selection,
// overlap prevention, and graceful fallbacks.

import { useEffect, useState } from "react"

export type NarrationState = {
  isSpeaking: boolean
  currentId: string | null
  supported: boolean
}

class NarrationService {
  private utterance: SpeechSynthesisUtterance | null = null
  private listeners = new Set<(state: NarrationState) => void>()
  private state: NarrationState = {
    isSpeaking: false,
    currentId: null,
    supported: typeof window !== "undefined" && "speechSynthesis" in window,
  }

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Chrome/Edge load voices asynchronously
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices ready
      }
    }
  }

  getState(): NarrationState {
    return this.state
  }

  subscribe(listener: (state: NarrationState) => void): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }

  stop() {
    if (!this.state.supported) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Ignore cancellation errors
    }
    this.utterance = null
    this.state = { ...this.state, isSpeaking: false, currentId: null }
    this.notify()
  }

  speak(text: string, id: string, onEnd?: () => void) {
    if (!this.state.supported) return

    // If currently speaking this exact item, toggle it off
    if (this.state.isSpeaking && this.state.currentId === id) {
      this.stop()
      return
    }

    // Cancel any previous speech immediately to prevent overlapping audio
    this.stop()

    // Clean text: strip markdown syntax, formatting brackets, emoji
    const cleanText = text
      .replace(/[*_#`~[\]]/g, "")
      .replace(/[✧✳↙✦]/g, "")
      .replace(/\s+/g, " ")
      .trim()

    if (!cleanText) return

    try {
      const u = new SpeechSynthesisUtterance(cleanText)
      this.utterance = u

      // Voice selection: find warm English voice
      const voices = window.speechSynthesis.getVoices()
      const preferred =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") ||
              v.name.includes("Female") ||
              v.name.includes("Samantha") ||
              v.name.includes("Google") ||
              v.name.includes("Zira")),
        ) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0]

      if (preferred) u.voice = preferred
      u.rate = 0.92 // Gentle, child-friendly cadence
      u.pitch = 1.05 // Friendly, warm tone

      u.onstart = () => {
        this.state = { ...this.state, isSpeaking: true, currentId: id }
        this.notify()
      }

      u.onend = () => {
        this.state = { ...this.state, isSpeaking: false, currentId: null }
        this.notify()
        onEnd?.()
      }

      u.onerror = () => {
        this.state = { ...this.state, isSpeaking: false, currentId: null }
        this.notify()
      }

      window.speechSynthesis.speak(u)
    } catch {
      this.state = { ...this.state, isSpeaking: false, currentId: null }
      this.notify()
    }
  }
}

export const narration = new NarrationService()

export function useNarration() {
  const [state, setState] = useState<NarrationState>(narration.getState())

  useEffect(() => {
    return narration.subscribe(setState)
  }, [])

  return {
    ...state,
    speak: (text: string, id: string, onEnd?: () => void) =>
      narration.speak(text, id, onEnd),
    stop: () => narration.stop(),
  }
}
