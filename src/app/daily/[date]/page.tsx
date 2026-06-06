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

  // ① dragXはrefで管理（クロージャ問題を回避）、描画用のみstate
  const dragXRef = useRef(0)
  const navigating = useRef(false)
  const [displayDragX, setDisplayDragX] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const isDragging = useRef(false)

  const today = new Date().toISOString().split('T')[0]

  const moveDate = (direction: number) => {
    if (navigating.current) return
    navigating.current = true
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + direction)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    router.push(`/daily/${y}-${m}-${day}`)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isDragging.current = false
    dragXRef.current = 0
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

    dragXRef.current = dx
    setDisplayDragX(dx)
  }

  const handleTouchEnd = () => {
    if (!isDragging.current) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }

    const dx = dragXRef.current

    if (Math.abs(dx) > 60 && !navigating.current) {
      setIsAnimating(true)
      const direction = dx < 0 ? 1 : -1
      setDisplayDragX(dx < 0 ? -window.innerWidth : window.innerWidth)
      setTimeout(() => {
        moveDate(direction)
      }, 250)
    } else {
      setIsAnimating(true)
      setDisplayDragX(0)
      setTimeout(() => setIsAnimating(false), 300)
    }

    dragXRef.current = 0
    touchStartX.current = null
    touchStartY.current = null
    isDragging.current = false
  }

  return (
    <div className="overflow-x-hidden">
      <div
        style={{
          transform: `translateX(${displayDragX}px)`,
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
          <DailyDetail data={data} profile={profile} refetch={refetch} date={date} />
        )}
      </div>
    </div>
  )
}
