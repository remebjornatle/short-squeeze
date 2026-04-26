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
  const active = results.filter(r => r.currentShortPct > 0).length

  const filtered = results.filter(r =>
    r.issuerName.toLowerCase().includes(search.toLowerCase()) ||
    r.isin.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0c0e14]">
      {/* Top bar */}
      <header className="border-b border-slate-800/80 bg-[#0f1117]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-red-500 text-lg leading-none">⚡</span>
            <span className="font-semibold text-white tracking-tight">Short Squeeze Risk</span>
            <span className="hidden sm:inline text-slate-600 text-sm">· Norwegian stocks</span>
          </div>
          <span className="text-slate-600 text-xs">
            Updated <span className="text-slate-500">{lastUpdated.slice(0, 10)}</span>
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats + search row */}
        <div className="flex flex-wrap gap-3 items-end justify-between mb-6">
          <div className="flex gap-3 flex-wrap">
            <StatCard
              label="High risk"
              value={high}
              valueClass="text-red-400"
              borderClass="border-red-500/25 bg-red-500/8"
            />
            <StatCard
              label="Medium risk"
              value={med}
              valueClass="text-orange-400"
              borderClass="border-orange-500/25 bg-orange-500/8"
            />
            <StatCard
              label="Active shorts"
              value={active}
              valueClass="text-slate-300"
              borderClass="border-slate-700 bg-slate-800/40"
            />
            <StatCard
              label="Total tracked"
              value={results.length}
              valueClass="text-slate-400"
              borderClass="border-slate-700/60 bg-slate-800/20"
            />
          </div>

          <input
            type="search"
            placeholder="Search company or ISIN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64 bg-slate-800/70 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-slate-500 focus:bg-slate-800 transition-colors"
          />
        </div>

        {/* Table card */}
        <div className="bg-[#13151f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/30">
          <RiskTable results={filtered} onSelect={setSelected} />
        </div>

        <p className="text-slate-700 text-xs mt-5 text-center leading-relaxed">
          Only positions ≥ 0.5% of share capital are publicly reported per EU Short Selling Regulation 236/2012.
          <br className="hidden sm:block" />
          Risk score is indicative only — not financial advice.
          Data: <a href="https://ssr.finanstilsynet.no" target="_blank" rel="noreferrer" className="underline hover:text-slate-500 transition-colors">Finanstilsynet SSR</a>
        </p>
      </main>

      {selected && (
        <DetailPanel result={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  valueClass,
  borderClass,
}: {
  label: string
  value: number
  valueClass: string
  borderClass: string
}) {
  return (
    <div className={`border rounded-xl px-5 py-3 min-w-[100px] ${borderClass}`}>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  )
}
