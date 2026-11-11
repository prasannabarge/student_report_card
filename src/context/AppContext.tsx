import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react'
import { getSampleStudent, getAdditionalSampleStudents } from '@/data/sampleData'
import type { StudentRecord, ActivityItem, AppState } from '@/types'

// ---------------------------------------------------------------------------
// Action types (discriminated union — no enums)
// ---------------------------------------------------------------------------

type AppAction =
  | { type: 'ADD_STUDENT'; payload: StudentRecord }
  | { type: 'UPDATE_STUDENT'; payload: StudentRecord }
  | { type: 'REMOVE_STUDENT'; payload: string }
  | { type: 'INCREMENT_REPORT_COUNT' }
  | { type: 'ADD_ACTIVITY'; payload: Omit<ActivityItem, 'id' | 'timestamp'> }
  | { type: 'LOAD_SAMPLE_DATA' }
  | { type: 'CLEAR_ALL_DATA' }

// ---------------------------------------------------------------------------
// Helper — create a full ActivityItem from a partial one
// ---------------------------------------------------------------------------

function createActivityItem(partial: Omit<ActivityItem, 'id' | 'timestamp'>): ActivityItem {
  return {
    ...partial,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: AppState = {
  students: [],
  reportCardsGenerated: 0,
  recentActivity: [],
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_STUDENT':
      return {
        ...state,
        students: [...state.students, action.payload],
      }

    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map((s) =>
          s.studentInfo.id === action.payload.studentInfo.id ? action.payload : s,
        ),
      }

    case 'REMOVE_STUDENT':
      return {
        ...state,
        students: state.students.filter((s) => s.studentInfo.id !== action.payload),
      }

    case 'INCREMENT_REPORT_COUNT':
      return {
        ...state,
        reportCardsGenerated: state.reportCardsGenerated + 1,
      }

    case 'ADD_ACTIVITY':
      return {
        ...state,
        recentActivity: [createActivityItem(action.payload), ...state.recentActivity].slice(0, 50),
      }

    case 'LOAD_SAMPLE_DATA': {
      const sampleStudents = [getSampleStudent(), ...getAdditionalSampleStudents()]
      return {
        ...state,
        students: [...state.students, ...sampleStudents],
      }
    }

    case 'CLEAR_ALL_DATA':
      return { ...initialState }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  addStudent: (record: StudentRecord) => void
  updateStudent: (record: StudentRecord) => void
  removeStudent: (id: string) => void
  incrementReportCount: () => void
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void
  loadSampleData: () => void
  clearAllData: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const helpers = useMemo<Omit<AppContextValue, 'state' | 'dispatch'>>(() => ({
    addStudent(record: StudentRecord) {
      dispatch({ type: 'ADD_STUDENT', payload: record })
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          type: 'student_added',
          description: `Added student "${record.studentInfo.fullName}" (Roll No. ${record.studentInfo.rollNumber})`,
          studentName: record.studentInfo.fullName,
        },
      })
    },

    updateStudent(record: StudentRecord) {
      dispatch({ type: 'UPDATE_STUDENT', payload: record })
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          type: 'marks_entered',
          description: `Updated record for "${record.studentInfo.fullName}"`,
          studentName: record.studentInfo.fullName,
        },
      })
    },

    removeStudent(id: string) {
      const student = state.students.find((s) => s.studentInfo.id === id)
      dispatch({ type: 'REMOVE_STUDENT', payload: id })
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          type: 'student_removed',
          description: `Removed student "${student?.studentInfo.fullName ?? 'Unknown'}"`,
          studentName: student?.studentInfo.fullName,
        },
      })
    },

    incrementReportCount() {
      dispatch({ type: 'INCREMENT_REPORT_COUNT' })
    },

    addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>) {
      dispatch({ type: 'ADD_ACTIVITY', payload: activity })
    },

    loadSampleData() {
      dispatch({ type: 'LOAD_SAMPLE_DATA' })
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          type: 'student_added',
          description: 'Loaded sample student data (3 students)',
        },
      })
    },

    clearAllData() {
      dispatch({ type: 'CLEAR_ALL_DATA' })
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          type: 'student_removed',
          description: 'Cleared all student data',
        },
      })
    },
  }), [state.students])

  const value = useMemo<AppContextValue>(
    () => ({ state, dispatch, ...helpers }),
    [state, dispatch, helpers],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (ctx === undefined) {
    throw new Error('useAppContext must be used within an <AppProvider>')
  }
  return ctx
}
