'use client'

import { useState } from 'react'
import JsonInput from '@/src/components/input/JsonInput'
import ManualForm from '@/src/components/input/ManualForm'

export default function InputPage() {
  const [tab, setTab] = useState<'json' | 'manual'>('json')

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-gray-800 mb-4">データ入力</h1>
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        <button
          onClick={() => setTab('json')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'json' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
        >
          JSON入力
        </button>
        <button
          onClick={() => setTab('manual')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'manual' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
        >
          手入力
        </button>
      </div>
      {tab === 'json' ? <JsonInput /> : <ManualForm />}
    </div>
  )
}
