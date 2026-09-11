
import { subjectColor } from '../utils/subjects'

interface SubjectFilterBarProps {
  subjects: { name: string; count: number }[]
  active: string | null
  total: number
  onChange: (subject: string | null) => void
}

export function SubjectFilterBar({ subjects, active, total, onChange }: SubjectFilterBarProps) {
  if (subjects.length < 2) return null

  return (
    <nav aria-label="Filter by subject" className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150 ease-out ${
          active === null
            ? 'border-ink bg-ink text-canvas'
            : 'border-line bg-surface text-muted hover:border-muted hover:text-ink'
        }`}
      >
        All · {total}
      </button>
      {subjects.map((subject) => {
        const isActive = active === subject.name
        return (
          <button
            key={subject.name}
            type="button"
            onClick={() => onChange(isActive ? null : subject.name)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150 ease-out ${
              isActive
                ? 'border-ink bg-ink text-canvas'
                : 'border-line bg-surface text-muted hover:border-muted hover:text-ink'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: subjectColor(subject.name) }}
              aria-hidden="true"
            />
            <span className="max-w-[16rem] truncate">{subject.name}</span>
            <span className={isActive ? 'text-canvas/70' : 'text-muted/70'}>{subject.count}</span>
          </button>
        )
      })}
    </nav>
  )
}
