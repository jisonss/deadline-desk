import { useState } from 'react'
import { SparklesIcon } from 'lucide-react'
import { sampleAnnouncement } from '../data/sampleText'

interface PasteFormProps {
  initialText?: string
  submitLabel: string
  onSubmit: (text: string) => void
  autoFocus?: boolean
}

export function PasteForm({
  initialText = '',
  submitLabel,
  onSubmit,
  autoFocus = false,
}: PasteFormProps) {
  const [text, setText] = useState(initialText)
  const isEmpty = text.trim().length === 0

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!isEmpty) onSubmit(text)
      }}
    >
      <label className="sr-only" htmlFor="announcement">
        Paste the announcement text
      </label>
      <textarea
        id="announcement"
        autoFocus={autoFocus}
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
        placeholder={
        'Example\nTitle:INTRODUCTION TO COMPUTING\nQUESTION/TITLE:Activity 1\nDEADLINE: Friday, Sept 11\nSUBMISSION: Check GClass for instructions.'
        }
        rows={12}
        className="w-full resize-y rounded-lg border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isEmpty}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition-colors duration-150 ease-out hover:bg-accent disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          <SparklesIcon className="h-4 w-4" aria-hidden="true" />
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={() => setText(sampleAnnouncement)}
          className="text-sm text-muted underline decoration-line underline-offset-4 transition-colors duration-150 ease-out hover:text-ink"
        >
          Use the example post
        </button>
        {!isEmpty && (
          <button
            type="button"
            onClick={() => setText('')}
            className="ml-auto text-sm text-muted transition-colors duration-150 ease-out hover:text-urgent"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  )
}
