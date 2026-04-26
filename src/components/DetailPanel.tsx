import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { RiskResult } from '../lib/types'

interface Props {
  result: RiskResult
  onClose: () => void
}

function fmt(dateStr: string) {
  return dateStr.slice(0, 10)
}

export function DetailPanel({ result, onClose }: Props) {
  const chartData = [...result.events]
    .reverse()
    .map(e => ({ date: fmt(e.date), pct: e.shortPercent }))

  const latestPositions =
    result.events.find(e => e.shortPercent > 0)?.activePositions ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1d27] border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[85vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{result.issuerName}</h2>
            <p className="text-slate-500 text-xs mt-0.5">{result.isin}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider">Short % history (2 years)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="shortGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v}%`}
                width={36}
              />
              <Tooltip
                contentStyle={{ background: '#1e2233', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Short %']}
              />
              <Area
                type="stepAfter"
                dataKey="pct"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#shortGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {latestPositions.length > 0 && (
          <div>
            <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider">Current position holders</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-slate-700">
                  <th className="text-left py-1.5 font-medium">Holder</th>
                  <th className="text-right py-1.5 font-medium">Short %</th>
                  <th className="text-right py-1.5 font-medium">Shares</th>
                  <th className="text-right py-1.5 font-medium">Since</th>
                </tr>
              </thead>
              <tbody>
                {latestPositions.map((p, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="py-2 text-slate-200">{p.positionHolder}</td>
                    <td className="py-2 text-right text-red-400">{p.shortPercent.toFixed(2)}%</td>
                    <td className="py-2 text-right text-slate-300">{p.shares.toLocaleString()}</td>
                    <td className="py-2 text-right text-slate-500">{fmt(p.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
