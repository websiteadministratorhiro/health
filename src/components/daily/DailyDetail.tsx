'use client'

import { useRef, useState } from 'react'
import type { DayData, HlMeal, HlWorkout, HlProfile, MealType } from '@/src/lib/types'
import {
  calcTotalCalories,
  calcTotalPFC,
  calcWorkoutCalories,
  calcTargetCalories,
  calcTargetPFC,
  calcBMI,
  calcBMR,
  calcTDEE,
  bmiCategory,
} from '@/src/lib/calculations'
import {
  updateDailyRecord,
  deleteMeal,
  updateMeal,
  deleteWorkout,
  updateWorkout,
  deleteMealsByDate,
  deleteDayAllData,
} from '@/src/hooks/useHealth'
import SummaryCard from '@/src/components/dashboard/SummaryCard'
import CalorieMeter from '@/src/components/dashboard/CalorieMeter'
import PFCBar from '@/src/components/dashboard/PFCBar'

// ---- 定数 ----
const MEAL_CATEGORIES: MealType[] = ['朝', '昼', '晩', '間食']
const MEAL_CATEGORY_LABELS: Record<MealType, string> = {
  '朝': '朝食',
  '昼': '昼食',
  '晩': '夕食',
  '間食': '間食',
}
const MEAL_TAG_CLS: Record<MealType, string> = {
  '朝': 'bg-blue-900 text-blue-300',
  '昼': 'bg-yellow-900 text-yellow-300',
  '晩': 'bg-orange-900 text-orange-300',
  '間食': 'bg-purple-900 text-purple-300',
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
  profile: HlProfile | null
  refetch: () => void
  date: string
}

function toStr(v: number | string | null | undefined): string {
  return v !== null && v !== undefined ? String(v) : ''
}

// ---- スクロール位置保持ユーティリティ ----
function useScrollPreserve() {
  const scrollYRef = useRef(0)

  const withScrollPreserve = async (fn: () => Promise<void>) => {
    scrollYRef.current = window.scrollY
    await fn()
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollYRef.current, behavior: 'instant' })
    })
  }

  return { withScrollPreserve }
}

// ---- 身体データ個別フィールド編集 ----
type FieldKey = 'weight_kg' | 'body_fat_pct' | 'water_ml' | 'mood' | 'condition_notes'

interface FieldConfig {
  key: FieldKey
  label: string
  type: 'number' | 'text' | 'mood'
  unit?: string
  step?: string
  min?: string
  max?: string
}

const FIELD_CONFIGS: FieldConfig[] = [
  { key: 'weight_kg', label: '体重', type: 'number', unit: 'kg', step: '0.1' },
  { key: 'body_fat_pct', label: '体脂肪率', type: 'number', unit: '%', step: '0.1' },
  { key: 'water_ml', label: '水分', type: 'number', unit: 'ml' },
  { key: 'mood', label: '気分', type: 'mood' },
  { key: 'condition_notes', label: '体調メモ', type: 'text' },
]

function FieldRow({
  config,
  record,
  refetch,
  withScrollPreserve,
}: {
  config: FieldConfig
  record: DayData['record']
  refetch: () => void
  withScrollPreserve: (fn: () => Promise<void>) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const rawValue = record ? record[config.key] : null

  const displayValue = () => {
    if (rawValue === null || rawValue === undefined) return '--'
    if (config.key === 'mood') return MOOD_LABELS[rawValue as number] ?? String(rawValue)
    return String(rawValue)
  }

  const startEdit = () => {
    setValue(toStr(rawValue))
    setEditing(true)
  }

  const handleSave = async () => {
    if (!record) return
    setSaving(true)
    const toNum = (s: string) => (s === '' ? null : Number(s))
    // condition_notes はstring|null、それ以外はnumber|null
    const fields = (
      config.type === 'text'
        ? { [config.key]: value || null }
        : { [config.key]: toNum(value) }
    ) as Parameters<typeof updateDailyRecord>[1]
    await withScrollPreserve(async () => {
      await updateDailyRecord(record.id, fields)
      refetch()
    })
    setSaving(false)
    setEditing(false)
  }

  const inputClass =
    'bg-[#0f172a] border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm w-32'

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
      <span className="text-xs text-slate-500 w-20 shrink-0">{config.label}</span>

      {editing ? (
        <div className="flex items-center gap-2 flex-1 justify-end">
          {config.type === 'mood' ? (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setValue(String(n))}
                  className={`text-lg px-1 rounded transition-colors ${
                    value === String(n) ? 'bg-slate-600' : 'hover:bg-slate-700'
                  }`}
                >
                  {MOOD_LABELS[n]}
                </button>
              ))}
            </div>
          ) : (
            <input
              className={inputClass}
              type={config.type === 'text' ? 'text' : 'number'}
              step={config.step}
              min={config.min}
              max={config.max}
              value={value}
              autoFocus
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') setEditing(false)
              }}
            />
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {saving ? '…' : '✓'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-200">
            {displayValue()}
            {rawValue !== null && rawValue !== undefined && config.unit ? ` ${config.unit}` : ''}
          </span>
          {record && (
            <button
              onClick={startEdit}
              className="text-slate-500 hover:text-slate-300 transition-colors text-sm px-1"
              title="編集"
            >
              ✏️
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function BodySection({
  record,
  refetch,
  withScrollPreserve,
}: {
  record: DayData['record']
  refetch: () => void
  withScrollPreserve: (fn: () => Promise<void>) => Promise<void>
}) {
  return (
    <div className="bg-[#1e293b] rounded-xl p-4">
      <h2 className="text-sm font-semibold text-slate-200 mb-3">身体データ詳細</h2>
      <div>
        {FIELD_CONFIGS.map((config) => (
          <FieldRow
            key={config.key}
            config={config}
            record={record}
            refetch={refetch}
            withScrollPreserve={withScrollPreserve}
          />
        ))}
      </div>
    </div>
  )
}

// ---- 食事行 ----
function MealRow({
  meal,
  refetch,
  withScrollPreserve,
}: {
  meal: HlMeal
  refetch: () => void
  withScrollPreserve: (fn: () => Promise<void>) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    food_name: meal.food_name,
    calories: toStr(meal.calories),
    protein_g: toStr(meal.protein_g),
    fat_g: toStr(meal.fat_g),
    carbs_g: toStr(meal.carbs_g),
    memo: toStr(meal.memo),
  })

  const inputClass =
    'bg-[#0f172a] border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm w-full'

  const handleDelete = async () => {
    await withScrollPreserve(async () => {
      await deleteMeal(meal.id)
      refetch()
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const toNum = (s: string) => (s === '' ? null : Number(s))
    await withScrollPreserve(async () => {
      await updateMeal(meal.id, {
        food_name: form.food_name,
        calories: toNum(form.calories),
        protein_g: toNum(form.protein_g),
        fat_g: toNum(form.fat_g),
        carbs_g: toNum(form.carbs_g),
        memo: form.memo || null,
      })
      refetch()
    })
    setSaving(false)
    setExpanded(false)
  }

  return (
    <div className="border border-slate-700 rounded-lg p-2">
      <div className="flex justify-between items-start text-sm">
        <button
          className="flex-1 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div>
            <span className="text-slate-200">{meal.food_name}</span>
            {meal.memo && !expanded && (
              <p className="text-xs text-slate-500 mt-0.5">{meal.memo}</p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <span className="text-slate-500 text-sm">{meal.calories ?? '--'} kcal</span>
          <button
            onClick={handleDelete}
            className="text-slate-500 hover:text-red-400 transition-colors text-xs px-1"
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-slate-500 mb-1">食品名</p>
              <input
                className={inputClass}
                type="text"
                value={form.food_name}
                onChange={(e) => setForm({ ...form, food_name: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">カロリー (kcal)</p>
              <input
                className={inputClass}
                type="number"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">P (g)</p>
              <input
                className={inputClass}
                type="number"
                step="0.1"
                value={form.protein_g}
                onChange={(e) => setForm({ ...form, protein_g: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">F (g)</p>
              <input
                className={inputClass}
                type="number"
                step="0.1"
                value={form.fat_g}
                onChange={(e) => setForm({ ...form, fat_g: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">C (g)</p>
              <input
                className={inputClass}
                type="number"
                step="0.1"
                value={form.carbs_g}
                onChange={(e) => setForm({ ...form, carbs_g: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">メモ</p>
              <input
                className={inputClass}
                type="text"
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setExpanded(false)}
              className="text-xs px-3 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- トレーニング行 ----
function WorkoutRow({
  workout,
  refetch,
  withScrollPreserve,
}: {
  workout: HlWorkout
  refetch: () => void
  withScrollPreserve: (fn: () => Promise<void>) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    menu_name: workout.menu_name,
    sets: toStr(workout.sets),
    reps: toStr(workout.reps),
    weight_kg: toStr(workout.weight_kg),
    duration_min: toStr(workout.duration_min),
    memo: toStr(workout.memo),
  })

  const inputClass =
    'bg-[#0f172a] border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm w-full'

  // ⑤ 固定フォーマット表示
  const formatSpec = () => {
    if (workout.sets && workout.reps) {
      const s = `${workout.sets}×${workout.reps}`
      return workout.weight_kg ? `${s} @${workout.weight_kg}kg` : s
    }
    if (workout.duration_min) return `${workout.duration_min}分`
    return ''
  }

  const burnedKcal = Math.round(calcWorkoutCalories([workout]))

  const handleDelete = async () => {
    await withScrollPreserve(async () => {
      await deleteWorkout(workout.id)
      refetch()
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const toNum = (s: string) => (s === '' ? null : Number(s))
    await withScrollPreserve(async () => {
      await updateWorkout(workout.id, {
        menu_name: form.menu_name,
        sets: toNum(form.sets),
        reps: toNum(form.reps),
        weight_kg: toNum(form.weight_kg),
        duration_min: toNum(form.duration_min),
        memo: form.memo || null,
      })
      refetch()
    })
    setSaving(false)
    setExpanded(false)
  }

  return (
    <div className="border border-slate-700 rounded-lg p-2">
      <div className="flex justify-between items-center text-sm">
        <button
          className="flex-1 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-200">{workout.menu_name}</span>
            {formatSpec() && (
              <span className="text-slate-400 text-xs">{formatSpec()}</span>
            )}
          </div>
          {workout.memo && !expanded && (
            <p className="text-xs text-slate-500 mt-0.5">{workout.memo}</p>
          )}
        </button>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          {burnedKcal > 0 && (
            <span className="text-slate-500 text-xs">{burnedKcal} kcal</span>
          )}
          <button
            onClick={handleDelete}
            className="text-slate-500 hover:text-red-400 transition-colors text-xs px-1"
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">メニュー名</p>
              <input
                className={inputClass}
                type="text"
                value={form.menu_name}
                onChange={(e) => setForm({ ...form, menu_name: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">セット</p>
              <input
                className={inputClass}
                type="number"
                value={form.sets}
                onChange={(e) => setForm({ ...form, sets: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">回数</p>
              <input
                className={inputClass}
                type="number"
                value={form.reps}
                onChange={(e) => setForm({ ...form, reps: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">重量 (kg)</p>
              <input
                className={inputClass}
                type="number"
                step="0.5"
                value={form.weight_kg}
                onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">時間 (分)</p>
              <input
                className={inputClass}
                type="number"
                value={form.duration_min}
                onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">メモ</p>
              <input
                className={inputClass}
                type="text"
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setExpanded(false)}
              className="text-xs px-3 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- 全データ削除 ----
function DeleteDaySection({
  date,
  refetch,
}: {
  date: string
  refetch: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await deleteDayAllData(date)
    setDeleting(false)
    setConfirming(false)
    refetch()
  }

  return (
    <div className="pt-2">
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="w-full text-xs text-red-500 border border-red-800 rounded-lg py-2 hover:bg-red-950 transition-colors"
        >
          この日のデータをすべて削除
        </button>
      ) : (
        <div className="border border-red-800 rounded-lg p-3 space-y-2">
          <p className="text-xs text-red-400 text-center">本当に削除しますか？</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setConfirming(false)}
              className="text-xs px-4 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs px-4 py-1.5 rounded bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? '削除中...' : 'はい削除'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- メイン ----
export default function DailyDetail({ data, profile, refetch, date }: Props) {
  const { record, meals, workouts } = data
  const { withScrollPreserve } = useScrollPreserve()

  const totalCal = calcTotalCalories(meals)
  const pfc = calcTotalPFC(meals)
  const burnedCal = Math.round(calcWorkoutCalories(workouts))

  // プロフィールベースの計算（表示用体重はrecordのみ、計算はprofileも使用）
  let bmi: number | null = null
  let tdee: number | null = null
  let targetCal: number | null = null
  let targetPFC: { protein_g: number; fat_g: number; carbs_g: number } | null = null

  // ⑨ 体重はrecordの実測値のみ（プロフィールフォールバックなし）
  const displayWeight = record?.weight_kg ?? null

  // カロリー・PFC計算はprofileのweight_kgを使用
  const calcWeight = profile?.weight_kg ?? null

  if (profile && calcWeight) {
    bmi = displayWeight
      ? Math.round(calcBMI(displayWeight, profile.height_cm) * 10) / 10
      : null
    const age = profile.age ?? 30
    const bmr = calcBMR(calcWeight, profile.height_cm, age, profile.gender)
    tdee = Math.round(calcTDEE(bmr, profile.activity_level))
    targetCal = Math.round(calcTargetCalories(tdee, profile.goal_type))
    targetPFC = calcTargetPFC(targetCal, profile.goal_type, calcWeight)
  }

  // ② 食事一括削除ハンドラ
  const handleDeleteAllMeals = async () => {
    await withScrollPreserve(async () => {
      await deleteMealsByDate(date)
      refetch()
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* 0. この日の全データ削除（最上部） */}
      <DeleteDaySection date={date} refetch={refetch} />

      {/* 1. SummaryCards — ⑨ 体重・BMIはrecordに値がある場合のみ表示 */}
      <div className="grid grid-cols-2 gap-3">
        {displayWeight !== null && (
          <SummaryCard label="体重" value={displayWeight} unit="kg" />
        )}
        {displayWeight !== null && bmi !== null && (
          <SummaryCard
            label="BMI"
            value={bmi}
            sub={bmiCategory(bmi)}
          />
        )}
        <SummaryCard
          label="睡眠"
          value={record?.sleep_hours ?? null}
          unit="時間"
          color="text-blue-400"
        />
        <SummaryCard
          label="歩数"
          value={record?.steps?.toLocaleString() ?? null}
          unit="歩"
          color="text-purple-400"
        />
      </div>

      {/* 2. CalorieMeter */}
      <CalorieMeter
        intake={totalCal}
        burned={burnedCal}
        target={targetCal ?? 2000}
        tdee={tdee ?? undefined}
      />

      {/* 3. PFCBar — PFCデータがある場合のみ表示、目標値も渡す */}
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

      {/* 4. 身体データ詳細（個別インライン編集） */}
      <BodySection
        record={record}
        refetch={refetch}
        withScrollPreserve={withScrollPreserve}
      />

      {/* 5. 食事一覧（④ カテゴリ固定表示 + ② 一括削除） */}
      <div className="bg-[#1e293b] rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-slate-200">食事</h2>
          {meals.length > 0 && (
            <button
              onClick={handleDeleteAllMeals}
              className="text-xs text-red-500 hover:text-red-400 transition-colors"
            >
              全消去
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-3">
          合計 {totalCal} kcal / P:{pfc.protein_g.toFixed(1)}g F:{pfc.fat_g.toFixed(1)}g C:
          {pfc.carbs_g.toFixed(1)}g
        </p>

        {/* ④ 4カテゴリを常時表示 */}
        <div className="space-y-4">
          {MEAL_CATEGORIES.map((cat) => {
            const catMeals = meals.filter((m) => m.meal_type === cat)
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs rounded px-1.5 py-0.5 ${MEAL_TAG_CLS[cat]}`}>
                    {MEAL_CATEGORY_LABELS[cat]}
                  </span>
                </div>
                {catMeals.length === 0 ? (
                  <p className="text-xs text-slate-600 pl-1">なし</p>
                ) : (
                  <div className="space-y-2">
                    {catMeals.map((meal) => (
                      <MealRow
                        key={meal.id}
                        meal={meal}
                        refetch={refetch}
                        withScrollPreserve={withScrollPreserve}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 6. トレーニング一覧 */}
      <div className="bg-[#1e293b] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">トレーニング</h2>
        {workouts.length === 0 ? (
          <p className="text-sm text-slate-500">記録なし</p>
        ) : (
          <div className="space-y-2">
            {workouts.map((w) => (
              <WorkoutRow
                key={w.id}
                workout={w}
                refetch={refetch}
                withScrollPreserve={withScrollPreserve}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
