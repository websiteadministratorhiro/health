'use client'

import { useDayData, useProfile, useWorkoutPlans } from '@/src/hooks/useHealth'
import {
  calcBMI, calcBMR, calcTDEE, calcTargetPFC, calcTargetCalories,
  calcTotalCalories, calcTotalPFC, calcWorkoutCalories, bmiCategory
} from '@/src/lib/calculations'
import SummaryCard from '@/src/components/dashboard/SummaryCard'
import PFCBar from '@/src/components/dashboard/PFCBar'
import CalorieMeter from '@/src/components/dashboard/CalorieMeter'
import Link from 'next/link'

const today = new Date().toISOString().split('T')[0]
const todayDow = new Date().getDay()

const MEAL_TAG_CLS: Record<string, string> = {
  '朝': 'bg-blue-900 text-blue-300',
  '昼': 'bg-yellow-900 text-yellow-300',
  '晩': 'bg-orange-900 text-orange-300',
  '間食': 'bg-purple-900 text-purple-300',
}
const MEAL_LABELS: Record<string, string> = { '朝': '朝食', '昼': '昼食', '晩': '夕食', '間食': '間食' }

export default function DashboardPage() {
  const { data, loading: dayLoading } = useDayData(today)
  const { profile, loading: profileLoading } = useProfile()
  const { plans, loading: plansLoading } = useWorkoutPlans(todayDow)

  if (dayLoading || profileLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">読み込み中...</div>
  }

  const { record, meals, workouts } = data
  const totalCal = calcTotalCalories(meals)
  const pfc = calcTotalPFC(meals)
  const burnedCal = Math.round(calcWorkoutCalories(workouts))

  let bmi: number | null = null
  let tdee: number | null = null
  let targetCal: number | null = null
  let targetPFC = null

  const weight = record?.weight_kg ?? profile?.weight_kg ?? null

  if (profile && weight) {
    bmi = Math.round(calcBMI(weight, profile.height_cm) * 10) / 10
    const age = profile.age ?? 30
    const bmr = calcBMR(weight, profile.height_cm, age, profile.gender)
    tdee = Math.round(calcTDEE(bmr, profile.activity_level))
    targetCal = Math.round(calcTargetCalories(tdee, profile.goal_type))
    targetPFC = calcTargetPFC(targetCal, profile.goal_type, weight)
  }

  // 達成済み判定：プランのmenu_nameと実績のmenu_nameが一致
  const achievedNames = new Set(workouts.map(w => w.menu_name))

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-lg font-bold text-slate-100">今日のサマリー</h1>
        <p className="text-sm text-slate-400">{today}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="体重" value={weight} unit="kg" />
        <SummaryCard label="BMI" value={bmi} sub={bmi ? bmiCategory(bmi) : undefined} />
        <SummaryCard label="睡眠" value={record?.sleep_hours ?? null} unit="時間" color="text-blue-400" />
        <SummaryCard label="歩数" value={record?.steps?.toLocaleString() ?? null} unit="歩" color="text-purple-400" />
      </div>

      <CalorieMeter
        intake={totalCal}
        burned={burnedCal}
        target={targetCal ?? 2000}
        tdee={tdee ?? undefined}
      />

      {(pfc.protein_g > 0 || pfc.fat_g > 0 || pfc.carbs_g > 0) && (
        <PFCBar
          protein_g={pfc.protein_g}
          fat_g={pfc.fat_g}
          carbs_g={pfc.carbs_g}
          targetProtein={targetPFC?.protein_g}
          targetFat={targetPFC?.fat_g}
          targetCarbs={targetPFC?.carbs_g}
        />
      )}

      {/* 食事セクション */}
      <div className="bg-[#1e293b] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-2">今日の食事</h2>
        {meals.length === 0 ? (
          <p className="text-sm text-slate-500">まだ記録がありません</p>
        ) : (
          <ul className="space-y-2">
            {meals.map(m => (
              <li key={m.id} className="flex items-start gap-2">
                <span className={`text-xs rounded px-1.5 py-0.5 shrink-0 mt-0.5 ${MEAL_TAG_CLS[m.meal_type] ?? 'bg-slate-700 text-slate-300'}`}>
                  {MEAL_LABELS[m.meal_type] ?? m.meal_type}
                </span>
                <span className="flex-1 min-w-0 text-sm text-slate-300 break-words">{m.food_name}</span>
                <span className="text-sm text-slate-500 shrink-0">{m.calories != null ? `${m.calories} kcal` : '-- kcal'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* トレーニングセクション */}
      <div className="bg-[#1e293b] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-2">今日のトレーニング</h2>

        {/* 今日のプラン */}
        {!plansLoading && plans.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-500 mb-1.5">今日のプラン</p>
            <ul className="space-y-1.5">
              {plans.map(plan => {
                const done = achievedNames.has(plan.menu_name)
                return (
                  <li key={plan.id} className={`flex items-center gap-2 text-sm ${done ? 'text-green-400' : 'text-slate-400'}`}>
                    <span className="shrink-0">{done ? '✅' : '○'}</span>
                    <span className="flex-1 min-w-0">
                      <span className={`text-xs rounded px-1 mr-1 ${plan.workout_type === '筋トレ' ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}`}>
                        {plan.workout_type}
                      </span>
                      {plan.menu_name}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">
                      {plan.workout_type === '筋トレ' && plan.target_sets && plan.target_reps
                        ? `${plan.target_sets}×${plan.target_reps}${plan.target_weight_kg ? `@${plan.target_weight_kg}kg` : ''}`
                        : plan.target_duration_min ? `${plan.target_duration_min}分` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* 実績 */}
        {workouts.length === 0 ? (
          <p className="text-sm text-slate-500">まだ記録がありません</p>
        ) : (
          <>
            {plans.length > 0 && <p className="text-xs text-slate-500 mb-1.5">実績</p>}
            <ul className="space-y-1">
              {workouts.map(w => (
                <li key={w.id} className="text-sm text-slate-300">
                  {w.menu_name}
                  {w.sets && w.reps ? ` ${w.sets}×${w.reps}` : ''}
                  {w.weight_kg ? ` @${w.weight_kg}kg` : ''}
                  {w.duration_min ? ` ${w.duration_min}分` : ''}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Link href="/input" className="block w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-center transition-colors">
        今日のデータを入力
      </Link>
    </div>
  )
}
