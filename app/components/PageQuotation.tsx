'use client'
// app/components/PageQuotation.tsx - แก้ไขราคาได้ + Print PDF สไตล์ใบเสนอราคาจริง
import { useState, useCallback } from 'react'
import { Printer, FileDown, Plus, Trash2, Edit3, Check, X, Download } from 'lucide-react'
import type { TorQuotation, TorProjectOverview, TorQuotationItem } from '../lib/types'

const CATEGORY_TH: Record<string, string> = {
  Development:'พัฒนาระบบ', Design:'ออกแบบ UI/UX', Infrastructure:'โครงสร้างพื้นฐาน',
  License:'ลิขสิทธิ์ซอฟต์แวร์', Training:'ฝึกอบรม', Support:'บำรุงรักษา',
}
const CATEGORIES = Object.keys(CATEGORY_TH)

function fmt(n: number) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtInput(n: number) { return String(n) }
function catClass(cat: string) {
  return ({ Development:'cat-dev', Infrastructure:'cat-inf', Design:'cat-des',
            License:'cat-lic', Training:'cat-tra', Support:'cat-sup' }[cat] ?? 'cat-dev')
}

const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Sarabun',sans-serif;font-size:13px;color:#1a1a2e;background:#fff}
.wrap{max-width:820px;margin:0 auto;padding:40px 48px}
.logo-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
.logo-box{display:flex;flex-direction:column;gap:3px}
.logo-name{font-size:22px;font-weight:800;color:#6c63ff;letter-spacing:-0.5px}
.logo-sub{font-size:11px;color:#888}
.doc-box{text-align:right}
.doc-title{font-size:28px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px}
.doc-num{font-size:12px;color:#666;margin-top:4px}
.doc-badge{display:inline-block;margin-top:6px;padding:4px 14px;border-radius:20px;background:linear-gradient(135deg,#6c63ff,#4fc3f7);color:#fff;font-size:11px;font-weight:700;letter-spacing:1px}
.divider{height:3px;background:linear-gradient(90deg,#6c63ff,#4fc3f7,#43e97b);border-radius:2px;margin-bottom:24px}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.party-box{background:#f8f8ff;border:1px solid #e8e6ff;border-radius:10px;padding:14px 16px}
.party-label{font-size:9px;font-weight:800;color:#6c63ff;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px}
.party-name{font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:4px}
.party-info{font-size:11px;color:#666;line-height:1.6}
.meta-row{display:flex;gap:12px;margin-bottom:24px}
.meta-box{flex:1;background:#f8f8ff;border:1px solid #e8e6ff;border-radius:8px;padding:10px 14px}
.meta-label{font-size:9px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px}
.meta-value{font-size:12px;color:#1a1a2e;font-weight:600}
.project-bar{background:linear-gradient(135deg,#6c63ff15,#4fc3f715);border:1px solid #6c63ff30;border-radius:10px;padding:14px 18px;margin-bottom:24px}
.project-label{font-size:9px;font-weight:800;color:#6c63ff;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px}
.project-name{font-size:15px;font-weight:700;color:#1a1a2e}
table{width:100%;border-collapse:collapse;margin-bottom:20px;border-radius:10px;overflow:hidden}
thead tr{background:linear-gradient(135deg,#6c63ff,#4a43cc)}
thead th{color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:11px 12px;text-align:left}
thead th.r{text-align:right}
tbody tr{border-bottom:1px solid #f0f0f8}
tbody tr:last-child{border-bottom:none}
tbody td{padding:11px 12px;font-size:12px;color:#333;vertical-align:top}
tbody td.r{text-align:right}
tbody tr:hover{background:#fafafe}
.num-badge{display:inline-block;width:22px;height:22px;border-radius:50%;background:#6c63ff;color:#fff;font-size:10px;font-weight:700;text-align:center;line-height:22px}
.cat-badge{display:inline-block;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;margin-top:3px}
.cat-dev{background:#ebe9ff;color:#6c63ff}.cat-inf{background:#e8f5e9;color:#2e7d32}
.cat-des{background:#e1f5fe;color:#0277bd}.cat-lic{background:#fff8e1;color:#f57f17}
.cat-tra{background:#f3e5f5;color:#7b1fa2}.cat-sup{background:#fce4ec;color:#c62828}
.summary-wrap{display:flex;justify-content:flex-end;margin-bottom:28px}
.summary-box{min-width:300px;background:#f8f8ff;border:1px solid #e8e6ff;border-radius:12px;overflow:hidden}
.sum-row{display:flex;justify-content:space-between;align-items:center;padding:11px 18px;border-bottom:1px solid #eeecff}
.sum-row:last-child{border:none}
.sum-label{font-size:12px;color:#666}
.sum-val{font-size:13px;color:#1a1a2e;font-weight:500}
.sum-total{background:linear-gradient(135deg,#6c63ff,#4a43cc)}
.sum-total .sum-label{color:rgba(255,255,255,0.85);font-weight:700;font-size:13px}
.sum-total .sum-val{color:#fff;font-weight:800;font-size:16px}
.section-head{font-size:11px;font-weight:800;color:#333;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px;padding-left:10px;border-left:3px solid #6c63ff}
.terms-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:22px;list-style:none}
.terms-grid li{font-size:11px;color:#444;display:flex;gap:6px;align-items:flex-start}
.terms-grid li::before{content:"◆";color:#6c63ff;font-size:8px;flex-shrink:0;margin-top:3px}
.notes-list{list-style:none;margin-bottom:28px}
.notes-list li{font-size:11px;color:#666;padding:3px 0 3px 14px;position:relative}
.notes-list li::before{content:"•";position:absolute;left:0;color:#6c63ff}
.sig-area{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:48px}
.sig-box{border-top:2px solid #6c63ff30;padding-top:12px}
.sig-title{font-size:10px;font-weight:700;color:#6c63ff;text-transform:uppercase;letter-spacing:.8px;margin-bottom:36px}
.sig-line{font-size:11px;font-weight:600;color:#333;border-top:1px dashed #ccc;padding-top:6px}
.sig-role{font-size:10px;color:#888;margin-top:3px}
.sig-date{font-size:10px;color:#999;margin-top:8px}
.footer{margin-top:32px;padding-top:14px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:9px;color:#bbb}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.wrap{padding:20px 28px}}
`

export function PageQuotation({
  quotation: initialQ,
  project: p,
}: {
  quotation: TorQuotation
  project: TorProjectOverview
}) {
  // State สำหรับแก้ไขได้
  const [items, setItems] = useState<TorQuotationItem[]>(() =>
    (initialQ.items || []).map((item, i) => ({ ...item, _id: i }))
  )
  const [editingId, setEditingId] = useState<number | null>(null)
  const [vatPct, setVatPct] = useState(initialQ.vat_percentage ?? 7)
  const [companyName, setCompanyName] = useState(initialQ.company_name || 'บริษัท พัฒนาระบบ จำกัด')
  const [contactPerson, setContactPerson] = useState(initialQ.contact_person || '')
  const [quotationNumber, setQuotationNumber] = useState(initialQ.quotation_number || 'QT-2024-001')
  const [quotationDate, setQuotationDate] = useState(initialQ.quotation_date || '')
  const [validUntil, setValidUntil] = useState(initialQ.valid_until || '')

  // คำนวณยอดรวม
  const subtotal = items.reduce((a, item) => a + (Number(item.total_price) || 0), 0)
  const vatAmount = Math.round(subtotal * vatPct / 100)
  const grandTotal = subtotal + vatAmount

  function updateItem(idx: number, field: keyof TorQuotationItem, val: string | number) {
    setItems(prev => {
      const next = [...prev]
      const item = { ...next[idx], [field]: val }
      // auto-calc total
      if (field === 'quantity' || field === 'unit_price') {
        item.total_price = Number(item.quantity) * Number(item.unit_price)
      }
      next[idx] = item
      return next
    })
  }

  function addItem() {
    const newItem: TorQuotationItem & { _id: number } = {
      _id: Date.now(), item_code: `NEW-${items.length + 1}`,
      description: 'รายการใหม่', category: 'Development',
      quantity: 1, unit: 'MD', unit_price: 3500, total_price: 3500,
    }
    setItems(prev => [...prev, newItem])
    setEditingId(newItem._id)
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function exportExcel() {
    const rows = [
      ['#','รายการ','หมวดหมู่','รหัส','จำนวน','หน่วย','ราคา/หน่วย','รวม (บาท)'],
      ...items.map((item, i) => [
        String(i + 1), item.description, CATEGORY_TH[item.category] || item.category,
        item.item_code, String(item.quantity), item.unit,
        String(item.unit_price), String(item.total_price),
      ]),
      ['','','','','','','ราคาก่อน VAT', String(subtotal)],
      ['','','','','','',`VAT ${vatPct}%`, String(vatAmount)],
      ['','','','','','','รวมทั้งสิ้น', String(grandTotal)],
    ]
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8"><style>
th{background:#6c63ff;color:#fff;font-weight:bold;padding:8px;border:1px solid #ccc}
td{padding:6px 8px;border:1px solid #ddd}
tr:nth-child(even) td{background:#f8f8ff}
</style></head><body><table>
${rows.map((row, i) => `<tr>${row.map(cell => i === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`).join('')}</tr>`).join('\n')}
</table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'quotation.xls'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  function handlePrint() {
    const itemsHTML = items.map((item, i) => `
      <tr>
        <td><span class="num-badge">${String(i+1).padStart(2,'0')}</span></td>
        <td><div style="font-weight:600;color:#1a1a2e;margin-bottom:3px">${item.description}</div>
          <span class="cat-badge ${catClass(item.category)}">${CATEGORY_TH[item.category] || item.category}</span></td>
        <td style="color:#666;font-size:11px">${item.item_code}</td>
        <td class="r">${item.quantity.toLocaleString()}</td>
        <td style="color:#666">${item.unit}</td>
        <td class="r">${fmt(item.unit_price)}</td>
        <td class="r" style="font-weight:700;color:#1a1a2e">${fmt(item.total_price)}</td>
      </tr>`).join('')

    const termsHTML = (initialQ.payment_terms || []).map(t => `<li>${t}</li>`).join('')
    const notesHTML = (initialQ.notes || []).map(n => `<li>${n}</li>`).join('')

    const html = `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
<title>ใบเสนอราคา ${quotationNumber}</title>
<style>${PRINT_CSS}</style></head><body>
<div class="wrap">
  <div class="logo-row">
    <div class="logo-box">
      <div class="logo-name">${companyName}</div>
      <div class="logo-sub">Software Development &amp; IT Consulting</div>
    </div>
    <div class="doc-box">
      <div class="doc-title">ใบเสนอราคา</div>
      <div class="doc-num">เลขที่: ${quotationNumber}</div>
      <div class="doc-badge">QUOTATION</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="meta-row">
    <div class="meta-box"><div class="meta-label">วันที่ออกเอกสาร</div><div class="meta-value">${quotationDate}</div></div>
    <div class="meta-box"><div class="meta-label">หมดอายุวันที่</div><div class="meta-value">${validUntil}</div></div>
    <div class="meta-box"><div class="meta-label">ผู้ติดต่อ</div><div class="meta-value">${contactPerson || '—'}</div></div>
    <div class="meta-box"><div class="meta-label">ระยะเวลา</div><div class="meta-value">${p.timeline.duration_months} เดือน (${p.timeline.total_installments} งวด)</div></div>
  </div>
  <div class="project-bar">
    <div class="project-label">ชื่อโครงการ</div>
    <div class="project-name">${initialQ.project_name || p.project_name}</div>
  </div>
  <table>
    <thead><tr>
      <th style="width:36px">#</th><th>รายละเอียด</th><th style="width:80px">รหัส</th>
      <th class="r" style="width:56px">จำนวน</th><th style="width:48px">หน่วย</th>
      <th class="r" style="width:110px">ราคา/หน่วย</th>
      <th class="r" style="width:120px">มูลค่า (บาท)</th>
    </tr></thead>
    <tbody>${itemsHTML}</tbody>
  </table>
  <div class="summary-wrap">
    <div class="summary-box">
      <div class="sum-row"><span class="sum-label">ราคาก่อน VAT</span><span class="sum-val">${fmt(subtotal)} บาท</span></div>
      <div class="sum-row"><span class="sum-label">VAT ${vatPct}%</span><span class="sum-val">${fmt(vatAmount)} บาท</span></div>
      <div class="sum-row sum-total"><span class="sum-label">รวมทั้งสิ้น</span><span class="sum-val">${fmt(grandTotal)} บาท</span></div>
    </div>
  </div>
  ${termsHTML ? `<div class="section-head">เงื่อนไขการชำระเงิน</div><ul class="terms-grid">${termsHTML}</ul>` : ''}
  ${notesHTML ? `<div class="section-head">หมายเหตุ</div><ul class="notes-list">${notesHTML}</ul>` : ''}
  <div class="sig-area">
    <div class="sig-box">
      <div class="sig-title">ผู้เสนอราคา (Vendor)</div>
      <div class="sig-line">_______________________________</div>
      <div class="sig-role">ผู้มีอำนาจลงนาม / ${companyName}</div>
      <div class="sig-date">วันที่ _______________</div>
    </div>
    <div class="sig-box">
      <div class="sig-title">ผู้อนุมัติ (Client)</div>
      <div class="sig-line">_______________________________</div>
      <div class="sig-role">ผู้มีอำนาจอนุมัติ</div>
      <div class="sig-date">วันที่ _______________</div>
    </div>
  </div>
  <div class="footer">
    <span>TOR Analyzer — AI-Powered by Typhoon AI</span>
    <span>เลขที่: ${quotationNumber}</span>
  </div>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  return (
    <div className="animate-slide-up space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber" />
          <h2 className="text-[15px] font-semibold">ใบเสนอราคา</h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-500">{quotationNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/10 border border-emerald/30 text-emerald text-[11px] font-semibold hover:bg-emerald/20 transition-all">
            <Download size={13} /> Export Excel
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber/10 border border-amber/30 text-amber text-[12px] font-semibold hover:bg-amber/20 transition-all">
            <Printer size={14} /> พิมพ์ / PDF
          </button>
        </div>
      </div>

      {/* ข้อมูลเอกสาร — แก้ไขได้ */}
      <div className="bg-bg-surface border border-white/[0.07] rounded-xl p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600 mb-4">📋 ข้อมูลเอกสาร (แก้ไขได้)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['เลขที่ใบเสนอราคา', quotationNumber, setQuotationNumber],
            ['วันที่', quotationDate, setQuotationDate],
            ['หมดอายุ', validUntil, setValidUntil],
            ['บริษัทผู้เสนอราคา', companyName, setCompanyName],
            ['ผู้ติดต่อ', contactPerson, setContactPerson],
          ].map(([label, val, setter]) => (
            <div key={label as string}>
              <p className="text-[9px] text-gray-600 mb-1">{label as string}</p>
              <input
                value={val as string}
                onChange={e => (setter as (v: string) => void)(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-bg-raised border border-white/[0.08] text-[12px] text-gray-200 outline-none focus:border-brand/50 transition-colors"
              />
            </div>
          ))}
          <div>
            <p className="text-[9px] text-gray-600 mb-1">VAT %</p>
            <input type="number" value={vatPct} onChange={e => setVatPct(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-bg-raised border border-white/[0.08] text-[12px] text-gray-200 outline-none focus:border-brand/50" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-4 text-center bg-brand/10 border border-brand/20">
          <div className="text-[10px] text-gray-600 mb-1">ราคาก่อน VAT</div>
          <div className="text-[17px] font-bold text-brand">฿{fmt(subtotal)}</div>
        </div>
        <div className="rounded-xl p-4 text-center bg-amber/10 border border-amber/20">
          <div className="text-[10px] text-gray-600 mb-1">VAT {vatPct}%</div>
          <div className="text-[17px] font-bold text-amber">฿{fmt(vatAmount)}</div>
        </div>
        <div className="rounded-xl p-4 text-center bg-emerald/10 border border-emerald/20">
          <div className="text-[10px] text-gray-600 mb-1">รวมทั้งสิ้น</div>
          <div className="text-[19px] font-bold text-emerald">฿{fmt(grandTotal)}</div>
        </div>
      </div>

      {/* Items Table — แก้ไขราคาได้ */}
      <div className="bg-bg-surface border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07]">
          <p className="text-[11px] font-bold text-gray-400">รายการ ({items.length} รายการ)</p>
          <button onClick={addItem}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand/10 border border-brand/30 text-brand text-[10px] font-semibold hover:bg-brand/20 transition-all">
            <Plus size={11} /> เพิ่มรายการ
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-raised border-b border-white/[0.07]">
                {['#','รายละเอียด','หมวดหมู่','รหัส','จำนวน','หน่วย','ราคา/หน่วย','รวม',''].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-600 whitespace-nowrap last:text-right">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const isEditing = editingId === (item as any)._id
                return (
                  <tr key={(item as any)._id ?? idx} className="border-b border-white/[0.04] hover:bg-white/[0.015] group transition-colors">
                    <td className="px-3 py-2.5 text-[11px] text-gray-600 font-mono">{String(idx+1).padStart(2,'0')}</td>
                    <td className="px-3 py-2.5 min-w-[200px]">
                      {isEditing ? (
                        <input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 rounded bg-bg-raised border border-brand/40 text-[12px] text-gray-200 outline-none" />
                      ) : (
                        <span className="text-[12px] text-gray-200 font-medium">{item.description}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {isEditing ? (
                        <select value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)}
                          className="px-2 py-1 rounded bg-bg-raised border border-brand/40 text-[11px] text-gray-300 outline-none">
                          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_TH[c]}</option>)}
                        </select>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                          {CATEGORY_TH[item.category] || item.category}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {isEditing ? (
                        <input value={item.item_code} onChange={e => updateItem(idx, 'item_code', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-bg-raised border border-brand/40 text-[11px] text-gray-300 outline-none" />
                      ) : (
                        <span className="text-[10px] font-mono text-gray-600">{item.item_code}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {isEditing ? (
                        <input type="number" value={fmtInput(item.quantity)} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded bg-bg-raised border border-brand/40 text-[12px] text-gray-200 outline-none" />
                      ) : (
                        <span className="text-[12px] text-gray-300">{item.quantity.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {isEditing ? (
                        <input value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}
                          className="w-14 px-2 py-1 rounded bg-bg-raised border border-brand/40 text-[11px] text-gray-300 outline-none" />
                      ) : (
                        <span className="text-[11px] text-gray-500">{item.unit}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {isEditing ? (
                        <input type="number" value={fmtInput(item.unit_price)} onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))}
                          className="w-24 px-2 py-1 rounded bg-bg-raised border border-brand/40 text-[12px] text-gray-200 outline-none" />
                      ) : (
                        <span className="text-[12px] text-gray-300">฿{fmt(item.unit_price)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[13px] font-bold text-amber">฿{fmt(item.total_price)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <>
                            <button onClick={() => setEditingId(null)}
                              className="p-1 rounded bg-emerald/20 text-emerald hover:bg-emerald/30 transition-all">
                              <Check size={11} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setEditingId((item as any)._id)}
                            className="p-1 rounded bg-brand/20 text-brand hover:bg-brand/30 transition-all">
                            <Edit3 size={11} />
                          </button>
                        )}
                        <button onClick={() => removeItem(idx)}
                          className="p-1 rounded bg-rose/20 text-rose hover:bg-rose/30 transition-all">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/[0.07] bg-bg-raised">
                <td colSpan={7} className="px-3 py-2 text-right text-[11px] text-gray-500">รวม {items.length} รายการ</td>
                <td className="px-3 py-2 text-right text-[13px] font-bold text-amber">฿{fmt(subtotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment terms */}
      {(initialQ.payment_terms || []).length > 0 && (
        <div className="bg-bg-surface border border-white/[0.07] rounded-xl p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600 mb-3">💼 เงื่อนไขการชำระเงิน</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {initialQ.payment_terms.map((term, i) => (
              <div key={i} className="flex items-start gap-2 py-2 px-3 rounded-lg bg-bg-raised border border-white/[0.05]">
                <span className="text-brand font-bold text-[10px] flex-shrink-0 mt-0.5">▸</span>
                <span className="text-[11px] text-gray-300">{term}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {(initialQ.notes || []).length > 0 && (
        <div className="bg-bg-surface border border-white/[0.07] rounded-xl p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-gray-600 mb-3">📝 หมายเหตุ</p>
          <ul className="space-y-1.5">
            {initialQ.notes.map((n, i) => (
              <li key={i} className="text-[12px] text-gray-400 flex gap-2">
                <span className="text-gray-700">•</span>{n}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Print CTA */}
      <div className="flex justify-center gap-3 pt-2">
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald font-semibold text-[12px] hover:bg-emerald/20 transition-all">
          <Download size={15} /> Export Excel
        </button>
        <button onClick={handlePrint}
          className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-amber text-black font-bold text-[13px] hover:bg-amber/90 transition-all">
          <FileDown size={15} /> พิมพ์ใบเสนอราคา / PDF
        </button>
      </div>
    </div>
  )
}
