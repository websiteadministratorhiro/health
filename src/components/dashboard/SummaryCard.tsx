'use client'

interface Props {
  label: string
  value: string | number | null
  unit?: string
  sub?: string
  color?: string
}

export default function SummaryCard({ label, value, unit, sub, color = 'text-green-400' }: Props) {
  return (
    <div className="bg-[#1e293b] rounded-xl p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value !== null && value !== undefined ? value : '--'}
        {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}
