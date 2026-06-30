'use client'
// app/components/Topbar.tsx
import { RotateCcw, Cpu, Zap } from 'lucide-react'

export function Topbar({ onReset }: { onReset: () => void }) {
  return (
    <header className="h-14 bg-bg-surface border-b border-white/[0.07] flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        <span className="text-[14px] font-semibold tracking-tight">
          TOR&nbsp;<span className="gradient-text">Analyzer</span>
        </span>
        <span className="hidden sm:inline text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-brand/10 border border-brand/30 text-brand">
          AI‑POWERED
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald/10 border border-emerald/25 text-emerald">
          <Cpu size={11} />
          claude-sonnet-4-6
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-bg-raised border border-white/[0.07] text-gray-400 hover:text-gray-200 hover:bg-bg-overlay transition-all"
        >
          <RotateCcw size={12} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  )
}
