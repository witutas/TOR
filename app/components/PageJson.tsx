'use client'
// app/components/PageJson.tsx
import { useState } from 'react'
import { Copy, Check, Download } from 'lucide-react'
import { SectionHeader } from './Shared'
import type { TorAnalysisResult } from '../lib/types'

export function PageJson({ data }: { data: TorAnalysisResult }) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(data, null, 2)

  function copy() {
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function download() {
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'tor-analysis.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader dot="bg-gray-700" title="Raw JSON Output" />
        <div className="flex gap-2 -mt-6">
          <button
            onClick={download}
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-bg-raised border border-white/[0.08] text-gray-400 hover:text-gray-200 transition-all"
          >
            <Download size={12} />
            ดาวน์โหลด
          </button>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-bg-raised border border-white/[0.08] text-gray-400 hover:text-gray-200 transition-all"
          >
            {copied ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
            {copied ? 'คัดลอกแล้ว!' : 'คัดลอก JSON'}
          </button>
        </div>
      </div>

      <div className="bg-bg-surface border border-white/[0.07] rounded-xl overflow-auto max-h-[68vh]">
        <pre className="p-5 text-[11px] font-mono leading-relaxed">
          <JsonHighlight json={json} />
        </pre>
      </div>
    </div>
  )
}

function JsonHighlight({ json }: { json: string }) {
  const lines = json.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        const colored = line
          .replace(/("[\w_]+")\s*:/g, '<span style="color:#6c63ff">$1</span>:')
          .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#43e97b">$1</span>')
          .replace(/:\s*(\d+(?:\.\d+)?)/g, ': <span style="color:#f9a825">$1</span>')
          .replace(/:\s*(true|false|null)/g, ': <span style="color:#4fc3f7">$1</span>')
        return (
          <div key={i} className="flex">
            <span className="select-none text-gray-700 w-9 text-right mr-5 flex-shrink-0 text-[10px] pt-px">
              {i + 1}
            </span>
            <span dangerouslySetInnerHTML={{ __html: colored }} />
          </div>
        )
      })}
    </>
  )
}
