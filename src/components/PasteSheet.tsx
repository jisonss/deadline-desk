
import { AnimatePresence, motion } from 'framer-motion'
import { XIcon } from 'lucide-react'
import { PasteForm } from './PasteForm'

interface PasteSheetProps {
  open: boolean
  initialText: string
  onClose: () => void
  onSubmit: (text: string) => void
}

const EASE = [0.23, 1, 0.32, 1] as const

export function PasteSheet({ open, initialText, onClose, onSubmit }: PasteSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex justify-end bg-ink/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Paste a new announcement"
            className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-canvas p-6 md:p-8"
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 32, opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-ink">Paste an announcement</h2>
                <p className="mt-1 text-[13px] text-muted">
                Add another announcement to your deadline list. Only tasks with a valid
                deadline will be added.
               </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-muted transition-colors duration-150 ease-out hover:bg-line hover:text-ink"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="mt-6">
              <PasteForm
                initialText={initialText}
                submitLabel="Add reminders"
                onSubmit={onSubmit}
                autoFocus
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
