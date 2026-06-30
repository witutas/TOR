'use client'
// app/components/PageApis.tsx
import { Lock, ArrowLeftRight } from 'lucide-react'
import { SectionHeader, Tag } from './Shared'
import type { TorExternalApi } from '../lib/types'

const TYPE_VARIANT: Record<string, string> = {
  REST: 'sky', SOAP: 'amber', GraphQL: 'purple', WebSocket: 'emerald', SDK: 'rose', Other: 'gray',
}

export function PageApis({ apis }: { apis: TorExternalApi[] }) {
  return (
    <div className="animate-slide-up">
      <SectionHeader dot="bg-emerald" title="External APIs & Integrations" badge={apis.length} />

      <div className="bg-bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-raised border-b border-white/[0.07]">
              {['API / Integration','วัตถุประสงค์','Module','Type','Security','SLA'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apis.map((api, i) => (
              <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors">
                <td className="px-4 py-4">
                  <p className="text-[13px] font-semibold text-gray-200">{api.api_name}</p>
                  {api.data_flow && (
                    <p className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-1">
                      <ArrowLeftRight size={9} />{api.data_flow}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4 text-[11px] text-gray-400 max-w-[200px] leading-relaxed">{api.purpose}</td>
                <td className="px-4 py-4">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber/10 text-amber border border-amber/25">
                    {api.associated_module_code}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Tag variant={(TYPE_VARIANT[api.integration_type] ?? 'gray') as 'sky'|'amber'|'purple'|'emerald'|'rose'|'gray'}>
                    {api.integration_type || 'REST'}
                  </Tag>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald/10 text-emerald border border-emerald/25 whitespace-nowrap">
                    <Lock size={10} />{api.security_protocol}
                  </span>
                </td>
                <td className="px-4 py-4 text-[11px] text-gray-500">{api.sla_requirement || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
