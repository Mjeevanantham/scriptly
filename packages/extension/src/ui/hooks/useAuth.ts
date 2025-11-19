import { useAppStore } from '../store'

export const useAuth = () => {
  const {
    isAuthenticated,
    setAuthenticated,
    userProfile,
    setUserProfile,
    navigateTo,
  } = useAppStore()

  const login = () => {
    setAuthenticated(true)
    navigateTo('dashboard')
  }

  const logout = () => {
    setAuthenticated(false)
    setUserProfile(undefined)
    navigateTo('login')
  }

  return {
    isAuthenticated,
    login,
    logout,
    userProfile,
    setUserProfile,
  }
}

