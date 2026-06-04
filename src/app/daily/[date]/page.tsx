'use client'

import { use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDayData } from '@/src/hooks/useHealth'
import DateNav from '@/src/components/daily/DateNav'
import DailyDetail from '@/src/components/daily/DailyDetail'

interface Props {
  params: Promise<{ date: string }>
}

export default function DailyPage({ params }: Props) {
  const { date } = use(params)
  const { data, loading, refetch } = useDayData(date)
  const router = useRouter()

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const moveDate = (days: number) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + days)
    router.push('/daily/' + d.toISOString().split('T')[0])
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // X方向の移動がY方向より大きい場合のみ発火
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= 60) {
      if (dx < 0) {
        // 左スワイプ → 翌日
        const today = new Date().toISOString().split('T')[0]
        if (date < today) moveDate(1)
      } else {
        // 右スワイプ → 前日
        moveDate(-1)
      }
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <DateNav date={date} />
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">読み込み中...</div>
      ) : (
        <DailyDetail data={data} refetch={refetch} />
      )}
    </div>
  )
}
