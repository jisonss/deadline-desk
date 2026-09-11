import { AlertTriangleIcon } from 'lucide-react'
import type { Task } from '../types/task'
import { getUrgency, shortDate } from '../utils/deadlines'
import { subjectColor } from '../utils/subjects'

interface SubjectSummaryProps {
  tasks: Task[]
  now: Date
  onSelect: (subject: string) => void
}

interface Row {
  subject: string
  count: number
  next: Date | null
  undated: number
}

export function SubjectSummary({ tasks, now, onSelect }: SubjectSummaryProps) {
  const rows = new Map<string, Row>()
  for (const task of tasks) {
    const row = rows.get(task.subject) ?? {
      subject: task.subject,
      count: 0,
      next: null,
      undated: 0,
    }
    row.count += 1
    if (!task.deadline) row.undated += 1
    else if (!row.next || task.deadline < row.next) row.next = task.deadline
    rows.set(task.subject, row)
  }

  const list = Array.from(rows.values()).sort((a, b) => {
    if (!a.next) return 1
    if (!b.next) return -1
    return a.next.getTime() - b.next.getTime()
  })

  const overdue = tasks.filter((task) => getUrgency(task.deadline, now) === 'overdue').length
  const undated = tasks.filter((task) => !task.deadline).length

  return (
    <aside aria-label="Subject overview" className="flex flex-col gap-5">
      {overdue > 0 && (
        <p className="flex items-start gap-2 rounded-lg bg-urgent-soft px-4 py-3 text-[13px] leading-snug text-urgent">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span>
            {overdue === 1 ? '1 task is past its deadline' : `${overdue} tasks are past their deadlines`}
          </span>
        </p>
      )}

      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          By subject
        </h2>
        <ul className="mt-3 flex flex-col">
          {list.map((row) => (
            <li key={row.subject} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(row.subject)}
                className="flex w-full items-start gap-3 py-3 text-left transition-colors duration-150 ease-out hover:text-accent"
              >
                <span
                  className="mt-1.5 h-2 w-2 flex-none rounded-full"
                  style={{ backgroundColor: subjectColor(row.subject) }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {row.subject}
                  </span>
                  <span className="block text-[12px] text-muted">
                    {row.next ? shortDate(row.next) : 'No date found'}
                  </span>
                </span>
                <span className="mt-0.5 text-[12px] text-muted">{row.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {undated > 0 && (
        <p className="text-[12px] leading-relaxed text-muted">
          {undated === 1 ? '1 task had no' : `${undated} tasks had no`} readable deadline — they sit
          at the bottom of the list. Add a line like <span className="text-ink">DEADLINE: Sept 20</span>{' '}
          and paste again.
        </p>
      )}
    </aside>
  )
}
