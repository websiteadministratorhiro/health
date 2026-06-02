'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar
} from 'recharts'
import type { HlDailyRecord, HlMeal } from '@/src/lib/types'
import { calcTotalCalories, calcTotalPFC } from '@/src/lib/calculations'

interface Props {
  records: HlDailyRecord[]
  meals: HlMeal[]
  goalWeight?: number | null
  heightCm?: number | null
}

export default function TrendCharts({ records, meals, goalWeight, heightCm }: Props) {
  const weightData = records.map(r => {
    const h = heightCm ? heightCm / 100 : 1.70
    return {
      date: r.date.slice(5),
      体重: r.weight_kg,
      BMI: r.weight_kg ? Math.round((r.weight_kg / (h * h)) * 10) / 10 : null,
    }
  })

  const mealsByDate = meals.reduce<Record<string, HlMeal[]>>((acc, m) => {
    acc[m.date] = acc[m.date] ? [...acc[m.date], m] : [m]
    return acc
  }, {})

  const calorieData = records.map(r => {
    const dayMeals = mealsByDate[r.date] ?? []
    const pfc = calcTotalPFC(dayMeals)
    return {
      date: r.date.slice(5),
      摂取: calcTotalCalories(dayMeals),
      タンパク質: Math.round(pfc.protein_g),
      脂質: Math.round(pfc.fat_g),
      炭水化物: Math.round(pfc.carbs_g),
    }
  })

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: 12,
  }

  return (
    <div className="space-y-4 p-4">
      <div className="bg-[#1e293b] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">体重推移 (kg)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="体重" stroke="#22c55e" strokeWidth={2} dot={false} connectNulls />
            {goalWeight && (
              <ReferenceLine
                y={goalWeight}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: `目標 ${goalWeight}kg`, fontSize: 10, fill: '#ef4444' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1e293b] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">BMI推移</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <ReferenceLine y={18.5} stroke="#64748b" strokeDasharray="3 3" />
            <ReferenceLine y={25} stroke="#f97316" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="BMI" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1e293b] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">摂取カロリー推移</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={calorieData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="摂取" fill="#22c55e" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1e293b] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">PFCバランス推移 (g)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={calorieData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar dataKey="タンパク質" stackId="a" fill="#60a5fa" />
            <Bar dataKey="脂質" stackId="a" fill="#fbbf24" />
            <Bar dataKey="炭水化物" stackId="a" fill="#fb923c" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
