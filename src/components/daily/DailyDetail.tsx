'use client'

import type { DayData } from '@/src/lib/types'
import { calcTotalCalories, calcTotalPFC } from '@/src/lib/calculations'

const MEAL_LABELS: Record<string, string> = {
  '朝': '朝食',
  '昼': '昼食',
  '晩': '夕食',
  '間食': '間食',
}

const MOOD_LABELS: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

interface Props {
  data: DayData
}

export default function DailyDetail({ data }: Props) {
  const { record, meals, workouts } = data
  const totalCal = calcTotalCalories(meals)
  const pfc = calcTotalPFC(meals)

  return (
    <div className="p-4 space-y-4">
      <div className="bg-[#1e293b] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">身体データ</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500">体重</p>
            <p className="font-bold text-slate-100">{record?.weight_kg ?? '--'} kg</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">体脂肪率</p>
            <p className="font-bold text-slate-100">{record?.body_fat_pct ?? '--'} %</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">睡眠</p>
            <p className="font-bold text-slate-100">{record?.sleep_hours ?? '--'} 時間</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">水分</p>
            <p className="font-bold text-slate-100">{record?.water_ml ?? '--'} ml</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">歩数</p>
            <p className="font-bold text-slate-100">{record?.steps?.toLocaleString() ?? '--'} 歩</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">気分</p>
            <p className="font-bold text-slate-100">
              {record?.mood ? MOOD_LABELS[record.mood] : '--'}
            </p>
          </div>
        </div>
        {record?.condition_notes && (
          <div className="mt-3">
            <p className="text-xs text-slate-500">体調メモ</p>
            <p className="text-sm text-slate-300">{record.condition_notes}</p>
          </div>
        )}
      </div>

      <div className="bg-[#1e293b] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">食事</h2>
        <p className="text-xs text-slate-500 mb-3">
          合計 {totalCal} kcal / P:{pfc.protein_g.toFixed(1)}g F:{pfc.fat_g.toFixed(1)}g C:{pfc.carbs_g.toFixed(1)}g
        </p>
        {meals.length === 0 ? (
          <p className="text-sm text-slate-500">記録なし</p>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div key={meal.id} className="flex justify-between items-start text-sm">
                <div>
                  <span className="text-xs bg-green-900 text-green-300 rounded px-1 mr-2">
                    {MEAL_LABELS[meal.meal_type] ?? meal.meal_type}
                  </span>
                  <span className="text-slate-200">{meal.food_name}</span>
                  {meal.memo && <p className="text-xs text-slate-500 mt-0.5 ml-1">{meal.memo}</p>}
                </div>
                <span className="text-slate-500 shrink-0 ml-2">{meal.calories ?? '--'} kcal</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#1e293b] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">トレーニング</h2>
        {workouts.length === 0 ? (
          <p className="text-sm text-slate-500">記録なし</p>
        ) : (
          <div className="space-y-2">
            {workouts.map((w) => (
              <div key={w.id} className="text-sm">
                <p className="font-medium text-slate-200">{w.menu_name}</p>
                <p className="text-slate-500 text-xs">
                  {w.sets && w.reps ? `${w.sets}セット × ${w.reps}回` : ''}
                  {w.weight_kg ? ` @ ${w.weight_kg}kg` : ''}
                  {w.duration_min ? ` ${w.duration_min}分` : ''}
                  {w.memo ? ` — ${w.memo}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
