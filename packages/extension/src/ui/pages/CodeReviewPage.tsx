import React, { useState } from 'react'

export const CodeReviewPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('')

  return (
    <div className="code-review-page p-8">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold mb-2">Code Review</h1>
        <p className="text-sm opacity-70">Analyze, refactor, and improve your code</p>
      </div>

      <div className="review-container grid grid-cols-2 gap-4">
        <div className="file-selector">
          <h2 className="text-lg font-semibold mb-3">Select File</h2>
          <div className="file-list space-y-2">
            <button className="file-item w-full p-3 bg-input-background border border-border rounded text-left hover:bg-button-background hover:text-button-foreground">
              No files available
            </button>
          </div>
        </div>

        <div className="review-panel">
          <h2 className="text-lg font-semibold mb-3">Review Results</h2>
          <div className="review-content p-4 bg-input-background border border-border rounded">
            <p className="text-sm opacity-70">Select a file to begin code review</p>
          </div>
        </div>
      </div>

      <div className="actions mt-6 flex gap-2">
        <button className="px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover">
          Find Bugs
        </button>
        <button className="px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover">
          Suggest Refactoring
        </button>
        <button className="px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover">
          Generate Tests
        </button>
      </div>
    </div>
  )
}

