"use client"

import { useEffect, useState } from "react"
import { ClipboardList, Compass, CalendarRange, LifeBuoy, Sparkles, ChevronRight, Wind } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AppView } from "@/lib/app-types"

const TOOLS: {
  view: AppView
  title: string
  description: string
  icon: typeof ClipboardList
  accent: string
}[] = [
  {
    view: "plan",
    title: "Action Plan",
    description: "Get practical steps for exam stress, overload & more",
    icon: ClipboardList,
    accent: "from-primary/15 to-primary/5",
  },
  {
    view: "campus",
    title: "Campus Help",
    description: "Counselling, emergency lines & how to book",
    icon: Compass,
    accent: "from-sky-500/15 to-sky-500/5",
  },
  {
    view: "study",
    title: "Study Companion",
    description: "Auto schedule, breaks & workload balance",
    icon: CalendarRange,
    accent: "from-violet-500/15 to-violet-500/5",
  },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export function HomeView({
  onNavigate,
  onOpenCalmMode,
}: {
  onNavigate: (view: AppView) => void
  onOpenCalmMode: () => void
}) {
  const [greeting, setGreeting] = useState("Hello")

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">{greeting}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">How can MindCare help today?</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Four tools built for academic stress — pick one below or get immediate calm.
        </p>
      </div>

      {/* Emergency — Feature 1 */}
      <button type="button" onClick={onOpenCalmMode} className="group w-full text-left">
        <Card className="calm-gradient relative overflow-hidden border-0 p-0 shadow-lg shadow-primary/20">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative p-5 text-primary-foreground">
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <LifeBuoy className="size-6" />
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                Feature 1
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold">Emergency Calm Mode</h2>
            <p className="mt-1 text-sm text-primary-foreground/85">
              Breathing · Grounding · Calm audio · Focus reset
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-transform group-active:scale-[0.98]">
                <Wind className="size-4" />
                I need calm now
              </span>
              <span className="flex items-center gap-1 text-xs text-primary-foreground/70">
                60 sec start <ChevronRight className="size-3.5" />
              </span>
            </div>
          </div>
        </Card>
      </button>

      {/* Quick tools */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Your tools</h2>
        </div>
        <div className="space-y-2.5">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon
            return (
              <button key={tool.view} type="button" onClick={() => onNavigate(tool.view)} className="w-full text-left">
                <Card
                  className={cn(
                    "feature-card-hover flex items-center gap-4 border-border/80 bg-gradient-to-r p-4",
                    tool.accent,
                  )}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card shadow-sm">
                    <Icon className="size-5 text-primary" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{tool.title}</span>
                      <span className="rounded-full bg-card/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {i + 2}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{tool.description}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Card>
              </button>
            )
          })}
        </div>
      </div>

      <Card className="border-dashed bg-muted/30 p-4">
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          MindCare is a self-help prototype — not a substitute for professional care. In crisis, call{" "}
          <a href="tel:988" className="font-semibold text-primary underline-offset-2 hover:underline">
            988
          </a>
          .
        </p>
      </Card>
    </div>
  )
}
