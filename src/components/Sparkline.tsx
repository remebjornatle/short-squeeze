import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface Props {
  data: { date: string; pct: number }[]
  rising: boolean
}

export function Sparkline({ data, rising }: Props) {
  if (data.length < 2) return <span className="text-slate-600">–</span>
  return (
    <ResponsiveContainer width={80} height={32}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="pct"
          stroke={rising ? '#f87171' : '#34d399'}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
