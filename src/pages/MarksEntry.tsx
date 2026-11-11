import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import type { z } from 'zod'
import { useAppContext } from '@/context/AppContext'
import {
  createEmptyStudent,
  createEmptySubject,
  DEFAULT_CLASSES,
  DEFAULT_DIVISIONS,
  DEFAULT_EXAMINATIONS,
  DEFAULT_SCHOOL,
  getDefaultSubjects,
  getSampleStudent,
} from '@/data/sampleData'
import { calculateResults } from '@/lib/calculations'
import { formatPercentage, getResultBadgeColor } from '@/lib/formatters'
import {
  findDuplicateSubjects,
  studentInfoSchema,
  validateSubjectMarksComplete,
} from '@/lib/validation'
import type { StudentRecord, Subject } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { ReportCardPreview } from '@/components/reports/ReportCardPreview'
import { cn } from '@/lib/utils'

type StudentInfoFormValues = z.infer<typeof studentInfoSchema>

export default function MarksEntry() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { state, addStudent, updateStudent, incrementReportCount, addActivity } = useAppContext()
  const { toast } = useToast()

  const existingRecord = useMemo(
    () => (editId ? state.students.find((s) => s.studentInfo.id === editId) : undefined),
    [editId, state.students],
  )

  const [recordId, setRecordId] = useState<string>(() =>
    existingRecord ? existingRecord.studentInfo.id : crypto.randomUUID(),
  )
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    existingRecord ? existingRecord.subjects.map((s) => ({ ...s })) : getDefaultSubjects(),
  )
  const [remarks, setRemarks] = useState<string>(() => existingRecord?.remarks ?? '')
  const [showSubjectErrors, setShowSubjectErrors] = useState(false)
  const [previewRecord, setPreviewRecord] = useState<StudentRecord | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentInfoFormValues>({
    resolver: zodResolver(studentInfoSchema),
    defaultValues: existingRecord
      ? {
          fullName: existingRecord.studentInfo.fullName,
          rollNumber: existingRecord.studentInfo.rollNumber,
          className: existingRecord.studentInfo.className,
          division: existingRecord.studentInfo.division,
          academicYear: existingRecord.studentInfo.academicYear,
          examinationName: existingRecord.studentInfo.examinationName,
          examinationDate: existingRecord.studentInfo.examinationDate ?? '',
        }
      : {
          fullName: '',
          rollNumber: '',
          className: '',
          division: '',
          academicYear: '2026-2027',
          examinationName: '',
          examinationDate: '',
        },
  })

  useEffect(() => {
    if (existingRecord) {
      setRecordId(existingRecord.studentInfo.id)
      setSubjects(existingRecord.subjects.map((s) => ({ ...s })))
      setRemarks(existingRecord.remarks ?? '')
      reset({
        fullName: existingRecord.studentInfo.fullName,
        rollNumber: existingRecord.studentInfo.rollNumber,
        className: existingRecord.studentInfo.className,
        division: existingRecord.studentInfo.division,
        academicYear: existingRecord.studentInfo.academicYear,
        examinationName: existingRecord.studentInfo.examinationName,
        examinationDate: existingRecord.studentInfo.examinationDate ?? '',
      })
    }
  }, [existingRecord, reset])

  const duplicateNames = useMemo(() => findDuplicateSubjects(subjects), [subjects])

  const subjectValidationErrors = useMemo(() => {
    const map = new Map<string, string>()
    for (const sub of subjects) {
      const err = validateSubjectMarksComplete(sub)
      if (err) {
        map.set(sub.id, err)
      } else if (
        sub.name.trim() &&
        duplicateNames.some((d) => d.trim().toLowerCase() === sub.name.trim().toLowerCase())
      ) {
        map.set(sub.id, 'Duplicate subject name')
      }
    }
    return map
  }, [subjects, duplicateNames])

  const calculations = useMemo(() => calculateResults(subjects), [subjects])

  const handleAddSubject = () => {
    setSubjects((prev) => [...prev, createEmptySubject()])
  }

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) {
      toast({
        title: 'Minimum 1 subject required',
        description: 'A report card must contain at least one subject.',
        variant: 'destructive',
      })
      return
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSubjectChange = <K extends keyof Subject>(
    id: string,
    field: K,
    value: Subject[K],
  ) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        if (field === 'isAbsent' && value === true) {
          return { ...s, isAbsent: true, obtainedMarks: null }
        }
        return { ...s, [field]: value }
      }),
    )
  }

  const handleLoadSample = () => {
    const sample = getSampleStudent()
    setRecordId(sample.studentInfo.id)
    setSubjects(sample.subjects)
    setRemarks(sample.remarks ?? '')
    setShowSubjectErrors(false)
    if (editId) setSearchParams({})
    reset({
      fullName: sample.studentInfo.fullName,
      rollNumber: sample.studentInfo.rollNumber,
      className: sample.studentInfo.className,
      division: sample.studentInfo.division,
      academicYear: sample.studentInfo.academicYear,
      examinationName: sample.studentInfo.examinationName,
      examinationDate: sample.studentInfo.examinationDate ?? '',
    })
    toast({
      title: 'Sample student loaded',
      description: 'Rahul Patil (Class 5-A) data loaded into the form.',
      variant: 'success',
    })
  }

  const handleResetForm = () => {
    const empty = createEmptyStudent()
    setRecordId(empty.studentInfo.id)
    setSubjects(empty.subjects)
    setRemarks('')
    setShowSubjectErrors(false)
    if (editId) setSearchParams({})
    reset({
      fullName: '',
      rollNumber: '',
      className: '',
      division: '',
      academicYear: '2026-2027',
      examinationName: '',
      examinationDate: '',
    })
  }

  const saveAndMaybePreview = (shouldPreview: boolean) =>
    handleSubmit((formData) => {
      setShowSubjectErrors(true)
      if (subjects.length === 0 || subjectValidationErrors.size > 0 || duplicateNames.length > 0) {
        toast({
          title: 'Please fix subject validation errors',
          description: 'All subjects must have valid names, marks, and no duplicates.',
          variant: 'destructive',
        })
        return
      }

      const record: StudentRecord = {
        studentInfo: {
          id: recordId,
          fullName: formData.fullName.trim(),
          rollNumber: formData.rollNumber.trim(),
          className: formData.className,
          division: formData.division,
          academicYear: formData.academicYear.trim(),
          examinationName: formData.examinationName.trim(),
          examinationDate: formData.examinationDate || undefined,
        },
        subjects: subjects.map((s) => ({ ...s, name: s.name.trim() })),
        remarks: remarks.trim() || undefined,
        createdAt: existingRecord?.createdAt ?? new Date().toISOString(),
      }

      if (existingRecord) {
        updateStudent(record)
        toast({
          title: 'Student record updated',
          description: `${record.studentInfo.fullName}'s marks have been updated.`,
          variant: 'success',
        })
      } else {
        addStudent(record)
        toast({
          title: 'Student record saved',
          description: `${record.studentInfo.fullName} added to the current session.`,
          variant: 'success',
        })
      }

      if (shouldPreview) {
        setPreviewRecord(record)
      } else {
        navigate('/report-cards')
      }
    })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-10"
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {existingRecord ? `Editing: ${existingRecord.studentInfo.fullName}` : 'Student Marks Entry'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter student details and subject-wise marks to automatically compute grades and report cards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleLoadSample} className="gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Load Sample Data
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleResetForm} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Student Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Information</CardTitle>
          <CardDescription>Required details for the report card header</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="fullName">Student Full Name *</Label>
              <Input
                id="fullName"
                placeholder="e.g. Rahul Patil"
                {...register('fullName')}
                className={errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                placeholder="e.g. 05"
                {...register('rollNumber')}
                className={errors.rollNumber ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.rollNumber && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.rollNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Class *</Label>
                <Controller
                  control={control}
                  name="className"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.className ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_CLASSES.map((c) => (
                          <SelectItem key={c} value={c}>
                            Class {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.className && (
                  <p className="text-xs text-destructive">{errors.className.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Division *</Label>
                <Controller
                  control={control}
                  name="division"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.division ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Div" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_DIVISIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            Div {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.division && (
                  <p className="text-xs text-destructive">{errors.division.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Input
                id="academicYear"
                placeholder="2026-2027"
                {...register('academicYear')}
                className={errors.academicYear ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.academicYear && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.academicYear.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="examinationName">Examination Name *</Label>
              <Input
                id="examinationName"
                list="exam-presets"
                placeholder="e.g. First Term Examination"
                {...register('examinationName')}
                className={errors.examinationName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              <datalist id="exam-presets">
                {DEFAULT_EXAMINATIONS.map((exam) => (
                  <option key={exam} value={exam} />
                ))}
              </datalist>
              {errors.examinationName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.examinationName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="examinationDate">Examination Date (Optional)</Label>
              <Input id="examinationDate" type="date" {...register('examinationDate')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Marks Entry */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base">Subject-Wise Marks Entry</CardTitle>
            <CardDescription>
              Supports decimal marks, dynamic subjects, and explicit absent tracking
            </CardDescription>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={handleAddSubject} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3 min-w-[180px]">Subject</th>
                  <th className="py-3 px-2 w-28">Max Marks</th>
                  <th className="py-3 px-2 w-28">Passing Marks</th>
                  <th className="py-3 px-2 w-32">Obtained Marks</th>
                  <th className="py-3 px-2 w-28 text-center">Result</th>
                  <th className="py-3 px-2 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subjects.map((subject, index) => {
                  const res = calculations.subjectResults[index]
                  const status: 'PASS' | 'FAIL' | 'ABSENT' | null = subject.isAbsent
                    ? 'ABSENT'
                    : subject.obtainedMarks === null
                      ? null
                      : res?.isPassed
                        ? 'PASS'
                        : 'FAIL'

                  const rowError = showSubjectErrors
                    ? subjectValidationErrors.get(subject.id)
                    : undefined

                  return (
                    <tr key={subject.id} className="align-top group">
                      <td className="py-3 px-3">
                        <Input
                          aria-label={`Subject ${index + 1} name`}
                          placeholder="Subject name"
                          value={subject.name}
                          onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                          className={cn(
                            'h-9',
                            rowError && !subject.name.trim() && 'border-destructive',
                          )}
                        />
                        {rowError && (
                          <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {rowError}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          step="any"
                          min={1}
                          aria-label={`${subject.name || 'Subject'} maximum marks`}
                          value={Number.isNaN(subject.maxMarks) ? '' : subject.maxMarks}
                          onChange={(e) =>
                            handleSubjectChange(
                              subject.id,
                              'maxMarks',
                              e.target.value === '' ? 0 : parseFloat(e.target.value),
                            )
                          }
                          className="h-9 tabular-nums"
                        />
                      </td>

                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          step="any"
                          min={0}
                          aria-label={`${subject.name || 'Subject'} passing marks`}
                          value={Number.isNaN(subject.passingMarks) ? '' : subject.passingMarks}
                          onChange={(e) =>
                            handleSubjectChange(
                              subject.id,
                              'passingMarks',
                              e.target.value === '' ? 0 : parseFloat(e.target.value),
                            )
                          }
                          className="h-9 tabular-nums"
                        />
                      </td>

                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          step="any"
                          min={0}
                          disabled={subject.isAbsent}
                          placeholder={subject.isAbsent ? 'AB' : 'Marks'}
                          aria-label={`${subject.name || 'Subject'} obtained marks`}
                          value={
                            subject.isAbsent || subject.obtainedMarks === null
                              ? ''
                              : subject.obtainedMarks
                          }
                          onChange={(e) =>
                            handleSubjectChange(
                              subject.id,
                              'obtainedMarks',
                              e.target.value === '' ? null : parseFloat(e.target.value),
                            )
                          }
                          className={cn(
                            'h-9 tabular-nums',
                            rowError &&
                              !subject.isAbsent &&
                              subject.obtainedMarks !== null &&
                              (subject.obtainedMarks > subject.maxMarks || subject.obtainedMarks < 0) &&
                              'border-destructive',
                          )}
                        />
                      </td>

                      <td className="py-3 px-2 text-center pt-4">
                        {status ? (
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                              getResultBadgeColor(status),
                            )}
                          >
                            {status}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant={subject.isAbsent ? 'secondary' : 'outline'}
                            onClick={() =>
                              handleSubjectChange(subject.id, 'isAbsent', !subject.isAbsent)
                            }
                            title={subject.isAbsent ? 'Mark as Present' : 'Mark as Absent'}
                            className={cn(
                              'h-9 px-2 text-xs gap-1',
                              subject.isAbsent && 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300',
                            )}
                          >
                            {subject.isAbsent ? (
                              <>
                                <UserX className="h-3.5 w-3.5" /> AB
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveSubject(subject.id)}
                            aria-label={`Remove ${subject.name || 'subject'}`}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Live Calculation Summary */}
          <div className="mt-6 rounded-xl border bg-slate-50 p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Marks</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {calculations.totalObtainedMarks} / {calculations.totalMaxMarks}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Percentage</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {formatPercentage(calculations.percentage)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Grade</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {calculations.grade}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({calculations.gradeDescription})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Overall Result</p>
                <div className="mt-1">
                  <Badge
                    variant={
                      calculations.overallResult === 'PASS'
                        ? 'success'
                        : calculations.overallResult === 'FAIL'
                          ? 'destructive'
                          : 'warning'
                    }
                  >
                    {calculations.overallResult}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-5 space-y-1.5">
            <Label htmlFor="remarks">Teacher Remarks (Optional)</Label>
            <Input
              id="remarks"
              placeholder="e.g. Good progress in Mathematics. Needs extra attention in Science."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Bar */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {subjectValidationErrors.size === 0 ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>All subject entries are valid and ready.</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>{subjectValidationErrors.size} subject(s) need attention before generating a report card.</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={saveAndMaybePreview(false)} className="gap-1.5">
            <Save className="h-4 w-4" />
            Save Student
          </Button>
          <Button type="button" onClick={saveAndMaybePreview(true)} className="gap-1.5">
            <Eye className="h-4 w-4" />
            Save &amp; Preview Report Card
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewRecord && (
        <ReportCardPreview
          open={Boolean(previewRecord)}
          onClose={() => setPreviewRecord(null)}
          school={DEFAULT_SCHOOL}
          student={previewRecord}
          calculations={calculateResults(previewRecord.subjects)}
          onEditMarks={() => setPreviewRecord(null)}
          onPdfGenerated={(filename) => {
            incrementReportCount()
            addActivity({
              type: 'report_generated',
              description: `Generated PDF "${filename}"`,
              studentName: previewRecord.studentInfo.fullName,
            })
            toast({
              title: 'PDF Generated',
              description: `${filename} downloaded successfully.`,
              variant: 'success',
            })
          }}
        />
      )}
    </motion.div>
  )
}

