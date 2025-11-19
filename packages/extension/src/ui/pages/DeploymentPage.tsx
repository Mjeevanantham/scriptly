import React, { useState } from 'react'

export const DeploymentPage: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<string>('')

  const targets = [
    { id: 'vercel', name: 'Vercel', icon: '▲' },
    { id: 'aws', name: 'AWS', icon: '☁️' },
    { id: 'digitalocean', name: 'DigitalOcean', icon: '🌊' },
  ]

  return (
    <div className="deployment-page p-8">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold mb-2">Deployment</h1>
        <p className="text-sm opacity-70">Deploy your application to cloud platforms</p>
      </div>

      <div className="targets-grid grid grid-cols-3 gap-4 mb-6">
        {targets.map((target) => (
          <button
            key={target.id}
            onClick={() => setSelectedTarget(target.id)}
            className={`target-card p-6 border rounded-lg text-center transition-all ${
              selectedTarget === target.id
                ? 'bg-button-background text-button-foreground border-button-background'
                : 'bg-input-background border-border hover:border-focus-border'
            }`}
          >
            <div className="target-icon text-4xl mb-2">{target.icon}</div>
            <div className="target-name font-semibold">{target.name}</div>
          </button>
        ))}
      </div>

      {selectedTarget && (
        <div className="deployment-config p-4 bg-input-background border border-border rounded">
          <h2 className="text-lg font-semibold mb-3">Configuration</h2>
          <p className="text-sm opacity-70">Configure deployment for {targets.find((t) => t.id === selectedTarget)?.name}</p>
        </div>
      )}
    </div>
  )
}

