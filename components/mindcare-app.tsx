"use client"

import { useState } from "react"
import { ClipboardList, Compass, CalendarRange, LifeBuoy } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { HomeView } from "@/components/home-view"
import { FeatureHeader } from "@/components/feature-header"
import { EmergencyCalmMode } from "@/components/emergency-calm-mode"
import { ActionPlan } from "@/components/action-plan"
import { ResourceNavigator } from "@/components/resource-navigator"
import { StudyCompanion } from "@/components/study-companion"
import type { AppView } from "@/lib/app-types"
import { cn } from "@/lib/utils"

export function MindCareApp() {
  const [view, setView] = useState<AppView>("home")
  const [calmOpen, setCalmOpen] = useState(false)

  return (
    <div className="page-glow mx-auto flex min-h-[100dvh] w-full max-w-md flex-col">
      <header className="sticky top-0 z-30 shrink-0 px-5 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="glass-nav flex items-center justify-between rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold leading-none tracking-tight">MindCare</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Academic anxiety support</p>
            </div>
          </div>
          {view !== "home" && (
            <button
              type="button"
              onClick={() => setView("home")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Home
            </button>
          )}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-28 pt-1">
        <div className={cn("animate-fade-in", view !== "home" && "animate-slide-up")}>
          {view === "home" && <HomeView onNavigate={setView} onOpenCalmMode={() => setCalmOpen(true)} />}
          {view === "plan" && (
            <>
              <FeatureHeader
                icon={ClipboardList}
                title="Action Plan"
                description="Pick what's bothering you, set how intense it feels, then follow your personalized steps."
                accent="teal"
              />
              <ActionPlan onOpenCalmMode={() => setCalmOpen(true)} />
            </>
          )}
          {view === "campus" && (
            <>
              <FeatureHeader
                icon={Compass}
                title="Campus Help"
                description="Find counselling, emergency support, and exactly how to book or walk in."
                accent="blue"
              />
              <ResourceNavigator />
            </>
          )}
          {view === "study" && (
            <>
              <FeatureHeader
                icon={CalendarRange}
                title="Study Companion"
                description="Add deadlines and get an auto-generated schedule with breaks built in."
                accent="violet"
              />
              <StudyCompanion />
            </>
          )}
        </div>
      </main>

      {view !== "home" && !calmOpen && (
        <button
          type="button"
          onClick={() => setCalmOpen(true)}
          aria-label="Open emergency calm mode"
          className="calm-gradient fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-40 flex size-14 items-center justify-center rounded-full text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 sm:right-[max(1.25rem,calc(50%-11rem))]"
        >
          <LifeBuoy className="size-6" />
        </button>
      )}

      <BottomNav active={view} onChange={setView} />

      {calmOpen && <EmergencyCalmMode onClose={() => setCalmOpen(false)} />}
    </div>
  )
}
