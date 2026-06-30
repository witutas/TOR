'use client'
// app/components/Sidebar.tsx
import {
  Upload, LayoutDashboard, Server,
  Plug, CalendarDays, Braces, BookOpen, FileText,
} from 'lucide-react'
import clsx from 'clsx'
import type { NavPage } from '../lib/types'

interface SidebarProps {
  page: NavPage
  onNavigate: (p: NavPage) => void
  counts: { systems?: number; apis?: number; sprints?: number }
  hasResult: boolean
}

const NAV: { id: NavPage; label: string; Icon: React.ElementType; locked?: boolean }[] = [
  { id: 'upload',    label: 'Upload TOR',      Icon: Upload },
  { id: 'overview',  label: 'Project Overview', Icon: LayoutDashboard, locked: true },
  { id: 'systems',   label: 'Systems & Modules',Icon: Server,          locked: true },
  { id: 'apis',      label: 'External APIs',    Icon: Plug,            locked: true },
  { id: 'sprints',   label: 'Sprint Backlog',   Icon: CalendarDays,    locked: true },
  { id: 'quotation', label: 'ใบเสนอราคา PDF',  Icon: FileText,        locked: true },
  { id: 'json',      label: 'Raw JSON',         Icon: Braces,          locked: true },
]

const COUNT_KEY: Partial<Record<NavPage, keyof SidebarProps['counts']>> = {
  systems: 'systems',
  apis:    'apis',
  sprints: 'sprints',
}

export function Sidebar({ page, onNavigate, counts, hasResult }: SidebarProps) {
  return (
    <aside className="w-[220px] xl:w-[240px] flex-shrink-0 bg-bg-surface border-r border-white/[0.07] sticky top-14 h-[calc(100vh-3.5rem)] flex flex-col py-4 overflow-y-auto">
      <div className="px-3 flex flex-col flex-1">
        <p className="text-[9px] font-extrabold tracking-[1.5px] text-gray-700 uppercase px-2 pb-3">
          Navigation
        </p>

        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ id, label, Icon, locked }) => {
            const disabled = locked && !hasResult
            const active   = page === id
            const ck       = COUNT_KEY[id]
            const count    = ck ? counts[ck] : undefined
            const isQuot   = id === 'quotation'

            return (
              <button
                key={id}
                disabled={disabled}
                onClick={() => !disabled && onNavigate(id)}
                className={clsx(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all w-full text-left',
                  active
                    ? isQuot
                      ? 'bg-amber/[0.14] border border-amber/30 text-amber'
                      : 'bg-brand/[0.14] border border-brand/30 text-brand'
                    : disabled
                    ? 'text-gray-700 cursor-not-allowed border border-transparent'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-bg-raised border border-transparent',
                )}
              >
                <Icon size={14} className="flex-shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {count !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-overlay text-gray-600">
                    {count}
                  </span>
                )}
                {isQuot && !disabled && (
                  <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-amber/20 text-amber">PDF</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/[0.06]">
          <div className="px-2.5 py-2 mb-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="text-[9px] font-bold text-emerald uppercase tracking-wider">Typhoon AI</span>
            </div>
            <p className="text-[9px] text-gray-700">ภาษาไทย · ฟรี 100%</p>
          </div>
          <a
            href="https://docs.opentyphoon.ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-gray-600 hover:text-gray-300 hover:bg-bg-raised transition-all"
          >
            <BookOpen size={14} />
            Typhoon Docs
          </a>
        </div>
      </div>
    </aside>
  )
}
