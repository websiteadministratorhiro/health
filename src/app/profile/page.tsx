'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/src/hooks/useHealth'
import {
  calcBMR, calcTDEE, calcTargetPFC, calcTargetCalories
} from '@/src/lib/calculations'
import type { GoalType, Gender } from '@/src/lib/types'

const ACTIVITY_LABELS: Record<number, string> = {
  1: '座り仕事中心（ほぼ運動なし）',
  2: '軽い運動（週1〜2）',
  3: '中程度の運動（週3〜5）',
  4: 'ハードな運動（週6〜7）',
  5: '非常にハード（肉体労働など）',
}

const GOAL_LABELS: Record<GoalType, string> = {
  'ダイエット': 'ダイエット',
  '筋トレ': '筋トレ',
  '維持': '維持',
}

const inputCls = 'w-full rounded-lg border border-slate-600 bg-slate-900 text-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

export default function ProfilePage() {
  const { profile, loading, saveProfile } = useProfile()
  const [height_cm, setHeight] = useState('')
  const [weight_kg, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [activity_level, setActivity] = useState(3)
  const [goal_type, setGoalType] = useState<GoalType>('維持')
  const [target_weight_kg, setTargetWeight] = useState('')
  const [target_months, setTargetMonths] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (profile) {
      setHeight(String(profile.height_cm))
      setWeight(profile.weight_kg ? String(profile.weight_kg) : '')
      setAge(profile.age ? String(profile.age) : '')
      setGender(profile.gender)
      setActivity(profile.activity_level)
      setGoalType(profile.goal_type)
      setTargetWeight(profile.target_weight_kg ? String(profile.target_weight_kg) : '')
      setTargetMonths(profile.target_months ? String(profile.target_months) : '')
    }
  }, [profile])

  const handleSave = async () => {
    setStatus('loading')
    const err = await saveProfile({
      height_cm: Number(height_cm),
      weight_kg: weight_kg ? Number(weight_kg) : null,
      age: age ? Number(age) : null,
      gender,
      activity_level,
      goal_type,
      target_weight_kg: target_weight_kg ? Number(target_weight_kg) : null,
      target_months: target_months ? Number(target_months) : null,
    })
    if (err) {
      setStatus('error')
      setErrorMsg(err.message)
    } else {
      setStatus('success')
    }
  }

  const calcStats = () => {
    if (!height_cm || !age || !weight_kg) return null
    const w = Number(weight_kg)
    const bmr = calcBMR(w, Number(height_cm), Number(age), gender)
    const tdee = calcTDEE(bmr, activity_level)
    const targetCal = calcTargetCalories(tdee, goal_type)
    const pfc = calcTargetPFC(Math.round(targetCal), goal_type)
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCal: Math.round(targetCal), pfc }
  }

  const stats = calcStats()

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">読み込み中...</div>

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold text-slate-100 pt-2">プロフィール設定</h1>

      <div className="bg-[#1e293b] rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">性別</label>
          <div className="flex gap-2">
            {(['male', 'female'] as Gender[]).map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  gender === g
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-slate-600 text-slate-400 hover:border-slate-400'
                }`}
              >
                {g === 'male' ? '男性' : '女性'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">身長 (cm)</label>
            <input type="number" value={height_cm} onChange={e => setHeight(e.target.value)} placeholder="170" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">体重 (kg)</label>
            <input type="number" value={weight_kg} onChange={e => setWeight(e.target.value)} placeholder="70" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">年齢</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">活動レベル</label>
          <div className="space-y-2">
            {Object.entries(ACTIVITY_LABELS).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setActivity(Number(val))}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                  activity_level === Number(val)
                    ? 'bg-green-900 border-green-600 text-green-300'
                    : 'border-slate-600 text-slate-400 hover:border-slate-400'
                }`}
              >
                <span className="font-medium">{val}.</span> {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">目標タイプ</label>
          <div className="flex gap-2">
            {(Object.entries(GOAL_LABELS) as [GoalType, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setGoalType(val)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  goal_type === val
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-slate-600 text-slate-400 hover:border-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">目標体重 (kg)</label>
            <input type="number" value={target_weight_kg} onChange={e => setTargetWeight(e.target.value)} placeholder="65" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">目標期間 (ヶ月)</label>
            <input type="number" value={target_months} onChange={e => setTargetMonths(e.target.value)} placeholder="3" className={inputCls} />
          </div>
        </div>

        {status === 'success' && <p className="text-sm text-green-400">保存しました！</p>}
        {status === 'error' && <p className="text-sm text-red-400">{errorMsg}</p>}

        <button
          onClick={handleSave}
          disabled={!height_cm || status === 'loading'}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? '保存中...' : '保存'}
        </button>
      </div>

      {stats && (
        <div className="bg-[#1e293b] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">計算結果プレビュー</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">基礎代謝 (BMR)</span>
              <span className="font-bold text-slate-100">{stats.bmr} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">TDEE（消費カロリー）</span>
              <span className="font-bold text-slate-100">{stats.tdee} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">目標摂取カロリー</span>
              <span className="font-bold text-green-400">{stats.targetCal} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">目標PFC</span>
              <span className="font-bold text-slate-100">
                P{stats.pfc.protein_g}g / F{stats.pfc.fat_g}g / C{stats.pfc.carbs_g}g
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
