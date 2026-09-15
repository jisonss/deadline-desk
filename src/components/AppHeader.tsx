
import { ClipboardPasteIcon, SparklesIcon } from 'lucide-react'
import { format } from 'date-fns'

interface AppHeaderProps {
  now: Date
  onPaste: () => void
}

export function AppHeader({ now, onPaste }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-ink text-white shadow-sm">
            <SparklesIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-ink sm:text-xl">
              Deadline Desk
            </h1>
            <p className="mt-0.5 text-xs text-muted">
              {format(now, 'EEEE, MMMM d')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onPaste}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:px-4 sm:text-sm"
        >
          <ClipboardPasteIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Paste announcement</span>
          <span className="sm:hidden">Paste</span>
        </button>
      </div>
    </header>
  )
}
