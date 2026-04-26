import type { RiskTier } from '../lib/types'

const styles: Record<RiskTier, string> = {
  HIGH: 'bg-red-500/20 text-red-400 border border-red-500/40',
  MED: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  LOW: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  NONE: 'bg-slate-700/40 text-slate-500 border border-slate-700',
}

export function RiskBadge({ tier }: { tier: RiskTier }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${styles[tier]}`}>
      {tier === 'NONE' ? '–' : tier}
    </span>
  )
}
