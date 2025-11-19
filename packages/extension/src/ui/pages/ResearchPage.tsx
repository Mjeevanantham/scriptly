import React, { useState } from 'react'

export const ResearchPage: React.FC = () => {
  const [query, setQuery] = useState('')

  return (
    <div className="research-page p-8">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold mb-2">Research</h1>
        <p className="text-sm opacity-70">Search your codebase with AI-powered semantic search</p>
      </div>

      <div className="search-container mb-6">
        <div className="search-input-wrapper flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search codebase... (e.g., 'authentication logic', 'database connection')"
            className="flex-1 p-3 bg-input-background border border-border rounded"
          />
          <button className="px-6 py-3 bg-button-background text-button-foreground rounded hover:bg-button-hover">
            Search
          </button>
        </div>
      </div>

      <div className="results-container">
        <h2 className="text-lg font-semibold mb-3">Results</h2>
        <div className="results-list space-y-2">
          <div className="result-item p-4 bg-input-background border border-border rounded">
            <p className="text-sm opacity-70">Enter a search query to find code</p>
          </div>
        </div>
      </div>
    </div>
  )
}

