'use client'

import { use, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDayData, useProfile } from '@/src/hooks/useHealth'
import DateNav from '@/src/components/daily/DateNav'
import DailyDetail from '@/src/components/daily/DailyDetail'

interface Props {
  params: Promise<{ date: string }>
}

export default function DailyPage({ params }: Props) {
  const { date } = use(params)
  const { data, loading, refetch } = useDayData(date)
  const { profile } = useProfile()
  const router = useRouter()

  const [dragX, setDragX] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const isDragging = useRef(false)

  const today = new Date().toISOString().split('T')[0]

  const moveDate = (days: number) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + days)
    router.push('/daily/' + d.toISOString().split('T')[0])
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isDragging.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    // Y方向が優勢なら無視
    if (!isDragging.current && Math.abs(dy) > Math.abs(dx)) {
      return
    }

    isDragging.current = true

    // 右端（未来方向）は今日より先に行けない制限
    if (dx < 0 && date >= today) return

    setDragX(dx)
  }

  const handleTouchEnd = () => {
    if (!isDragging.current) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }

    setIsAnimating(true)

    if (Math.abs(dragX) > 60) {
      // スライドアウト → 遷移（dragXをリセットしない）
      const targetX = dragX < 0 ? -window.innerWidth : window.innerWidth
      const direction = dragX < 0 ? 1 : -1
      setDragX(targetX)
      setTimeout(() => {
        moveDate(direction)
        // 遷移後にリセット（新ページでは見えない）
        setDragX(0)
        setIsAnimating(false)
      }, 280)
    } else {
      // スプリングバック
      setDragX(0)
      setTimeout(() => setIsAnimating(false), 300)
    }

    touchStartX.current = null
    touchStartY.current = null
    isDragging.current = false
  }

  return (
    <div className="overflow-x-hidden">
      <div
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isAnimating ? 'transform 0.28s ease-out' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <DateNav date={date} />
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">読み込み中...</div>
        ) : (
          <DailyDetail data={data} profile={profile} refetch={refetch} />
        )}
      </div>
    </div>
  )
}
