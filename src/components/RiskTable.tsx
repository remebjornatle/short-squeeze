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

const COLS: { key: SortKey; label: string; align: string }[] = [
  { key: 'issuerName', label: 'Company', align: 'text-left' },
  { key: 'currentShortPct', label: 'Short %', align: 'text-right' },
  { key: 'change30d', label: '30d Δ', align: 'text-right' },
  { key: 'holders', label: 'Holders', align: 'text-right' },
  { key: 'score', label: 'Score', align: 'text-right' },
]

export function RiskTable({ results, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...results].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  function arrow(key: SortKey) {
    if (key !== sortKey) return <span className="text-slate-700 ml-1">↕</span>
    return <span className="text-slate-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
            {COLS.map(col => (
              <th
                key={col.key}
                className={`py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-300 transition-colors ${col.align}`}
                onClick={() => handleSort(col.key)}
              >
                {col.label}{arrow(col.key)}
              </th>
            ))}
            <th className="py-3 px-4 font-medium text-left">Trend (90d)</th>
            <th className="py-3 px-4 font-medium text-left">Risk</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => {
            const rising = r.change30d > 0
            return (
              <tr
                key={r.isin}
                onClick={() => onSelect(r)}
                className="border-b border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <p className="text-slate-100 font-medium">{r.issuerName}</p>
                  <p className="text-slate-600 text-xs">{r.isin}</p>
                </td>
                <td className="py-3 px-4 text-right text-slate-200 font-mono">
                  {r.currentShortPct > 0 ? `${r.currentShortPct.toFixed(2)}%` : '–'}
                </td>
                <td className={`py-3 px-4 text-right font-mono ${r.change30d > 0 ? 'text-red-400' : r.change30d < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {r.change30d === 0 ? '–' : `${r.change30d > 0 ? '+' : ''}${r.change30d.toFixed(2)}pp`}
                </td>
                <td className="py-3 px-4 text-right text-slate-300">
                  {r.holders > 0 ? r.holders : '–'}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-semibold ${r.score >= 70 ? 'text-red-400' : r.score >= 40 ? 'text-orange-400' : 'text-slate-400'}`}>
                    {r.score > 0 ? r.score : '–'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Sparkline data={r.sparklineData} rising={rising} />
                </td>
                <td className="py-3 px-4">
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
