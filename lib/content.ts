import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Layers,
  Users,
  BatteryLow,
  Moon,
  Phone,
  HeartHandshake,
  CalendarCheck,
  LifeBuoy,
} from "lucide-react"

export type Intensity = "mild" | "moderate" | "intense"

export type PlanStep = {
  text: string
  timerMinutes?: number
  openCalmMode?: boolean
}

export type ActionPlan = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  intro: string
  steps: PlanStep[]
}

export function personalizePlan(plan: ActionPlan, intensity: Intensity): { intro: string; steps: PlanStep[] } {
  const intro =
    intensity === "intense"
      ? `${plan.intro} Take it one small step — start with whatever feels doable right now.`
      : intensity === "mild"
        ? `${plan.intro} Keep it light today — even one step counts.`
        : plan.intro

  if (intensity === "mild") {
    return { intro, steps: plan.steps.slice(0, 3) }
  }

  if (intensity === "intense") {
    return {
      intro,
      steps: [
        { text: "Pause for 60 seconds — open Calm Mode and breathe before anything else.", openCalmMode: true },
        ...plan.steps,
        { text: "Check in with yourself: did anything feel even slightly easier?", openCalmMode: false },
      ],
    }
  }

  return { intro, steps: plan.steps }
}

export const ACTION_PLANS: ActionPlan[] = [
  {
    id: "exam-stress",
    label: "Exam stress",
    description: "Feeling the pressure of upcoming tests",
    icon: BookOpen,
    intro: "Exams feel huge, but they shrink when you break them down. Try these now:",
    steps: [
      { text: "Write down exactly which exam is worrying you most." },
      { text: "Study one topic for 20 focused minutes — phone away.", timerMinutes: 20 },
      { text: "Take a 5-minute walk or stretch break.", timerMinutes: 5 },
      { text: "Make a tiny revision checklist for tomorrow." },
      { text: "Remind yourself: one exam does not define you." },
    ],
  },
  {
    id: "assignment-overload",
    label: "Assignment overload",
    description: "Too many tasks, not enough time",
    icon: Layers,
    intro: "When everything feels urgent, do the next small thing — not all of it.",
    steps: [
      { text: "Complete one task within 15 minutes.", timerMinutes: 15 },
      { text: "Take a 5-minute break to reset.", timerMinutes: 5 },
      { text: "Prioritize the most urgent assignment first." },
      { text: "Plan tomorrow's schedule before you stop for the day." },
      { text: "Ask for an extension if you genuinely need one — that's allowed." },
    ],
  },
  {
    id: "social-anxiety",
    label: "Social anxiety",
    description: "Nervous around classmates or speaking up",
    icon: Users,
    intro: "Social worry is common. Small, safe steps build comfort over time.",
    steps: [
      { text: "Take 3 slow breaths before entering the room.", openCalmMode: true },
      { text: "Set one small goal — say hi to one person." },
      { text: "Prepare a question you can ask if conversation stalls." },
      { text: "Remind yourself most people are focused on themselves, not judging you." },
      { text: "Reward yourself afterward, no matter how it went." },
    ],
  },
  {
    id: "lack-of-motivation",
    label: "Lack of motivation",
    description: "Struggling to get started",
    icon: BatteryLow,
    intro: "Motivation often comes after starting, not before. Lower the bar:",
    steps: [
      { text: "Commit to just 2 minutes on the task.", timerMinutes: 2 },
      { text: "Clear your desk of distractions." },
      { text: "Put your phone in another room." },
      { text: "Pair the task with something nice — a drink or music." },
      { text: "Celebrate finishing, even something small." },
    ],
  },
  {
    id: "sleep-issues",
    label: "Sleep issues",
    description: "Trouble winding down or resting",
    icon: Moon,
    intro: "Good rest is academic support too. Set up tonight for better sleep:",
    steps: [
      { text: "Set a screen-off time 45 minutes before bed." },
      { text: "Dim the lights and lower the room temperature." },
      { text: "Write tomorrow's worries on paper to park them." },
      { text: "Try the 60-second breathing exercise in Calm Mode.", openCalmMode: true },
      { text: "Keep a consistent wake-up time, even after a rough night." },
    ],
  },
]

export type ContactLine = {
  label: string
  value: string
  href: string
}

export type CampusResource = {
  id: string
  name: string
  category: "Counselling" | "Emergency" | "Academic" | "Wellbeing"
  description: string
  contacts: ContactLine[]
  hours: string
  howTo: string
  icon: LucideIcon
  urgent?: boolean
}

export const CAMPUS_RESOURCES: CampusResource[] = [
  {
    id: "crisis-line",
    name: "24/7 Crisis Support Line",
    category: "Emergency",
    description: "Immediate, confidential support if you are in distress or crisis at any hour.",
    contacts: [
      { label: "Call", value: "988 (Suicide & Crisis Lifeline)", href: "tel:988" },
      { label: "Text", value: "HOME to 741741", href: "sms:741741&body=HOME" },
    ],
    hours: "Open 24 hours, every day",
    howTo: "Call or text now — no appointment needed. You can stay anonymous.",
    icon: LifeBuoy,
    urgent: true,
  },
  {
    id: "counselling",
    name: "Student Counselling Centre",
    category: "Counselling",
    description: "Free, confidential one-on-one counselling with licensed professionals.",
    contacts: [
      { label: "Email", value: "counselling@campus.edu", href: "mailto:counselling@campus.edu" },
      { label: "Phone", value: "(555) 012-3400", href: "tel:+15550123400" },
    ],
    hours: "Mon–Fri, 9:00am – 5:00pm",
    howTo: "Book online through the student portal or call to schedule an intake session.",
    icon: HeartHandshake,
  },
  {
    id: "drop-in",
    name: "Wellbeing Drop-In Hours",
    category: "Wellbeing",
    description: "No-appointment-needed sessions to talk things through with a wellbeing advisor.",
    contacts: [
      { label: "Email", value: "wellbeing@campus.edu", href: "mailto:wellbeing@campus.edu" },
      { label: "Location", value: "Room 120, Student Union", href: "#" },
    ],
    hours: "Mon, Wed, Fri · 11:00am – 2:00pm",
    howTo: "Just walk in during drop-in hours. First come, first served.",
    icon: Users,
  },
  {
    id: "academic-advising",
    name: "Academic Advising Office",
    category: "Academic",
    description: "Help with workload, deadlines, extensions, and study planning when things pile up.",
    contacts: [
      { label: "Email", value: "advising@campus.edu", href: "mailto:advising@campus.edu" },
      { label: "Phone", value: "(555) 012-3422", href: "tel:+15550123422" },
    ],
    hours: "Mon–Fri, 8:30am – 4:30pm",
    howTo: "Email to request a meeting or book a slot through the advising portal.",
    icon: CalendarCheck,
  },
  {
    id: "after-hours",
    name: "Campus Security & Welfare",
    category: "Emergency",
    description: "On-campus support and safe escorts, available outside normal office hours.",
    contacts: [{ label: "Phone", value: "(555) 012-3911", href: "tel:+15550123911" }],
    hours: "Open 24 hours",
    howTo: "Call directly for urgent on-campus welfare concerns.",
    icon: Phone,
    urgent: true,
  },
]
