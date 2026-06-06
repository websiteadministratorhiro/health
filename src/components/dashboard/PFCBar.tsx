'use client'

interface Props {
  protein_g: number
  fat_g: number
  carbs_g: number
  targetProtein?: number
  targetFat?: number
  targetCarbs?: number
}

export default function PFCBar({
  protein_g,
  fat_g,
  carbs_g,
  targetProtein,
  targetFat,
  targetCarbs,
}: Props) {
  // 実績割合
  const totalG = protein_g + fat_g + carbs_g
  const pPct = totalG > 0 ? Math.round((protein_g / totalG) * 100) : 0
  const fPct = totalG > 0 ? Math.round((fat_g / totalG) * 100) : 0
  const cPct = totalG > 0 ? 100 - pPct - fPct : 0

  // 理想割合
  const tTotal = (targetProtein ?? 0) + (targetFat ?? 0) + (targetCarbs ?? 0)
  const tpPct = tTotal > 0 ? Math.round(((targetProtein ?? 0) / tTotal) * 100) : 0
  const tfPct = tTotal > 0 ? Math.round(((targetFat ?? 0) / tTotal) * 100) : 0
  const tcPct = tTotal > 0 ? 100 - tpPct - tfPct : 0

  const hasTarget = tTotal > 0

  return (
    <div className="bg-[#1e293b] rounded-xl p-4 space-y-3">
      <p className="text-xs text-slate-400">PFCバランス</p>

      {/* 割合バー */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 w-8 shrink-0">実績</span>
          <div className="flex flex-1 rounded-full overflow-hidden h-3">
            <div className="bg-[#60a5fa]" style={{ width: `${pPct}%` }} />
            <div className="bg-[#fbbf24]" style={{ width: `${fPct}%` }} />
            <div className="bg-[#4ade80]" style={{ width: `${cPct}%` }} />
          </div>
        </div>
        {hasTarget && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-8 shrink-0">目標</span>
            <div className="flex flex-1 rounded-full overflow-hidden h-3">
              <div className="bg-[#60a5fa] opacity-50" style={{ width: `${tpPct}%` }} />
              <div className="bg-[#fbbf24] opacity-50" style={{ width: `${tfPct}%` }} />
              <div className="bg-[#4ade80] opacity-50" style={{ width: `${tcPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* グラム比較表 */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#60a5fa]" />
            <span className="text-slate-400">タンパク質</span>
          </div>
          <p className="font-bold text-slate-100">{protein_g.toFixed(1)}g</p>
          {hasTarget && (
            <p className="text-slate-500">目標 {targetProtein}g</p>
          )}
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#fbbf24]" />
            <span className="text-slate-400">脂質</span>
          </div>
          <p className="font-bold text-slate-100">{fat_g.toFixed(1)}g</p>
          {hasTarget && (
            <p className="text-slate-500">目標 {targetFat}g</p>
          )}
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#4ade80]" />
            <span className="text-slate-400">炭水化物</span>
          </div>
          <p className="font-bold text-slate-100">{carbs_g.toFixed(1)}g</p>
          {hasTarget && (
            <p className="text-slate-500">目標 {targetCarbs}g</p>
          )}
        </div>
      </div>
    </div>
  )
}
