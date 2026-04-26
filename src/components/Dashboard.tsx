import { useState } from 'react'
import type { RiskResult } from '../lib/types'
import { RiskTable } from './RiskTable'
import { DetailPanel } from './DetailPanel'

interface Props {
  results: RiskResult[]
  lastUpdated: string
}

export function Dashboard({ results, lastUpdated }: Props) {
  const [selected, setSelected] = useState<RiskResult | null>(null)
  const [search, setSearch] = useState('')

  const high = results.filter(r => r.tier === 'HIGH').length
  const med = results.filter(r => r.tier === 'MED').length

  const filtered = results.filter(r =>
    r.issuerName.toLowerCase().includes(search.toLowerCase()) ||
    r.isin.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0f1117] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Short Squeeze Risk</h1>
          <p className="text-slate-500 text-sm">
            Norwegian stocks with publicly reported short positions ·{' '}
            <span className="text-slate-400">
              Data: <a href="https://ssr.finanstilsynet.no" target="_blank" rel="noreferrer" className="underline hover:text-slate-200">Finanstilsynet SSR</a>
            </span>{' '}
            · Updated {lastUpdated.slice(0, 10)}
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
            <p className="text-xs text-red-400/70 uppercase tracking-wider">HIGH risk</p>
            <p className="text-2xl font-bold text-red-400">{high}</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2">
            <p className="text-xs text-orange-400/70 uppercase tracking-wider">MEDIUM risk</p>
            <p className="text-2xl font-bold text-orange-400">{med}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total tracked</p>
            <p className="text-2xl font-bold text-slate-300">{results.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search company or ISIN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-72 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-slate-500 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-[#141720] border border-slate-800 rounded-xl overflow-hidden">
          <RiskTable results={filtered} onSelect={setSelected} />
        </div>

        <p className="text-slate-700 text-xs mt-4 text-center">
          Only positions ≥ 0.5% of share capital are publicly reported per EU Short Selling Regulation 236/2012.
          Risk score is indicative only — not financial advice.
        </p>
      </div>

      {selected && (
        <DetailPanel result={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
