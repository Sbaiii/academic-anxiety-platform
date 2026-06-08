import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const ACCENTS = {
  teal: "bg-primary/10 text-primary",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  blue: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
} as const

export function FeatureHeader({
  icon: Icon,
  title,
  description,
  accent = "teal",
}: {
  icon: LucideIcon
  title: string
  description: string
  accent?: keyof typeof ACCENTS
}) {
  return (
    <div className="mb-6">
      <div className="flex items-start gap-3.5">
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl", ACCENTS[accent])}>
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
