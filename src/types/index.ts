export interface Subject {
  id: string
  name: string
  maxMarks: number
  passingMarks: number
  obtainedMarks: number | null
  isAbsent: boolean
}

export interface StudentInfo {
  id: string
  fullName: string
  rollNumber: string
  className: string
  division: string
  academicYear: string
  examinationName: string
  examinationDate?: string
}

export interface StudentRecord {
  studentInfo: StudentInfo
  subjects: Subject[]
  remarks?: string
  createdAt: string
}

export interface SubjectResult {
  subject: Subject
  isPassed: boolean
  isAbsent: boolean
  percentage: number
}

export interface CalculationResult {
  subjectResults: SubjectResult[]
  totalMaxMarks: number
  totalObtainedMarks: number
  percentage: number
  grade: string
  gradeDescription: string
  overallResult: 'PASS' | 'FAIL' | 'ABSENT'
  passedSubjects: number
  failedSubjects: number
  absentSubjects: number
}

export interface GradeScale {
  minPercentage: number
  maxPercentage: number
  grade: string
  description: string
}

export interface SchoolInfo {
  name: string
  address: string
  contact: string
  logoUrl?: string
}

export interface ReportCardData {
  school: SchoolInfo
  student: StudentRecord
  calculations: CalculationResult
}

export interface AppState {
  students: StudentRecord[]
  reportCardsGenerated: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'student_added' | 'marks_entered' | 'report_generated' | 'student_removed'
  description: string
  timestamp: string
  studentName?: string
}

