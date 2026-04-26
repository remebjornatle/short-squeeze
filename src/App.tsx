import { useEffect, useState } from 'react'
import { fetchInstruments } from './lib/api'
import { computeRiskScore } from './lib/riskScore'
import type { RiskResult } from './lib/types'
import { Dashboard } from './components/Dashboard'

export default function App() {
  const [results, setResults] = useState<RiskResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInstruments()
      .then(instruments => {
        const scored = instruments
          .map(computeRiskScore)
          .sort((a, b) => b.score - a.score)
        setResults(scored)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const lastUpdated =
    results.reduce((latest, r) => (r.lastUpdated > latest ? r.lastUpdated : latest), '') ||
    new Date().toISOString()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading short positions…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-red-400 font-semibold mb-2">Failed to load data</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return <Dashboard results={results} lastUpdated={lastUpdated} />
}
