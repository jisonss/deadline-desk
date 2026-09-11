export interface Task {
  id: string
  subject: string
  kind?: string
  title: string
  submission?: string
  note?: string
  deadlineRaw?: string
  deadline: Date | null
}