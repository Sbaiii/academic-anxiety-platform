import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type Step = { label: string }

export function StepTracker({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="mb-6 rounded-2xl bg-muted/50 p-4">
      <div className="flex items-start justify-between gap-1">
        {steps.map((step, i) => {
          const done = i < current
          const active = i === current
          return (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-2">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                  done && "bg-primary text-primary-foreground",
                  active && !done && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !done && !active && "bg-background text-muted-foreground shadow-sm",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-center text-[10px] font-semibold uppercase tracking-wide",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex gap-1 px-4">
        {steps.slice(0, -1).map((_, i) => (
          <div
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-colors", i < current ? "bg-primary/50" : "bg-border")}
          />
        ))}
      </div>
    </div>
  )
}
