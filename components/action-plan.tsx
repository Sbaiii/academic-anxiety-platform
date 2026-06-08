"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, RotateCcw, ChevronRight, Timer, LifeBuoy, ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StepTracker } from "@/components/step-tracker"
import { cn } from "@/lib/utils"
import { ACTION_PLANS, personalizePlan, type Intensity } from "@/lib/content"
import { useLocalStorage } from "@/lib/use-local-storage"

type Progressed = Record<string, number[]>

const INTENSITY_OPTIONS: { id: Intensity; label: string; hint: string; emoji: string }[] = [
  { id: "mild", label: "Mild", hint: "I can manage with a few small steps", emoji: "🌤" },
  { id: "moderate", label: "Moderate", hint: "It's affecting me — I need a clear plan", emoji: "🌥" },
  { id: "intense", label: "Intense", hint: "It feels overwhelming right now", emoji: "🌧" },
]

const WIZARD_STEPS = [{ label: "Issue" }, { label: "Intensity" }, { label: "Your plan" }]

type ActionPlanProps = {
  onOpenCalmMode?: () => void
}

export function ActionPlan({ onOpenCalmMode }: ActionPlanProps) {
  const [selected, setSelected] = useLocalStorage<string | null>("mindcare:action:selected", null)
  const [intensity, setIntensity] = useLocalStorage<Intensity | null>("mindcare:action:intensity", null)
  const [progress, setProgress] = useLocalStorage<Progressed>("mindcare:action:progress", {})
  const [activeTimer, setActiveTimer] = useState<{ stepIndex: number; secondsLeft: number } | null>(null)

  const basePlan = useMemo(() => ACTION_PLANS.find((p) => p.id === selected) ?? null, [selected])
  const plan = useMemo(() => {
    if (!basePlan || !intensity) return null
    return { ...basePlan, ...personalizePlan(basePlan, intensity) }
  }, [basePlan, intensity])

  const wizardStep = !basePlan ? 0 : !intensity ? 1 : 2
  const completed = (plan && progress[plan.id]) || []

  useEffect(() => {
    if (!activeTimer || activeTimer.secondsLeft <= 0) return
    const id = setInterval(() => {
      setActiveTimer((t) => {
        if (!t || t.secondsLeft <= 1) return null
        return { ...t, secondsLeft: t.secondsLeft - 1 }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [activeTimer])

  const toggleStep = (index: number) => {
    if (!plan) return
    setProgress((prev) => {
      const current = prev[plan.id] ?? []
      const next = current.includes(index) ? current.filter((i) => i !== index) : [...current, index]
      return { ...prev, [plan.id]: next }
    })
  }

  const resetPlan = () => {
    if (!plan) return
    setProgress((prev) => ({ ...prev, [plan.id]: [] }))
    setActiveTimer(null)
  }

  const startTimer = (stepIndex: number, minutes: number) => {
    setActiveTimer({ stepIndex, secondsLeft: minutes * 60 })
  }

  const clearSelection = () => {
    setSelected(null)
    setIntensity(null)
    setActiveTimer(null)
  }

  if (!basePlan) {
    return (
      <div>
        <StepTracker steps={WIZARD_STEPS} current={0} />
        <p className="mb-4 text-sm text-muted-foreground">What&apos;s affecting you most right now?</p>
        <div className="space-y-2.5">
          {ACTION_PLANS.map((p) => {
            const Icon = p.icon
            const planDone = (progress[p.id] ?? []).length
            return (
              <button key={p.id} onClick={() => setSelected(p.id)} className="w-full text-left">
                <Card className="feature-card-hover flex items-center gap-4 p-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-medium">
                      {p.label}
                      {planDone > 0 && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          In progress
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{p.description}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Card>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (!intensity) {
    const Icon = basePlan.icon
    return (
      <div>
        <StepTracker steps={WIZARD_STEPS} current={1} />
        <button
          type="button"
          onClick={clearSelection}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <Card className="mb-5 flex items-center gap-3 border-primary/20 bg-primary/5 p-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Selected</p>
            <p className="font-semibold">{basePlan.label}</p>
          </div>
        </Card>
        <p className="mb-3 text-sm font-medium">How intense does this feel?</p>
        <div className="space-y-2.5">
          {INTENSITY_OPTIONS.map((opt) => (
            <button key={opt.id} onClick={() => setIntensity(opt.id)} className="w-full text-left">
              <Card className="feature-card-hover flex items-center gap-4 p-4">
                <span className="text-2xl">{opt.emoji}</span>
                <span className="flex-1">
                  <p className="font-medium">{opt.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{opt.hint}</p>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Card>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!plan) return null

  const Icon = plan.icon
  const pct = Math.round((completed.length / plan.steps.length) * 100)
  const allDone = completed.length === plan.steps.length

  return (
    <div>
      <StepTracker steps={WIZARD_STEPS} current={2} />
      <button
        type="button"
        onClick={clearSelection}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Start over
      </button>

      <Card className="mb-5 overflow-hidden p-0">
        <div className="flex items-start gap-3 p-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{plan.label}</h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold capitalize text-secondary-foreground">
                {intensity}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{plan.intro}</p>
          </div>
        </div>
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Progress</span>
            <span className="tabular-nums text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="mt-2 h-2" />
        </div>
      </Card>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your steps</p>
      <ul className="space-y-3">
        {plan.steps.map((step, i) => {
          const done = completed.includes(i)
          const timerActive = activeTimer?.stepIndex === i
          return (
            <li key={i}>
              <Card
                className={cn(
                  "overflow-hidden p-0 transition-colors",
                  done ? "border-primary/30 bg-primary/5" : "border-border",
                  timerActive && "ring-2 ring-primary/30",
                )}
              >
                <button
                  onClick={() => toggleStep(i)}
                  className="flex w-full items-start gap-3 p-4 text-left active:bg-accent/30"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className={cn("flex-1 text-sm leading-relaxed", done && "text-muted-foreground line-through")}>
                    {step.text}
                  </span>
                </button>

                {!done && (step.timerMinutes || step.openCalmMode) && (
                  <div className="flex flex-wrap gap-2 border-t border-border bg-muted/20 px-4 py-3">
                    {step.timerMinutes && (
                      <Button
                        variant={timerActive ? "default" : "secondary"}
                        size="sm"
                        onClick={() => startTimer(i, step.timerMinutes!)}
                        disabled={timerActive}
                        className="rounded-xl"
                      >
                        <Timer className="mr-1.5 size-3.5" />
                        {timerActive
                          ? `${Math.floor((activeTimer?.secondsLeft ?? 0) / 60)}:${String((activeTimer?.secondsLeft ?? 0) % 60).padStart(2, "0")}`
                          : `${step.timerMinutes} min timer`}
                      </Button>
                    )}
                    {step.openCalmMode && onOpenCalmMode && (
                      <Button variant="secondary" size="sm" onClick={onOpenCalmMode} className="rounded-xl">
                        <LifeBuoy className="mr-1.5 size-3.5" />
                        Calm Mode
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </li>
          )
        })}
      </ul>

      {allDone && (
        <Card className="mt-5 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-5 text-center">
          <p className="text-2xl">✨</p>
          <p className="mt-2 font-semibold text-primary">Plan complete!</p>
          <p className="mt-1 text-sm text-muted-foreground">You showed up for yourself today. That matters.</p>
        </Card>
      )}

      {completed.length > 0 && !allDone && (
        <Button variant="ghost" size="sm" onClick={resetPlan} className="mt-4 w-full text-muted-foreground">
          <RotateCcw className="mr-1.5 size-3.5" />
          Reset progress
        </Button>
      )}
    </div>
  )
}
