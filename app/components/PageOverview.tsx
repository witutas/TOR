'use client'
// app/components/PageOverview.tsx
import { SectionHeader, MetricCard, InfoRow, Panel, Tag } from './Shared'
import type { TorAnalysisResult } from '../lib/types'
import { AlertTriangle, Users, Target, Layers } from 'lucide-react'

const ACCENTS = ['#6c63ff','#4fc3f7','#43e97b','#f9a825','#f06292','#ef5350','#ab47bc','#26c6da']

const METRIC_DEFS = [
  { key: 'total_systems',      label: 'Systems',     icon: '🏗️' },
  { key: 'total_modules',      label: 'Modules',     icon: '📦' },
  { key: 'total_external_apis',label: 'APIs',        icon: '🔌' },
  { key: 'total_phases',       label: 'Phases',      icon: '🎯' },
  { key: 'total_sprints',      label: 'Sprints',     icon: '🏃' },
  { key: 'total_tasks',        label: 'Tasks',       icon: '✅' },
  { key: 'total_mandays',      label: 'Man-days',    icon: '👤' },
] as const

const RISK_IMPACT_COLOR: Record<string, string> = {
  High: 'red', Medium: 'amber', Low: 'emerald',
}

export function PageOverview({ data }: { data: TorAnalysisResult }) {
  const { project_overview: o, metrics: m, risks = [], phases = [] } = data
  const t  = o.timeline
  const ct = o.compliance_and_targets

  return (
    <div className="animate-slide-up space-y-6">
      <SectionHeader dot="bg-brand" title="Project Overview" />

      {/* Metric Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {METRIC_DEFS.map((def, i) => {
          const val = m[def.key as keyof typeof m]
          return (
            <MetricCard
              key={def.key}
              value={val ?? '—'}
              label={def.label}
              icon={def.icon}
              accent={ACCENTS[i]}
            />
          )
        })}
      </div>

      {/* Budget badge */}
      {m.estimated_budget_thb && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber/[0.08] border border-amber/20">
          <span className="text-amber text-lg">💰</span>
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">ประมาณงบประมาณรวม</p>
            <p className="text-[15px] font-bold text-amber">{m.estimated_budget_thb}</p>
          </div>
        </div>
      )}

      {/* Info Panels row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel className="p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600 mb-4">📋 Project Info</p>
          <InfoRow label="ชื่อโครงการ"  value={<span className="text-[11px]">{o.project_name}</span>} />
          <InfoRow label="Kickoff"       value={t.kickoff_date} />
          <InfoRow label="Go Live"       value={t.go_live_target} />
          <InfoRow label="ระยะเวลา"     value={`${t.duration_months} เดือน`} />
          <InfoRow label="จำนวนงวด"     value={`${t.total_installments} งวด`} />
          {o.budget_thb && <InfoRow label="งบประมาณ" value={<span className="text-amber">{o.budget_thb}</span>} />}
        </Panel>

        <Panel className="p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600 mb-4">🔒 Compliance & Targets</p>
          <InfoRow
            label="Security"
            value={
              <div className="flex flex-wrap gap-1 justify-end">
                {ct.security_requirements.map((s) => (
                  <Tag key={s} variant="red">{s}</Tag>
                ))}
              </div>
            }
          />
          <InfoRow label="Concurrent Users" value={<Tag variant="sky">{ct.concurrent_users_target}</Tag>} />
        </Panel>
      </div>

      {/* Objective + Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {o.objective && (
          <Panel className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target size={13} className="text-brand" />
              <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600">วัตถุประสงค์</p>
            </div>
            <p className="text-[12px] text-gray-300 leading-relaxed">{o.objective}</p>
          </Panel>
        )}
        {o.scope && (
          <Panel className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={13} className="text-sky" />
              <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600">ขอบเขตงาน</p>
            </div>
            <p className="text-[12px] text-gray-300 leading-relaxed">{o.scope}</p>
          </Panel>
        )}
      </div>

      {/* Stakeholders */}
      {o.stakeholders?.length > 0 && (
        <Panel className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={13} className="text-emerald" />
            <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600">ผู้มีส่วนได้เสีย</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {o.stakeholders.map((s) => (
              <Tag key={s} variant="emerald">{s}</Tag>
            ))}
          </div>
        </Panel>
      )}

      {/* Description */}
      <Panel className="p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600 mb-3">📝 รายละเอียดโครงการ</p>
        <p className="text-[13px] text-gray-300 leading-relaxed">{o.description}</p>
      </Panel>

      {/* Phases Timeline */}
      {phases.length > 0 && (
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600 mb-3">📅 แผนงวดงาน</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {phases.map((ph) => (
              <Panel key={ph.phase_number} className="p-4" accentTop={ACCENTS[ph.phase_number % ACCENTS.length]}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] font-semibold text-gray-200">งวดที่ {ph.installment_number}: {ph.phase_name}</p>
                  <Tag variant="amber">{ph.payment_percentage}%</Tag>
                </div>
                <p className="text-[10px] text-gray-600 mb-2">⏱ {ph.duration_weeks} สัปดาห์</p>
                <ul className="space-y-1">
                  {ph.deliverables.map((d, i) => (
                    <li key={i} className="text-[11px] text-gray-400 flex gap-1.5">
                      <span className="text-gray-700 flex-shrink-0">▸</span>{d}
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {/* Risk Matrix */}
      {risks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-rose" />
            <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600">Risk Matrix</p>
          </div>
          <div className="bg-bg-surface border border-white/[0.07] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-raised border-b border-white/[0.07]">
                  {['ID', 'ความเสี่ยง', 'โอกาส', 'ผลกระทบ', 'แนวทางลด'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {risks.map((r) => (
                  <tr key={r.risk_id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-[10px] font-mono text-gray-500">{r.risk_id}</td>
                    <td className="px-4 py-3 text-[11px] text-gray-300 max-w-[200px]">{r.description}</td>
                    <td className="px-4 py-3"><Tag variant={RISK_IMPACT_COLOR[r.probability] as 'red' | 'amber' | 'emerald'}>{r.probability}</Tag></td>
                    <td className="px-4 py-3"><Tag variant={RISK_IMPACT_COLOR[r.impact] as 'red' | 'amber' | 'emerald'}>{r.impact}</Tag></td>
                    <td className="px-4 py-3 text-[11px] text-gray-400 max-w-[220px]">{r.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
