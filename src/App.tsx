import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { AppProvider } from '@/context/AppContext'
import { ToastProvider } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import MarksEntry from '@/pages/MarksEntry'
import ReportCards from '@/pages/ReportCards'

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <ToastProvider>
          <AppProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/marks-entry" element={<MarksEntry />} />
                  <Route path="/report-cards" element={<ReportCards />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </ToastProvider>
      </TooltipProvider>
    </MotionConfig>
  )
}

export default App
