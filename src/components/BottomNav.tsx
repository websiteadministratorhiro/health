'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'ホーム', icon: '🏠' },
  { href: '/daily/' + new Date().toISOString().split('T')[0], label: '日次', icon: '📅' },
  { href: '/input', label: '入力', icon: '✏️' },
  { href: '/trend', label: 'トレンド', icon: '📈' },
  { href: '/profile', label: 'プロフィール', icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-slate-700 z-50">
      <div className="max-w-md mx-auto flex">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href.startsWith('/daily') ? '/daily' : item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 ${
                isActive ? 'text-green-400' : 'text-slate-400'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
