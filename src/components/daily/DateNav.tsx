'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useDatesWithData } from '@/src/hooks/useHealth'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

interface Props {
  date: string
}

export default function DateNav({ date }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today
  const weekday = WEEKDAYS[new Date(date + 'T00:00:00').getDay()]

  const [modalOpen, setModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [calMonth, setCalMonth] = useState<string>(() => date.slice(0, 7))
  const { dates: datesWithData } = useDatesWithData()

  useEffect(() => { setMounted(true) }, [])

  const move = (days: number) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + days)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    router.push(`/daily/${y}-${m}-${day}`)
  }

  const openModal = () => {
    setCalMonth(date.slice(0, 7))
    setModalOpen(true)
  }

  const todayMonth = today.slice(0, 7)
  const minMonth = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })()

  const moveMonth = (delta: number) => {
    const [y, m] = calMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (next >= minMonth && next <= todayMonth) setCalMonth(next)
  }

  const calMonthLabel = (() => {
    const [y, m] = calMonth.split('-').map(Number)
    return `${y}年${m}月`
  })()

  const calDays = (() => {
    const [y, m] = calMonth.split('-').map(Number)
    const firstDay = new Date(y, m - 1, 1).getDay()
    const lastDate = new Date(y, m, 0).getDate()
    const cells: (string | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= lastDate; d++) {
      cells.push(`${calMonth}-${String(d).padStart(2, '0')}`)
    }
    while (cells.length < 42) cells.push(null)
    return cells
  })()

  const handleDayClick = (d: string) => {
    if (d > today) return
    setModalOpen(false)
    router.push('/daily/' + d)
  }

  const modal = modalOpen && mounted ? createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
      onClick={() => setModalOpen(false)}
    >
      <div
        className="bg-[#1e293b] rounded-2xl p-4 shadow-xl"
        style={{ width: '320px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => moveMonth(-1)}
            disabled={calMonth <= minMonth}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-100 disabled:opacity-30 rounded-lg hover:bg-slate-700"
          >←</button>
          <span className="text-sm font-semibold text-slate-100">{calMonthLabel}</span>
          <button
            onClick={() => moveMonth(1)}
            disabled={calMonth >= todayMonth}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-100 disabled:opacity-30 rounded-lg hover:bg-slate-700"
          >→</button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {['日','月','火','水','木','金','土'].map((w) => (
            <div key={w} className="text-center text-xs text-slate-500 py-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calDays.map((d, i) => {
            if (!d) return <div key={`e-${i}`} className="h-10" />
            const isFuture = d > today
            const isSelected = d === date
            const isCurrentDay = d === today
            const hasData = datesWithData.has(d)
            return (
              <button
                key={d}
                onClick={() => handleDayClick(d)}
                disabled={isFuture}
                className={[
                  'relative flex flex-col items-center justify-center h-10 w-10 mx-auto rounded-full text-sm transition-colors',
                  isSelected ? 'bg-green-500 text-white font-bold'
                    : isCurrentDay ? 'border-2 border-green-400 text-green-400 font-bold'
                    : isFuture ? 'text-slate-700 cursor-not-allowed'
                    : 'text-slate-300 hover:bg-slate-700',
                ].join(' ')}
              >
                {parseInt(d.slice(-2), 10)}
                {hasData && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-green-400 leading-none" style={{ fontSize: '7px' }}>●</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-slate-700">
        <button onClick={() => move(-1)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors">←</button>
        <div className="text-center">
          <button onClick={openModal} className="focus:outline-none">
            <p className="text-sm font-semibold text-slate-100">{date} ({weekday})</p>
            {isToday && <p className="text-xs text-green-400">今日</p>}
          </button>
        </div>
        <button onClick={() => move(1)} disabled={isToday} className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors disabled:opacity-30">→</button>
      </div>
      {modal}
    </>
  )
}
