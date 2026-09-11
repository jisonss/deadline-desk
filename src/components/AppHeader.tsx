
import { ClipboardPasteIcon } from 'lucide-react'
import { format } from 'date-fns'

interface AppHeaderProps {
  now: Date
  onPaste: () => void
}

export function AppHeader({ now, onPaste }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <h1 className="font-display text-xl leading-none text-ink">Deadline Desk</h1>
          <p className="mt-1 text-[12px] text-muted">{format(now, 'EEEE, MMMM d')}</p>
        </div>
        <button
          type="button"
          onClick={onPaste}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[13px] font-medium text-ink transition-colors duration-150 ease-out hover:border-ink"
        >
          <ClipboardPasteIcon className="h-4 w-4" aria-hidden="true" />
          Paste list
        </button>
      </div>
    </header>
  )
}
