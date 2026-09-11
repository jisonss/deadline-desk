import type { Task } from '../types/task'
import { dayHeading, dayKey, getUrgency, shortDate } from '../utils/deadlines'
import { subjectColor } from '../utils/subjects'
import { TaskRow } from './TaskRow'

export type GroupMode = 'date' | 'subject'

interface DeadlineGroupsProps {
  tasks: Task[]
  now: Date
  groupBy: GroupMode
  onToggle: (id: string) => void
  onViewDetails: (task: Task) => void
  onDelete: (id: string) => void
}

interface Group {
  key: string
  heading: string
  meta?: string
  accent?: string
  tasks: Task[]
}

function sortByDeadline(a: Task, b: Task): number {
  if (!a.deadline && !b.deadline) return a.subject.localeCompare(b.subject)
  if (!a.deadline) return 1
  if (!b.deadline) return -1
  return a.deadline.getTime() - b.deadline.getTime()
}

function buildGroups(tasks: Task[], now: Date, groupBy: GroupMode): Group[] {
  const sorted = [...tasks].sort(sortByDeadline)
  const map = new Map<string, Group>()

  for (const task of sorted) {
    const key = groupBy === 'date' ? dayKey(task.deadline) : task.subject
    if (!map.has(key)) {
      map.set(key, {
        key,
        heading: groupBy === 'date' ? dayHeading(task.deadline, now) : task.subject,
        meta:
          groupBy === 'subject'
            ? task.deadline
              ? `Next: ${shortDate(task.deadline)}`
              : 'No dates found'
            : undefined,
        accent: groupBy === 'subject' ? subjectColor(task.subject) : undefined,
        tasks: [],
      })
    }
    map.get(key)!.tasks.push(task)
  }

  return Array.from(map.values())
}

export function DeadlineGroups({
  tasks,
  now,
  groupBy,
  onToggle,
  onViewDetails,
  onDelete,
}: DeadlineGroupsProps) {
  const groups = buildGroups(tasks, now, groupBy)

  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
        Nothing left here — everything is checked off.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => {
        const urgency = groupBy === 'date' ? getUrgency(group.tasks[0].deadline, now) : 'later'
        return (
          <section key={group.key} aria-labelledby={`group-${group.key}`}>
            <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-2">
              <h3
                id={`group-${group.key}`}
                className="flex items-center gap-2 font-display text-xl text-ink"
              >
                {group.accent && (
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: group.accent }}
                    aria-hidden="true"
                  />
                )}
                {group.heading}
              </h3>
              <span
                className={`text-[12px] ${
                  urgency === 'overdue' ? 'font-medium text-urgent' : 'text-muted'
                }`}
              >
                {group.meta ??
                  (urgency === 'overdue'
                    ? 'Past due'
                    : group.tasks.length === 1
                      ? '1 task'
                      : `${group.tasks.length} tasks`)}
              </span>
            </div>
            <ul className="mt-1">
              {group.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  done={false}
                  now={now}
                  showSubject={groupBy === 'date'}
                  showDate={groupBy === 'subject'}
                  onToggle={onToggle}
                  onViewDetails={onViewDetails}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
