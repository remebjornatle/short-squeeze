import type { InstrumentShortingHistory } from './types'

const DATA_URL = import.meta.env.DEV
  ? '/api/v2/instruments'
  : `${import.meta.env.BASE_URL}data/instruments.json`

export async function fetchInstruments(): Promise<InstrumentShortingHistory[]> {
  const res = await fetch(DATA_URL)
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  return res.json()
}
