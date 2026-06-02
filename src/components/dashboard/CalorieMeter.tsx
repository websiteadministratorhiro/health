'use client'

interface Props {
  intake: number
  burned: number
  target: number
}

export default function CalorieMeter({ intake, burned, target }: Props) {
  const net = intake - burned
  const diff = target - net
  const pct = target > 0 ? Math.min(Math.round((net / target) * 100), 100) : 0

  return (
    <div className="bg-[#1e293b] rounded-xl p-4">
      <p className="text-xs text-slate-400 mb-2">カロリー収支</p>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-400">摂取 <span className="font-bold text-slate-100">{intake}</span> kcal</span>
        <span className="text-slate-400">消費 <span className="font-bold text-slate-100">{burned}</span> kcal</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : 'bg-green-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-center text-slate-400">
        目標まで <span className={`font-bold ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>{Math.abs(Math.round(diff))}</span> kcal
        {diff > 0 ? ' 残り' : ' オーバー'}
      </p>
    </div>
  )
}
