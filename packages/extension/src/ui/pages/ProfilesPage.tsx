import React from 'react'

export const ProfilesPage: React.FC = () => {
  return (
    <div className="profiles-page p-8">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold mb-2">Profiles</h1>
        <p className="text-sm opacity-70">Manage your API key profiles</p>
      </div>

      <div className="profiles-list space-y-3">
        <div className="profile-card p-4 bg-input-background border border-border rounded">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Default Profile</h3>
              <p className="text-sm opacity-70">OpenAI - GPT-4</p>
            </div>
            <button className="px-3 py-1 bg-button-background text-button-foreground rounded text-sm hover:bg-button-hover">
              Edit
            </button>
          </div>
        </div>

        <button className="w-full p-4 border-2 border-dashed border-border rounded text-center text-sm opacity-70 hover:opacity-100 transition-opacity">
          + Create New Profile
        </button>
      </div>
    </div>
  )
}

