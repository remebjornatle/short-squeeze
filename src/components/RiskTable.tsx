import { useState } from 'react'
import type { RiskResult } from '../lib/types'
import { RiskBadge } from './RiskBadge'
import { Sparkline } from './Sparkline'

type SortKey = 'issuerName' | 'currentShortPct' | 'change30d' | 'holders' | 'score'
type SortDir = 'asc' | 'desc'

interface Props {
  results: RiskResult[]
  onSelect: (r: RiskResult) => void
}

const COLS: { key: SortKey; label: string; align: React.CSSProperties['textAlign'] }[] = [
  { key: 'issuerName', label: 'Company', align: 'left' },
  { key: 'currentShortPct', label: 'Short %', align: 'right' },
  { key: 'change30d', label: '30d Δ', align: 'right' },
  { key: 'holders', label: 'Holders', align: 'right' },
  { key: 'score', label: 'Score', align: 'right' },
]

const th: React.CSSProperties = {
  padding: '12px 20px',
  fontWeight: 500,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#475569',
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid #1e2130',
}
const thFirst: React.CSSProperties = { ...th, paddingLeft: 28 }
const thLast: React.CSSProperties = { ...th, paddingRight: 28 }

export function RiskTable({ results, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [hovered, setHovered] = useState<string | null>(null)

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...results].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey]
    if (typeof av === 'string' && typeof bv === 'string')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  function arrowFor(key: SortKey) {
    if (key !== sortKey) return <span style={{ opacity: 0.25, marginLeft: 4 }}>↕</span>
    return <span style={{ color: '#60a5fa', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  if (results.length === 0) {
    return <div style={{ padding: '64px 28px', textAlign: 'center', color: '#334155', fontSize: 14 }}>No results</div>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {COLS.map((col, i) => (
              <th
                key={col.key}
                style={i === 0 ? { ...thFirst, textAlign: col.align } : { ...th, textAlign: col.align }}
                onClick={() => handleSort(col.key)}
              >
                {col.label}{arrowFor(col.key)}
              </th>
            ))}
            <th style={{ ...th, textAlign: 'left' }}>Trend 90d</th>
            <th style={{ ...thLast, textAlign: 'left' }}>Risk</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, idx) => {
            const isHovered = hovered === r.isin
            const isLast = idx === sorted.length - 1
            return (
              <tr
                key={r.isin}
                onClick={() => onSelect(r)}
                onMouseEnter={() => setHovered(r.isin)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  borderBottom: isLast ? 'none' : '1px solid #171a27',
                  background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                <td style={{ padding: '14px 20px 14px 28px' }}>
                  <p style={{ color: '#e2e8f0', fontWeight: 500, margin: 0 }}>{r.issuerName}</p>
                  <p style={{ color: '#334155', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>{r.isin}</p>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right', fontFamily: 'monospace', color: '#cbd5e1' }}>
                  {r.currentShortPct > 0 ? `${r.currentShortPct.toFixed(2)}%` : '–'}
                </td>
                <td style={{
                  padding: '14px 20px', textAlign: 'right', fontFamily: 'monospace',
                  color: r.change30d > 0 ? '#f87171' : r.change30d < 0 ? '#34d399' : '#334155',
                }}>
                  {r.change30d === 0 ? '–' : `${r.change30d > 0 ? '+' : ''}${r.change30d.toFixed(2)}pp`}
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right', color: '#64748b' }}>
                  {r.holders > 0 ? r.holders : '–'}
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <span style={{
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: r.score >= 70 ? '#f87171' : r.score >= 40 ? '#fb923c' : '#475569',
                  }}>
                    {r.score > 0 ? r.score : '–'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <Sparkline data={r.sparklineData} rising={r.change30d > 0} />
                </td>
                <td style={{ padding: '14px 28px 14px 20px' }}>
                  <RiskBadge tier={r.tier} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
