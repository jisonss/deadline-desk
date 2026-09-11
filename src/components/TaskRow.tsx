import { CheckIcon, FileTextIcon } from 'lucide-react'
import type { Task } from '../types/task'
import { getUrgency, relativeLabel, shortDate, timeLabel } from '../utils/deadlines'
import { subjectColor } from '../utils/subjects'

interface TaskRowProps {
  task: Task
  done: boolean
  now: Date
  showSubject?: boolean
  showDate?: boolean
  onToggle: (id: string) => void
  onViewDetails: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskRow({
  task,
  done,
  now,
  showSubject = true,
  showDate = false,
  onToggle,
  onViewDetails,
  onDelete,
}: TaskRowProps) {
  const urgency = getUrgency(task.deadline, now)
  const color = subjectColor(task.subject)

  return (
    <li className="group flex items-start gap-4 border-b border-line py-4 last:border-b-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-colors duration-150 ease-out ${
          done
            ? 'border-accent bg-accent text-white'
            : 'border-muted/50 text-transparent hover:border-accent hover:text-accent/40'
        }`}
      >
        <CheckIcon className="h-3 w-3" aria-hidden="true" />
        <span className="sr-only">{done ? 'Mark as not done' : 'Mark as done'}</span>
      </button>

      <div className="min-w-0 flex-1">
        {showSubject && (
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 flex-none rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              {task.subject}
            </span>
            {task.kind && (
              <span className="rounded-sm bg-canvas px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                {task.kind}
              </span>
            )}
          </div>
        )}
        <p
          className={`mt-1 text-[15px] leading-snug ${
            done ? 'text-muted line-through' : 'text-ink'
          }`}
        >
          {task.title}
        </p>
        {task.submission && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-muted">
            <FileTextIcon className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden="true" />
            <span>{task.submission}</span>
          </p>
        )}
        {task.note && <p className="mt-1 text-[13px] leading-snug text-muted">{task.note}</p>}
      </div>

      <div className="flex w-32 flex-none flex-col items-end text-right">
        <span className="text-[13px] font-medium text-ink">
          {showDate ? shortDate(task.deadline) : timeLabel(task.deadline) || 'Undated'}
        </span>
        <span
          className={`mt-0.5 text-[12px] ${
            !done && urgency === 'overdue'
              ? 'font-medium text-urgent'
              : !done && (urgency === 'today' || urgency === 'tomorrow')
                ? 'font-medium text-warn'
                : 'text-muted'
          }`}
        >
          {done ? 'Done' : relativeLabel(task.deadline, now)}
            <button
              type="button"
              onClick={() => onViewDetails(task)}
              className="mt-2 text-[11px] font-medium text-accent underline underline-offset-2 hover:text-ink"
            >
              View details
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${task.title}"?`)) {
                  onDelete(task.id)
                }
              }}
              className="mt-1 text-[11px] font-medium text-red-600 underline underline-offset-2 hover:text-red-800"
              >
              Delete
            </button>
        </span>
      </div>
    </li>
  )
}
