import { XIcon } from 'lucide-react'
import { format } from 'date-fns'
import type { Task } from '../types/task'

interface TaskDetailsProps {
  task: Task
  onClose: () => void
}

export function TaskDetails({
  task,
  onClose,
}: TaskDetailsProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        className="w-full max-w-lg rounded-xl border border-line bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {task.subject}
            </p>

            <h2 className="mt-2 font-display text-3xl leading-tight text-ink">
              {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-line hover:text-ink"
          >
            <XIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Deadline
            </p>

            <p className="mt-1 text-lg font-medium text-ink">
              {task.deadline
                ? format(task.deadline, 'EEEE, MMMM d, yyyy')
                : 'No deadline'}
            </p>

            {task.deadline && (
              <p className="mt-1 text-sm text-muted">
                {format(task.deadline, 'h:mm a')}
              </p>
            )}

            {task.deadlineRaw && (
              <p className="mt-2 text-xs text-muted">
                Original: {task.deadlineRaw}
              </p>
            )}
          </section>

          {task.kind && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Type
              </p>

              <p className="mt-1 text-sm text-ink">
                {task.kind}
              </p>
            </section>
          )}

          {task.submission && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Submission
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {task.submission}
              </p>
            </section>
          )}

          {task.note && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Notes
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {task.note}
              </p>
            </section>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-accent"
        >
          Close
        </button>
      </div>
    </div>
  )
}