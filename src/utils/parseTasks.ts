import type { Task } from '../types/task'
import { parseDeadline } from './deadlines'
import { normalizeText, stripDecoration } from './normalizeText'

type FieldKey = 'deadline' | 'submission' | 'note' | 'title'

const KEY_PATTERNS: { key: FieldKey; re: RegExp }[] = [
  { key: 'deadline', re: /^(deadline|due date|due|dueon|pasahan|deadlines)$/ },
  {
    key: 'submission',
    re: /^(submission|submit|submit to|where|where to submit|platform|format)$/,
  },
  {
    key: 'note',
    re: /^(note|notes|reminder|reminders|instruction|instructions|paalala|panuto)$/,
  },
  {
    key: 'title',
    re: /^(question|task|takda|activity|assignment|project|topic|gawain|requirement|output|quiz|exam|homework)\s*\d*$/,
  },
]

interface KeyLine {
  key: FieldKey
  label: string
  value: string
}

function matchKeyLine(line: string): KeyLine | null {
  const match = line.match(/^([^:\u2013\u2014]{1,32})[:\u2013\u2014]\s*(.*)$/)

  if (!match) return null

  const label = match[1].trim()
  const compact = label
    .toLowerCase()
    .replace(/[.*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const found = KEY_PATTERNS.find((pattern) => pattern.re.test(compact))

  if (!found) return null

  return {
    key: found.key,
    label,
    value: match[2].trim(),
  }
}

function isSubjectHeading(line: string): boolean {
  const letters = line.replace(/[^A-Za-z]/g, '')

  if (letters.length < 3) return false
  if (letters !== letters.toUpperCase()) return false

  if (/[:\u2013\u2014]/.test(line) && matchKeyLine(line)) {
    return false
  }

  return /^[A-Z0-9\s.,'&()/+-]+$/.test(line)
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) =>
      word.length > 2 ? word[0].toUpperCase() + word.slice(1) : word,
    )
    .join(' ')
}

interface Draft {
  subject: string
  kind?: string
  title?: string
  submission?: string
  note?: string
  deadlineRaw?: string
}

export function parseTasks(
  input: string,
  reference: Date = new Date(),
): Task[] {
  const lines = normalizeText(input)
    .split(/\r?\n/)
    .map((line) => stripDecoration(line))
    .filter((line) => line.length > 0)

  const drafts: Draft[] = []

  let subject = 'General'
  let current: Draft | null = null

  const flush = () => {
    if (
      current &&
      (current.title || current.deadlineRaw || current.submission)
    ) {
      drafts.push(current)
    }

    current = null
  }

  const start = (): Draft => ({ subject })

  for (const clean of lines) {
    if (isSubjectHeading(clean)) {
      flush()
      subject = titleCase(clean)
      continue
    }

    const keyLine = matchKeyLine(clean)

    if (!keyLine) {
      if (!current || current.title) {
        flush()
        current = start()
      }

      current.title = clean
      continue
    }

    if (keyLine.key === 'title') {
      if (!current || current.title) {
        flush()
        current = start()
      }

      current.kind = titleCase(keyLine.label)
      current.title = keyLine.value || titleCase(keyLine.label)
      continue
    }

    if (!current) {
      current = start()
    }

    if (keyLine.key === 'deadline') {
      if (current.deadlineRaw) {
        flush()
        current = start()
      }

      current.deadlineRaw = keyLine.value
    } else if (keyLine.key === 'submission') {
      if (current.submission) {
        current.submission = `${current.submission} · ${keyLine.value}`
      } else {
        current.submission = keyLine.value
      }
    } else {
      current.note = current.note
        ? `${current.note} ${keyLine.value}`
        : keyLine.value
    }
  }

  flush()

  const tasks: Task[] = []

  drafts.forEach((draft, index) => {
    const deadline = draft.deadlineRaw
      ? parseDeadline(draft.deadlineRaw, reference)
      : null

    // No valid deadline = do not create a task
    if (!deadline) {
      return
    }

    tasks.push({
      id: `task-${index}-${draft.subject
        .toLowerCase()
        .replace(/\s+/g, '-')}-${deadline.getTime()}`,
      subject: draft.subject,
      kind: draft.kind,
      title: draft.title || draft.kind || 'Requirement',
      submission: draft.submission,
      note: draft.note,
      deadlineRaw: draft.deadlineRaw,
      deadline,
    })
  })

  return tasks
}