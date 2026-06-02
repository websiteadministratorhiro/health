'use client'

import { useState } from 'react'
import { saveJsonData } from '@/src/hooks/useHealth'
import type { JsonInputData } from '@/src/lib/types'

const CLAUDE_PROMPT = `以下のJSON形式で今日の健康データを出力してください。
不明な値はフィールドごと省略してOKです。

{
  "date": "YYYY-MM-DD",
  "weight_kg": 体重(kg),
  "body_fat_pct": 体脂肪率(%),
  "sleep_hours": 睡眠時間(h),
  "water_ml": 水分摂取量(ml),
  "steps": 歩数,
  "mood": 気分(1=最悪〜5=最高),
  "condition_notes": "体調メモ",
  "meals": [
    {
      "meal_type": "朝" または "昼" または "晩" または "間食",
      "food_name": "食品名",
      "calories": カロリー(kcal),
      "protein_g": タンパク質(g),
      "fat_g": 脂質(g),
      "carbs_g": 炭水化物(g),
      "memo": "メモ(省略可)"
    }
  ],
  "workouts": [
    {
      "menu_name": "種目名",
      "sets": セット数,
      "reps": 回数,
      "weight_kg": 重量(kg),
      "duration_min": 時間(分),
      "memo": "メモ(省略可)"
    }
  ]
}

今日の食事・運動・体重などを教えてください。`

const PLACEHOLDER = `{
  "date": "2026-06-02",
  "weight_kg": 70.5,
  "sleep_hours": 7.5,
  "steps": 8000,
  "mood": 4,
  "meals": [
    {"meal_type": "朝", "food_name": "ご飯・味噌汁・卵焼き", "calories": 450, "protein_g": 18, "fat_g": 10, "carbs_g": 65},
    {"meal_type": "昼", "food_name": "鶏胸肉定食", "calories": 650, "protein_g": 40, "fat_g": 12, "carbs_g": 75}
  ],
  "workouts": [
    {"menu_name": "ベンチプレス", "sets": 3, "reps": 10, "weight_kg": 60}
  ]
}`

export default function JsonInput() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CLAUDE_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    setStatus('loading')
    setErrorMsg('')
    let parsed: JsonInputData
    try {
      parsed = JSON.parse(text)
    } catch {
      setStatus('error')
      setErrorMsg('JSONのパースに失敗しました。形式を確認してください。')
      return
    }
    const err = await saveJsonData(parsed)
    if (err) {
      setStatus('error')
      setErrorMsg(err)
    } else {
      setStatus('success')
      setText('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#1e293b] rounded-xl p-4">
        <p className="text-sm font-semibold text-slate-200 mb-2">Claudeへの報告プロンプト</p>
        <p className="text-xs text-slate-400 mb-3">コピーしてClaudeに送り、返ってきたJSONを下に貼り付けてください。</p>
        <pre className="text-xs text-slate-300 bg-slate-900 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {CLAUDE_PROMPT}
        </pre>
        <button
          onClick={handleCopy}
          className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-700 text-green-100'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
        >
          {copied ? 'コピーしました！' : 'プロンプトをコピー'}
        </button>
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-2">ClaudeのJSON出力を貼り付けて登録</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={14}
          className="w-full rounded-xl border border-slate-600 p-3 text-xs font-mono bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {status === 'success' && (
        <p className="text-sm text-green-400 font-medium">登録しました！</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || status === 'loading'}
        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? '登録中...' : '一括登録'}
      </button>
    </div>
  )
}
