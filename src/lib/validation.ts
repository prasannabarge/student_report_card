import { z } from 'zod'

export const studentInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Student name must be at least 2 characters')
    .max(100, 'Student name is too long'),
  rollNumber: z
    .string()
    .min(1, 'Roll number is required')
    .max(20, 'Roll number is too long'),
  className: z
    .string()
    .min(1, 'Class is required'),
  division: z
    .string()
    .min(1, 'Division is required'),
  academicYear: z
    .string()
    .min(1, 'Academic year is required')
    .regex(/^\d{4}[-–]\d{4}$/, 'Academic year must be in format YYYY-YYYY (e.g., 2026-2027)'),
  examinationName: z
    .string()
    .min(1, 'Examination name is required')
    .max(100, 'Examination name is too long'),
  examinationDate: z
    .string()
    .optional(),
})

export const subjectSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Subject name is required')
    .max(80, 'Subject name is too long'),
  maxMarks: z
    .number()
    .positive('Maximum marks must be greater than 0')
    .max(1000, 'Maximum marks cannot exceed 1000'),
  passingMarks: z
    .number()
    .min(0, 'Passing marks cannot be negative'),
  obtainedMarks: z
    .number()
    .min(0, 'Obtained marks cannot be negative')
    .nullable(),
  isAbsent: z.boolean(),
}).refine(
  (data) => data.passingMarks <= data.maxMarks,
  { message: 'Passing marks cannot exceed maximum marks', path: ['passingMarks'] }
).refine(
  (data) => {
    if (data.isAbsent || data.obtainedMarks === null) return true
    return data.obtainedMarks <= data.maxMarks
  },
  { message: 'Obtained marks cannot exceed maximum marks', path: ['obtainedMarks'] }
)

export const studentRecordSchema = z.object({
  studentInfo: studentInfoSchema,
  subjects: z
    .array(z.object({
      id: z.string(),
      name: z.string().min(1, 'Subject name is required'),
      maxMarks: z.number().positive('Maximum marks must be greater than 0'),
      passingMarks: z.number().min(0, 'Passing marks cannot be negative'),
      obtainedMarks: z.number().min(0).nullable(),
      isAbsent: z.boolean(),
    }))
    .min(1, 'At least one subject is required'),
})

/**
 * Validate that there are no duplicate subject names in the list.
 */
export function findDuplicateSubjects(subjects: { name: string }[]): string[] {
  const seen = new Map<string, number>()
  const duplicates: string[] = []

  for (const subject of subjects) {
    const normalized = subject.name.trim().toLowerCase()
    if (normalized === '') continue
    const count = (seen.get(normalized) ?? 0) + 1
    seen.set(normalized, count)
    if (count === 2) {
      duplicates.push(subject.name)
    }
  }

  return duplicates
}

/**
 * Validate a single subject's marks entry completeness.
 */
export function validateSubjectMarksComplete(subject: {
  name: string
  maxMarks: number
  passingMarks: number
  obtainedMarks: number | null
  isAbsent: boolean
}): string | null {
  if (!subject.name.trim()) return 'Subject name is required'
  if (subject.maxMarks <= 0) return 'Maximum marks must be greater than 0'
  if (subject.passingMarks < 0) return 'Passing marks cannot be negative'
  if (subject.passingMarks > subject.maxMarks) return 'Passing marks cannot exceed maximum marks'
  if (!subject.isAbsent && subject.obtainedMarks === null) return 'Enter obtained marks or mark as absent'
  if (!subject.isAbsent && subject.obtainedMarks !== null) {
    if (subject.obtainedMarks < 0) return 'Obtained marks cannot be negative'
    if (subject.obtainedMarks > subject.maxMarks) return 'Obtained marks cannot exceed maximum marks'
  }
  return null
}

