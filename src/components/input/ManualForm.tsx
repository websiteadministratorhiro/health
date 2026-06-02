'use client'

import { useState } from 'react'
import { saveJsonData } from '@/src/hooks/useHealth'
import type { MealType, JsonInputData } from '@/src/lib/types'

const today = new Date().toISOString().split('T')[0]

interface MealRow {
  meal_type: MealType
  food_name: string
  calories: string
  protein_g: string
  fat_g: string
  carbs_g: string
  memo: string
}

interface WorkoutRow {
  menu_name: string
  sets: string
  reps: string
  weight_kg: string
  duration_min: string
  memo: string
}

const emptyMeal = (): MealRow => ({ meal_type: '朝', food_name: '', calories: '', protein_g: '', fat_g: '', carbs_g: '', memo: '' })
const emptyWorkout = (): WorkoutRow => ({ menu_name: '', sets: '', reps: '', weight_kg: '', duration_min: '', memo: '' })

const inputCls = 'w-full rounded-lg border border-slate-600 bg-slate-900 text-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

export default function ManualForm() {
  const [date, setDate] = useState(today)
  const [weight_kg, setWeight] = useState('')
  const [body_fat_pct, setBodyFat] = useState('')
  const [sleep_hours, setSleep] = useState('')
  const [water_ml, setWater] = useState('')
  const [steps, setSteps] = useState('')
  const [mood, setMood] = useState('')
  const [condition_notes, setNotes] = useState('')
  const [meals, setMeals] = useState<MealRow[]>([emptyMeal()])
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([emptyWorkout()])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const updateMeal = (i: number, field: keyof MealRow, val: string) => {
    setMeals(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m))
  }
  const updateWorkout = (i: number, field: keyof WorkoutRow, val: string) => {
    setWorkouts(prev => prev.map((w, idx) => idx === i ? { ...w, [field]: val } : w))
  }

  const handleSubmit = async () => {
    setStatus('loading')
    setErrorMsg('')
    const input: JsonInputData = {
      date,
      ...(weight_kg ? { weight_kg: Number(weight_kg) } : {}),
      ...(body_fat_pct ? { body_fat_pct: Number(body_fat_pct) } : {}),
      ...(sleep_hours ? { sleep_hours: Number(sleep_hours) } : {}),
      ...(water_ml ? { water_ml: Number(water_ml) } : {}),
      ...(steps ? { steps: Number(steps) } : {}),
      ...(mood ? { mood: Number(mood) } : {}),
      ...(condition_notes ? { condition_notes } : {}),
      meals: meals.filter(m => m.food_name).map(m => ({
        meal_type: m.meal_type,
        food_name: m.food_name,
        ...(m.calories ? { calories: Number(m.calories) } : {}),
        ...(m.protein_g ? { protein_g: Number(m.protein_g) } : {}),
        ...(m.fat_g ? { fat_g: Number(m.fat_g) } : {}),
        ...(m.carbs_g ? { carbs_g: Number(m.carbs_g) } : {}),
        ...(m.memo ? { memo: m.memo } : {}),
      })),
      workouts: workouts.filter(w => w.menu_name).map(w => ({
        menu_name: w.menu_name,
        ...(w.sets ? { sets: Number(w.sets) } : {}),
        ...(w.reps ? { reps: Number(w.reps) } : {}),
        ...(w.weight_kg ? { weight_kg: Number(w.weight_kg) } : {}),
        ...(w.duration_min ? { duration_min: Number(w.duration_min) } : {}),
        ...(w.memo ? { memo: w.memo } : {}),
      })),
    }
    const err = await saveJsonData(input)
    if (err) {
      setStatus('error')
      setErrorMsg(err)
    } else {
      setStatus('success')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs text-slate-400 block mb-1">日付</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '体重 (kg)', value: weight_kg, set: setWeight, ph: '70.5' },
          { label: '体脂肪率 (%)', value: body_fat_pct, set: setBodyFat, ph: '18.5' },
          { label: '睡眠 (時間)', value: sleep_hours, set: setSleep, ph: '7.5' },
          { label: '水分 (ml)', value: water_ml, set: setWater, ph: '1800' },
          { label: '歩数', value: steps, set: setSteps, ph: '8000' },
        ].map(({ label, value, set, ph }) => (
          <div key={label}>
            <label className="text-xs text-slate-400 block mb-1">{label}</label>
            <input
              type="number"
              value={value}
              onChange={e => set(e.target.value)}
              placeholder={ph}
              className={inputCls}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">気分 (1〜5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setMood(String(n))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                mood === String(n)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-slate-600 text-slate-400 hover:border-slate-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">体調メモ</label>
        <textarea
          value={condition_notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className={inputCls}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-slate-200">食事</p>
          <button onClick={() => setMeals(p => [...p, emptyMeal()])} className="text-xs text-green-400">+ 追加</button>
        </div>
        {meals.map((m, i) => (
          <div key={i} className="border border-slate-700 rounded-xl p-3 mb-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">種別</label>
                <select
                  value={m.meal_type}
                  onChange={e => updateMeal(i, 'meal_type', e.target.value)}
                  className={inputCls}
                >
                  <option value="朝">朝食</option>
                  <option value="昼">昼食</option>
                  <option value="晩">夕食</option>
                  <option value="間食">間食</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">食品名</label>
                <input
                  type="text"
                  value={m.food_name}
                  onChange={e => updateMeal(i, 'food_name', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['calories', 'protein_g', 'fat_g', 'carbs_g'] as (keyof MealRow)[]).map(f => (
                <div key={f}>
                  <label className="text-xs text-slate-400 block mb-1">
                    {f === 'calories' ? 'kcal' : f === 'protein_g' ? 'P(g)' : f === 'fat_g' ? 'F(g)' : 'C(g)'}
                  </label>
                  <input
                    type="number"
                    value={m[f]}
                    onChange={e => updateMeal(i, f, e.target.value)}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">メモ</label>
              <input type="text" value={m.memo} onChange={e => updateMeal(i, 'memo', e.target.value)} className={inputCls} />
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-slate-200">トレーニング</p>
          <button onClick={() => setWorkouts(p => [...p, emptyWorkout()])} className="text-xs text-green-400">+ 追加</button>
        </div>
        {workouts.map((w, i) => (
          <div key={i} className="border border-slate-700 rounded-xl p-3 mb-2 space-y-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">種目名</label>
              <input
                type="text"
                value={w.menu_name}
                onChange={e => updateWorkout(i, 'menu_name', e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([
                { f: 'sets', label: 'セット' },
                { f: 'reps', label: '回数' },
                { f: 'weight_kg', label: '重量kg' },
                { f: 'duration_min', label: '分' },
              ] as { f: keyof WorkoutRow; label: string }[]).map(({ f, label }) => (
                <div key={f}>
                  <label className="text-xs text-slate-400 block mb-1">{label}</label>
                  <input
                    type="number"
                    value={w[f]}
                    onChange={e => updateWorkout(i, f, e.target.value)}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">メモ</label>
              <input type="text" value={w.memo} onChange={e => updateWorkout(i, 'memo', e.target.value)} className={inputCls} />
            </div>
          </div>
        ))}
      </div>

      {status === 'success' && <p className="text-sm text-green-400 font-medium">登録しました！</p>}
      {status === 'error' && <p className="text-sm text-red-400">{errorMsg}</p>}

      <button
        onClick={handleSubmit}
        disabled={status === 'loading'}
        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? '登録中...' : '登録'}
      </button>
    </div>
  )
}
