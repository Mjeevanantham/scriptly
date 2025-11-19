import React from 'react'
import { usePage } from '../hooks/usePage'
import { useMode } from '../hooks/useMode'

export const DashboardPage: React.FC = () => {
  const { goToPage } = usePage()
  const { switchMode } = useMode()

  const quickActions = [
    {
      title: 'Chat',
      description: 'Ask questions about your code',
      icon: '💬',
      page: 'chat' as const,
      mode: 'chat' as const,
    },
    {
      title: 'Code Review',
      description: 'Review and refactor code',
      icon: '💻',
      page: 'code-review' as const,
      mode: 'code' as const,
    },
    {
      title: 'Research',
      description: 'Search and analyze codebase',
      icon: '🔍',
      page: 'research' as const,
      mode: 'research' as const,
    },
    {
      title: 'Deployment',
      description: 'Deploy your application',
      icon: '🚀',
      page: 'deployment' as const,
    },
  ]

  return (
    <div className="dashboard-page p-8">
      <div className="dashboard-header mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm opacity-70">Welcome back! What would you like to do?</p>
      </div>

      <div className="quick-actions grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.title}
            onClick={() => {
              if (action.mode) switchMode(action.mode)
              goToPage(action.page)
            }}
            className="action-card p-6 bg-input-background border border-border rounded-lg hover:border-focus-border transition-all text-left"
          >
            <div className="action-icon text-3xl mb-3">{action.icon}</div>
            <h3 className="font-semibold mb-1">{action.title}</h3>
            <p className="text-sm opacity-70">{action.description}</p>
          </button>
        ))}
      </div>

      <div className="recent-activity mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="activity-list space-y-2">
          <div className="activity-item p-3 bg-input-background rounded text-sm opacity-70">
            No recent activity
          </div>
        </div>
      </div>
    </div>
  )
}

