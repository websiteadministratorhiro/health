'use client'

import { useState } from 'react'
import { useTrendData, useProfile } from '@/src/hooks/useHealth'
import TrendCharts from '@/src/components/trend/TrendCharts'

const PERIODS = [
  { label: '1週', days: 7 },
  { label: '2週', days: 14 },
  { label: '1ヶ月', days: 30 },
  { label: '3ヶ月', days: 90 },
]

export default function TrendPage() {
  const [days, setDays] = useState(30)
  const { records, meals, loading } = useTrendData(days)
  const { profile } = useProfile()

  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-slate-100 mb-3">トレンド</h1>
        <div className="flex bg-slate-800 rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === p.days
                  ? 'bg-slate-600 text-green-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">読み込み中...</div>
      ) : records.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">データがありません</div>
      ) : (
        <TrendCharts
          records={records}
          meals={meals}
          goalWeight={profile?.target_weight_kg}
          heightCm={profile?.height_cm}
        />
      )}
    </div>
  )
}
