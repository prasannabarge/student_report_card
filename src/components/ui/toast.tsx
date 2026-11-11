import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = 'default' | 'success' | 'destructive'

interface ToastData {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (options: { title: string; description?: string; variant?: ToastVariant }) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const toast = React.useCallback(
    (options: { title: string; description?: string; variant?: ToastVariant }) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, ...options }])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    },
    []
  )

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg",
                t.variant === 'success' && "border-emerald-200 bg-emerald-50",
                t.variant === 'destructive' && "border-red-200 bg-red-50"
              )}
            >
              <div className="mt-0.5">
                {t.variant === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : t.variant === 'destructive' ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Info className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  t.variant === 'success' && "text-emerald-900",
                  t.variant === 'destructive' && "text-red-900"
                )}>
                  {t.title}
                </p>
                {t.description && (
                  <p className={cn(
                    "mt-1 text-xs",
                    t.variant === 'success' ? "text-emerald-700" :
                    t.variant === 'destructive' ? "text-red-700" :
                    "text-muted-foreground"
                  )}>
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

