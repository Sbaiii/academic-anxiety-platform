"use client"

import { Home, ClipboardList, Compass, CalendarRange } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppView } from "@/lib/app-types"

const NAV: { id: AppView; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "plan", label: "Plan", icon: ClipboardList },
  { id: "campus", label: "Campus", icon: Compass },
  { id: "study", label: "Study", icon: CalendarRange },
]

export function BottomNav({ active, onChange }: { active: AppView; onChange: (v: AppView) => void }) {
  return (
    <nav
      className="glass-nav fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-t-3xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around px-2 pt-2">
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl transition-all",
                  isActive && "bg-primary/10 scale-105",
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} />
              </span>
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
