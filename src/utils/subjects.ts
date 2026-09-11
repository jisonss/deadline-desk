const PALETTE = [
  '#1f6f5c',
  '#a8552b',
  '#3f5fa8',
  '#7a4b8f',
  '#8a6b1f',
  '#31708e',
  '#96324e',
]

export function subjectColor(subject: string): string {
  let hash = 0

  for (let i = 0; i < subject.length; i += 1) {
    hash = (hash * 31 + subject.charCodeAt(i)) % 100000
  }

  return PALETTE[hash % PALETTE.length]
}

export function subjectInitials(subject: string): string {
  return subject
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}