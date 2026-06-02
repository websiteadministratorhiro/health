'use client'

import { useRouter } from 'next/navigation'

interface Props {
  date: string
}

export default function DateNav({ date }: Props) {
  const router = useRouter()

  const move = (days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    router.push('/daily/' + d.toISOString().split('T')[0])
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-slate-700">
      <button
        onClick={() => move(-1)}
        className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors"
      >
        ←
      </button>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-100">{date}</p>
        {isToday && <p className="text-xs text-green-400">今日</p>}
      </div>
      <button
        onClick={() => move(1)}
        disabled={isToday}
        className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors disabled:opacity-30"
      >
        →
      </button>
    </div>
  )
}
