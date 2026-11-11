import type { SchoolInfo, Subject, StudentRecord } from '@/types'

export const DEFAULT_SCHOOL: SchoolInfo = {
  name: 'Anant English School Satara',
  address: 'Satara - 415002',
  contact: '+91 20 1234 5678',
}

export const DEFAULT_CLASSES: string[] = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
]

export const DEFAULT_DIVISIONS: string[] = ['A', 'B', 'C', 'D']

export const DEFAULT_EXAMINATIONS: string[] = [
  'First Term Examination',
  'Second Term Examination',
  'Mid-Term Examination',
  'Annual Examination',
  'Unit Test 1',
  'Unit Test 2',
]

/**
 * Default subjects template with standard marks.
 */
export function getDefaultSubjects(): Subject[] {
  return [
    { id: crypto.randomUUID(), name: 'English', maxMarks: 100, passingMarks: 35, obtainedMarks: null, isAbsent: false },
    { id: crypto.randomUUID(), name: 'Mathematics', maxMarks: 100, passingMarks: 35, obtainedMarks: null, isAbsent: false },
    { id: crypto.randomUUID(), name: 'Science', maxMarks: 100, passingMarks: 35, obtainedMarks: null, isAbsent: false },
    { id: crypto.randomUUID(), name: 'Marathi', maxMarks: 100, passingMarks: 35, obtainedMarks: null, isAbsent: false },
    { id: crypto.randomUUID(), name: 'History', maxMarks: 100, passingMarks: 35, obtainedMarks: null, isAbsent: false },
  ]
}

/**
 * Create an empty subject with a unique ID.
 */
export function createEmptySubject(): Subject {
  return {
    id: crypto.randomUUID(),
    name: '',
    maxMarks: 100,
    passingMarks: 35,
    obtainedMarks: null,
    isAbsent: false,
  }
}

/**
 * Create an empty student record with default subjects.
 */
export function createEmptyStudent(): StudentRecord {
  return {
    studentInfo: {
      id: crypto.randomUUID(),
      fullName: '',
      rollNumber: '',
      className: '',
      division: '',
      academicYear: '2026-2027',
      examinationName: '',
      examinationDate: '',
    },
    subjects: getDefaultSubjects(),
    remarks: '',
    createdAt: new Date().toISOString(),
  }
}

/**
 * Sample student data for demonstration.
 */
export function getSampleStudent(): StudentRecord {
  return {
    studentInfo: {
      id: crypto.randomUUID(),
      fullName: 'Rahul Patil',
      rollNumber: '05',
      className: '5',
      division: 'A',
      academicYear: '2026-2027',
      examinationName: 'First Term Examination',
      examinationDate: '2026-10-15',
    },
    subjects: [
      { id: crypto.randomUUID(), name: 'English', maxMarks: 100, passingMarks: 35, obtainedMarks: 78, isAbsent: false },
      { id: crypto.randomUUID(), name: 'Mathematics', maxMarks: 100, passingMarks: 35, obtainedMarks: 85, isAbsent: false },
      { id: crypto.randomUUID(), name: 'Science', maxMarks: 100, passingMarks: 35, obtainedMarks: 32, isAbsent: false },
      { id: crypto.randomUUID(), name: 'Marathi', maxMarks: 100, passingMarks: 35, obtainedMarks: 28, isAbsent: false },
      { id: crypto.randomUUID(), name: 'History', maxMarks: 100, passingMarks: 35, obtainedMarks: 65, isAbsent: false },
    ],
    remarks: 'Needs improvement in Science and Marathi. Good performance in Mathematics.',
    createdAt: new Date().toISOString(),
  }
}

/**
 * Additional sample students for demo variety.
 */
export function getAdditionalSampleStudents(): StudentRecord[] {
  return [
    {
      studentInfo: {
        id: crypto.randomUUID(),
        fullName: 'Priya Sharma',
        rollNumber: '12',
        className: '5',
        division: 'A',
        academicYear: '2026-2027',
        examinationName: 'First Term Examination',
        examinationDate: '2026-10-15',
      },
      subjects: [
        { id: crypto.randomUUID(), name: 'English', maxMarks: 100, passingMarks: 35, obtainedMarks: 92, isAbsent: false },
        { id: crypto.randomUUID(), name: 'Mathematics', maxMarks: 100, passingMarks: 35, obtainedMarks: 88, isAbsent: false },
        { id: crypto.randomUUID(), name: 'Science', maxMarks: 100, passingMarks: 35, obtainedMarks: 95, isAbsent: false },
        { id: crypto.randomUUID(), name: 'Marathi', maxMarks: 100, passingMarks: 35, obtainedMarks: 76, isAbsent: false },
        { id: crypto.randomUUID(), name: 'History', maxMarks: 100, passingMarks: 35, obtainedMarks: 82, isAbsent: false },
      ],
      remarks: 'Excellent performance across all subjects. Keep up the good work!',
      createdAt: new Date().toISOString(),
    },
    {
      studentInfo: {
        id: crypto.randomUUID(),
        fullName: 'Amit Deshmukh',
        rollNumber: '08',
        className: '5',
        division: 'A',
        academicYear: '2026-2027',
        examinationName: 'First Term Examination',
        examinationDate: '2026-10-15',
      },
      subjects: [
        { id: crypto.randomUUID(), name: 'English', maxMarks: 100, passingMarks: 35, obtainedMarks: 55, isAbsent: false },
        { id: crypto.randomUUID(), name: 'Mathematics', maxMarks: 100, passingMarks: 35, obtainedMarks: 62, isAbsent: false },
        { id: crypto.randomUUID(), name: 'Science', maxMarks: 100, passingMarks: 35, obtainedMarks: 48, isAbsent: false },
        { id: crypto.randomUUID(), name: 'Marathi', maxMarks: 100, passingMarks: 35, obtainedMarks: null, isAbsent: true },
        { id: crypto.randomUUID(), name: 'History', maxMarks: 100, passingMarks: 35, obtainedMarks: 71, isAbsent: false },
      ],
      remarks: 'Was absent for Marathi examination. Needs to appear for re-exam.',
      createdAt: new Date().toISOString(),
    },
  ]
}

