import { create } from 'zustand'
import type {
  AppState,
  AppMode,
  AppPage,
  UserProfile,
  Conversation,
  HistoryEntry,
} from '../../types/ui'
import { ChatMessage } from '../../types'

interface AppStore extends AppState {
  // Navigation
  previousPage?: AppPage
  navigateTo: (page: AppPage) => void
  navigateBack: () => void
  navigateForward: () => void
  canGoBack: boolean
  canGoForward: boolean

  // Mode
  setMode: (mode: AppMode) => void

  // Auth
  setAuthenticated: (authenticated: boolean) => void
  setUserProfile: (profile: UserProfile | undefined) => void

  // Loading
  setLoading: (isLoading: boolean, message?: string) => void

  // Conversations
  conversations: Conversation[]
  currentConversationId?: string
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  setCurrentConversation: (id: string | undefined) => void
  deleteConversation: (id: string) => void

  // History
  history: HistoryEntry[]
  addHistoryEntry: (entry: HistoryEntry) => void
  clearHistory: () => void

  // Navigation history
  navigationHistory: AppPage[]
  historyIndex: number
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  currentPage: 'login',
  currentMode: 'chat',
  isLoading: false,
  userProfile: undefined,
  conversations: [],
  currentConversationId: undefined,
  history: [],
  navigationHistory: ['login'],
  historyIndex: 0,
  canGoBack: false,
  canGoForward: false,
  previousPage: undefined,

  // Navigation
  navigateTo: (page: AppPage) => {
    const state = get()
    const newHistory = state.navigationHistory.slice(0, state.historyIndex + 1)
    newHistory.push(page)
    const newIndex = newHistory.length - 1
    set({
      currentPage: page,
      previousPage: state.currentPage,
      navigationHistory: newHistory,
      historyIndex: newIndex,
      canGoBack: newIndex > 0,
      canGoForward: false,
    })
  },

  navigateBack: () => {
    const state = get()
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1
      set({
        currentPage: state.navigationHistory[newIndex],
        previousPage: state.currentPage,
        historyIndex: newIndex,
        canGoBack: newIndex > 0,
        canGoForward: newIndex < state.navigationHistory.length - 1,
      })
    }
  },

  navigateForward: () => {
    const state = get()
    if (state.historyIndex < state.navigationHistory.length - 1) {
      const newIndex = state.historyIndex + 1
      set({
        currentPage: state.navigationHistory[newIndex],
        previousPage: state.currentPage,
        historyIndex: newIndex,
        canGoBack: newIndex > 0,
        canGoForward: newIndex < state.navigationHistory.length - 1,
      })
    }
  },

  // Mode
  setMode: (mode: AppMode) => {
    set({ currentMode: mode })
  },

  // Auth
  setAuthenticated: (authenticated: boolean) => {
    set({
      isAuthenticated: authenticated,
      currentPage: authenticated ? 'dashboard' : 'login',
    })
  },

  setUserProfile: (profile: UserProfile | undefined) => {
    set({ userProfile: profile })
  },

  // Loading
  setLoading: (isLoading: boolean, message?: string) => {
    set({ isLoading, ...(message && { loadingMessage: message }) })
  },

  // Conversations
  addConversation: (conversation: Conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }))
  },

  updateConversation: (id: string, updates: Partial<Conversation>) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    }))
  },

  setCurrentConversation: (id: string | undefined) => {
    set({ currentConversationId: id })
  },

  deleteConversation: (id: string) => {
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      currentConversationId:
        state.currentConversationId === id
          ? undefined
          : state.currentConversationId,
    }))
  },

  // History
  addHistoryEntry: (entry: HistoryEntry) => {
    set((state) => ({
      history: [entry, ...state.history].slice(0, 100), // Keep last 100 entries
    }))
  },

  clearHistory: () => {
    set({ history: [] })
  },
}))

