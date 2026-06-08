"use client"

// Lightweight Web Audio engine for generated calming tones.
// No external assets — everything is synthesized in-browser.

type ToneHandle = {
  stop: () => void
}

let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!sharedCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    sharedCtx = new Ctor()
  }
  if (sharedCtx.state === "suspended") {
    void sharedCtx.resume()
  }
  return sharedCtx
}

// A soft, evolving ambient pad built from a few detuned sine partials
// plus a gentle low-pass filter and slow amplitude swell.
export function startCalmPad(): ToneHandle {
  const ctx = getCtx()
  if (!ctx) return { stop: () => {} }

  const now = ctx.currentTime
  const master = ctx.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.18, now + 4)

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.setValueAtTime(900, now)

  master.connect(filter)
  filter.connect(ctx.destination)

  // Soft chord (A minor-ish, very consonant) in a low octave.
  const freqs = [110, 164.81, 220, 277.18]
  const oscNodes: OscillatorNode[] = []
  const lfoNodes: OscillatorNode[] = []

  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.value = f

    const gain = ctx.createGain()
    gain.gain.value = 0.25 / freqs.length

    // Slow tremolo for a breathing, alive quality.
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07 + i * 0.013
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.12 / freqs.length
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)

    osc.connect(gain)
    gain.connect(master)
    osc.start(now)
    lfo.start(now)
    oscNodes.push(osc)
    lfoNodes.push(lfo)
  })

  return {
    stop: () => {
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.exponentialRampToValueAtTime(0.0001, t + 1.5)
      oscNodes.forEach((o) => o.stop(t + 1.6))
      lfoNodes.forEach((o) => o.stop(t + 1.6))
    },
  }
}

// A single soft bell/chime, used as a gentle cue (e.g. phase changes).
export function playChime(frequency = 528) {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.type = "sine"
  osc.frequency.value = frequency

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 2.3)
}
