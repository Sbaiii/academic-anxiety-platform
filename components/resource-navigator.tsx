"use client"

import { useMemo, useState } from "react"
import { Clock, ChevronDown, ArrowRight, AlertTriangle, Phone } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CAMPUS_RESOURCES, type CampusResource } from "@/lib/content"

const CATEGORIES = ["All", "Emergency", "Counselling", "Wellbeing", "Academic"] as const

export function ResourceNavigator() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All")
  const [open, setOpen] = useState<string | null>(null)

  const resources = useMemo(() => {
    const filtered = CAMPUS_RESOURCES.filter((r) => filter === "All" || r.category === filter)
    return [...filtered].sort((a, b) => Number(b.urgent) - Number(a.urgent))
  }, [filter])

  const emergency = CAMPUS_RESOURCES.filter((r) => r.urgent)

  return (
    <div>
      <Card className="mb-5 overflow-hidden border-destructive/25 p-0">
        <div className="flex items-start gap-3 bg-gradient-to-br from-destructive/10 to-destructive/5 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-destructive">Need help right now?</p>
            <p className="mt-1 text-sm text-muted-foreground">Tap a service below for instant contact details.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {emergency.flatMap((r) =>
                r.contacts
                  .filter((c) => c.href.startsWith("tel:"))
                  .map((c) => (
                    <a
                      key={r.id + c.href}
                      href={c.href}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-2 text-xs font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
                    >
                      <Phone className="size-3.5" />
                      {c.value.split("(")[0].trim()}
                    </a>
                  )),
              )}
            </div>
          </div>
        </div>
      </Card>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filter by type</p>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
              filter === c
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {resources.map((r) => (
          <ResourceCard key={r.id} resource={r} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} />
        ))}
      </div>
    </div>
  )
}

function ResourceCard({
  resource,
  open,
  onToggle,
}: {
  resource: CampusResource
  open: boolean
  onToggle: () => void
}) {
  const Icon = resource.icon
  return (
    <Card
      className={cn(
        "overflow-hidden p-0 transition-shadow",
        resource.urgent && "border-destructive/25",
        open && "shadow-md ring-1 ring-primary/10",
      )}
    >
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-4 p-4 text-left">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl",
            resource.urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{resource.name}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                resource.urgent ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
              )}
            >
              {resource.category}
            </span>
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{resource.description}</span>
        </span>
        <ChevronDown
          className={cn("mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="animate-fade-in border-t border-border bg-muted/25 px-4 py-4">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</dt>
              <dd className="mt-2 space-y-2">
                {resource.contacts.map((c) => (
                  <div key={c.label} className="flex items-center justify-between gap-3 rounded-xl bg-card p-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
                      <p className="mt-0.5 font-medium">{c.value}</p>
                    </div>
                    {!c.href.startsWith("#") && (
                      <a
                        href={c.href}
                        className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                      >
                        {c.href.startsWith("tel:") ? "Call" : c.href.startsWith("mailto:") ? "Email" : "Open"}
                      </a>
                    )}
                  </div>
                ))}
              </dd>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-card p-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hours</dt>
                <dd className="mt-0.5 font-medium">{resource.hours}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-card p-3">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How to access</dt>
                <dd className="mt-0.5 leading-relaxed text-muted-foreground">{resource.howTo}</dd>
              </div>
            </div>
          </dl>
        </div>
      )}
    </Card>
  )
}
