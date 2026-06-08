export type TaskType = "assignment" | "exam" | "presentation"

export type StudyTask = {
  id: string
  title: string
  type: TaskType
  due: string
  done: boolean
}

export type ScheduleBlock = {
  id: string
  label: string
  taskTitle?: string
  taskType?: TaskType
  isBreak: boolean
  reminder?: string
}

export type DaySchedule = {
  date: string
  dayLabel: string
  blocks: ScheduleBlock[]
}

function addDays(base: Date, n: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatDayLabel(d: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function sessionsForType(type: TaskType, daysLeft: number) {
  const base = type === "exam" ? 3 : type === "presentation" ? 2 : 2
  if (daysLeft <= 1) return Math.max(base, 2)
  if (daysLeft <= 3) return base + 1
  return base
}

export function buildWeekSchedule(tasks: StudyTask[]): DaySchedule[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const pending = tasks.filter((t) => !t.done)

  const days: DaySchedule[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i)
    return { date: toDateKey(d), dayLabel: formatDayLabel(d), blocks: [] }
  })

  if (pending.length === 0) return days

  for (const task of pending) {
    const due = new Date(task.due + "T00:00:00")
    const daysLeft = Math.max(1, Math.round((due.getTime() - today.getTime()) / 86400000))
    const sessions = sessionsForType(task.type, daysLeft)
    const typeLabel = task.type === "exam" ? "Review" : task.type === "presentation" ? "Prep" : "Work on"

    for (let s = 0; s < sessions; s++) {
      const offset = Math.min(
        6,
        Math.max(0, Math.floor(((s + 1) / (sessions + 1)) * Math.min(daysLeft, 7)) - 1),
      )
      const scheduleDay = days[offset]
      if (!scheduleDay) continue

      scheduleDay.blocks.push({
        id: `${task.id}-${s}`,
        label: `${typeLabel}: ${task.title}`,
        taskTitle: task.title,
        taskType: task.type,
        isBreak: false,
        reminder: s === 0 ? "Start early — avoid last-minute cramming" : undefined,
      })

      scheduleDay.blocks.push({
        id: `${task.id}-${s}-break`,
        label: "5-min break — stretch & hydrate",
        isBreak: true,
        reminder: "Break reminder after 25 min focus",
      })
    }
  }

  for (const day of days) {
    day.blocks.sort((a, b) => Number(a.isBreak) - Number(b.isBreak))
  }

  return days.filter((d) => d.blocks.length > 0)
}

export function workloadSummary(pending: StudyTask[]) {
  if (pending.length === 0) return null
  const dueThisWeek = pending.filter((t) => {
    const n = Math.round((new Date(t.due + "T00:00:00").getTime() - Date.now()) / 86400000)
    return n >= 0 && n <= 7
  }).length
  const heavy = dueThisWeek >= 3
  return {
    dueThisWeek,
    heavy,
    message: heavy
      ? `${dueThisWeek} items due this week — your schedule spreads them across study blocks with built-in breaks.`
      : `${pending.length} upcoming item${pending.length === 1 ? "" : "s"} — steady progress beats cramming.`,
  }
}
