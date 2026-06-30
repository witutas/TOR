'use client'
// app/components/PageSprints.tsx - ตาราง Sprint พร้อม Export
import { useState } from 'react'
import { CheckCircle, AlertCircle, Clock, Calendar, Download, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { SectionHeader, Tag } from './Shared'
import type { TorSprint } from '../lib/types'

const PALETTE = [
  { ring: '#6c63ff', bg: 'rgba(108,99,255,0.12)', text: '#a09bff', light: 'rgba(108,99,255,0.06)' },
  { ring: '#4fc3f7', bg: 'rgba(79,195,247,0.12)',  text: '#7dd3f7', light: 'rgba(79,195,247,0.06)' },
  { ring: '#43e97b', bg: 'rgba(67,233,123,0.12)',  text: '#6ee8a0', light: 'rgba(67,233,123,0.06)' },
  { ring: '#f9a825', bg: 'rgba(249,168,37,0.12)',  text: '#f9c55a', light: 'rgba(249,168,37,0.06)' },
  { ring: '#f06292', bg: 'rgba(240,98,146,0.12)',  text: '#f48ab0', light: 'rgba(240,98,146,0.06)' },
]
const DAY_NAMES = ['จ.','อ.','พ.','พฤ.','ศ.']

function exportSprintsExcel(sprints: TorSprint[]) {
  const rows: string[][] = [
    ['Sprint','Focus','สัปดาห์','Modules','วันที่','วัน','งาน','Deliverable','ผู้รับผิดชอบ','Goals','Definition of Done','Risks'],
  ]
  sprints.forEach(sp => {
    const daily = sp.daily_schedule ?? []
    if (daily.length === 0) {
      rows.push([String(sp.sprint_number), sp.focus, `${sp.start_week}-${sp.end_week}`,
        sp.associated_module_codes.join(', '), '', '', '', '', '',
        sp.goals.join(' | '), (sp.definition_of_done || []).join(' | '), (sp.risks || []).join(' | ')])
    } else {
      daily.forEach((d, di) => {
        rows.push([
          di === 0 ? String(sp.sprint_number) : '',
          di === 0 ? sp.focus : '',
          di === 0 ? `${sp.start_week}-${sp.end_week}` : '',
          di === 0 ? sp.associated_module_codes.join(', ') : '',
          d.date_offset,
          String(d.day),
          d.tasks.join(' | '),
          (d.deliverables || []).join(' | '),
          d.assignee_role,
          di === 0 ? sp.goals.join(' | ') : '',
          di === 0 ? (sp.definition_of_done || []).join(' | ') : '',
          di === 0 ? (sp.risks || []).join(' | ') : '',
        ])
      })
    }
  })

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8"><style>
th{background:#f9a825;color:#000;font-weight:bold;padding:8px;border:1px solid #ccc;white-space:nowrap}
td{padding:6px 8px;border:1px solid #ddd;vertical-align:top;font-size:12px}
tr:nth-child(even) td{background:#fffdf0}
</style></head><body>
<table>
${rows.map((row, i) => `<tr>${row.map(cell => i === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`).join('')}</tr>`).join('\n')}
</table></body></html>`

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'sprint-backlog.xls'; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function PageSprints({ sprints }: { sprints: TorSprint[] }) {
  const [view, setView] = useState<'table'|'card'>('table')
  const totalWeeks = sprints.reduce((a, s) => a + s.duration_weeks, 0)
  const totalTasks = sprints.reduce((a, s) => a + (s.daily_schedule?.reduce((b, d) => b + d.tasks.length, 0) ?? 0), 0)

  return (
    <div className="animate-slide-up space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeader dot="bg-amber" title="Sprint Backlog" badge={`${sprints.length} sprints · ${totalWeeks} สัปดาห์ · ${totalTasks} tasks`} />
        <div className="flex items-center gap-2">
          <button onClick={() => exportSprintsExcel(sprints)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/10 border border-emerald/30 text-emerald text-[11px] font-semibold hover:bg-emerald/20 transition-all">
            <Download size={13} /> Export Excel
          </button>
          <div className="flex rounded-lg overflow-hidden border border-white/[0.1]">
            {(['table','card'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={clsx('px-3 py-1.5 text-[11px] font-semibold transition-all',
                  view === v ? 'bg-amber text-black' : 'text-gray-500 hover:text-gray-300')}>
                {v === 'table' ? '⊞ ตาราง' : '⊟ Card'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'table' ? (
        <SprintTable sprints={sprints} />
      ) : (
        <div className="flex flex-col gap-3">
          {sprints.map(sp => {
            const c = PALETTE[(sp.sprint_number - 1) % PALETTE.length]
            return <SprintCard key={sp.sprint_number} sp={sp} color={c} />
          })}
        </div>
      )}
    </div>
  )
}

function SprintTable({ sprints }: { sprints: TorSprint[] }) {
  const [expandedSprint, setExpandedSprint] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {/* Summary table */}
      <div className="bg-bg-surface border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-raised border-b border-white/[0.07]">
                {['Sprint','Focus','สัปดาห์','Modules','Tasks','Goals','Done Criteria','Risks',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sprints.map(sp => {
                const c = PALETTE[(sp.sprint_number - 1) % PALETTE.length]
                const taskCount = (sp.daily_schedule ?? []).reduce((a, d) => a + d.tasks.length, 0)
                const isExpanded = expandedSprint === sp.sprint_number
                return (
                  <>
                    <tr key={sp.sprint_number}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
                      onClick={() => setExpandedSprint(isExpanded ? null : sp.sprint_number)}>
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2"
                          style={{ borderColor: c.ring, background: c.bg, color: c.text }}>
                          {sp.sprint_number}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-medium text-gray-200 max-w-[200px]">{sp.focus}</td>
                      <td className="px-4 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                        W{sp.start_week}–W{sp.end_week} <span className="text-gray-600">({sp.duration_weeks} wk)</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {sp.associated_module_codes.slice(0, 3).map(c => (
                            <Tag key={c} variant="gray">{c}</Tag>
                          ))}
                          {sp.associated_module_codes.length > 3 && <Tag variant="gray">+{sp.associated_module_codes.length - 3}</Tag>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-bold text-amber">{taskCount}</td>
                      <td className="px-4 py-3 text-[11px] text-gray-500 max-w-[180px]">
                        {(sp.goals ?? []).slice(0, 2).map((g, i) => (
                          <p key={i} className="truncate">• {g}</p>
                        ))}
                        {(sp.goals ?? []).length > 2 && <p className="text-gray-700">+{sp.goals.length - 2} more</p>}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500 max-w-[150px]">
                        {(sp.definition_of_done ?? []).slice(0, 1).map((d, i) => (
                          <p key={i} className="truncate flex items-center gap-1">
                            <CheckCircle size={9} className="text-emerald flex-shrink-0" />{d}
                          </p>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500">
                        {(sp.risks ?? []).slice(0, 1).map((r, i) => (
                          <p key={i} className="truncate flex items-center gap-1">
                            <AlertCircle size={9} className="text-rose flex-shrink-0" />{r}
                          </p>
                        ))}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronDown size={13} className={clsx('text-gray-600 transition-transform', isExpanded && 'rotate-180')} />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${sp.sprint_number}-detail`} className="border-b border-white/[0.04] bg-bg-raised">
                        <td colSpan={9} className="px-4 py-4">
                          <DailyTable sp={sp} color={c} />
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DailyTable({ sp, color }: { sp: TorSprint; color: typeof PALETTE[0] }) {
  const daily = sp.daily_schedule ?? []
  if (daily.length === 0) return <p className="text-[12px] text-gray-600">ไม่มีข้อมูลรายวัน</p>

  return (
    <div>
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-3">
        📅 ตารางงานรายวัน — Sprint {sp.sprint_number}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr style={{ background: color.bg }}>
              {['วัน','งานที่ต้องทำ','Deliverable','ผู้รับผิดชอบ'].map(h => (
                <th key={h} className="text-left px-3 py-2 font-bold text-[10px] uppercase tracking-wider"
                  style={{ color: color.text }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daily.map((d, i) => {
              const dayIdx = (d.day - 1) % 5
              return (
                <tr key={d.day} className={clsx('border-b border-white/[0.04]', i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: color.bg, color: color.text, border: `1px solid ${color.ring}40` }}>
                        {DAY_NAMES[dayIdx] ?? `D${d.day}`}
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-300">วันที่ {d.day}</p>
                        <p className="text-[9px] text-gray-600">{d.date_offset}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <ul className="space-y-0.5">
                      {d.tasks.map((task, j) => (
                        <li key={j} className="text-[11px] text-gray-300 flex gap-1.5">
                          <span className="text-gray-700 flex-shrink-0">▸</span>{task}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-2.5">
                    {(d.deliverables || []).map((del, j) => (
                      <p key={j} className="text-[11px] text-emerald flex items-center gap-1">
                        <CheckCircle size={9} />{del}
                      </p>
                    ))}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-gray-400 whitespace-nowrap">
                    👤 {d.assignee_role}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SprintCard({ sp, color }: { sp: TorSprint; color: typeof PALETTE[0] }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'daily'|'goals'|'dod'|'risks'>('daily')

  const byWeek: Record<number, typeof sp.daily_schedule> = {}
  ;(sp.daily_schedule ?? []).forEach(d => {
    const week = Math.ceil(d.day / 5)
    if (!byWeek[week]) byWeek[week] = []
    byWeek[week].push(d)
  })
  const weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b)

  return (
    <div className="bg-bg-surface border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/[0.12] transition-colors">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-4 px-5 py-4 w-full text-left">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0 border-2"
          style={{ borderColor: color.ring, background: color.bg, color: color.text }}>
          {sp.sprint_number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold mb-1">{sp.focus}</p>
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <span className="flex items-center gap-1"><Clock size={10} />{sp.duration_weeks} สัปดาห์</span>
            {sp.start_week && sp.end_week && (
              <span className="flex items-center gap-1"><Calendar size={10} />W{sp.start_week}–W{sp.end_week}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 max-w-[180px] justify-end">
          {sp.associated_module_codes.slice(0, 3).map(c => <Tag key={c} variant="gray">{c}</Tag>)}
          {sp.associated_module_codes.length > 3 && <Tag variant="gray">+{sp.associated_module_codes.length - 3}</Tag>}
        </div>
        <ChevronDown size={14} className={clsx('text-gray-600 transition-transform ml-2', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="border-t border-white/[0.06]">
          <div className="flex gap-1 px-5 pt-3">
            {(['daily','goals','dod','risks'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx('text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all',
                  tab === t ? 'bg-amber/20 text-amber' : 'text-gray-600 hover:text-gray-400')}>
                {t === 'daily' ? '📅 รายวัน' : t === 'goals' ? '🎯 Goals' : t === 'dod' ? '✅ DoD' : '⚠️ Risks'}
              </button>
            ))}
          </div>
          <div className="p-5 pt-3">
            {tab === 'daily' && <DailyTable sp={sp} color={color} />}
            {tab === 'goals' && (
              <ul className="space-y-2">
                {(sp.goals ?? []).map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-gray-300">
                    <span style={{ color: color.ring }} className="font-bold flex-shrink-0">→</span>{g}
                  </li>
                ))}
              </ul>
            )}
            {tab === 'dod' && (
              <ul className="space-y-2">
                {(sp.definition_of_done ?? []).map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-gray-300">
                    <CheckCircle size={13} className="text-emerald flex-shrink-0 mt-0.5" />{d}
                  </li>
                ))}
              </ul>
            )}
            {tab === 'risks' && (
              <ul className="space-y-2">
                {(sp.risks ?? []).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-gray-300">
                    <AlertCircle size={13} className="text-rose flex-shrink-0 mt-0.5" />{r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
