import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import type { Task } from '../types/task'
import { TaskRow } from './TaskRow'

interface CompletedListProps {
  tasks: Task[]
  now: Date
  onToggle: (id: string) => void
  onViewDetails: (task: Task) => void
  onDelete: (id: string) => void
}

export function CompletedList({
  tasks,
  now,
  onToggle,
  onViewDetails,
  onDelete,
}: CompletedListProps) {
  const [open, setOpen] = useState(false)
  if (tasks.length === 0) return null

  return (
    <section aria-labelledby="completed-heading" className="border-t border-line pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left text-[13px] font-medium text-muted transition-colors duration-150 ease-out hover:text-ink"
      >
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-150 ease-out ${
            open ? 'rotate-0' : '-rotate-90'
          }`}
          aria-hidden="true"
        />
        <span id="completed-heading">Completed · {tasks.length}</span>
      </button>
      {open && (
        <ul className="mt-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              done
              now={now}
              showDate
              onToggle={onToggle}
              onViewDetails={onViewDetails}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
