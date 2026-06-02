'use client'

import { useState, useEffect } from 'react'
import { useProfile, useAllWorkoutPlans, saveWorkoutPlan, deleteWorkoutPlan } from '@/src/hooks/useHealth'
import {
  calcBMR, calcTDEE, calcTargetPFC, calcTargetCalories
} from '@/src/lib/calculations'
import type { GoalType, Gender, WorkoutType } from '@/src/lib/types'

const ACTIVITY_LABELS: Record<number, string> = {
  1: '座り仕事中心（ほぼ運動なし）',
  2: '軽い運動（週1〜2）',
  3: '中程度の運動（週3〜5）',
  4: 'ハードな運動（週6〜7）',
  5: '非常にハード（肉体労働など）',
}

const GOAL_OPTIONS: { value: GoalType; label: string; desc: string }[] = [
  { value: 'ダイエット', label: 'ダイエット', desc: '体重・体脂肪を減らしたい（脂肪燃焼優先）' },
  { value: '筋トレ', label: '筋トレ', desc: '筋肉を増やしたい（バルクアップ）' },
  { value: 'ボディメイク', label: 'ボディメイク', desc: '筋トレしながら脂肪も落としたい（リコンプ）' },
]

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

const inputCls = 'w-full rounded-lg border border-slate-600 bg-slate-900 text-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

export default function ProfilePage() {
  const { profile, loading, saveProfile } = useProfile()
  const { plans, loading: plansLoading, refetch: refetchPlans } = useAllWorkoutPlans()

  const [height_cm, setHeight] = useState('')
  const [weight_kg, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [activity_level, setActivity] = useState(3)
  const [goal_type, setGoalType] = useState<GoalType>('ボディメイク')
  const [target_weight_kg, setTargetWeight] = useState('')
  const [target_months, setTargetMonths] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // トレーニングプラン用
  const [activeDay, setActiveDay] = useState(new Date().getDay())
  const [showForm, setShowForm] = useState(false)
  const [menuName, setMenuName] = useState('')
  const [workoutType, setWorkoutType] = useState<WorkoutType>('筋トレ')
  const [targetSets, setTargetSets] = useState('')
  const [targetReps, setTargetReps] = useState('')
  const [targetWeightKg, setTargetWeightKg] = useState('')
  const [targetDurationMin, setTargetDurationMin] = useState('')
  const [targetDistanceKm, setTargetDistanceKm] = useState('')
  const [planStatus, setPlanStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

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
    const pfc = calcTargetPFC(Math.round(targetCal), goal_type, Number(weight_kg))
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCal: Math.round(targetCal), pfc }
  }

  const stats = calcStats()

  const handleAddPlan = async () => {
    if (!menuName.trim()) return
    setPlanStatus('loading')
    const dayPlans = plans.filter(p => p.day_of_week === activeDay)
    const err = await saveWorkoutPlan({
      day_of_week: activeDay,
      menu_name: menuName.trim(),
      workout_type: workoutType,
      target_sets: targetSets ? Number(targetSets) : null,
      target_reps: targetReps ? Number(targetReps) : null,
      target_weight_kg: targetWeightKg ? Number(targetWeightKg) : null,
      target_duration_min: targetDurationMin ? Number(targetDurationMin) : null,
      target_distance_km: targetDistanceKm ? Number(targetDistanceKm) : null,
      order_index: dayPlans.length,
    })
    if (!err) {
      setMenuName('')
      setTargetSets('')
      setTargetReps('')
      setTargetWeightKg('')
      setTargetDurationMin('')
      setTargetDistanceKm('')
      setShowForm(false)
      setPlanStatus('idle')
      await refetchPlans()
    } else {
      setPlanStatus('error')
    }
  }

  const handleDeletePlan = async (id: string) => {
    await deleteWorkoutPlan(id)
    await refetchPlans()
  }

  const activeDayPlans = plans.filter(p => p.day_of_week === activeDay)

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
          <div className="space-y-2">
            {GOAL_OPTIONS.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setGoalType(value)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  goal_type === value
                    ? 'bg-green-900 border-green-600'
                    : 'border-slate-600 hover:border-slate-400'
                }`}
              >
                <p className={`text-sm font-medium ${goal_type === value ? 'text-green-300' : 'text-slate-300'}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${goal_type === value ? 'text-green-400' : 'text-slate-500'}`}>{desc}</p>
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

      {/* 週間トレーニングプラン */}
      <div className="bg-[#1e293b] rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">週間トレーニングプラン</h2>

        {/* 曜日タブ */}
        <div className="flex gap-1">
          {DAY_LABELS.map((day, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveDay(idx); setShowForm(false) }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeDay === idx
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-slate-600 text-slate-400 hover:border-slate-400'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* 登録済みメニュー */}
        {plansLoading ? (
          <p className="text-xs text-slate-500">読み込み中...</p>
        ) : activeDayPlans.length === 0 ? (
          <p className="text-xs text-slate-500">メニューが登録されていません</p>
        ) : (
          <ul className="space-y-2">
            {activeDayPlans.map(plan => (
              <li key={plan.id} className="flex items-start justify-between bg-slate-800 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs rounded px-1.5 py-0.5 shrink-0 ${plan.workout_type === '筋トレ' ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}`}>
                      {plan.workout_type}
                    </span>
                    <span className="text-sm text-slate-200 truncate">{plan.menu_name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {plan.workout_type === '筋トレ' && (plan.target_sets || plan.target_reps || plan.target_weight_kg) && (
                      <>
                        {plan.target_sets ? `${plan.target_sets}セット` : ''}
                        {plan.target_reps ? ` × ${plan.target_reps}回` : ''}
                        {plan.target_weight_kg ? ` @ ${plan.target_weight_kg}kg` : ''}
                      </>
                    )}
                    {plan.workout_type === '有酸素' && (plan.target_duration_min || plan.target_distance_km) && (
                      <>
                        {plan.target_duration_min ? `${plan.target_duration_min}分` : ''}
                        {plan.target_distance_km ? ` ${plan.target_distance_km}km` : ''}
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-slate-500 hover:text-red-400 text-xs ml-2 shrink-0 transition-colors"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* 追加フォーム */}
        {showForm ? (
          <div className="space-y-3 border border-slate-600 rounded-lg p-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">メニュー名</label>
              <input
                type="text"
                value={menuName}
                onChange={e => setMenuName(e.target.value)}
                placeholder="例: ベンチプレス"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">種別</label>
              <div className="flex gap-2">
                {(['筋トレ', '有酸素'] as WorkoutType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setWorkoutType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      workoutType === t
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-slate-600 text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {workoutType === '筋トレ' ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">セット数</label>
                  <input type="number" value={targetSets} onChange={e => setTargetSets(e.target.value)} placeholder="3" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">回数</label>
                  <input type="number" value={targetReps} onChange={e => setTargetReps(e.target.value)} placeholder="10" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">重量 (kg)</label>
                  <input type="number" value={targetWeightKg} onChange={e => setTargetWeightKg(e.target.value)} placeholder="60" className={inputCls} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">時間 (分)</label>
                  <input type="number" value={targetDurationMin} onChange={e => setTargetDurationMin(e.target.value)} placeholder="30" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">距離 (km)</label>
                  <input type="number" value={targetDistanceKm} onChange={e => setTargetDistanceKm(e.target.value)} placeholder="5" className={inputCls} />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAddPlan}
                disabled={!menuName.trim() || planStatus === 'loading'}
                className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {planStatus === 'loading' ? '追加中...' : '追加'}
              </button>
              <button
                onClick={() => { setShowForm(false); setPlanStatus('idle') }}
                className="flex-1 py-2 border border-slate-600 text-slate-400 hover:border-slate-400 rounded-lg text-sm transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-2 border border-dashed border-slate-600 text-slate-400 hover:border-green-600 hover:text-green-400 rounded-lg text-sm transition-colors"
          >
            + メニュー追加
          </button>
        )}
      </div>
    </div>
  )
}
