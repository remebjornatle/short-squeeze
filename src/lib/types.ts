export interface UnderlyingShortPosition {
  date: string
  shortPercent: number
  shares: number
  positionHolder: string
}

export interface AggregatedShortEvent {
  date: string
  shortPercent: number
  shares: number
  activePositions: UnderlyingShortPosition[]
}

export interface InstrumentShortingHistory {
  isin: string
  issuerName: string
  events: AggregatedShortEvent[]
}

export type RiskTier = 'HIGH' | 'MED' | 'LOW' | 'NONE'

export interface RiskResult {
  isin: string
  issuerName: string
  currentShortPct: number
  change30d: number
  holders: number
  score: number
  tier: RiskTier
  sparklineData: { date: string; pct: number }[]
  events: AggregatedShortEvent[]
  lastUpdated: string
}
