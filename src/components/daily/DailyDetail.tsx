'use client'

import { useState } from 'react'
import type { DayData, HlMeal, HlWorkout } from '@/src/lib/types'
import { calcTotalCalories, calcTotalPFC } from '@/src/lib/calculations'
import {
  updateDailyRecord,
  deleteMeal,
  updateMeal,
  deleteWorkout,
  updateWorkout,
} from '@/src/hooks/useHealth'

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
  refetch: () => void
}

// ---- 身体データ編集 ----
interface RecordEditState {
  weight_kg: string
  body_fat_pct: string
  sleep_hours: string
  water_ml: string
  steps: string
  mood: string
  condition_notes: string
}

function toStr(v: number | string | null | undefined): string {
  return v !== null && v !== undefined ? String(v) : ''
}

function BodySection({
  record,
  refetch,
}: {
  record: DayData['record']
  refetch: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<RecordEditState>({
    weight_kg: toStr(record?.weight_kg),
    body_fat_pct: toStr(record?.body_fat_pct),
    sleep_hours: toStr(record?.sleep_hours),
    water_ml: toStr(record?.water_ml),
    steps: toStr(record?.steps),
    mood: toStr(record?.mood),
    condition_notes: toStr(record?.condition_notes),
  })

  const startEdit = () => {
    setForm({
      weight_kg: toStr(record?.weight_kg),
      body_fat_pct: toStr(record?.body_fat_pct),
      sleep_hours: toStr(record?.sleep_hours),
      water_ml: toStr(record?.water_ml),
      steps: toStr(record?.steps),
      mood: toStr(record?.mood),
      condition_notes: toStr(record?.condition_notes),
    })
    setEditing(true)
  }

  const handleSave = async () => {
    if (!record) return
    setSaving(true)
    const toNum = (s: string) => (s === '' ? null : Number(s))
    await updateDailyRecord(record.id, {
      weight_kg: toNum(form.weight_kg),
      body_fat_pct: toNum(form.body_fat_pct),
      sleep_hours: toNum(form.sleep_hours),
      water_ml: toNum(form.water_ml),
      steps: toNum(form.steps),
      mood: toNum(form.mood),
      condition_notes: form.condition_notes || null,
    })
    setSaving(false)
    setEditing(false)
    refetch()
  }

  const inputClass =
    'bg-[#0f172a] border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm w-full'

  return (
    <div className="bg-[#1e293b] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-200">身体データ</h2>
        {record && !editing && (
          <button
            onClick={startEdit}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
          >
            編集
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">体重 (kg)</p>
              <input
                className={inputClass}
                type="number"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">体脂肪率 (%)</p>
              <input
                className={inputClass}
                type="number"
                step="0.1"
                value={form.body_fat_pct}
                onChange={(e) => setForm({ ...form, body_fat_pct: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">睡眠 (時間)</p>
              <input
                className={inputClass}
                type="number"
                step="0.5"
                value={form.sleep_hours}
                onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">水分 (ml)</p>
              <input
                className={inputClass}
                type="number"
                value={form.water_ml}
                onChange={(e) => setForm({ ...form, water_ml: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">歩数</p>
              <input
                className={inputClass}
                type="number"
                value={form.steps}
                onChange={(e) => setForm({ ...form, steps: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">気分 (1〜5)</p>
              <input
                className={inputClass}
                type="number"
                min="1"
                max="5"
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: e.target.value })}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">体調メモ</p>
            <input
              className={inputClass}
              type="text"
              value={form.condition_notes}
              onChange={(e) => setForm({ ...form, condition_notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
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
      ) : (
        <>
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
              <p className="font-bold text-slate-100">
                {record?.steps?.toLocaleString() ?? '--'} 歩
              </p>
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
        </>
      )}
    </div>
  )
}

// ---- 食事行 ----
function MealRow({
  meal,
  refetch,
}: {
  meal: HlMeal
  refetch: () => void
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
    await deleteMeal(meal.id)
    refetch()
  }

  const handleSave = async () => {
    setSaving(true)
    const toNum = (s: string) => (s === '' ? null : Number(s))
    await updateMeal(meal.id, {
      food_name: form.food_name,
      calories: toNum(form.calories),
      protein_g: toNum(form.protein_g),
      fat_g: toNum(form.fat_g),
      carbs_g: toNum(form.carbs_g),
      memo: form.memo || null,
    })
    setSaving(false)
    setExpanded(false)
    refetch()
  }

  return (
    <div className="border border-slate-700 rounded-lg p-2">
      <div className="flex justify-between items-start text-sm">
        <button
          className="flex-1 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div>
            <span className="text-xs bg-green-900 text-green-300 rounded px-1 mr-2">
              {MEAL_LABELS[meal.meal_type] ?? meal.meal_type}
            </span>
            <span className="text-slate-200">{meal.food_name}</span>
            {meal.memo && !expanded && (
              <p className="text-xs text-slate-500 mt-0.5 ml-1">{meal.memo}</p>
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
}: {
  workout: HlWorkout
  refetch: () => void
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

  const handleDelete = async () => {
    await deleteWorkout(workout.id)
    refetch()
  }

  const handleSave = async () => {
    setSaving(true)
    const toNum = (s: string) => (s === '' ? null : Number(s))
    await updateWorkout(workout.id, {
      menu_name: form.menu_name,
      sets: toNum(form.sets),
      reps: toNum(form.reps),
      weight_kg: toNum(form.weight_kg),
      duration_min: toNum(form.duration_min),
      memo: form.memo || null,
    })
    setSaving(false)
    setExpanded(false)
    refetch()
  }

  return (
    <div className="border border-slate-700 rounded-lg p-2">
      <div className="flex justify-between items-start text-sm">
        <button
          className="flex-1 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <p className="font-medium text-slate-200">{workout.menu_name}</p>
          {!expanded && (
            <p className="text-slate-500 text-xs">
              {workout.sets && workout.reps ? `${workout.sets}セット × ${workout.reps}回` : ''}
              {workout.weight_kg ? ` @ ${workout.weight_kg}kg` : ''}
              {workout.duration_min ? ` ${workout.duration_min}分` : ''}
              {workout.memo ? ` — ${workout.memo}` : ''}
            </p>
          )}
        </button>
        <button
          onClick={handleDelete}
          className="text-slate-500 hover:text-red-400 transition-colors text-xs px-1 ml-2 shrink-0"
        >
          ✕
        </button>
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

// ---- メイン ----
export default function DailyDetail({ data, refetch }: Props) {
  const { record, meals, workouts } = data
  const totalCal = calcTotalCalories(meals)
  const pfc = calcTotalPFC(meals)

  return (
    <div className="p-4 space-y-4">
      <BodySection record={record} refetch={refetch} />

      <div className="bg-[#1e293b] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">食事</h2>
        <p className="text-xs text-slate-500 mb-3">
          合計 {totalCal} kcal / P:{pfc.protein_g.toFixed(1)}g F:{pfc.fat_g.toFixed(1)}g C:
          {pfc.carbs_g.toFixed(1)}g
        </p>
        {meals.length === 0 ? (
          <p className="text-sm text-slate-500">記録なし</p>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <MealRow key={meal.id} meal={meal} refetch={refetch} />
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
              <WorkoutRow key={w.id} workout={w} refetch={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
