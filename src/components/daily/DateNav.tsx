'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

interface Props {
  date: string
}

export default function DateNav({ date }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const move = (days: number) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + days)
    router.push('/daily/' + d.toISOString().split('T')[0])
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today

  const weekday = WEEKDAYS[new Date(date + 'T00:00:00').getDay()]

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      router.push('/daily/' + e.target.value)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-slate-700">
      <button
        onClick={() => move(-1)}
        className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors"
      >
        ←
      </button>

      <div className="text-center relative">
        <button
          onClick={() => inputRef.current?.showPicker()}
          className="focus:outline-none"
        >
          <p className="text-sm font-semibold text-slate-100">
            {date} ({weekday})
          </p>
          {isToday && <p className="text-xs text-green-400">今日</p>}
        </button>
        <input
          ref={inputRef}
          type="date"
          value={date}
          max={today}
          onChange={handleDateChange}
          className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
          tabIndex={-1}
        />
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
