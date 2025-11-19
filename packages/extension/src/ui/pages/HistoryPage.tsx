import React from 'react'

export const HistoryPage: React.FC = () => {
  return (
    <div className="history-page p-8">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold mb-2">History</h1>
        <p className="text-sm opacity-70">View your past conversations and activities</p>
      </div>

      <div className="history-tabs mb-4 flex gap-2 border-b border-border">
        <button className="tab-button px-4 py-2 border-b-2 border-button-background font-semibold">
          All
        </button>
        <button className="tab-button px-4 py-2 opacity-70 hover:opacity-100">
          Chat
        </button>
        <button className="tab-button px-4 py-2 opacity-70 hover:opacity-100">
          Code Review
        </button>
        <button className="tab-button px-4 py-2 opacity-70 hover:opacity-100">
          Deployment
        </button>
      </div>

      <div className="history-list space-y-2">
        <div className="history-item p-4 bg-input-background border border-border rounded">
          <p className="text-sm opacity-70">No history yet</p>
        </div>
      </div>
    </div>
  )
}

