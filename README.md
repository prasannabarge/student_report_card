# ScholarTrack — School Marks Management & Automatic Report Card Generator

**ScholarTrack** is a frontend-only demonstration web application built for school management, principals, and teachers. It allows teachers to enter student details and subject-wise marks through a clean, validated interface, automatically calculates academic results and grades, renders an accurate report card preview, and exports print-ready A4 PDF report cards—all directly in the browser without requiring a backend server or database.

> **Demo Scope Notice:** All student records, activity logs, and generated report counts are stored temporarily in React session state (`AppContext`) and are cleared when the browser tab is closed or refreshed. This application is a frontend demonstration/MVP and is not intended for permanent academic record storage.

---

## Key Features

### 1. Session Dashboard (`/`)
- Overview cards showing session student count, configured subjects, and total report cards generated in the current session.
- **Quick Actions** to jump directly into marks entry, view report cards, load built-in demonstration records, or clear all session data.
- **Recent Activity** feed tracking added/updated/removed students and generated PDFs with relative timestamps.

### 2. Dynamic Marks Entry & Live Calculation (`/marks-entry`)
- **Student Information Form** (validated with React Hook Form + Zod):
  - Student Full Name, Roll Number, Class (`1`–`10`), Division (`A`–`D`), Academic Year (`YYYY-YYYY`), Examination Name (with quick presets), Examination Date (optional), and Teacher Remarks.
- **Dynamic Subject Management**:
  - Starts with 5 default subjects (`English`, `Mathematics`, `Science`, `Marathi`, `History`) that can be freely edited, removed (minimum 1 subject enforced), or expanded with any number of custom subjects.
  - Per-subject configurable **Maximum Marks** and **Passing Marks**.
  - Supports **decimal marks** (e.g. `78.5`).
  - Explicit **Absent (`AB`)** toggle per subject so absent students are tracked accurately instead of being silently treated as zero.
- **Real-Time Validation**:
  - Detects empty student/subject fields, negative marks, passing marks exceeding max marks, obtained marks exceeding max marks, missing marks on non-absent subjects, and duplicate subject names.
  - Prevents generating a final report card when entries are incomplete or invalid.
- **Edit Mode**: Existing session students can be reopened in `/marks-entry?edit=<id>` to update marks or remarks.

### 3. Automatic Calculation & Grading Engine (`src/lib/calculations.ts`)
- **Subject Result**: `PASS` if `obtainedMarks >= passingMarks`, `FAIL` if below passing marks, `ABSENT` if marked absent.
- **Totals & Percentage**: Sums maximum and obtained marks (absent subjects contribute `0` to obtained marks) and rounds percentage cleanly to 2 decimal places.
- **Overall Result**:
  - `ABSENT` if one or more subjects are marked absent.
  - `FAIL` if no subjects are absent and at least one subject is failed.
  - `PASS` only when all subjects are passed.
- **Configurable Grading Scale** (`getDefaultGradeScale()`):

| Percentage Range | Grade | Description   |
| ---------------- | ----- | ------------- |
| `90 – 100%`      | `A+`  | Outstanding   |
| `80 – 89.99%`    | `A`   | Excellent     |
| `70 – 79.99%`    | `B+`  | Very Good     |
| `60 – 69.99%`    | `B`   | Good          |
| `50 – 59.99%`    | `C`   | Average       |
| `35 – 49.99%`    | `D`   | Below Average |
| `0 – 34.99%`     | `F`   | Fail          |

### 4. Report Card Preview & A4 PDF Generation (`/report-cards`)
- **HTML & In-Browser PDF Preview** (`ReportCardPreview`):
  - Displays an A4-proportioned report card preview matching the exported PDF, plus a toggleable live PDF Blob preview (`<iframe>`) with proper `URL.revokeObjectURL` cleanup.
- **Professional A4 PDF Export** (`jsPDF` + `jspdf-autotable`):
  - School letterhead (emblem badge, configurable school name, address, and contact details).
  - Student metadata grid, color-coded marks table (`PASS` / `FAIL` / `ABSENT`), grand total row, summary card, teacher remarks, and signature lines (`Class Teacher`, `Principal`, `Date`, `[ Official School Seal ]`).
  - Automatic page-break handling for long subject lists and multi-line remarks.
  - Unicode / Devanagari text fallback rendering (e.g., Marathi subject or student names) via high-DPI offscreen canvas.
  - Standardized file naming: `StudentName_ClassX_Div_Examination.pdf` (e.g., `RahulPatil_Class5_A_FirstTermExamination.pdf`).
- **Multi-Student Management & Combined Class PDF**:
  - Search by student name, roll number, or examination, and filter by class.
  - Download or print individual PDFs, edit marks, or remove students (with confirmation dialog).
  - Export a **Combined Class PDF** containing one student report card starting on a fresh A4 page per student.
  - Customize the active school letterhead live via **Configure School**.

### 5. Built-In Sample Demonstration Data
Clicking **Load Sample Data** adds 3 pre-configured Class 5-A demonstration records (`Rahul Patil`, `Priya Sharma`, and `Amit Deshmukh`) covering mixed pass/fail results, high-scoring results, and absent-subject handling.

---

## Tech Stack

- **Core**: React 19, TypeScript, Vite 8
- **Routing**: React Router (`react-router-dom`)
- **Styling & UI**: Tailwind CSS v4 (`@tailwindcss/vite`), Radix UI primitives, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Forms & Validation**: React Hook Form, Zod, `@hookform/resolvers`
- **PDF Generation**: `jspdf`, `jspdf-autotable`
- **Animations & Icons**: Motion (`motion/react` with `MotionConfig reducedMotion="user"`), Lucide React
- **Linting**: Oxlint

---

## Project Structure

```text
student_report_card/
├── index.html
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx                             # Router, MotionConfig, Toast & App providers
    ├── main.tsx                            # Application entry point
    ├── index.css                           # Tailwind v4 @theme tokens & print/scrollbar styles
    ├── types/
    │   └── index.ts                        # TypeScript interfaces (Subject, StudentRecord, etc.)
    ├── context/
    │   └── AppContext.tsx                  # Session state management (useReducer + helpers)
    ├── data/
    │   └── sampleData.ts                   # Default school info, classes, divisions & demo students
    ├── lib/
    │   ├── calculations.ts                 # Pure subject/overall calculation & grading engine
    │   ├── validation.ts                   # Zod schemas & duplicate/completeness validators
    │   ├── formatters.ts                   # Percentage, marks, date, filename & badge helpers
    │   ├── pdfGenerator.ts                 # Individual & combined A4 PDF generation utilities
    │   └── utils.ts                        # cn() class merging utility
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx               # Responsive shell combining Sidebar, TopBar & Outlet
    │   │   ├── Sidebar.tsx                 # Desktop & mobile slide-over navigation
    │   │   └── TopBar.tsx                  # Page title bar & Demo Mode indicator
    │   ├── reports/
    │   │   └── ReportCardPreview.tsx       # Visual A4 preview modal + PDF Blob iframe viewer
    │   └── ui/                             # Reusable Radix + Tailwind UI primitives
    └── pages/
        ├── Dashboard.tsx                   # Session overview, quick actions & activity feed
        ├── MarksEntry.tsx                  # Student info + dynamic subject marks entry form
        └── ReportCards.tsx                 # Student list, school config, individual & combined PDFs
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm**

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

*(On Windows PowerShell, if `npm.ps1` is blocked by execution policy, run `npm.cmd run dev` or `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first.)*

### Available Scripts

| Command           | Description                                        |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Starts the Vite development server with HMR        |
| `npm run build`   | Runs `tsc -b` type-checking and builds `dist/`     |
| `npm run preview` | Serves the production `dist/` build locally        |
| `npm run lint`    | Runs `oxlint` across the codebase                  |

---

## Static Deployment

Because the application runs entirely on the client with no backend dependencies, the compiled `dist/` directory produced by `npm run build` can be deployed directly to any static hosting service (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.). Note that SPA fallback routing to `index.html` should be configured for direct navigation to `/marks-entry` or `/report-cards`.
