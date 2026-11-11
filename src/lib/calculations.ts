import type { Subject, SubjectResult, CalculationResult, GradeScale } from '@/types'

/**
 * Default grading scale — isolated for easy configuration changes.
 */
export function getDefaultGradeScale(): GradeScale[] {
  return [
    { minPercentage: 90, maxPercentage: 100, grade: 'A+', description: 'Outstanding' },
    { minPercentage: 80, maxPercentage: 89.99, grade: 'A', description: 'Excellent' },
    { minPercentage: 70, maxPercentage: 79.99, grade: 'B+', description: 'Very Good' },
    { minPercentage: 60, maxPercentage: 69.99, grade: 'B', description: 'Good' },
    { minPercentage: 50, maxPercentage: 59.99, grade: 'C', description: 'Average' },
    { minPercentage: 35, maxPercentage: 49.99, grade: 'D', description: 'Below Average' },
    { minPercentage: 0, maxPercentage: 34.99, grade: 'F', description: 'Fail' },
  ]
}

/**
 * Round percentage to 2 decimal places, avoiding floating-point issues.
 */
export function roundPercentage(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Get grade and description for a given percentage.
 */
export function getGrade(percentage: number): { grade: string; description: string } {
  const scale = getDefaultGradeScale()
  const rounded = roundPercentage(percentage)

  for (const entry of scale) {
    if (rounded >= entry.minPercentage && rounded <= entry.maxPercentage) {
      return { grade: entry.grade, description: entry.description }
    }
  }

  return { grade: 'F', description: 'Fail' }
}

/**
 * Calculate individual subject result.
 */
export function calculateSubjectResult(subject: Subject): SubjectResult {
  if (subject.isAbsent) {
    return {
      subject,
      isPassed: false,
      isAbsent: true,
      percentage: 0,
    }
  }

  const obtained = subject.obtainedMarks ?? 0
  const isPassed = obtained >= subject.passingMarks
  const percentage = subject.maxMarks > 0
    ? roundPercentage((obtained / subject.maxMarks) * 100)
    : 0

  return {
    subject,
    isPassed,
    isAbsent: false,
    percentage,
  }
}

/**
 * Calculate complete results for all subjects.
 */
export function calculateResults(subjects: Subject[]): CalculationResult {
  const subjectResults = subjects.map(calculateSubjectResult)

  const totalMaxMarks = subjects.reduce((sum, s) => sum + s.maxMarks, 0)
  const totalObtainedMarks = subjects.reduce((sum, s) => {
    if (s.isAbsent) return sum
    return sum + (s.obtainedMarks ?? 0)
  }, 0)

  const percentage = totalMaxMarks > 0
    ? roundPercentage((totalObtainedMarks / totalMaxMarks) * 100)
    : 0

  const { grade, description: gradeDescription } = getGrade(percentage)

  const passedSubjects = subjectResults.filter(r => r.isPassed).length
  const failedSubjects = subjectResults.filter(r => !r.isPassed && !r.isAbsent).length
  const absentSubjects = subjectResults.filter(r => r.isAbsent).length

  let overallResult: 'PASS' | 'FAIL' | 'ABSENT'
  if (absentSubjects > 0) {
    overallResult = 'ABSENT'
  } else if (failedSubjects > 0) {
    overallResult = 'FAIL'
  } else {
    overallResult = 'PASS'
  }

  return {
    subjectResults,
    totalMaxMarks,
    totalObtainedMarks,
    percentage,
    grade,
    gradeDescription,
    overallResult,
    passedSubjects,
    failedSubjects,
    absentSubjects,
  }
}

