
import { PasteForm } from './PasteForm'

interface EmptyStateProps {
  onSubmit: (text: string) => void
}

export function EmptyState({ onSubmit }: EmptyStateProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
        Smart task reminder
      </p>
      <h1 className="mt-4 font-display text-5xl leading-[1.05] text-ink md:text-6xl">
        Paste the group chat post.
        <br />
        Get every deadline, sorted.
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
        Drop in an announcement exactly as it was posted — fancy bold letters, emoji and all. Each
        subject becomes its own task with the deadline read straight from the text.
      </p>
      <div className="mt-10">
        <PasteForm submitLabel="Build my reminders" onSubmit={onSubmit} autoFocus />
      </div>
    </main>
  )
}
