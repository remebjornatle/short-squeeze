import type { InstrumentShortingHistory, RiskResult, RiskTier } from './types'

function tierFromPct(pct: number): RiskTier {
  if (pct >= 3) return 'HIGH'
  if (pct >= 1) return 'MED'
  if (pct > 0) return 'LOW'
  return 'NONE'
}

export function computeRiskScore(instrument: InstrumentShortingHistory): RiskResult {
  const sorted = [...instrument.events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const latestActive = sorted.find(e => e.shortPercent > 0)
  const currentShortPct = latestActive?.shortPercent ?? 0
  const holders = latestActive?.activePositions.length ?? 0
  const lastUpdated = sorted[0]?.date ?? ''

  const now = latestActive ? new Date(latestActive.date) : new Date()
  const cutoff30 = new Date(now)
  cutoff30.setDate(cutoff30.getDate() - 30)
  const prev30 = sorted.find(e => new Date(e.date) <= cutoff30 && e.shortPercent > 0)
  const change30d = currentShortPct - (prev30?.shortPercent ?? currentShortPct)

  const cutoff90 = new Date(now)
  cutoff90.setDate(cutoff90.getDate() - 90)
  const sparklineData = sorted
    .filter(e => new Date(e.date) >= cutoff90)
    .map(e => ({ date: e.date.slice(0, 10), pct: e.shortPercent }))
    .reverse()

  return {
    isin: instrument.isin,
    issuerName: instrument.issuerName,
    currentShortPct,
    change30d,
    holders,
    tier: tierFromPct(currentShortPct),
    sparklineData,
    events: sorted,
    lastUpdated,
  }
}
