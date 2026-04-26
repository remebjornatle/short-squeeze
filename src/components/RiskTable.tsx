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
    if (key !== sortKey) return <span className="text-slate-700 ml-1 text-[10px]">↕</span>
    return <span className="text-blue-400 ml-1 text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  if (results.length === 0) {
    return (
      <div className="py-20 text-center text-slate-600 text-sm">No results</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-[11px] text-slate-500 uppercase tracking-widest">
            {COLS.map(col => (
              <th
                key={col.key}
                className={`py-3.5 px-5 font-medium cursor-pointer select-none hover:text-slate-300 transition-colors ${col.align} ${col.key === 'issuerName' ? 'pl-6' : ''}`}
                onClick={() => handleSort(col.key)}
              >
                {col.label}{arrow(col.key)}
              </th>
            ))}
            <th className="py-3.5 px-5 font-medium text-left">Trend (90d)</th>
            <th className="py-3.5 px-5 pr-6 font-medium text-left">Risk</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, idx) => {
            const rising = r.change30d > 0
            const isLast = idx === sorted.length - 1
            return (
              <tr
                key={r.isin}
                onClick={() => onSelect(r)}
                className={`${isLast ? '' : 'border-b border-slate-800/50'} hover:bg-slate-800/30 cursor-pointer transition-colors group`}
              >
                <td className="py-3.5 px-5 pl-6">
                  <p className="text-slate-100 font-medium group-hover:text-white transition-colors">{r.issuerName}</p>
                  <p className="text-slate-600 text-xs font-mono mt-0.5">{r.isin}</p>
                </td>
                <td className="py-3.5 px-5 text-right font-mono text-slate-200">
                  {r.currentShortPct > 0 ? `${r.currentShortPct.toFixed(2)}%` : '–'}
                </td>
                <td className={`py-3.5 px-5 text-right font-mono text-sm ${r.change30d > 0 ? 'text-red-400' : r.change30d < 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {r.change30d === 0 ? '–' : `${r.change30d > 0 ? '+' : ''}${r.change30d.toFixed(2)}pp`}
                </td>
                <td className="py-3.5 px-5 text-right text-slate-400">
                  {r.holders > 0 ? r.holders : '–'}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className={`font-bold tabular-nums ${r.score >= 70 ? 'text-red-400' : r.score >= 40 ? 'text-orange-400' : 'text-slate-500'}`}>
                    {r.score > 0 ? r.score : '–'}
                  </span>
                </td>
                <td className="py-3.5 px-5">
                  <Sparkline data={r.sparklineData} rising={rising} />
                </td>
                <td className="py-3.5 px-5 pr-6">
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
