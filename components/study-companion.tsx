"use client"

import { useMemo, useState } from "react"
import {
  Plus,
  Trash2,
  CalendarClock,
  GraduationCap,
  Presentation,
  FileText,
  Check,
  Coffee,
  Lightbulb,
  Bell,
  CalendarDays,
  ListTodo,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/lib/use-local-storage"
import { buildWeekSchedule, workloadSummary, type StudyTask, type TaskType } from "@/lib/study-schedule"

const TYPE_META: Record<TaskType, { label: string; icon: typeof FileText; color: string }> = {
  assignment: { label: "Assignment", icon: FileText, color: "text-primary" },
  exam: { label: "Exam", icon: GraduationCap, color: "text-amber-600" },
  presentation: { label: "Presentation", icon: Presentation, color: "text-violet-600" },
}

type StudyTab = "tasks" | "schedule"

function daysUntil(due: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(due + "T00:00:00")
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

function formatDue(due: string) {
  const n = daysUntil(due)
  if (n < 0) return `${Math.abs(n)}d overdue`
  if (n === 0) return "Due today"
  if (n === 1) return "Due tomorrow"
  return `${n} days left`
}

function buildSuggestions(pending: StudyTask[]): { text: string; break?: boolean }[] {
  if (pending.length === 0) return []
  const out: { text: string; break?: boolean }[] = []
  const sorted = [...pending].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
  const next = sorted[0]
  const n = daysUntil(next.due)

  out.push({
    text:
      n <= 0
        ? `"${next.title}" is due now — one 25-minute sprint first.`
        : `Start "${next.title}" — closest deadline in ${n} day${n === 1 ? "" : "s"}.`,
  })

  const dueSoon = sorted.filter((t) => daysUntil(t.due) <= 7).length
  if (dueSoon >= 3) {
    out.push({ text: `${dueSoon} items this week — follow your schedule, one block at a time.` })
  } else {
    out.push({ text: "Aim for 2–3 focused blocks today, one task each." })
  }

  out.push({ text: "5-min break after every 25 minutes — stretch & hydrate.", break: true })

  return out
}

export function StudyCompanion() {
  const [tasks, setTasks] = useLocalStorage<StudyTask[]>("mindcare:study:tasks", [])
  const [tab, setTab] = useState<StudyTab>("tasks")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<TaskType>("assignment")
  const [due, setDue] = useState("")

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()),
    [tasks],
  )
  const pending = sorted.filter((t) => !t.done)
  const schedule = useMemo(() => buildWeekSchedule(pending), [pending])
  const summary = useMemo(() => workloadSummary(pending), [pending])
  const suggestions = useMemo(() => buildSuggestions(pending), [pending])

  const addTask = () => {
    if (!title.trim() || !due) return
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), title: title.trim(), type, due, done: false }])
    setTitle("")
    setDue("")
    setType("assignment")
    setTab("schedule")
  }

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const remove = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id))

  return (
    <div>
      {/* Segmented control */}
      <div className="mb-5 flex rounded-2xl bg-secondary p-1">
        {(
          [
            { id: "tasks" as const, label: "My Tasks", icon: ListTodo },
            { id: "schedule" as const, label: "Schedule", icon: CalendarDays },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all",
              tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
            {id === "schedule" && pending.length > 0 && (
              <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "tasks" && (
        <div className="animate-fade-in space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <p className="text-sm font-semibold">Add a deadline</p>
              <p className="text-xs text-muted-foreground">Assignments, exams, or presentations</p>
            </div>
            <div className="space-y-3 p-4">
              <div className="grid gap-1.5">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  placeholder="e.g. Psychology essay"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="task-type">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                    <SelectTrigger id="task-type" className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="task-due">Due date</Label>
                  <Input
                    id="task-due"
                    type="date"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button onClick={addTask} disabled={!title.trim() || !due} className="w-full rounded-xl py-5 text-sm font-semibold">
                <Plus className="mr-1.5 size-4" />
                Add & generate schedule
              </Button>
            </div>
          </Card>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your deadlines ({pending.length} active)
            </p>
            {sorted.length === 0 ? (
              <Card className="border-dashed bg-muted/20 p-8 text-center">
                <CalendarClock className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">No tasks yet. Add one above to get started.</p>
              </Card>
            ) : (
              <ul className="space-y-2">
                {sorted.map((t) => {
                  const Icon = TYPE_META[t.type].icon
                  const n = daysUntil(t.due)
                  const urgent = !t.done && n <= 2
                  return (
                    <li key={t.id}>
                      <Card className={cn("flex items-center gap-3 p-3.5", t.done && "opacity-50")}>
                        <button
                          type="button"
                          onClick={() => toggle(t.id)}
                          aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            t.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30",
                          )}
                        >
                          {t.done && <Check className="size-4" />}
                        </button>
                        <Icon className={cn("size-4 shrink-0", TYPE_META[t.type].color)} />
                        <div className="min-w-0 flex-1">
                          <p className={cn("truncate text-sm font-medium", t.done && "line-through")}>{t.title}</p>
                          <p className="text-xs text-muted-foreground">{TYPE_META[t.type].label}</p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                            t.done
                              ? "bg-secondary text-secondary-foreground"
                              : urgent
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary",
                          )}
                        >
                          {t.done ? "Done" : formatDue(t.due)}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(t.id)}
                          aria-label="Remove task"
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </Card>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "schedule" && (
        <div className="animate-fade-in space-y-5">
          {summary && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4">
              <p className="flex items-start gap-2.5 text-sm">
                <Bell className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="font-semibold">Workload balance · </span>
                  <span className="text-muted-foreground">{summary.message}</span>
                </span>
              </p>
            </Card>
          )}

          {schedule.length === 0 ? (
            <Card className="border-dashed bg-muted/20 p-8 text-center">
              <CalendarDays className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium">No schedule yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add tasks first — we&apos;ll build your study plan automatically.</p>
              <Button variant="secondary" size="sm" className="mt-4 rounded-xl" onClick={() => setTab("tasks")}>
                Add a task
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {schedule.map((day) => (
                <Card key={day.date} className="overflow-hidden p-0">
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                    <p className="text-sm font-semibold">{day.dayLabel}</p>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {day.blocks.filter((b) => !b.isBreak).length} sessions
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {day.blocks.map((block) => (
                      <li
                        key={block.id}
                        className={cn("flex items-start gap-3 px-4 py-3 text-sm", block.isBreak && "bg-amber-50/80 dark:bg-amber-950/20")}
                      >
                        {block.isBreak ? (
                          <Coffee className="mt-0.5 size-4 shrink-0 text-amber-600" />
                        ) : (
                          <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
                        )}
                        <div>
                          <p className={cn(!block.isBreak && "font-medium")}>{block.label}</p>
                          {block.reminder && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Bell className="size-3" />
                              {block.reminder}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}

          {pending.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Lightbulb className="size-3.5" />
                Smart tips
              </p>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <Card key={i} className="flex items-start gap-3 p-3.5">
                    {s.break ? (
                      <Coffee className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    ) : (
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                    )}
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
