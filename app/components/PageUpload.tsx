'use client'
// app/components/PageUpload.tsx
import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react'
import {
  FileUp, FlaskConical, Loader2,
  AlertTriangle, FileText, X, Bot,
} from 'lucide-react'
import { SectionHeader, Divider } from './Shared'
import { ApiKeySettings } from './ApiKeySettings'
import { DEMO_RESULT, DEMO_TOR_TEXT } from '../lib/demo'
import { PROVIDERS, LS_PROVIDER, LS_API_KEY, LS_MODEL } from '../lib/providers'
import type { TorAnalysisResult, AnalysisStatus } from '../lib/types'

interface Props {
  status: AnalysisStatus
  progress: { pct: number; label: string }
  error: string | null
  onAnalyze: (fd: FormData) => Promise<void>
  onLoadDemo: (r: TorAnalysisResult) => void
}

export function PageUpload({ status, progress, error, onAnalyze, onLoadDemo }: Props) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile]         = useState<File | null>(null)
  const [text, setText]         = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const loading = status === 'loading'

  // ── AI Provider + API Key state ──
  const [providerId, setProviderId] = useState('typhoon')
  const [apiKey, setApiKey]         = useState('')
  const [model, setModel]           = useState(PROVIDERS[0].models[0].id)

  // โหลดค่าที่บันทึกไว้จาก localStorage ตอน mount
  useEffect(() => {
    const savedProvider = localStorage.getItem(LS_PROVIDER) ?? 'typhoon'
    const savedKey   = localStorage.getItem(LS_API_KEY + savedProvider) ?? ''
    const savedModel = localStorage.getItem(LS_MODEL + savedProvider) ??
      (PROVIDERS.find(p => p.id === savedProvider)?.models[0].id ?? PROVIDERS[0].models[0].id)
    setProviderId(savedProvider)
    setApiKey(savedKey)
    setModel(savedModel)
  }, [])

  function handleProviderChange(pid: string, key: string, mdl: string) {
    setProviderId(pid)
    setApiKey(key)
    setModel(mdl)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  function clearFile() {
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function submit() {
    if (!file && !text.trim()) return
    const fd = new FormData()
    if (file) fd.append('file', file)
    else      fd.append('text', text)
    // ส่ง provider + key + model ไปกับ request
    fd.append('provider', providerId)
    fd.append('apiKey', apiKey)
    fd.append('model', model)
    await onAnalyze(fd)
  }

  const hasKey = apiKey.trim().length > 0
  const canSubmit = (!!file || text.trim().length > 20) && !loading && hasKey

  return (
    <div className="animate-fade-in max-w-2xl">
      <SectionHeader dot="bg-brand" title="วิเคราะห์เอกสาร TOR ด้วย AI" />

      {/* AI Provider + API Key Settings */}
      <ApiKeySettings
        providerId={providerId}
        apiKey={apiKey}
        model={model}
        onChange={handleProviderChange}
      />

      {!hasKey && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-amber/[0.08] border border-amber/20 rounded-xl text-amber text-[11px]">
          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
          <span>กรุณาใส่ API Key ก่อนเริ่มวิเคราะห์ — กดที่กล่องด้านบนเพื่อตั้งค่า</span>
        </div>
      )}

      {file && providerId === 'typhoon' && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-sky/[0.08] border border-sky/20 rounded-xl text-sky-300 text-[11px]">
          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            กำลังใช้ Typhoon — ถ้าไฟล์ PDF เป็นไฟล์<strong className="text-sky-200"> สแกนจากกระดาษ (รูปภาพ)</strong> Typhoon จะอ่านไม่ได้
            แนะนำเปลี่ยนเป็น <strong className="text-sky-200">Gemini</strong> หรือ <strong className="text-sky-200">Claude</strong> ด้านบน ซึ่งอ่าน PDF สแกนได้โดยตรง
          </span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && fileRef.current?.click()}
        className={[
          'relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200',
          !file ? 'cursor-pointer' : '',
          dragging
            ? 'border-brand bg-brand/5 scale-[1.01]'
            : file
            ? 'border-emerald/40 bg-emerald/[0.04] cursor-default'
            : 'border-white/10 bg-bg-surface hover:border-white/[0.18] hover:bg-bg-raised',
        ].join(' ')}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={onFileChange}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <FileText size={40} className="text-emerald opacity-70" />
            <div>
              <p className="font-semibold text-emerald text-sm">{file.name}</p>
              <p className="text-[11px] text-gray-600 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); clearFile() }}
              className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-all"
            >
              <X size={11} /> ลบไฟล์
            </button>
          </div>
        ) : (
          <>
            <FileUp size={40} className="mx-auto mb-4 text-gray-700" />
            <p className="text-[15px] font-semibold mb-2">ลาก &amp; วาง ไฟล์ PDF ที่นี่</p>
            <p className="text-[12px] text-gray-500 mb-6">
              หรือกดปุ่มเพื่อเลือกไฟล์ — รองรับ <strong className="text-gray-400">.pdf</strong> และ <strong className="text-gray-400">.txt</strong>
            </p>
            <button className="px-5 py-2 rounded-xl bg-brand text-white text-[13px] font-semibold hover:bg-brand/80 transition-colors">
              เลือกไฟล์ TOR
            </button>
          </>
        )}
      </div>

      <Divider label="หรือวางข้อความ TOR โดยตรง" />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={9}
        placeholder={`วางเนื้อหา TOR ของคุณที่นี่…\n\nรองรับ:\n• ข้อความภาษาไทย / อังกฤษ\n• TOR ฉบับเต็ม หรือบางส่วน\n• เนื้อหาที่คัดลอกจาก PDF`}
        className="w-full bg-bg-raised border border-white/[0.08] rounded-xl p-4 text-[12px] font-mono text-gray-300 placeholder-gray-700 resize-y outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-all"
      />

      {/* Progress */}
      {loading && (
        <div className="mt-4 p-4 bg-bg-surface border border-white/[0.07] rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 size={13} className="animate-spin-slow text-brand" />
            <span className="text-[12px] text-gray-300">{progress.label}</span>
          </div>
          <div className="h-1 bg-bg-overlay rounded-full overflow-hidden">
            <div
              className="h-full gradient-brand rounded-full transition-all duration-700"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 p-4 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-red-400 text-[12px] animate-fade-in">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex gap-3 flex-wrap">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:bg-brand/80 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand/20"
        >
          {loading ? <Loader2 size={14} className="animate-spin-slow" /> : <Bot size={14} />}
          วิเคราะห์ด้วย AI
        </button>
        <button
          onClick={() => { setText(DEMO_TOR_TEXT); onLoadDemo(DEMO_RESULT) }}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-raised border border-white/[0.08] text-[13px] font-medium text-gray-400 hover:text-gray-200 hover:bg-bg-overlay disabled:opacity-35 transition-all"
        >
          <FlaskConical size={14} />
          โหลดข้อมูลตัวอย่าง
        </button>
      </div>
    </div>
  )
}
