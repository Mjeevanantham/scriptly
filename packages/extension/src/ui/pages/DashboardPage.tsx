import React from 'react'
import { usePage } from '../hooks/usePage'
import { useMode } from '../hooks/useMode'
import { useAuth } from '../hooks/useAuth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Alert,
} from '../components/ui'

export const DashboardPage: React.FC = () => {
  const { goToPage } = usePage()
  const { switchMode } = useMode()
  const { userProfile, logout } = useAuth()

  const quickActions = [
    {
      title: 'AI Chat',
      description: 'Ask questions about your code, get instant help',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      page: 'chat' as const,
      mode: 'chat' as const,
      color: 'text-info',
      bgColor: 'bg-info/5',
    },
    {
      title: 'Code Review',
      description: 'Get AI-powered code analysis and suggestions',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
      page: 'code-review' as const,
      mode: 'code' as const,
      color: 'text-warning',
      bgColor: 'bg-warning/5',
    },
    {
      title: 'Research',
      description: 'Search and analyze your codebase',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      page: 'research' as const,
      mode: 'research' as const,
      color: 'text-success',
      bgColor: 'bg-success/5',
    },
    {
      title: 'Deploy',
      description: 'Deploy your application with confidence',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12l5 5l5-5m-5-5v12"
          />
        </svg>
      ),
      page: 'deployment' as const,
      color: 'text-error',
      bgColor: 'bg-error/5',
    },
  ]

  const quickStats = [
    {
      label: 'Active Chats',
      value: '3',
      trend: '+2 today',
      icon: '💬',
    },
    {
      label: 'Code Reviews',
      value: '7',
      trend: '+1 this week',
      icon: '🔍',
    },
    {
      label: 'Deployments',
      value: '2',
      trend: 'Last: 2 days ago',
      icon: '🚀',
    },
    {
      label: 'AI Model',
      value: 'GPT-4',
      trend: 'Connected',
      icon: '🤖',
    },
  ]

  const recentActivity = [
    {
      type: 'chat',
      title: 'Discussed component architecture',
      timestamp: '2 minutes ago',
      status: 'success',
    },
    {
      type: 'code-review',
      title: 'Reviewed authentication flow',
      timestamp: '1 hour ago',
      status: 'success',
    },
    {
      type: 'research',
      title: 'Analyzed API dependencies',
      timestamp: '3 hours ago',
      status: 'success',
    },
  ]

  const getCurrentTime = () => {
    const now = new Date()
    const hour = now.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="dashboard-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="dashboard-header mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {getCurrentTime()}, {userProfile?.name || 'Developer'}! 👋
            </h1>
            <p className="text-muted-foreground">What would you like to work on today?</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage('settings')}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
            >
              Settings
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-error hover:text-error"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              }
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </div>
              <div className="text-2xl opacity-70">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Choose what you want to work on</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map(action => (
                  <Card
                    key={action.title}
                    hover
                    clickable
                    onClick={() => {
                      if (action.mode) switchMode(action.mode)
                      goToPage(action.page)
                    }}
                    className="p-6"
                  >
                    <div className={`${action.bgColor} ${action.color} p-3 rounded-lg w-fit mb-4`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest work sessions</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-success' : 'bg-warning'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="info">
                    <p className="text-sm">
                      No recent activity yet. Start a chat or review some code to get going!
                    </p>
                  </Alert>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage('history')}
                  className="w-full mt-4"
                >
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
