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
    <div style={{ background: '#0c0e15', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(180deg, #12141e 0%, #0c0e15 100%)',
        borderBottom: '1px solid #1e2130',
        padding: '0 48px',
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#ef4444', fontSize: 20 }}>⚡</span>
            <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
              Short Squeeze Risk
            </span>
            <span style={{ color: '#334155', fontSize: 14, marginLeft: 4 }}>· Norwegian stocks</span>
          </div>
          <div style={{ color: '#475569', fontSize: 12 }}>
            Data via <a href="https://ssr.finanstilsynet.no" target="_blank" rel="noreferrer"
              style={{ color: '#64748b', textDecoration: 'underline' }}>Finanstilsynet</a>
            {' · '}Updated <span style={{ color: '#64748b' }}>{lastUpdated.slice(0, 10)}</span>
          </div>
        </div>
      </header>

      {/* ── Page body ────────────────────────────────────────── */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 48px 80px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard label="≥ 3% shorted" value={high} accent="#ef4444" dimAccent="rgba(239,68,68,0.08)" borderColor="rgba(239,68,68,0.2)" />
          <StatCard label="1–3% shorted" value={med} accent="#f97316" dimAccent="rgba(249,115,22,0.08)" borderColor="rgba(249,115,22,0.2)" />
          <StatCard label="Active shorts" value={active} accent="#94a3b8" dimAccent="rgba(100,116,139,0.08)" borderColor="rgba(100,116,139,0.2)" />
          <StatCard label="Total tracked" value={results.length} accent="#64748b" dimAccent="rgba(71,85,105,0.06)" borderColor="rgba(71,85,105,0.15)" />
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ color: '#475569', fontSize: 13 }}>
            {filtered.length} {filtered.length === 1 ? 'company' : 'companies'} · click any row for full history
          </p>
          <input
            type="search"
            placeholder="Search company or ISIN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: '#13151f',
              border: '1px solid #1e2436',
              borderRadius: 8,
              padding: '8px 14px',
              color: '#e2e8f0',
              fontSize: 13,
              width: 240,
              outline: 'none',
            }}
          />
        </div>

        {/* Table card */}
        <div style={{
          background: '#13151f',
          border: '1px solid #1e2130',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}>
          <RiskTable results={filtered} onSelect={setSelected} />
        </div>

        <p style={{ color: '#334155', fontSize: 12, marginTop: 20, textAlign: 'center', lineHeight: 1.7 }}>
          Only positions ≥ 0.5% of share capital are publicly reported (EU Short Selling Regulation 236/2012).
          Risk score is indicative only — not financial advice.
        </p>
      </div>

      {selected && (
        <DetailPanel result={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function StatCard({ label, value, accent, dimAccent, borderColor }: {
  label: string; value: number; accent: string; dimAccent: string; borderColor: string
}) {
  return (
    <div style={{
      background: dimAccent,
      border: `1px solid ${borderColor}`,
      borderRadius: 12,
      padding: '18px 24px',
    }}>
      <p style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
      <p style={{ color: accent, fontSize: 32, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
    </div>
  )
}
