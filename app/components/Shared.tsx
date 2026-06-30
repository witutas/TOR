'use client'
// app/components/Shared.tsx
import clsx from 'clsx'

/* ─── Section Header ─────────────────────────────────── */
export function SectionHeader({
  dot, title, badge,
}: { dot: string; title: string; badge?: string | number }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      {badge !== undefined && (
        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-500">
          {badge}
        </span>
      )}
    </div>
  )
}

/* ─── Metric Card ─────────────────────────────────────── */
export function MetricCard({
  value, label, accent, icon,
}: { value: number | string; label: string; accent: string; icon?: string }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}
    >
      {icon && <div className="text-base mb-0.5">{icon}</div>}
      <div className="text-2xl font-bold tracking-tight" style={{ color: accent }}>
        {value ?? '—'}
      </div>
      <div className="text-[9px] uppercase tracking-widest mt-1 font-medium" style={{ color: accent, opacity: 0.65 }}>
        {label}
      </div>
    </div>
  )
}

/* ─── Tag ─────────────────────────────────────────────── */
type TagVariant = 'purple' | 'sky' | 'emerald' | 'amber' | 'rose' | 'red' | 'gray'

const TAG_STYLES: Record<TagVariant, string> = {
  purple:  'bg-brand/10   text-purple-300  border border-brand/25',
  sky:     'bg-sky/10     text-sky-300     border border-sky/25',
  emerald: 'bg-emerald/10 text-green-300   border border-emerald/25',
  amber:   'bg-amber/10   text-amber-300   border border-amber/25',
  rose:    'bg-rose/10    text-pink-300    border border-rose/25',
  red:     'bg-red-500/10 text-red-300     border border-red-500/25',
  gray:    'bg-white/[0.06] text-gray-400  border border-white/[0.08]',
}

export function Tag({
  children, variant = 'gray',
}: { children: React.ReactNode; variant?: TagVariant }) {
  return (
    <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded font-mono', TAG_STYLES[variant])}>
      {children}
    </span>
  )
}

/* ─── Divider ─────────────────────────────────────────── */
export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="h-px bg-white/[0.06] my-6" />
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/[0.06]" />
      <span className="text-[11px] text-gray-600">{label}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  )
}

/* ─── Panel ───────────────────────────────────────────── */
export function Panel({
  children, className, accentTop,
}: { children: React.ReactNode; className?: string; accentTop?: string }) {
  return (
    <div
      className={clsx('bg-bg-surface border border-white/[0.07] rounded-xl overflow-hidden', className)}
      style={accentTop ? { borderTop: `2px solid ${accentTop}` } : undefined}
    >
      {children}
    </div>
  )
}

/* ─── InfoRow ─────────────────────────────────────────── */
export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.05] last:border-0">
      <span className="text-[11px] text-gray-500 flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-[12px] text-gray-200 font-medium text-right leading-relaxed">{value}</span>
    </div>
  )
}
