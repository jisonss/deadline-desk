import { CheckIcon, ClockIcon, FileTextIcon } from 'lucide-react'
import type { Task } from '../types/task'
import { getUrgency, relativeLabel, shortDate, timeLabel } from '../utils/deadlines'
import { subjectColor } from '../utils/subjects'

interface NextUpPanelProps {
  task: Task
  now: Date
  remaining: number
  onToggle: (id: string) => void
}

export function NextUpPanel({ task, now, remaining, onToggle }: NextUpPanelProps) {
  const urgency = getUrgency(task.deadline, now)
  const isHot = urgency === 'overdue' || urgency === 'today' || urgency === 'tomorrow'

  return (
    <section
      aria-labelledby="next-up-heading"
      className="rounded-xl border border-line bg-surface p-6 md:p-8"
      style={{ borderLeft: `4px solid ${subjectColor(task.subject)}` }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="next-up-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"
        >
          Next up
        </h2>
        <span className="text-[12px] text-muted">
          {remaining === 1 ? '1 task left' : `${remaining} tasks left`}
        </span>
      </div>

      <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: subjectColor(task.subject) }}>
        {task.subject}
        {task.kind ? ` · ${task.kind}` : ''}
      </p>
      <p className="mt-2 font-display text-3xl leading-tight text-ink md:text-4xl">{task.title}</p>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p
            className={`font-display text-4xl leading-none ${
              isHot ? 'text-urgent' : 'text-accent'
            }`}
          >
            {relativeLabel(task.deadline, now)}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
            <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {shortDate(task.deadline)}
            {timeLabel(task.deadline) ? ` · ${timeLabel(task.deadline)}` : ''}
            {task.deadlineRaw ? ` · from "${task.deadlineRaw}"` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className="inline-flex items-center gap-2 rounded-md border border-ink px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-ink hover:text-canvas"
        >
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
          Mark done
        </button>
      </div>

      {task.submission && (
        <p className="mt-6 flex items-start gap-2 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
          <FileTextIcon className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden="true" />
          <span>{task.submission}</span>
        </p>
      )}
    </section>
  )
}
