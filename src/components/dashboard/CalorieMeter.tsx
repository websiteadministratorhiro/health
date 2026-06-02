'use client'

interface Props {
  intake: number
  burned: number
  target: number
  tdee?: number // 太るライン（TDEE）
}

export default function CalorieMeter({ intake, burned, target, tdee }: Props) {
  const net = intake - burned           // 正味摂取（摂取 - 運動消費）
  const vsTarget = net - target         // 目標との差（+でオーバー、-で余裕）
  const vsTDEE = tdee ? net - tdee : null // TDEEとの差（+で体重増加方向）

  // プログレスバー：target を100%として描画
  const pct = target > 0 ? Math.min((net / target) * 100, 150) : 0
  const tdeeMarkerPct = (tdee && target > 0) ? Math.min((tdee / target) * 100, 150) : null

  return (
    <div className="bg-[#1e293b] rounded-xl p-4 space-y-3">
      <p className="text-xs text-slate-400">カロリー収支</p>

      {/* 摂取・消費・正味 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-slate-500">摂取</p>
          <p className="text-base font-bold text-slate-100">{intake}</p>
          <p className="text-xs text-slate-500">kcal</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">運動消費</p>
          <p className="text-base font-bold text-blue-400">{burned}</p>
          <p className="text-xs text-slate-500">kcal</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">正味摂取</p>
          <p className="text-base font-bold text-slate-100">{net}</p>
          <p className="text-xs text-slate-500">kcal</p>
        </div>
      </div>

      {/* プログレスバー（TDEEマーカー付き） */}
      <div className="relative">
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : 'bg-green-400'}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {/* TDEEマーカー */}
        {tdeeMarkerPct !== null && (
          <div
            className="absolute top-0 h-4 w-0.5 bg-yellow-400"
            style={{ left: `${Math.min(tdeeMarkerPct, 100)}%` }}
            title={`TDEE: ${tdee} kcal`}
          />
        )}
      </div>

      {/* 目標・TDEEとの比較 */}
      <div className="space-y-1.5">
        {/* 目標との差 */}
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">目標 <span className="text-slate-300">{target} kcal</span> に対して</span>
          <span className={`font-bold ${vsTarget <= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {vsTarget > 0 ? `+${vsTarget}` : vsTarget} kcal
          </span>
        </div>
        {/* 太るラインとの差 */}
        {vsTDEE !== null && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">太るライン <span className="text-yellow-400">{tdee} kcal</span> まで</span>
            <span className={`font-bold ${vsTDEE < 0 ? 'text-slate-300' : 'text-red-400'}`}>
              {vsTDEE < 0 ? `あと ${Math.abs(vsTDEE)} kcal` : `${vsTDEE} kcal オーバー ⚠️`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
