import type { StudentInfo } from '@/types'

/**
 * Format a percentage value for display.
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * Format marks display — shows "AB" for absent students.
 */
export function formatMarks(obtained: number | null, max: number, isAbsent: boolean): string {
  if (isAbsent) return `AB / ${max}`
  if (obtained === null) return `— / ${max}`
  return `${obtained} / ${max}`
}

/**
 * Generate a clean filename for the PDF.
 * Example: RahulPatil_Class5_A_FirstTerm.pdf
 */
export function generateFileName(student: StudentInfo): string {
  const name = student.fullName
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')

  const className = `Class${student.className}`
  const division = student.division

  const exam = student.examinationName
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')

  return `${name}_${className}_${division}_${exam}.pdf`
}

/**
 * Format a date string for display.
 */
export function formatDate(date: string): string {
  if (!date) return ''
  try {
    const d = new Date(date)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return date
  }
}

/**
 * Get Tailwind classes for result badge color.
 */
export function getResultBadgeColor(result: 'PASS' | 'FAIL' | 'ABSENT'): string {
  switch (result) {
    case 'PASS':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'FAIL':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'ABSENT':
      return 'bg-amber-100 text-amber-800 border-amber-200'
  }
}

/**
 * Get relative time string (e.g., "2 minutes ago").
 */
export function getRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  return formatDate(timestamp)
}

