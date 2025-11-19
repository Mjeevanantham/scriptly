export type AppMode = 'chat' | 'code' | 'research' | 'settings'

export type AppPage =
  | 'login'
  | 'dashboard'
  | 'chat'
  | 'code-review'
  | 'deployment'
  | 'research'
  | 'settings'
  | 'profiles'
  | 'history'

export interface AppState {
  isAuthenticated: boolean
  currentPage: AppPage
  currentMode: AppMode
  isLoading: boolean
  userProfile?: UserProfile
}

export interface UserProfile {
  id: string
  name: string
  apiKeyProfile: string
  preferences: UserPreferences
  createdAt: number
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultMode: AppMode
  defaultPage: AppPage
  autoSave: boolean
  offlineMode: boolean
}

export interface RefactorSuggestion {
  id: string
  filePath: string
  lineRange: [number, number]
  originalCode: string
  suggestedCode: string
  reason: string
  confidence: number
  mode: 'refactor' | 'optimize' | 'fix' | 'simplify'
}

export interface TestSuggestion {
  id: string
  filePath: string
  testCode: string
  testFramework: string
  description: string
  coverage: number
}

export interface BugDetection {
  id: string
  filePath: string
  line: number
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
  category: 'security' | 'performance' | 'logic' | 'style'
}

export interface CodeQualityMetrics {
  filePath: string
  complexity: number
  maintainability: number
  testCoverage: number
  issues: BugDetection[]
  suggestions: RefactorSuggestion[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  codeContext?: string
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  mode: AppMode
  provider?: string
}

export interface DeploymentTarget {
  id: string
  name: string
  type: 'aws' | 'vercel' | 'digitalocean' | 'custom'
  config: Record<string, any>
  lastDeployed?: number
}

export interface HistoryEntry {
  id: string
  type: 'chat' | 'code-review' | 'deployment' | 'refactor' | 'test'
  title: string
  timestamp: number
  data: any
}

export interface LoaderState {
  isLoading: boolean
  message?: string
  progress?: number
  type?: 'spinner' | 'progress' | 'pulse'
}

export interface NavigationState {
  currentPage: AppPage
  previousPage?: AppPage
  canGoBack: boolean
  canGoForward: boolean
  history: AppPage[]
}

