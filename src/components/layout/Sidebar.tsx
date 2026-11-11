import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  PenLine,
  FileText,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/marks-entry', icon: PenLine, label: 'Marks Entry' },
  { to: '/report-cards', icon: FileText, label: 'Report Cards' },
]

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-card transition-transform duration-200 lg:translate-x-0 lg:z-30",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Branding */}
        <div className="flex items-center gap-3 px-6 py-5 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground">
              ScholarTrack
            </span>
            <span className="text-[11px] text-muted-foreground">
              Report Card System
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t px-4 py-3">
          <p className="text-[11px] text-muted-foreground text-center">
            Session Data Only • Not Stored
          </p>
        </div>
      </aside>
    </>
  )
}

