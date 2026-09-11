import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  startOfDay,
} from 'date-fns'

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  sept: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

const WEEKDAYS: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  tues: 2,
  wed: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  fri: 5,
  sat: 6,
}

const MONTH_NAMES =
  'jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december'

interface TimeOfDay {
  hour: number
  minute: number
  explicit: boolean
}

function parseTimeOfDay(text: string): TimeOfDay {
  const meridiem = text.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)/
  )

  if (meridiem) {
    let hour = parseInt(meridiem[1], 10) % 12

    if (meridiem[3].startsWith('p')) {
      hour += 12
    }

    return {
      hour,
      minute: meridiem[2] ? parseInt(meridiem[2], 10) : 0,
      explicit: true,
    }
  }

  const clock = text.match(/\b(\d{1,2}):(\d{2})\b/)

  if (clock) {
    return {
      hour: parseInt(clock[1], 10),
      minute: parseInt(clock[2], 10),
      explicit: true,
    }
  }

  if (/\bnoon\b/.test(text)) {
    return {
      hour: 12,
      minute: 0,
      explicit: true,
    }
  }

  if (/\bmidnight\b/.test(text)) {
    return {
      hour: 23,
      minute: 59,
      explicit: true,
    }
  }

  // No time given: treat the deadline as end of day.
  return {
    hour: 23,
    minute: 59,
    explicit: false,
  }
}

function monthKey(raw: string): number {
  const key = raw.slice(0, 4).toLowerCase()

  if (MONTHS[key] !== undefined) {
    return MONTHS[key]
  }

  return MONTHS[raw.slice(0, 3).toLowerCase()] ?? -1
}

function weekdayIn(text: string): number | undefined {
  const match = text.match(
    /\b(sunday|sun|monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thurs|thur|thu|friday|fri|saturday|sat)\b/
  )

  if (!match) {
    return undefined
  }

  const raw = match[1]

  return (
    WEEKDAYS[raw.slice(0, 5)] ??
    WEEKDAYS[raw.slice(0, 4)] ??
    WEEKDAYS[raw.slice(0, 3)]
  )
}

/**
 * Picks the year that makes a month/day pair land closest to "now", preferring
 * a year where the stated weekday actually matches and the date is not in the past.
 */
function resolveYear(
  month: number,
  day: number,
  time: TimeOfDay,
  weekday: number | undefined,
  reference: Date,
): Date | null {
  const base = reference.getFullYear()

  let best: { date: Date; penalty: number } | null = null

  for (const year of [base - 1, base, base + 1]) {
    const candidate = new Date(
      year,
      month,
      day,
      time.hour,
      time.minute,
      0,
      0,
    )

    if (
      candidate.getMonth() !== month ||
      candidate.getDate() !== day
    ) {
      continue
    }

    const diff = differenceInCalendarDays(candidate, reference)

    let penalty = Math.abs(diff)

    if (
      weekday !== undefined &&
      candidate.getDay() !== weekday
    ) {
      penalty += 500
    }

    if (diff < -7) {
      penalty += 220
    }

    if (!best || penalty < best.penalty) {
      best = {
        date: candidate,
        penalty,
      }
    }
  }

  return best ? best.date : null
}

function nextWeekday(
  weekday: number,
  time: TimeOfDay,
  reference: Date,
): Date {
  let cursor = startOfDay(reference)

  for (let i = 0; i < 7; i += 1) {
    if (cursor.getDay() === weekday) {
      break
    }

    cursor = addDays(cursor, 1)
  }

  const candidate = new Date(cursor)

  candidate.setHours(
    time.hour,
    time.minute,
    0,
    0,
  )

  return candidate < reference
    ? addDays(candidate, 7)
    : candidate
}

/**
 * Turns free-form deadline text
 * ("Fri, Sept 11", "9/12 5pm", "tomorrow")
 * into a Date.
 */
export function parseDeadline(
  raw: string,
  reference: Date,
): Date | null {
  const text = raw.toLowerCase()

  const time = parseTimeOfDay(text)
  const weekday = weekdayIn(text)

  // Example: Sept 11
  const monthFirst = text.match(
    new RegExp(
      '\\b(' +
        MONTH_NAMES +
        ')\\.?\\s+(\\d{1,2})\\b',
    ),
  )

  if (monthFirst) {
    const month = monthKey(monthFirst[1])

    if (month >= 0) {
      return resolveYear(
        month,
        parseInt(monthFirst[2], 10),
        time,
        weekday,
        reference,
      )
    }
  }

  // Example: 11 Sept / 11th of September
  const dayFirst = text.match(
    new RegExp(
      '\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(' +
        MONTH_NAMES +
        ')\\b',
    ),
  )

  if (dayFirst) {
    const month = monthKey(dayFirst[2])

    if (month >= 0) {
      return resolveYear(
        month,
        parseInt(dayFirst[1], 10),
        time,
        weekday,
        reference,
      )
    }
  }

  // Example: 9/12 or 9-12 or 9.12
  const numeric = text.match(
    /\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/,
  )

  if (numeric) {
    const month = parseInt(numeric[1], 10) - 1
    const day = parseInt(numeric[2], 10)

    if (
      month >= 0 &&
      month <= 11 &&
      day >= 1 &&
      day <= 31
    ) {
      if (numeric[3]) {
        const rawYear = parseInt(numeric[3], 10)

        const year =
          rawYear < 100
            ? 2000 + rawYear
            : rawYear

        return new Date(
          year,
          month,
          day,
          time.hour,
          time.minute,
          0,
          0,
        )
      }

      return resolveYear(
        month,
        day,
        time,
        weekday,
        reference,
      )
    }
  }

  // Today
  if (/\btoday\b|\btonight\b|\bngayon\b/.test(text)) {
    const today = startOfDay(reference)

    today.setHours(
      time.hour,
      time.minute,
      0,
      0,
    )

    return today
  }

  // Tomorrow
  if (/\btomorrow\b|\bbukas\b/.test(text)) {
    const day = addDays(
      startOfDay(reference),
      1,
    )

    day.setHours(
      time.hour,
      time.minute,
      0,
      0,
    )

    return day
  }

  // Weekday
  if (weekday !== undefined) {
    return nextWeekday(
      weekday,
      time,
      reference,
    )
  }

  return null
}

export type Urgency =
  | 'overdue'
  | 'today'
  | 'tomorrow'
  | 'soon'
  | 'later'
  | 'undated'

export function getUrgency(
  deadline: Date | null,
  now: Date,
): Urgency {
  if (!deadline) {
    return 'undated'
  }

  if (deadline.getTime() < now.getTime()) {
    return 'overdue'
  }

  const days = differenceInCalendarDays(
    deadline,
    now,
  )

  if (days <= 0) {
    return 'today'
  }

  if (days === 1) {
    return 'tomorrow'
  }

  if (days <= 3) {
    return 'soon'
  }

  return 'later'
}

export function relativeLabel(
  deadline: Date | null,
  now: Date,
): string {
  if (!deadline) {
    return 'No date found'
  }

  const days = differenceInCalendarDays(
    deadline,
    now,
  )

  if (deadline.getTime() < now.getTime()) {
    const late = Math.abs(days)

    if (late === 0) {
      return 'Past due today'
    }

    return late === 1
      ? '1 day late'
      : `${late} days late`
  }

  if (days <= 0) {
    return 'Due today'
  }

  if (days === 1) {
    return 'Due tomorrow'
  }

  if (days <= 6) {
    return `In ${days} days`
  }

  const weeks = Math.round(days / 7)

  return weeks <= 1
    ? 'In 1 week'
    : `In ${weeks} weeks`
}

export function dayHeading(
  deadline: Date | null,
  now: Date,
): string {
  if (!deadline) {
    return 'No date detected'
  }

  if (isSameDay(deadline, now)) {
    return `Today · ${format(deadline, 'EEEE, MMM d')}`
  }

  if (
    isSameDay(
      deadline,
      addDays(now, 1),
    )
  ) {
    return `Tomorrow · ${format(
      deadline,
      'EEEE, MMM d',
    )}`
  }

  return format(
    deadline,
    'EEEE, MMM d',
  )
}

export function dayKey(
  deadline: Date | null,
): string {
  return deadline
    ? format(deadline, 'yyyy-MM-dd')
    : 'zzz-undated'
}

export function timeLabel(
  deadline: Date | null,
): string {
  if (!deadline) {
    return ''
  }

  const isEndOfDay =
    deadline.getHours() === 23 &&
    deadline.getMinutes() === 59

  return isEndOfDay
    ? 'End of day'
    : format(deadline, 'h:mm a')
}

export function shortDate(
  deadline: Date | null,
): string {
  return deadline
    ? format(deadline, 'EEE, MMM d')
    : 'Undated'
}