import type { InstrumentShortingHistory, RiskResult, RiskTier } from './types'

function levelScore(pct: number): number {
  if (pct >= 5) return 40
  if (pct >= 3) return 35
  if (pct >= 2) return 30
  if (pct >= 1) return 20
  return 10
}

function tierFromScore(score: number): RiskTier {
  if (score >= 70) return 'HIGH'
  if (score >= 40) return 'MED'
  if (score > 0) return 'LOW'
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

  if (currentShortPct === 0) {
    return {
      isin: instrument.isin,
      issuerName: instrument.issuerName,
      currentShortPct: 0,
      change30d: 0,
      holders: 0,
      score: 0,
      tier: 'NONE',
      sparklineData: [],
      events: sorted,
      lastUpdated,
    }
  }

  // 30-day momentum
  const now = latestActive ? new Date(latestActive.date) : new Date()
  const cutoff30 = new Date(now)
  cutoff30.setDate(cutoff30.getDate() - 30)
  const prev30 = sorted.find(
    e => new Date(e.date) <= cutoff30 && e.shortPercent > 0
  )
  const pct30dAgo = prev30?.shortPercent ?? currentShortPct
  const momentumRaw = ((currentShortPct - pct30dAgo) / Math.max(pct30dAgo, 0.5)) * 35
  const momentumScore = Math.max(0, Math.min(35, momentumRaw))
  const change30d = currentShortPct - pct30dAgo

  // Concentration
  const concentrationScore = holders >= 3 ? 15 : holders === 2 ? 10 : 5

  // Duration at high
  let durationScore = 0
  if (latestActive) {
    const latestDate = new Date(latestActive.date)
    const firstHighEvent = sorted
      .filter(e => e.shortPercent >= currentShortPct * 0.9)
      .at(-1)
    if (firstHighEvent) {
      const days =
        (latestDate.getTime() - new Date(firstHighEvent.date).getTime()) /
        86400000
      durationScore = days > 90 ? 10 : days > 30 ? 7 : days > 7 ? 4 : 0
    }
  }

  const score = Math.min(
    100,
    levelScore(currentShortPct) + momentumScore + concentrationScore + durationScore
  )

  // Sparkline: last 90 days, one point per event
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
    score: Math.round(score),
    tier: tierFromScore(Math.round(score)),
    sparklineData,
    events: sorted,
    lastUpdated,
  }
}
