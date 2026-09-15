
import type { Task } from '../types/task'
import { parseDeadline } from './deadlines'
import { normalizeText, stripDecoration } from './normalizeText'

type FieldKey =
  | 'subject'
  | 'deadline'
  | 'submission'
  | 'note'
  | 'title'

const KEY_PATTERNS: { key: FieldKey; re: RegExp }[] = [
  {
    key: 'subject',
    re: /^(subject|subject name|subject title)$/,
  },
  {
    key: 'deadline',
    re: /^(deadline|due date|due|dueon|pasahan|deadlines)$/,
  },
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
    re: /^(title|question|task|takda|activity|assignment|project|topic|gawain|requirement|output|quiz|exam|homework)\s*\d*$/,
  },
]

interface KeyLine {
  key: FieldKey
  label: string
  value: string
}

function matchKeyLine(line: string): KeyLine | null {
  const match = line.match(
    /^([^:\u2013\u2014]{1,64})[:\u2013\u2014]\s*(.*)$/,
  )

  if (!match) return null

  const label = match[1].trim()

  const compact = label
    .toLowerCase()
    .replace(/[.*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const found = KEY_PATTERNS.find((pattern) =>
    pattern.re.test(compact),
  )

  if (!found) return null

  return {
    key: found.key,
    label,
    value: match[2].trim(),
  }
}

/*
 * This is kept for backward compatibility.
 *
 * It can still recognize an old-style subject such as:
 *
 * PATHFIT
 * MATHEMATICS
 * COMPUTER PROGRAMMING
 *
 * However, the preferred format is:
 *
 * Subject: PATHFIT
 *
 * This also avoids depending on ASCII uppercase for
 * Unicode subjects such as 𝐏𝐀𝐓𝐇𝐅𝐈𝐓.
 */
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
      word.length > 2
        ? word[0].toUpperCase() + word.slice(1)
        : word,
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
      (current.title ||
        current.deadlineRaw ||
        current.submission)
    ) {
      drafts.push(current)
    }

    current = null
  }

  const start = (): Draft => ({
    subject,
  })

  for (const clean of lines) {
    const keyLine = matchKeyLine(clean)

    /*
     * NEW TEMPLATE:
     *
     * Subject: 𝐏𝐀𝐓𝐇𝐅𝐈𝐓
     *
     * The value after "Subject:" is accepted exactly
     * as written, including Unicode/fancy characters.
     */
    if (keyLine?.key === 'subject') {
      flush()

      subject = keyLine.value.trim()

      continue
    }

    /*
     * OLD SUBJECT FORMAT:
     *
     * PATHFIT
     * MATHEMATICS
     *
     * This is still supported.
     */
    if (isSubjectHeading(clean)) {
      flush()

      subject = titleCase(clean)

      continue
    }

    /*
     * Ignore unstructured text before a valid subject.
     *
     * This prevents random announcement text from being
     * automatically treated as a subject.
     */
    if (!keyLine && subject === 'General' && !current) {
      continue
    }

    /*
     * Normal non-key line.
     */
    if (!keyLine) {
      if (!current || current.title) {
        flush()
        current = start()
      }

      current.title = clean

      continue
    }

    /*
     * TITLE
     *
     * Title: Activity 1
     * Question: What is...
     * Task: Create a program
     */
    if (keyLine.key === 'title') {
      if (!current || current.title) {
        flush()
        current = start()
      }

      current.kind =
        keyLine.label.toLowerCase() === 'title'
          ? undefined
          : titleCase(keyLine.label)

      current.title =
        keyLine.value || titleCase(keyLine.label)

      continue
    }

    /*
     * Create a task if the announcement starts with
     * Submission or Deadline.
     */
    if (!current) {
      current = start()
    }

    /*
     * SUBMISSION
     */
    if (keyLine.key === 'submission') {
      if (current.submission) {
        current.submission =
          `${current.submission} · ${keyLine.value}`
      } else {
        current.submission = keyLine.value
      }

      continue
    }

    /*
     * DEADLINE
     */
    if (keyLine.key === 'deadline') {
      if (current.deadlineRaw) {
        flush()
        current = start()
      }

      current.deadlineRaw = keyLine.value

      continue
    }

    /*
     * NOTE
     */
    if (keyLine.key === 'note') {
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
      id: `task-${Date.now()}-${index}-${draft.subject
        .toLowerCase()
        .replace(/\s+/g, '-')}`,

      subject: draft.subject,

      kind: draft.kind,

      title:
        draft.title ||
        draft.kind ||
        'Requirement',

      submission: draft.submission,

      note: draft.note,

      deadlineRaw: draft.deadlineRaw,

      deadline,
    })
  })

  return tasks
}
