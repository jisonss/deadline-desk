import {
  CheckIcon,
  Clock3Icon,
  EyeIcon,
  FileTextIcon,
  Trash2Icon,
} from 'lucide-react'
import type { Task } from '../types/task'
import {
  getUrgency,
  relativeLabel,
  shortDate,
  timeLabel,
} from '../utils/deadlines'
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

  const urgent =
    !done && (urgency === 'today' || urgency === 'tomorrow')

  const overdue = !done && urgency === 'overdue'

  return (
    <li
      className={`group relative overflow-hidden rounded-2xl border border-line/70 bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-line hover:shadow-md sm:p-5 ${
        done ? 'opacity-60' : ''
      }`}
    >
      <span
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start gap-3 pl-1 sm:gap-4">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 transition-all duration-200 ${
            done
              ? 'border-accent bg-accent text-white'
              : 'border-muted/40 bg-surface text-transparent hover:scale-105 hover:border-accent hover:bg-accent/5 hover:text-accent/50'
          }`}
        >
          <CheckIcon className="h-3.5 w-3.5" />

          <span className="sr-only">
            {done ? 'Mark as not done' : 'Mark as done'}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          {showSubject && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                {task.subject}
              </span>

              {task.kind && (
                <span className="rounded-full bg-canvas px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted">
                  {task.kind}
                </span>
              )}
            </div>
          )}

          <p
            className={`text-[15px] font-semibold leading-snug sm:text-base ${
              done
                ? 'text-muted line-through'
                : 'text-ink group-hover:text-accent'
            }`}
          >
            {task.title}
          </p>

          {task.submission && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-canvas px-3 py-2.5">
              <FileTextIcon className="mt-0.5 h-4 w-4 flex-none text-muted" />

              <span className="text-xs leading-relaxed text-muted">
                {task.submission}
              </span>
            </div>
          )}

          {task.note && (
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {task.note}
            </p>
          )}

          <div className="mt-3 flex gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => onViewDetails(task)}
              className="flex items-center gap-1.5 rounded-lg bg-canvas px-3 py-2 text-[11px] font-semibold text-accent transition hover:bg-accent hover:text-white"
            >
              <EyeIcon className="h-3.5 w-3.5" />
              Details
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${task.title}"?`)) {
                  onDelete(task.id)
                }
              }}
              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              <Trash2Icon className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>

        <div className="flex w-auto flex-none flex-col items-end text-right sm:w-32">
          <div
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 ${
              overdue
                ? 'bg-red-50'
                : urgent
                  ? 'bg-amber-50'
                  : 'bg-canvas'
            }`}
          >
            <Clock3Icon
              className={`h-3.5 w-3.5 ${
                overdue
                  ? 'text-red-600'
                  : urgent
                    ? 'text-amber-600'
                    : 'text-muted'
              }`}
            />

            <span className="text-[11px] font-bold text-ink sm:text-xs">
              {showDate
                ? shortDate(task.deadline)
                : timeLabel(task.deadline) || 'Undated'}
            </span>
          </div>

          <span
            className={`mt-1.5 text-[10px] font-semibold sm:text-[11px] ${
              overdue
                ? 'text-red-600'
                : urgent
                  ? 'text-amber-600'
                  : 'text-muted'
            }`}
          >
            {done ? 'Completed' : relativeLabel(task.deadline, now)}
          </span>

          <div className="mt-2 hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => onViewDetails(task)}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-accent transition hover:bg-accent/10"
            >
              <EyeIcon className="h-3 w-3" />
              Details
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${task.title}"?`)) {
                  onDelete(task.id)
                }
              }}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2Icon className="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
