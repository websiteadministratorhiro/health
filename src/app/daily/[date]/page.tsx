'use client'

import { use } from 'react'
import { useDayData } from '@/src/hooks/useHealth'
import DateNav from '@/src/components/daily/DateNav'
import DailyDetail from '@/src/components/daily/DailyDetail'

interface Props {
  params: Promise<{ date: string }>
}

export default function DailyPage({ params }: Props) {
  const { date } = use(params)
  const { data, loading } = useDayData(date)

  return (
    <div>
      <DateNav date={date} />
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">読み込み中...</div>
      ) : (
        <DailyDetail data={data} />
      )}
    </div>
  )
}
