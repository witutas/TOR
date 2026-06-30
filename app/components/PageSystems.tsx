'use client'
// app/components/PageSystems.tsx - ตารางพร้อม Export Excel
import { useState, useCallback } from 'react'
import { ChevronDown, CheckCircle, AlertCircle, Link2, Download, Search, Filter } from 'lucide-react'
import clsx from 'clsx'
import { SectionHeader, Tag } from './Shared'
import type { TorSystem, TorModule } from '../lib/types'

const PRIORITY_VARIANT: Record<string, 'red'|'amber'|'sky'|'gray'> = {
  Critical: 'red', High: 'amber', Medium: 'sky', Low: 'gray',
}
const PRIORITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }
const TYPE_EMOJI: Record<string, string> = {
  Frontend: '🖥️', Backend: '⚙️', Database: '🗄️',
  Infrastructure: '☁️', Integration: '🔌', Mobile: '📱',
}
const PRIORITY_COLOR: Record<string, string> = {
  Critical: '#ef5350', High: '#f9a825', Medium: '#4fc3f7', Low: '#43e97b',
}

// สีพาสเทลแบบ Feature List ต้นฉบับ — สลับสีตาม System
const XLS_SYSTEM_COLORS = [
  { header: '#4472C4', light: '#D9E2F3', mid: '#BDD7EE' }, // ฟ้า
  { header: '#70AD47', light: '#E2EFDA', mid: '#C6E0B4' }, // เขียว
  { header: '#FFC000', light: '#FFF2CC', mid: '#FFE699' }, // เหลือง
  { header: '#C55A11', light: '#FCE4D6', mid: '#F8CBAD' }, // ส้ม
  { header: '#7030A0', light: '#E6DAEF', mid: '#D2B9E0' }, // ม่วง
]
const PRIORITY_BG: Record<string, string> = {
  Critical: '#FFC7CE', High: '#FFEB9C', Medium: '#C6E0B4', Low: '#D9D9D9',
}
const PRIORITY_FG: Record<string, string> = {
  Critical: '#9C0006', High: '#9C6500', Medium: '#375623', Low: '#595959',
}

function exportToExcel(systems: TorSystem[]) {
  // ใช้ dynamic import เพื่อไม่ให้ xlsx ถูกบันเดิลเข้า initial bundle
  import('xlsx').then((XLSX) => {
    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })
    const totalModules = systems.reduce((a, s) => a + s.modules.length, 0)
    const totalDays = systems.reduce((a, s) => a + s.modules.reduce((b, m) => b + (m.estimated_days ?? 0), 0), 0)

    // ── สร้างข้อมูลแบบ Array of Arrays (AOA) เพื่อคุมตำแหน่งแถว/คอลัมน์ได้แม่นยำ ──
    const aoa: (string | number)[][] = []

    aoa.push(['Systems & Modules Breakdown'])
    aoa.push([`วันที่ออกเอกสาร: ${today}`, '', '', `จำนวน Systems: ${systems.length}`, '', '', `รวม Man-days: ${totalDays} MD`])
    aoa.push([]) // แถวว่างคั่น

    aoa.push(['Module Code', 'Module Name', 'TOR Ref', 'Priority', 'Est. Days', 'Implementation Details', 'Acceptance Criteria', 'Risks', 'Dependencies'])

    // เก็บตำแหน่งแถวพิเศษไว้ใส่สีทีหลัง
    const systemHeaderRows: number[] = []
    const moduleRows: { row: number; priority: string }[] = []

    systems.forEach((sys) => {
      const sysDays = sys.modules.reduce((a, m) => a + (m.estimated_days ?? 0), 0)
      systemHeaderRows.push(aoa.length)
      aoa.push([
        `${sys.system_id} — ${sys.system_name} (${sys.system_type} · ${sys.suggested_tech_stack})`,
        '', '', '', '', '', '',
        `${sys.modules.length} modules`,
        `${sysDays} MD`,
      ])

      sys.modules.forEach((mod) => {
        moduleRows.push({ row: aoa.length, priority: mod.priority })
        aoa.push([
          mod.module_code,
          mod.module_name,
          mod.tor_reference,
          mod.priority,
          mod.estimated_days ?? '',
          (mod.implementation_details || []).map(d => '• ' + d).join('\n'),
          (mod.acceptance_criteria || []).map(d => '✓ ' + d).join('\n'),
          (mod.risks || []).map(d => '⚠ ' + d).join('\n'),
          (mod.dependencies || []).join(', '),
        ])
      })
    })

    aoa.push([]) // แถวว่างคั่น
    const summaryRow = aoa.length
    aoa.push([`รวมทั้งหมด ${totalModules} Modules`, '', '', '', `${totalDays} Man-days`])

    // ── สร้าง worksheet ──
    const ws = XLSX.utils.aoa_to_sheet(aoa)

    // ความกว้างคอลัมน์
    ws['!cols'] = [
      { wch: 12 }, { wch: 26 }, { wch: 14 }, { wch: 10 }, { wch: 9 },
      { wch: 40 }, { wch: 35 }, { wch: 32 }, { wch: 20 },
    ]

    // merge หัวข้อ title และแถว system header
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // title row
      ...systemHeaderRows.map(r => ({ s: { r, c: 0 }, e: { r, c: 6 } })),
    ]

    // ปรับความสูงแถวให้พอดีกับข้อความหลายบรรทัด
    ws['!rows'] = aoa.map((_, i) => {
      const isModuleRow = moduleRows.some(m => m.row === i)
      return isModuleRow ? { hpt: 60 } : { hpt: 20 }
    })

    // ── จัดสไตล์ (สี, ตัวหนา, border) — ใช้ xlsx-style API ผ่าน cell.s ──
    const priorityColors: Record<string, { bg: string; fg: string }> = {
      Critical: { bg: 'FFC7CE', fg: '9C0006' },
      High:     { bg: 'FFEB9C', fg: '9C6500' },
      Medium:   { bg: 'C6E0B4', fg: '375623' },
      Low:      { bg: 'D9D9D9', fg: '595959' },
    }

    function setCellStyle(r: number, c: number, style: any) {
      const addr = XLSX.utils.encode_cell({ r, c })
      if (!ws[addr]) ws[addr] = { t: 's', v: '' }
      ws[addr].s = style
    }

    // Title row style
    for (let c = 0; c <= 8; c++) {
      setCellStyle(0, c, {
        fill: { fgColor: { rgb: '1F1F3D' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 14 },
        alignment: { horizontal: 'center', vertical: 'center' },
      })
    }
    // Meta row style
    for (let c = 0; c <= 8; c++) {
      setCellStyle(1, c, {
        fill: { fgColor: { rgb: 'F2F2F2' } },
        font: { sz: 10 },
      })
    }
    // Column header style
    for (let c = 0; c <= 8; c++) {
      setCellStyle(3, c, {
        fill: { fgColor: { rgb: '2D2D5F' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 10 },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
      })
    }
    // System header rows
    const sysColors = ['4472C4', '70AD47', 'FFC000', 'C55A11', '7030A0']
    systemHeaderRows.forEach((r, idx) => {
      const color = sysColors[idx % sysColors.length]
      for (let c = 0; c <= 8; c++) {
        setCellStyle(r, c, {
          fill: { fgColor: { rgb: color } },
          font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 11 },
          alignment: { vertical: 'center' },
        })
      }
    })
    // Module rows — สีตาม priority ที่คอลัมน์ Priority, สีอ่อนสลับแถวที่อื่น
    moduleRows.forEach(({ row, priority }, idx) => {
      const prio = priorityColors[priority] ?? { bg: 'EEEEEE', fg: '333333' }
      const rowBg = idx % 2 === 0 ? 'F7F8FF' : 'FFFFFF'
      for (let c = 0; c <= 8; c++) {
        setCellStyle(row, c, {
          fill: { fgColor: { rgb: c === 3 ? prio.bg : rowBg } },
          font: { sz: 10, color: { rgb: c === 3 ? prio.fg : '333333' }, bold: c === 3 },
          alignment: { vertical: 'top', wrapText: true, horizontal: c === 3 || c === 4 ? 'center' : 'left' },
          border: { top: { style: 'hair', color: { rgb: 'DDDDDD' } }, bottom: { style: 'hair', color: { rgb: 'DDDDDD' } } },
        })
      }
    })
    // Summary row
    for (let c = 0; c <= 8; c++) {
      setCellStyle(summaryRow, c, {
        fill: { fgColor: { rgb: 'FFF2CC' } },
        font: { bold: true, color: { rgb: '7F6000' }, sz: 11 },
      })
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Systems & Modules')
    XLSX.writeFile(wb, 'systems-modules.xlsx', { cellStyles: true })
  })
}

export function PageSystems({ systems }: { systems: TorSystem[] }) {
  const [view, setView] = useState<'table'|'card'>('table')
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('All')
  const [filterType, setFilterType] = useState<string>('All')

  const allModules = systems.flatMap(sys =>
    sys.modules.map(mod => ({ ...mod, sys }))
  )
  const totalDays = allModules.reduce((a, m) => a + (m.estimated_days ?? 0), 0)

  const filtered = allModules.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.module_name.toLowerCase().includes(q) || m.module_code.toLowerCase().includes(q) || m.sys.system_name.toLowerCase().includes(q)
    const matchPriority = filterPriority === 'All' || m.priority === filterPriority
    const matchType = filterType === 'All' || m.sys.system_type === filterType
    return matchSearch && matchPriority && matchType
  }).sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9))

  const types = Array.from(new Set(systems.map(s => s.system_type)))

  return (
    <div className="animate-slide-up space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeader dot="bg-sky" title="Systems & Modules" badge={`${systems.length} systems · ${allModules.length} modules · ${totalDays} MD`} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToExcel(systems)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/10 border border-emerald/30 text-emerald text-[11px] font-semibold hover:bg-emerald/20 transition-all"
          >
            <Download size={13} /> Export Excel
          </button>
          <div className="flex rounded-lg overflow-hidden border border-white/[0.1]">
            {(['table','card'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={clsx('px-3 py-1.5 text-[11px] font-semibold transition-all',
                  view === v ? 'bg-brand text-white' : 'text-gray-500 hover:text-gray-300'
                )}>
                {v === 'table' ? '⊞ ตาราง' : '⊟ Card'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหา module..."
            className="pl-7 pr-3 py-1.5 rounded-lg bg-bg-raised border border-white/[0.08] text-[11px] text-gray-300 placeholder-gray-700 outline-none focus:border-brand/50 w-[180px]"
          />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-bg-raised border border-white/[0.08] text-[11px] text-gray-400 outline-none">
          <option value="All">Priority: All</option>
          {['Critical','High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-bg-raised border border-white/[0.08] text-[11px] text-gray-400 outline-none">
          <option value="All">Type: All</option>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        {(search || filterPriority !== 'All' || filterType !== 'All') && (
          <button onClick={() => { setSearch(''); setFilterPriority('All'); setFilterType('All') }}
            className="px-3 py-1.5 rounded-lg bg-rose/10 border border-rose/30 text-rose text-[11px]">
            ✕ Reset
          </button>
        )}
        <span className="self-center text-[10px] text-gray-600">{filtered.length} รายการ</span>
      </div>

      {view === 'table' ? (
        <div className="bg-bg-surface border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-raised border-b border-white/[0.07]">
                  {['Module','ระบบ','Priority','Est. Days','Tech Stack','TOR Ref','รายละเอียด'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <ModuleTableRow key={m.module_code + i} m={m} />
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-[12px] text-gray-600">ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/[0.07] bg-bg-raised">
                  <td colSpan={3} className="px-4 py-2 text-[10px] text-gray-600">รวม {filtered.length} modules</td>
                  <td className="px-4 py-2 text-[11px] font-bold text-amber">
                    {filtered.reduce((a, m) => a + (m.estimated_days ?? 0), 0)} MD
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {systems.map((sys, i) => {
            const color = COLORS[i % COLORS.length]
            const mods = sys.modules.filter(m => {
              const q = search.toLowerCase()
              return (!q || m.module_name.toLowerCase().includes(q)) &&
                (filterPriority === 'All' || m.priority === filterPriority)
            })
            if (mods.length === 0) return null
            return <SystemCard key={sys.system_id} sys={{ ...sys, modules: mods }} color={color} />
          })}
        </div>
      )}
    </div>
  )
}

function ModuleTableRow({ m }: { m: TorModule & { sys: TorSystem } }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr
        className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber/10 text-amber border border-amber/25">
              {m.module_code}
            </span>
            <span className="text-[12px] font-medium text-gray-200">{m.module_name}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{TYPE_EMOJI[m.sys.system_type] ?? '🔧'}</span>
            <span className="text-[11px] text-gray-400">{m.sys.system_name}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              color: PRIORITY_COLOR[m.priority] ?? '#aaa',
              background: `${PRIORITY_COLOR[m.priority]}18`,
              borderColor: `${PRIORITY_COLOR[m.priority]}40`,
            }}>
            {m.priority === 'Critical' && '🔴'}{m.priority === 'High' && '🟡'}{m.priority === 'Medium' && '🔵'}{m.priority === 'Low' && '🟢'}
            {' '}{m.priority}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="text-[12px] font-bold text-amber">{m.estimated_days ?? '—'}</span>
          <span className="text-[10px] text-gray-600 ml-1">MD</span>
        </td>
        <td className="px-4 py-3 text-[10px] font-mono text-gray-500 max-w-[150px] truncate">{m.sys.suggested_tech_stack}</td>
        <td className="px-4 py-3 text-[10px] text-gray-600">{m.tor_reference}</td>
        <td className="px-4 py-3">
          <ChevronDown size={12} className={clsx('text-gray-600 transition-transform', open && 'rotate-180')} />
        </td>
      </tr>
      {open && (
        <tr className="border-b border-white/[0.04] bg-bg-raised">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-600 mb-2">📋 รายละเอียด</p>
                <ul className="space-y-1">
                  {(m.implementation_details || []).map((d, i) => (
                    <li key={i} className="text-[11px] text-gray-400 flex gap-1.5">
                      <span className="text-gray-700">▸</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-600 mb-2">✅ เกณฑ์รับงาน</p>
                <ul className="space-y-1">
                  {(m.acceptance_criteria || []).map((c, i) => (
                    <li key={i} className="text-[11px] text-gray-400 flex gap-1.5">
                      <CheckCircle size={10} className="text-emerald flex-shrink-0 mt-0.5" />{c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-600 mb-2">⚠️ ความเสี่ยง</p>
                <ul className="space-y-1">
                  {(m.risks || []).map((r, i) => (
                    <li key={i} className="text-[11px] text-gray-400 flex gap-1.5">
                      <AlertCircle size={10} className="text-rose flex-shrink-0 mt-0.5" />{r}
                    </li>
                  ))}
                </ul>
                {(m.dependencies || []).length > 0 && (
                  <div className="mt-2">
                    <p className="text-[9px] text-gray-600 mb-1 flex items-center gap-1"><Link2 size={9} />Dependencies</p>
                    <div className="flex flex-wrap gap-1">
                      {m.dependencies.map(d => <Tag key={d} variant="gray">{d}</Tag>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

const COLORS = [
  { top: '#6c63ff', id: 'rgba(108,99,255,0.15)', idText: '#a09bff', idBorder: 'rgba(108,99,255,0.3)' },
  { top: '#4fc3f7', id: 'rgba(79,195,247,0.12)', idText: '#7dd3f7', idBorder: 'rgba(79,195,247,0.3)' },
  { top: '#43e97b', id: 'rgba(67,233,123,0.12)', idText: '#6ee8a0', idBorder: 'rgba(67,233,123,0.3)' },
  { top: '#f9a825', id: 'rgba(249,168,37,0.12)', idText: '#f9c55a', idBorder: 'rgba(249,168,37,0.3)' },
]
function SystemCard({ sys, color }: { sys: TorSystem; color: typeof COLORS[0] }) {
  const totalDays = sys.modules.reduce((a, m) => a + (m.estimated_days ?? 0), 0)
  return (
    <div className="bg-bg-surface border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">
      <div className="h-[2px]" style={{ background: color.top }} />
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span>{TYPE_EMOJI[sys.system_type] ?? '🔧'}</span>
            <p className="font-semibold text-[13px]">{sys.system_name}</p>
          </div>
          <p className="text-[11px] font-mono truncate mb-1" style={{ color: color.top }}>⚡ {sys.suggested_tech_stack}</p>
          {sys.architecture_pattern && <p className="text-[10px] text-gray-600">🏛 {sys.architecture_pattern}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg"
            style={{ background: color.id, border: `1px solid ${color.idBorder}`, color: color.idText }}>
            {sys.system_id}
          </span>
          {totalDays > 0 && <span className="text-[9px] text-gray-600 font-mono">{totalDays} MD</span>}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        {sys.modules.map(mod => (
          <div key={mod.module_code} className="bg-bg-raised rounded-xl border border-white/[0.06] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber/10 text-amber border border-amber/25">{mod.module_code}</span>
              <span className="text-[12px] flex-1">{mod.module_name}</span>
              <Tag variant={(PRIORITY_VARIANT[mod.priority] ?? 'gray') as 'red'|'amber'|'sky'|'gray'}>{mod.priority}</Tag>
              <span className="text-[9px] text-gray-600">{mod.estimated_days}d</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}