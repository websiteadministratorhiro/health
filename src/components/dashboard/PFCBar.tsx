'use client'

interface Props {
  protein_g: number
  fat_g: number
  carbs_g: number
  targetProtein?: number
  targetFat?: number
  targetCarbs?: number
}

export default function PFCBar({ protein_g, fat_g, carbs_g, targetProtein, targetFat, targetCarbs }: Props) {
  const total = protein_g * 4 + fat_g * 9 + carbs_g * 4
  const pPct = total > 0 ? Math.round((protein_g * 4 / total) * 100) : 0
  const fPct = total > 0 ? Math.round((fat_g * 9 / total) * 100) : 0
  const cPct = total > 0 ? 100 - pPct - fPct : 0

  return (
    <div className="bg-[#1e293b] rounded-xl p-4">
      <p className="text-xs text-slate-400 mb-2">PFCバランス</p>
      <div className="flex rounded-full overflow-hidden h-4 mb-3">
        <div className="bg-blue-400" style={{ width: `${pPct}%` }} />
        <div className="bg-yellow-400" style={{ width: `${fPct}%` }} />
        <div className="bg-orange-400" style={{ width: `${cPct}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />
          <span className="text-slate-400">タンパク質</span>
          <p className="font-bold text-slate-100">{protein_g.toFixed(1)}g</p>
          {targetProtein && <p className="text-slate-500">目標 {targetProtein}g</p>}
        </div>
        <div className="text-center">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />
          <span className="text-slate-400">脂質</span>
          <p className="font-bold text-slate-100">{fat_g.toFixed(1)}g</p>
          {targetFat && <p className="text-slate-500">目標 {targetFat}g</p>}
        </div>
        <div className="text-center">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1" />
          <span className="text-slate-400">炭水化物</span>
          <p className="font-bold text-slate-100">{carbs_g.toFixed(1)}g</p>
          {targetCarbs && <p className="text-slate-500">目標 {targetCarbs}g</p>}
        </div>
      </div>
    </div>
  )
}
