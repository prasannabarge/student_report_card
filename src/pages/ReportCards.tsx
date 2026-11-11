import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Building2,
  Download,
  Edit3,
  Eye,
  FileStack,
  FileText,
  PenLine,
  Printer,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { DEFAULT_CLASSES, DEFAULT_SCHOOL } from '@/data/sampleData'
import { calculateResults } from '@/lib/calculations'
import { formatPercentage, generateFileName, getResultBadgeColor } from '@/lib/formatters'
import {
  downloadPDF,
  generateCombinedPDF,
  generateReportCardPDF,
  printPDF,
} from '@/lib/pdfGenerator'
import type { ReportCardData, SchoolInfo, StudentRecord } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/toast'
import { ReportCardPreview } from '@/components/reports/ReportCardPreview'
import { cn } from '@/lib/utils'

export default function ReportCards() {
  const navigate = useNavigate()
  const {
    state,
    removeStudent,
    incrementReportCount,
    addActivity,
    loadSampleData,
  } = useAppContext()
  const { toast } = useToast()

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(DEFAULT_SCHOOL)
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false)
  const [schoolDraft, setSchoolDraft] = useState<SchoolInfo>(DEFAULT_SCHOOL)

  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState<string>('ALL')
  const [previewStudent, setPreviewStudent] = useState<StudentRecord | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(null)

  const filteredStudents = useMemo(() => {
    return state.students.filter((record) => {
      const info = record.studentInfo
      const matchesClass = classFilter === 'ALL' || info.className === classFilter
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        info.fullName.toLowerCase().includes(q) ||
        info.rollNumber.toLowerCase().includes(q) ||
        info.examinationName.toLowerCase().includes(q)
      return matchesClass && matchesSearch
    })
  }, [state.students, classFilter, searchQuery])

  const handleSaveSchoolInfo = () => {
    if (!schoolDraft.name.trim()) {
      toast({
        title: 'School name required',
        description: 'Please enter a valid school name.',
        variant: 'destructive',
      })
      return
    }
    setSchoolInfo({
      name: schoolDraft.name.trim(),
      address: schoolDraft.address.trim() || DEFAULT_SCHOOL.address,
      contact: schoolDraft.contact.trim() || DEFAULT_SCHOOL.contact,
    })
    setSchoolDialogOpen(false)
    toast({
      title: 'School letterhead updated',
      description: 'Updated details will appear on all generated report cards.',
      variant: 'success',
    })
  }

  const handleDownloadIndividual = (record: StudentRecord) => {
    const calculations = calculateResults(record.subjects)
    const doc = generateReportCardPDF({ school: schoolInfo, student: record, calculations })
    const filename = generateFileName(record.studentInfo)
    downloadPDF(doc, filename)
    incrementReportCount()
    addActivity({
      type: 'report_generated',
      description: `Downloaded PDF "${filename}"`,
      studentName: record.studentInfo.fullName,
    })
    toast({
      title: 'Report card downloaded',
      description: filename,
      variant: 'success',
    })
  }

  const handlePrintIndividual = (record: StudentRecord) => {
    const calculations = calculateResults(record.subjects)
    const doc = generateReportCardPDF({ school: schoolInfo, student: record, calculations })
    printPDF(doc)
    incrementReportCount()
    addActivity({
      type: 'report_generated',
      description: `Printed report card for "${record.studentInfo.fullName}"`,
      studentName: record.studentInfo.fullName,
    })
  }

  const handleGenerateCombinedPDF = () => {
    if (filteredStudents.length === 0) return
    const dataList: ReportCardData[] = filteredStudents.map((student) => ({
      school: schoolInfo,
      student,
      calculations: calculateResults(student.subjects),
    }))
    const doc = generateCombinedPDF(dataList)
    const classLabel = classFilter === 'ALL' ? 'AllClasses' : `Class${classFilter}`
    const filename = `Combined_ReportCards_${classLabel}.pdf`
    downloadPDF(doc, filename)
    incrementReportCount()
    addActivity({
      type: 'report_generated',
      description: `Generated combined PDF (${filteredStudents.length} students)`,
    })
    toast({
      title: 'Combined Class PDF Generated',
      description: `${filename} (${filteredStudents.length} report cards)`,
      variant: 'success',
    })
  }

  const handleConfirmDelete = () => {
    if (!studentToDelete) return
    const name = studentToDelete.studentInfo.fullName
    removeStudent(studentToDelete.studentInfo.id)
    setStudentToDelete(null)
    toast({
      title: 'Student removed',
      description: `${name} was removed from the current session.`,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-10"
    >
      {/* Header & School Config */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Report Cards &amp; Student Records</h2>
          <p className="text-sm text-muted-foreground">
            Preview, edit, print, and export individual or combined A4 PDF report cards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSchoolDraft(schoolInfo)
              setSchoolDialogOpen(true)
            }}
            className="gap-1.5"
          >
            <Building2 className="h-4 w-4" />
            Configure School
          </Button>
          {filteredStudents.length > 0 && (
            <Button
              size="sm"
              onClick={handleGenerateCombinedPDF}
              className="gap-1.5"
            >
              <FileStack className="h-4 w-4" />
              Combined PDF ({filteredStudents.length})
            </Button>
          )}
        </div>
      </div>

      {/* Active School Letterhead Banner */}
      <Card className="bg-slate-50/70">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Letterhead
            </p>
            <p className="text-sm font-semibold text-foreground">{schoolInfo.name}</p>
            <p className="text-xs text-muted-foreground">
              {schoolInfo.address} • {schoolInfo.contact}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/marks-entry')}
            className="gap-1.5 self-start sm:self-center"
          >
            <PenLine className="h-4 w-4" />
            Add New Student
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      {state.students.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, roll number, or exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Classes</SelectItem>
                {DEFAULT_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    Class {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Empty State or Student Table */}
      {state.students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No Student Records Yet</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Enter student marks to generate report cards, or load the built-in demonstration
              dataset to preview how individual and combined PDFs work.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate('/marks-entry')} className="gap-2">
                <PenLine className="h-4 w-4" />
                Enter Student Marks
              </Button>
              <Button variant="outline" onClick={loadSampleData} className="gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Load Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium text-foreground">No matching students found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or class filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Session Students ({filteredStudents.length})
            </CardTitle>
            <CardDescription>
              Temporary session records — not persisted to a database
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y bg-muted/40 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-3">Class / Div</th>
                    <th className="py-3 px-3">Examination</th>
                    <th className="py-3 px-3 text-right">Marks</th>
                    <th className="py-3 px-3 text-right">Percentage</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">Result</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((record) => {
                    const calc = calculateResults(record.subjects)
                    const info = record.studentInfo
                    return (
                      <tr key={info.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{info.fullName}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            Roll No: {info.rollNumber}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-foreground">
                          Class {info.className} - {info.division}
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-foreground">{info.examinationName}</p>
                          <p className="text-xs text-muted-foreground">{info.academicYear}</p>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-medium">
                          {calc.totalObtainedMarks} / {calc.totalMaxMarks}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums">
                          {formatPercentage(calc.percentage)}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold">{calc.grade}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                              getResultBadgeColor(calc.overallResult),
                            )}
                          >
                            {calc.overallResult}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewStudent(record)}
                              className="h-8 px-2.5 gap-1 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Preview
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Edit Marks"
                              onClick={() => navigate(`/marks-entry?edit=${info.id}`)}
                              className="h-8 w-8"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Download PDF"
                              onClick={() => handleDownloadIndividual(record)}
                              className="h-8 w-8 text-primary hover:text-primary"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Print PDF"
                              onClick={() => handlePrintIndividual(record)}
                              className="h-8 w-8"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Remove Student"
                              onClick={() => setStudentToDelete(record)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
          </CardContent>
        </Card>
      )}

      {/* Report Card Preview Modal */}
      {previewStudent && (
        <ReportCardPreview
          open={Boolean(previewStudent)}
          onClose={() => setPreviewStudent(null)}
          school={schoolInfo}
          student={previewStudent}
          calculations={calculateResults(previewStudent.subjects)}
          onEditMarks={() => {
            const id = previewStudent.studentInfo.id
            setPreviewStudent(null)
            navigate(`/marks-entry?edit=${id}`)
          }}
          onPdfGenerated={(filename) => {
            incrementReportCount()
            addActivity({
              type: 'report_generated',
              description: `Generated PDF "${filename}"`,
              studentName: previewStudent.studentInfo.fullName,
            })
            toast({
              title: 'PDF Generated',
              description: `${filename} downloaded successfully.`,
              variant: 'success',
            })
          }}
        />
      )}

      {/* School Info Configuration Dialog */}
      <Dialog open={schoolDialogOpen} onOpenChange={setSchoolDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>School Letterhead Details</DialogTitle>
            <DialogDescription>
              Customize the school name, address, and contact shown on report cards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={schoolDraft.name}
                onChange={(e) => setSchoolDraft({ ...schoolDraft, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="schoolAddress">School Address</Label>
              <Input
                id="schoolAddress"
                value={schoolDraft.address}
                onChange={(e) => setSchoolDraft({ ...schoolDraft, address: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="schoolContact">Contact Info</Label>
              <Input
                id="schoolContact"
                value={schoolDraft.contact}
                onChange={(e) => setSchoolDraft({ ...schoolDraft, contact: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchoolDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchoolInfo}>Save Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(studentToDelete)}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>{studentToDelete?.studentInfo.fullName}</strong> from this session?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

