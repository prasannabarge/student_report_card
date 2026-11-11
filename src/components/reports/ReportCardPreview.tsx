import { useEffect, useState } from 'react'
import {
  Download,
  Edit3,
  Eye,
  GraduationCap,
  Printer,
  X,
} from 'lucide-react'
import type { CalculationResult, SchoolInfo, StudentRecord } from '@/types'
import { formatDate, formatPercentage, generateFileName, getResultBadgeColor } from '@/lib/formatters'
import {
  downloadPDF,
  generateReportCardPDF,
  previewPDF,
  printPDF,
} from '@/lib/pdfGenerator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ReportCardPreviewProps {
  open: boolean
  onClose: () => void
  school: SchoolInfo
  student: StudentRecord
  calculations: CalculationResult
  onEditMarks?: () => void
  onPdfGenerated?: (filename: string) => void
}

export function ReportCardPreview({
  open,
  onClose,
  school,
  student,
  calculations,
  onEditMarks,
  onPdfGenerated,
}: ReportCardPreviewProps) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [showRawPdf, setShowRawPdf] = useState(false)

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
      }
    }
  }, [pdfBlobUrl])

  useEffect(() => {
    if (!open) {
      setShowRawPdf(false)
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
        setPdfBlobUrl(null)
      }
    }
  }, [open, pdfBlobUrl])

  const handleDownloadPDF = () => {
    const doc = generateReportCardPDF({ school, student, calculations })
    const filename = generateFileName(student.studentInfo)
    downloadPDF(doc, filename)
    onPdfGenerated?.(filename)
  }

  const handlePrintPDF = () => {
    const doc = generateReportCardPDF({ school, student, calculations })
    printPDF(doc)
    onPdfGenerated?.(generateFileName(student.studentInfo))
  }

  const handleTogglePdfPreview = () => {
    if (showRawPdf) {
      setShowRawPdf(false)
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
        setPdfBlobUrl(null)
      }
      return
    }
    const doc = generateReportCardPDF({ school, student, calculations })
    const url = previewPDF(doc)
    setPdfBlobUrl(url)
    setShowRawPdf(true)
  }

  const info = student.studentInfo

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-card shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-8">
            <div>
              <DialogTitle className="text-lg">Report Card Preview</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {info.fullName} — Class {info.className} ({info.division}) • {info.examinationName}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onEditMarks && (
                <Button variant="outline" size="sm" onClick={onEditMarks} className="gap-1.5">
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Marks
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleTogglePdfPreview} className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {showRawPdf ? 'HTML Preview' : 'Preview PDF'}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintPDF} className="gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                Print PDF
              </Button>
              <Button size="sm" onClick={handleDownloadPDF} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Generate PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6">
          {showRawPdf && pdfBlobUrl ? (
            <div className="h-[68vh] w-full rounded-lg border bg-white shadow-sm overflow-hidden">
              <iframe
                src={pdfBlobUrl}
                title={`Report Card PDF Preview - ${info.fullName}`}
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="mx-auto max-w-[740px] rounded-lg border bg-white p-6 sm:p-10 shadow-md text-slate-900">
              {/* Top Accent Bar */}
              <div className="h-1.5 w-full rounded-full bg-primary mb-6" />

              {/* School Letterhead */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left pb-5 border-b border-slate-200">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-blue-50 text-primary">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div className="flex-1 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                    {school.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{school.address}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tel: {school.contact}</p>
                </div>
                <div className="hidden sm:block w-14 shrink-0" />
              </div>

              {/* Report Card Title */}
              <div className="text-center py-4 border-b border-slate-200">
                <h3 className="text-base font-bold tracking-wider uppercase text-slate-900">
                  Academic Progress Report Card
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Academic Year: <span className="font-medium text-slate-800">{info.academicYear}</span>
                  {'  |  '}
                  Examination: <span className="font-medium text-slate-800">{info.examinationName}</span>
                  {info.examinationDate && (
                    <>
                      {'  |  '}
                      Date: <span className="font-medium text-slate-800">{formatDate(info.examinationDate)}</span>
                    </>
                  )}
                </p>
              </div>

              {/* Student Details */}
              <div className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-700 min-w-[110px]">Student Name:</span>
                  <span className="font-medium text-slate-900">{info.fullName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-700 min-w-[80px]">Class:</span>
                  <span className="font-medium text-slate-900">{info.className}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-700 min-w-[110px]">Roll Number:</span>
                  <span className="font-medium text-slate-900 tabular-nums">{info.rollNumber}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-700 min-w-[80px]">Division:</span>
                  <span className="font-medium text-slate-900">{info.division}</span>
                </div>
              </div>

              {/* Marks Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="px-3 py-2.5 text-center font-semibold w-14">Sr.</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Subject</th>
                      <th className="px-3 py-2.5 text-center font-semibold">Max Marks</th>
                      <th className="px-3 py-2.5 text-center font-semibold">Passing</th>
                      <th className="px-3 py-2.5 text-center font-semibold">Obtained</th>
                      <th className="px-3 py-2.5 text-center font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {calculations.subjectResults.map((res, idx) => {
                      const status = res.isAbsent ? 'ABSENT' : res.isPassed ? 'PASS' : 'FAIL'
                      return (
                        <tr
                          key={res.subject.id}
                          className={idx % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}
                        >
                          <td className="px-3 py-2 text-center tabular-nums text-slate-600">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-900">
                            {res.subject.name}
                          </td>
                          <td className="px-3 py-2 text-center tabular-nums">
                            {res.subject.maxMarks}
                          </td>
                          <td className="px-3 py-2 text-center tabular-nums text-slate-600">
                            {res.subject.passingMarks}
                          </td>
                          <td className="px-3 py-2 text-center tabular-nums font-medium">
                            {res.isAbsent ? (
                              <span className="text-amber-700 font-semibold">AB</span>
                            ) : (
                              res.subject.obtainedMarks
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                                getResultBadgeColor(status),
                              )}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="bg-slate-200/80 font-bold text-slate-900">
                      <td className="px-3 py-2.5 text-center" />
                      <td className="px-3 py-2.5">Grand Total</td>
                      <td className="px-3 py-2.5 text-center tabular-nums">
                        {calculations.totalMaxMarks}
                      </td>
                      <td className="px-3 py-2.5 text-center">—</td>
                      <td className="px-3 py-2.5 text-center tabular-nums">
                        {calculations.totalObtainedMarks}
                      </td>
                      <td className="px-3 py-2.5 text-center">{calculations.overallResult}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Academic Summary */}
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Total Marks</p>
                    <p className="font-bold text-slate-900 tabular-nums mt-0.5">
                      {calculations.totalObtainedMarks} / {calculations.totalMaxMarks}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Percentage</p>
                    <p className="font-bold text-slate-900 tabular-nums mt-0.5">
                      {formatPercentage(calculations.percentage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Grade</p>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {calculations.grade}{' '}
                      <span className="text-xs font-normal text-slate-600">
                        ({calculations.gradeDescription})
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Overall Result</p>
                    <div className="mt-0.5">
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
                <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap gap-4">
                  <span>Passed: <strong>{calculations.passedSubjects}</strong></span>
                  <span>Failed: <strong>{calculations.failedSubjects}</strong></span>
                  <span>Absent: <strong>{calculations.absentSubjects}</strong></span>
                </div>
              </div>

              {/* Teacher Remarks */}
              <div className="mt-5 border-t border-slate-200 pt-4 text-sm">
                <span className="font-semibold text-slate-800">Teacher Remarks: </span>
                <span className="text-slate-700">
                  {student.remarks && student.remarks.trim().length > 0
                    ? student.remarks
                    : 'N/A'}
                </span>
              </div>

              {/* Signatures Footer */}
              <div className="mt-12 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs text-slate-700">
                <div>
                  <div className="mx-auto mb-2 h-8 w-32 border-b border-slate-400" />
                  <p className="font-medium">Class Teacher Signature</p>
                </div>
                <div>
                  <div className="mx-auto mb-2 h-8 w-32 border-b border-slate-400" />
                  <p className="font-medium">Principal Signature</p>
                  <p className="mt-2 text-[10px] text-slate-400">[ Official School Seal ]</p>
                </div>
                <div>
                  <div className="mx-auto mb-2 h-8 w-32 border-b border-slate-400 flex items-end justify-center pb-1 text-slate-600">
                    {new Date().toLocaleDateString('en-IN')}
                  </div>
                  <p className="font-medium">Date</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-card px-6 py-3 shrink-0">
          <Button variant="ghost" onClick={onClose} className="gap-1.5">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

