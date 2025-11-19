import { useAppStore } from '../store'
import type { AppPage } from '../../types/ui'

export const usePage = () => {
  const { currentPage, navigateTo, navigateBack, navigateForward, canGoBack, canGoForward } = useAppStore()

  const goToPage = (page: AppPage) => {
    navigateTo(page)
  }

  const goBack = () => {
    navigateBack()
  }

  const goForward = () => {
    navigateForward()
  }

  const isPage = (page: AppPage) => {
    return currentPage === page
  }

  return {
    currentPage,
    goToPage,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    isPage,
  }
}

