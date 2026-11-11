import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Users,
  BookOpen,
  FileText,
  PenLine,
  ArrowRight,
  Clock,
  Sparkles,
  GraduationCap,
  UserPlus,
  FileDown,
  Trash2,
} from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRelativeTime } from '@/lib/formatters'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { state, loadSampleData, clearAllData } = useAppContext()

  const totalSubjects = state.students.length > 0
    ? new Set(state.students.flatMap((s) => s.subjects.map((sub) => sub.name))).size
    : 0

  const activityIcon = (type: string) => {
    switch (type) {
      case 'student_added': return <UserPlus className="h-4 w-4 text-emerald-600" />
      case 'marks_entered': return <PenLine className="h-4 w-4 text-primary" />
      case 'report_generated': return <FileDown className="h-4 w-4 text-violet-600" />
      case 'student_removed': return <Trash2 className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  Welcome to ScholarTrack
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  School Marks Management &amp; Automatic Report Card Generator.
                  Enter student marks and generate professional report cards instantly.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigate('/marks-entry')} className="gap-2">
                  <PenLine className="h-4 w-4" />
                  Enter Marks
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/report-cards')}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Report Cards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{state.students.length}</p>
                <p className="text-xs text-muted-foreground">Students (Session)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <BookOpen className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{totalSubjects}</p>
                <p className="text-xs text-muted-foreground">Subjects Configured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <FileText className="h-5 w-5 text-violet-700" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{state.reportCardsGenerated}</p>
                <p className="text-xs text-muted-foreground">Reports Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sample Data & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.students.length === 0 && (
                <button
                  onClick={loadSampleData}
                  className="w-full flex items-center gap-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-left hover:bg-primary/10 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Load Sample Data</p>
                    <p className="text-xs text-muted-foreground">
                      Load demo student records to explore the application
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              )}

              <button
                onClick={() => navigate('/marks-entry')}
                className="w-full flex items-center gap-4 rounded-lg border p-4 text-left hover:bg-accent transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <PenLine className="h-5 w-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Enter Student Marks</p>
                  <p className="text-xs text-muted-foreground">
                    Add a new student and enter subject-wise marks
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => navigate('/report-cards')}
                className="w-full flex items-center gap-4 rounded-lg border p-4 text-left hover:bg-accent transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                  <FileText className="h-5 w-5 text-violet-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Generate Report Cards</p>
                  <p className="text-xs text-muted-foreground">
                    Preview and download PDF report cards
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {state.students.length > 0 && (
                <button
                  onClick={clearAllData}
                  className="w-full flex items-center gap-4 rounded-lg border border-red-200 p-4 text-left hover:bg-red-50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Clear All Data</p>
                    <p className="text-xs text-muted-foreground">
                      Remove all session data and start fresh
                    </p>
                  </div>
                </button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No activity yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start by entering student marks or loading sample data
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {state.recentActivity
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="mt-0.5">{activityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                        {activity.studentName && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {activity.studentName}
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Session Notice */}
      <motion.div variants={itemVariants}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-xs text-amber-800">
            <strong>Demo Mode:</strong> All data is stored in your browser session only.
            Data will be lost when you close or refresh the page.
            This is not a permanent storage system.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

