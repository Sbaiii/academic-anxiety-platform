"use client"

import { useEffect, useRef, useState } from "react"
import { X, Wind, Sparkles, Music, Target, Check, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { startCalmPad, playChime } from "@/lib/audio"

type Tool = "breathe" | "ground" | "sound" | "focus"

const TOOLS: { id: Tool; label: string; icon: typeof Wind; hint: string }[] = [
  { id: "breathe", label: "Breathe", icon: Wind, hint: "60-second guided breathing" },
  { id: "ground", label: "Ground", icon: Sparkles, hint: "5-4-3-2-1 senses" },
  { id: "sound", label: "Calm Sound", icon: Music, hint: "Soothing ambient tone" },
  { id: "focus", label: "Refocus", icon: Target, hint: "Quick focus reset" },
]

export function EmergencyCalmMode({ onClose }: { onClose: () => void }) {
  const [tool, setTool] = useState<Tool>("breathe")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Emergency calm mode"
      className="calm-gradient fixed inset-0 z-50 flex flex-col text-white animate-fade-in"
    >
      <header className="flex items-center justify-between px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-2.5 animate-pulse rounded-full bg-white/90" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Calm Mode</p>
            <p className="text-sm font-medium">You&apos;re safe. Breathe with me.</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close calm mode"
          className="size-10 rounded-xl text-white hover:bg-white/15"
        >
          <X className="size-5" />
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-4">
        <div className="w-full max-w-sm">
          {tool === "breathe" && <BreathingExercise />}
          {tool === "ground" && <GroundingExercise />}
          {tool === "sound" && <CalmSound />}
          {tool === "focus" && <FocusReset />}
        </div>
      </div>

      <nav className="mx-auto w-full max-w-md px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-black/20 p-1.5 backdrop-blur-sm">
          {TOOLS.map((t) => {
            const Icon = t.icon
            const active = tool === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                aria-pressed={active}
                title={t.hint}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[10px] font-semibold transition-all",
                  active ? "bg-white text-primary shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-5" />
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/* ----------------------------- Breathing ----------------------------- */

type Phase = { label: string; seconds: number; scale: number }
const BREATH_CYCLE: Phase[] = [
  { label: "Breathe in", seconds: 4, scale: 1 },
  { label: "Hold", seconds: 4, scale: 1 },
  { label: "Breathe out", seconds: 6, scale: 0.55 },
]
const TOTAL = 60

function BreathingExercise() {
  const [running, setRunning] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [phaseLeft, setPhaseLeft] = useState(BREATH_CYCLE[0].seconds)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setElapsed((e) => Math.min(e + 1, TOTAL))
      setPhaseLeft((left) => {
        if (left > 1) return left - 1
        setPhaseIndex((pi) => {
          const next = (pi + 1) % BREATH_CYCLE.length
          playChime(next === 0 ? 528 : 396)
          return next
        })
        return -1 // sentinel; corrected below
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  // keep phaseLeft in sync when phase changes
  useEffect(() => {
    setPhaseLeft(BREATH_CYCLE[phaseIndex].seconds)
  }, [phaseIndex])

  useEffect(() => {
    if (elapsed >= TOTAL) setRunning(false)
  }, [elapsed])

  const phase = BREATH_CYCLE[phaseIndex]
  const done = elapsed >= TOTAL

  return (
    <div className="flex flex-col items-center text-center">
      <p className="mb-8 text-sm text-primary-foreground/70">
        {done ? "Well done. Notice how your body feels now." : "Follow the circle. Let your shoulders drop."}
      </p>

      <div className="relative flex size-64 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary-foreground/10" />
        <span
          className="absolute rounded-full bg-primary-foreground/25 transition-transform ease-in-out"
          style={{
            inset: 0,
            transform: `scale(${done ? 0.7 : phase.scale})`,
            transitionDuration: `${phase.seconds}s`,
          }}
        />
        <div className="z-10 flex flex-col items-center">
          <span className="text-2xl font-semibold">{done ? "Complete" : phase.label}</span>
          {!done && <span className="mt-1 text-5xl font-light tabular-nums">{Math.max(phaseLeft, 1)}</span>}
        </div>
      </div>

      <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/15">
        <div
          className="h-full rounded-full bg-primary-foreground transition-all duration-1000 ease-linear"
          style={{ width: `${(elapsed / TOTAL) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-primary-foreground/60 tabular-nums">{TOTAL - elapsed}s remaining</p>

      <div className="mt-6 flex gap-3">
        {!done ? (
          <Button
            variant="secondary"
            onClick={() => setRunning((r) => !r)}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            {running ? <Pause className="mr-1.5 size-4" /> : <Play className="mr-1.5 size-4" />}
            {running ? "Pause" : "Resume"}
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              setElapsed(0)
              setPhaseIndex(0)
              setPhaseLeft(BREATH_CYCLE[0].seconds)
              setRunning(true)
            }}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            Go again
          </Button>
        )}
      </div>
    </div>
  )
}

/* ----------------------------- Grounding ----------------------------- */

const GROUND_STEPS = [
  { count: 5, sense: "things you can see", prompt: "Look around and name them slowly." },
  { count: 4, sense: "things you can feel", prompt: "Your feet, your chair, the air." },
  { count: 3, sense: "things you can hear", prompt: "Near and far sounds." },
  { count: 2, sense: "things you can smell", prompt: "Or two smells you like." },
  { count: 1, sense: "thing you can taste", prompt: "Or one good thing about today." },
]

function GroundingExercise() {
  const [step, setStep] = useState(0)
  const current = GROUND_STEPS[step]
  const done = step >= GROUND_STEPS.length

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary-foreground/20">
          <Check className="size-9" />
        </div>
        <h3 className="mt-6 text-xl font-semibold">You&apos;re here, in this moment.</h3>
        <p className="mt-2 text-sm text-primary-foreground/70">Grounding complete. You can repeat it anytime.</p>
        <Button
          variant="secondary"
          onClick={() => setStep(0)}
          className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          Start over
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm text-primary-foreground/70">Take your time with each one.</p>
      <div className="my-8 flex size-40 flex-col items-center justify-center rounded-full bg-primary-foreground/15">
        <span className="text-7xl font-light">{current.count}</span>
      </div>
      <h3 className="text-balance text-2xl font-semibold">{current.sense}</h3>
      <p className="mt-2 text-pretty text-sm text-primary-foreground/70">{current.prompt}</p>

      <div className="mt-6 flex items-center gap-1.5">
        {GROUND_STEPS.map((_, i) => (
          <span
            key={i}
            className={cn("h-1.5 rounded-full transition-all", i <= step ? "w-6 bg-primary-foreground" : "w-1.5 bg-primary-foreground/30")}
          />
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => setStep((s) => s + 1)}
        className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
      >
        {step === GROUND_STEPS.length - 1 ? "Finish" : "Next"}
      </Button>
    </div>
  )
}

/* ----------------------------- Calm Sound ----------------------------- */

function CalmSound() {
  const [playing, setPlaying] = useState(false)
  const handleRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    return () => handleRef.current?.stop()
  }, [])

  const toggle = () => {
    if (playing) {
      handleRef.current?.stop()
      handleRef.current = null
      setPlaying(false)
    } else {
      handleRef.current = startCalmPad()
      setPlaying(true)
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="mb-8 text-sm text-primary-foreground/70">
        A soft ambient tone to settle your mind. Close your eyes if you&apos;d like.
      </p>

      <button
        onClick={toggle}
        aria-label={playing ? "Pause calming sound" : "Play calming sound"}
        className="relative flex size-48 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform active:scale-95"
      >
        {playing && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-primary-foreground/10" style={{ animationDuration: "3s" }} />
            <span className="absolute inset-4 animate-ping rounded-full bg-primary-foreground/10" style={{ animationDuration: "4s" }} />
          </>
        )}
        <span className="z-10 flex size-20 items-center justify-center rounded-full bg-primary-foreground text-primary">
          {playing ? <Pause className="size-8" /> : <Play className="ml-1 size-8" />}
        </span>
      </button>

      <p className="mt-8 text-sm font-medium">{playing ? "Playing — breathe slowly" : "Tap to begin"}</p>
    </div>
  )
}

/* ----------------------------- Focus Reset ----------------------------- */

const FOCUS_STEPS = [
  "Plant both feet flat on the floor.",
  "Unclench your jaw and relax your shoulders.",
  "Pick one small next step — just the very first one.",
  "Say it out loud: \u201cI only need to start.\u201d",
]

function FocusReset() {
  const [step, setStep] = useState(0)
  const done = step >= FOCUS_STEPS.length

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary-foreground/20">
          <Target className="size-9" />
        </div>
        <h3 className="mt-6 text-balance text-xl font-semibold">Clear enough to begin.</h3>
        <p className="mt-2 text-sm text-primary-foreground/70">Start with that one small step. You&apos;ve got this.</p>
        <Button
          variant="secondary"
          onClick={() => setStep(0)}
          className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          Reset again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm text-primary-foreground/70">One step at a time.</p>
      <div className="my-8 flex min-h-36 w-full items-center justify-center rounded-3xl bg-primary-foreground/12 px-6 py-8">
        <p className="text-balance text-2xl font-medium leading-snug">{FOCUS_STEPS[step]}</p>
      </div>
      <p className="text-xs text-primary-foreground/60">
        {step + 1} of {FOCUS_STEPS.length}
      </p>
      <Button
        variant="secondary"
        onClick={() => setStep((s) => s + 1)}
        className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
      >
        {step === FOCUS_STEPS.length - 1 ? "Done" : "Next"}
      </Button>
    </div>
  )
}
