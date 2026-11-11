import { useLocation } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/marks-entry': 'Marks Entry',
  '/report-cards': 'Report Cards',
}

export function TopBar() {
  const location = useLocation()

  const title = pageTitles[location.pathname] ?? 'ScholarTrack'

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b bg-card/80 backdrop-blur-md px-6 py-3 lg:px-8">
      {/* Spacer for mobile menu button */}
      <div className="w-9 lg:hidden" />

      <div className="flex items-center gap-3">
        <GraduationCap className="h-5 w-5 text-primary lg:hidden" />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Demo Mode
        </div>
      </div>
    </header>
  )
}

