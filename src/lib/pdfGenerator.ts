import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type {
  CalculationResult,
  ReportCardData,
  SchoolInfo,
  StudentRecord,
  Subject,
} from '@/types'
import { formatDate, formatPercentage } from '@/lib/formatters'

// ── Color constants ──────────────────────────────────────────────────
const PRIMARY: [number, number, number] = [37, 99, 235] // #2563EB
const TEXT_DARK: [number, number, number] = [15, 23, 42] // #0F172A
const TEXT_MUTED: [number, number, number] = [100, 116, 139] // #64748B
const WHITE: [number, number, number] = [255, 255, 255]
const PASS_GREEN: [number, number, number] = [22, 163, 74]
const FAIL_RED: [number, number, number] = [220, 38, 38]
const ABSENT_ORANGE: [number, number, number] = [217, 119, 6]
const LIGHT_GRAY: [number, number, number] = [248, 250, 252]
const BORDER_GRAY: [number, number, number] = [203, 213, 225]

// ── Layout constants ─────────────────────────────────────────────────
const MARGIN_LEFT = 20
const MARGIN_RIGHT = 20
const MARGIN_TOP = 18
const PAGE_WIDTH = 210 // A4 mm
const PAGE_HEIGHT = 297 // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const FOOTER_HEIGHT = 36

// ── Unicode / Non-Latin helper ───────────────────────────────────────

function hasNonLatin1(text: string): boolean {
  // Check for characters outside ISO-8859-1 that standard Helvetica cannot encode
  return /[^\u0000-\u00FF]/.test(text)
}

/**
 * Renders text containing non-Latin scripts (e.g. Marathi/Devanagari) onto an
 * offscreen high-DPI canvas and draws it into jsPDF as a crisp PNG image.
 */
function drawUnicodeText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize: number
    fontWeight?: 'normal' | 'bold'
    color?: [number, number, number]
    align?: 'left' | 'center' | 'right'
    maxWidthMm?: number
  },
): void {
  if (typeof document === 'undefined' || !hasNonLatin1(text)) {
    doc.text(text, x, y, {
      align: options.align ?? 'left',
      maxWidth: options.maxWidthMm,
    })
    return
  }

  const scale = 4
  const ptToMm = 0.352778
  const fontPx = options.fontSize * scale * 1.333
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    doc.text(text, x, y, { align: options.align ?? 'left' })
    return
  }

  const weight = options.fontWeight === 'bold' ? '700' : '400'
  const fontFamily = '"Noto Sans Devanagari", "Nirmala UI", "Mangal", "Inter", system-ui, sans-serif'
  ctx.font = `${weight} ${fontPx}px ${fontFamily}`

  const metrics = ctx.measureText(text)
  const textWidthPx = Math.ceil(metrics.width) + 8
  const textHeightPx = Math.ceil(fontPx * 1.4)

  canvas.width = Math.max(1, textWidthPx)
  canvas.height = Math.max(1, textHeightPx)

  ctx.font = `${weight} ${fontPx}px ${fontFamily}`
  const [r, g, b] = options.color ?? TEXT_DARK
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 2, textHeightPx / 2)

  const imgWidthMm = (textWidthPx / scale) * 0.264583
  const imgHeightMm = (textHeightPx / scale) * 0.264583
  const clampedWidth = options.maxWidthMm
    ? Math.min(imgWidthMm, options.maxWidthMm)
    : imgWidthMm
  const finalHeight = imgHeightMm * (clampedWidth / Math.max(0.1, imgWidthMm))

  let drawX = x
  if (options.align === 'center') drawX = x - clampedWidth / 2
  else if (options.align === 'right') drawX = x - clampedWidth

  const baselineOffset = options.fontSize * ptToMm * 0.85
  const dataUrl = canvas.toDataURL('image/png')
  doc.addImage(dataUrl, 'PNG', drawX, y - baselineOffset, clampedWidth, finalHeight)
}

// ── Internal helpers ─────────────────────────────────────────────────

function drawHorizontalLine(doc: jsPDF, y: number, color: [number, number, number] = BORDER_GRAY): void {
  doc.setDrawColor(...color)
  doc.setLineWidth(0.4)
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y)
}

function ensureSpace(doc: jsPDF, currentY: number, neededHeight: number): number {
  if (currentY + neededHeight > PAGE_HEIGHT - FOOTER_HEIGHT - 6) {
    doc.addPage()
    return MARGIN_TOP
  }
  return currentY
}

function drawHeader(doc: jsPDF, school: SchoolInfo, startY: number): number {
  let y = startY

  // Subtle top accent bar
  doc.setFillColor(...PRIMARY)
  doc.rect(MARGIN_LEFT, y - 4, CONTENT_WIDTH, 1.5, 'F')
  y += 4

  // School emblem placeholder on top-left
  const emblemX = MARGIN_LEFT + 7
  const emblemY = y + 6
  doc.setDrawColor(...PRIMARY)
  doc.setFillColor(239, 246, 255)
  doc.setLineWidth(0.5)
  doc.circle(emblemX, emblemY, 7, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PRIMARY)
  const initials = school.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'SC'
  doc.text(initials, emblemX, emblemY + 1, { align: 'center' })

  // School name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(...PRIMARY)
  drawUnicodeText(doc, school.name, PAGE_WIDTH / 2 + 4, y + 3, {
    fontSize: 17,
    fontWeight: 'bold',
    color: PRIMARY,
    align: 'center',
    maxWidthMm: CONTENT_WIDTH - 22,
  })
  y += 9

  // School address
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...TEXT_DARK)
  drawUnicodeText(doc, school.address, PAGE_WIDTH / 2 + 4, y, {
    fontSize: 9.5,
    color: TEXT_DARK,
    align: 'center',
    maxWidthMm: CONTENT_WIDTH - 22,
  })
  y += 5

  // Contact info
  doc.setFontSize(8.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(`Tel: ${school.contact}`, PAGE_WIDTH / 2 + 4, y, { align: 'center' })
  y += 5

  // Separator line
  drawHorizontalLine(doc, y)
  y += 7

  // REPORT CARD title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...TEXT_DARK)
  doc.text('ACADEMIC PROGRESS REPORT CARD', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 6

  return y
}

function drawStudentMeta(
  doc: jsPDF,
  student: StudentRecord,
  startY: number,
): number {
  let y = startY
  const info = student.studentInfo

  // Academic Year, Examination Name, and optional Date
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...TEXT_MUTED)
  const examLineParts = [
    `Academic Year: ${info.academicYear}`,
    `Examination: ${info.examinationName}`,
  ]
  if (info.examinationDate) {
    examLineParts.push(`Date: ${formatDate(info.examinationDate)}`)
  }
  drawUnicodeText(doc, examLineParts.join('   |   '), PAGE_WIDTH / 2, y, {
    fontSize: 9.5,
    color: TEXT_MUTED,
    align: 'center',
    maxWidthMm: CONTENT_WIDTH,
  })
  y += 5

  drawHorizontalLine(doc, y)
  y += 7

  // Student info box background
  doc.setFillColor(...LIGHT_GRAY)
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN_LEFT, y - 4, CONTENT_WIDTH, 18, 2, 2, 'FD')

  const col1X = MARGIN_LEFT + 4
  const col2X = PAGE_WIDTH / 2 + 6

  // Row 1
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...TEXT_DARK)
  doc.text('Student Name:', col1X, y + 1)
  doc.setFont('helvetica', 'normal')
  drawUnicodeText(doc, info.fullName, col1X + 29, y + 1, {
    fontSize: 9.5,
    color: TEXT_DARK,
    maxWidthMm: PAGE_WIDTH / 2 - col1X - 28,
  })

  doc.setFont('helvetica', 'bold')
  doc.text('Class:', col2X, y + 1)
  doc.setFont('helvetica', 'normal')
  doc.text(info.className, col2X + 15, y + 1)
  y += 7

  // Row 2
  doc.setFont('helvetica', 'bold')
  doc.text('Roll Number:', col1X, y + 1)
  doc.setFont('helvetica', 'normal')
  doc.text(info.rollNumber, col1X + 29, y + 1)

  doc.setFont('helvetica', 'bold')
  doc.text('Division:', col2X, y + 1)
  doc.setFont('helvetica', 'normal')
  doc.text(info.division, col2X + 18, y + 1)
  y += 11

  return y
}

function drawMarksTable(
  doc: jsPDF,
  subjects: Subject[],
  calculations: CalculationResult,
  startY: number,
): number {
  const head = [['Sr. No.', 'Subject', 'Max Marks', 'Passing Marks', 'Obtained Marks', 'Result']]

  const body: (string | number)[][] = subjects.map((sub, idx) => {
    const result = calculations.subjectResults.find((r) => r.subject.id === sub.id)
    let resultText = 'PASS'
    if (sub.isAbsent) {
      resultText = 'ABSENT'
    } else if (result && !result.isPassed) {
      resultText = 'FAIL'
    }

    return [
      idx + 1,
      hasNonLatin1(sub.name) ? ' ' : sub.name,
      sub.maxMarks,
      sub.passingMarks,
      sub.isAbsent ? 'AB' : (sub.obtainedMarks ?? '-'),
      resultText,
    ]
  })

  const footRow: (string | number)[] = [
    '',
    'Grand Total',
    calculations.totalMaxMarks,
    '-',
    calculations.totalObtainedMarks,
    calculations.overallResult,
  ]

  autoTable(doc, {
    startY,
    head,
    body: [...body, footRow],
    theme: 'grid',
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT, bottom: FOOTER_HEIGHT + 4 },
    headStyles: {
      fillColor: PRIMARY,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEXT_DARK,
      halign: 'center',
      cellPadding: 2.8,
    },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY,
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { cellWidth: 24 },
      3: { cellWidth: 27 },
      4: { cellWidth: 28 },
      5: { cellWidth: 22 },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 5) {
        const val = String(data.cell.raw)
        if (val === 'FAIL') {
          data.cell.styles.textColor = FAIL_RED
          data.cell.styles.fontStyle = 'bold'
        } else if (val === 'PASS') {
          data.cell.styles.textColor = PASS_GREEN
          data.cell.styles.fontStyle = 'bold'
        } else if (val === 'ABSENT') {
          data.cell.styles.textColor = ABSENT_ORANGE
          data.cell.styles.fontStyle = 'bold'
        }
      }
      const isLastRow = data.section === 'body' && data.row.index === body.length
      if (isLastRow) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = [226, 232, 240]
      }
    },
    didDrawCell(data) {
      // Draw non-Latin1 subject names cleanly via canvas image
      if (
        data.section === 'body' &&
        data.column.index === 1 &&
        data.row.index < subjects.length
      ) {
        const sub = subjects[data.row.index]
        if (sub && hasNonLatin1(sub.name)) {
          drawUnicodeText(
            doc,
            sub.name,
            data.cell.x + 2.5,
            data.cell.y + data.cell.height / 2 + 1.2,
            {
              fontSize: 9,
              color: TEXT_DARK,
              maxWidthMm: data.cell.width - 5,
            },
          )
        }
      }
    },
  })

  const tableDoc = doc as jsPDF & { lastAutoTable?: { finalY: number } }
  return tableDoc.lastAutoTable?.finalY ?? startY + 20
}

function drawSummary(
  doc: jsPDF,
  calculations: CalculationResult,
  startY: number,
): number {
  let y = ensureSpace(doc, startY + 6, 30)

  doc.setFillColor(...LIGHT_GRAY)
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 24, 2, 2, 'FD')

  y += 6.5
  doc.setFontSize(10)
  doc.setTextColor(...TEXT_DARK)

  const leftCol = MARGIN_LEFT + 4
  const rightCol = PAGE_WIDTH / 2 + 6
  const lineHeight = 6.5

  // Row 1
  doc.setFont('helvetica', 'bold')
  doc.text('Total Marks:', leftCol, y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${calculations.totalObtainedMarks} / ${calculations.totalMaxMarks}`,
    leftCol + 28,
    y,
  )

  doc.setFont('helvetica', 'bold')
  doc.text('Percentage:', rightCol, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatPercentage(calculations.percentage), rightCol + 25, y)
  y += lineHeight

  // Row 2
  doc.setFont('helvetica', 'bold')
  doc.text('Grade:', leftCol, y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${calculations.grade} (${calculations.gradeDescription})`,
    leftCol + 16,
    y,
  )

  doc.setFont('helvetica', 'bold')
  doc.text('Overall Result:', rightCol, y)

  const resultColor =
    calculations.overallResult === 'PASS'
      ? PASS_GREEN
      : calculations.overallResult === 'FAIL'
        ? FAIL_RED
        : ABSENT_ORANGE
  doc.setTextColor(...resultColor)
  doc.text(calculations.overallResult, rightCol + 30, y)
  doc.setTextColor(...TEXT_DARK)
  y += lineHeight

  // Subject breakdown
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(
    `Subjects Passed: ${calculations.passedSubjects}   |   Failed: ${calculations.failedSubjects}   |   Absent: ${calculations.absentSubjects}`,
    leftCol,
    y,
  )

  return y + 6
}

function drawRemarks(doc: jsPDF, remarks: string | undefined, startY: number): number {
  const remarkText = remarks && remarks.trim().length > 0 ? remarks.trim() : 'N/A'
  const splitRemarks = doc.splitTextToSize(remarkText, CONTENT_WIDTH - 26) as string[]
  const blockHeight = Math.max(12, splitRemarks.length * 5 + 8)

  let y = ensureSpace(doc, startY + 2, blockHeight)

  drawHorizontalLine(doc, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...TEXT_DARK)
  doc.text('Teacher Remarks:', MARGIN_LEFT, y)

  doc.setFont('helvetica', 'normal')
  if (hasNonLatin1(remarkText)) {
    drawUnicodeText(doc, remarkText, MARGIN_LEFT + 34, y, {
      fontSize: 9.5,
      color: TEXT_DARK,
      maxWidthMm: CONTENT_WIDTH - 34,
    })
  } else {
    const wrapped = doc.splitTextToSize(remarkText, CONTENT_WIDTH - 34) as string[]
    doc.text(wrapped, MARGIN_LEFT + 34, y)
    return y + wrapped.length * 5 + 4
  }

  return y + 10
}

function drawFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()
  doc.setPage(pageCount)
  const footerY = PAGE_HEIGHT - 30

  drawHorizontalLine(doc, footerY - 5)

  const sigLineWidth = 40
  const sigY = footerY + 8
  const sigLabelY = sigY + 5

  const positions = [
    { label: 'Class Teacher Signature', x: MARGIN_LEFT + 22 },
    { label: 'Principal Signature', x: PAGE_WIDTH / 2 },
    { label: `Date: ${new Date().toLocaleDateString('en-IN')}`, x: PAGE_WIDTH - MARGIN_RIGHT - 22 },
  ]

  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...TEXT_DARK)

  for (const pos of positions) {
    doc.line(pos.x - sigLineWidth / 2, sigY, pos.x + sigLineWidth / 2, sigY)
    doc.text(pos.label, pos.x, sigLabelY, { align: 'center' })
  }

  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('[ Official School Seal ]', PAGE_WIDTH / 2, footerY + 19, { align: 'center' })
}

function generateSingleReportPage(doc: jsPDF, data: ReportCardData): void {
  let y = MARGIN_TOP

  y = drawHeader(doc, data.school, y)
  y = drawStudentMeta(doc, data.student, y)
  y = drawMarksTable(doc, data.student.subjects, data.calculations, y)
  y = drawSummary(doc, data.calculations, y)
  drawRemarks(doc, data.student.remarks, y)
  drawFooter(doc)
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Generates a single student report card PDF on A4 paper.
 */
export function generateReportCardPDF(data: ReportCardData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  generateSingleReportPage(doc, data)
  return doc
}

/**
 * Generates a combined PDF with one student report card starting on a fresh page.
 */
export function generateCombinedPDF(dataList: ReportCardData[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  dataList.forEach((data, index) => {
    if (index > 0) {
      doc.addPage()
    }
    generateSingleReportPage(doc, data)
  })

  return doc
}

/**
 * Saves / downloads the PDF with the given filename.
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename)
}

/**
 * Returns a blob URL for previewing the PDF.
 * The caller is responsible for revoking the URL via URL.revokeObjectURL().
 */
export function previewPDF(doc: jsPDF): string {
  const blob = doc.output('blob')
  return URL.createObjectURL(blob)
}

/**
 * Opens the browser print dialog for the PDF.
 */
export function printPDF(doc: jsPDF): void {
  const blobUrl = previewPDF(doc)
  const printWindow = window.open(blobUrl, '_blank')
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      printWindow.print()
    })
  }
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl)
  }, 60000)
}
