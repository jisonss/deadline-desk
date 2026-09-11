import { useMemo, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { CompletedList } from './components/CompletedList'
import { DeadlineGroups } from './components/DeadlineGroups'
import { EmptyState } from './components/EmptyState'
import { NextUpPanel } from './components/NextUpPanel'
import { PasteSheet } from './components/PasteSheet'
import { SubjectFilterBar } from './components/SubjectFilterBar'
import { SubjectSummary } from './components/SubjectSummary'
import { TaskDetails } from './components/TaskDetails'
import type { Task } from './types/task'
import { parseTasks } from './utils/parseTasks'


interface AppProps {
  /** How the reminder list is organised. */
  groupBy?: 'date' | 'subject'
}

export function App({ groupBy = 'date' }: AppProps) {
  const now = useMemo(() => new Date(), [])
  const [rawText, setRawText] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [doneIds, setDoneIds] = useState<string[]>([])
  const [activeSubject, setActiveSubject] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const handleParse = (text: string) => {
  const newTasks = parseTasks(text, now)

  setRawText(text)

  setTasks((current) => {
    const existingIds = new Set(current.map((task) => task.id))

    const uniqueNewTasks = newTasks.filter(
      (task) => !existingIds.has(task.id),
    )

    return [...current, ...uniqueNewTasks]
  })

  setActiveSubject(null)
  setSheetOpen(false)
}

  const toggleDone = (id: string) => {
    setDoneIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }
  const deleteTask = (id: string) => {
  setTasks((current) => current.filter((task) => task.id !== id))
  setDoneIds((current) => current.filter((taskId) => taskId !== id))
  }

  const subjects = useMemo(() => {
    const counts = new Map<string, number>()
    tasks
      .filter((task) => !doneIds.includes(task.id))
      .forEach((task) => counts.set(task.subject, (counts.get(task.subject) ?? 0) + 1))
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
  }, [tasks, doneIds])

  const openTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          !doneIds.includes(task.id) && (!activeSubject || task.subject === activeSubject),
      ),
    [tasks, doneIds, activeSubject],
  )

  const completed = tasks.filter((task) => doneIds.includes(task.id))

  const nextUp = useMemo(() => {
    const dated = openTasks
      .filter((task) => task.deadline)
      .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
    return dated[0] ?? openTasks[0]
  }, [openTasks])

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen w-full bg-canvas font-sans text-ink">
        <EmptyState onSubmit={handleParse} />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-canvas font-sans text-ink">
      <AppHeader now={now} onPaste={() => setSheetOpen(true)} />

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {nextUp ? (
          <NextUpPanel
            task={nextUp}
            now={now}
            remaining={openTasks.length}
            onToggle={toggleDone}
          />
        ) : (
          <section className="rounded-xl border border-line bg-surface p-8">
            <h2 className="font-display text-3xl text-ink">All clear.</h2>
            <p className="mt-2 text-[14px] text-muted">
              Every task from this post is checked off. Paste a new one when the next batch lands.
            </p>
          </section>
        )}

        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:gap-12">
          <div className="min-w-0 flex-1">
            <SubjectFilterBar
              subjects={subjects}
              active={activeSubject}
              total={tasks.filter((task) => !doneIds.includes(task.id)).length}
              onChange={setActiveSubject}
            />
            <div className="mt-8">
              <DeadlineGroups
                tasks={openTasks}
                now={now}
                groupBy={groupBy}
                onToggle={toggleDone}
                onViewDetails={setSelectedTask}
                onDelete={deleteTask}
              />
            </div>
            <div className="mt-10">
              <CompletedList
              tasks={completed}
              now={now}
              onToggle={toggleDone}
              onViewDetails={setSelectedTask}
              onDelete={deleteTask}
            />
            </div>
          </div>

          <div className="w-full flex-none lg:w-72">
            <SubjectSummary
              tasks={tasks.filter((task) => !doneIds.includes(task.id))}
              now={now}
              onSelect={(subject) =>
                setActiveSubject((current) => (current === subject ? null : subject))
              }
            />
          </div>
        </div>
      </main>

      <PasteSheet
        open={sheetOpen}
        initialText={rawText}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleParse}
      />
      {selectedTask && (
  <TaskDetails
    task={selectedTask}
    onClose={() => setSelectedTask(null)}
  />
)}
{selectedTask && (
  <TaskDetails
    task={selectedTask}
    onClose={() => setSelectedTask(null)}
  />
)}
    </div>
  )
}
