'use client'
// app/page.tsx
import { useState } from 'react'
import { Topbar }        from './components/Topbar'
import { Sidebar }       from './components/Sidebar'
import { PageUpload }    from './components/PageUpload'
import { PageOverview }  from './components/PageOverview'
import { PageSystems }   from './components/PageSystems'
import { PageApis }      from './components/PageApis'
import { PageSprints }   from './components/PageSprints'
import { PageJson }      from './components/PageJson'
import { PageQuotation } from './components/PageQuotation'
import type { TorAnalysisResult, NavPage, AnalysisStatus } from './lib/types'

const STEPS = [
  { pct: 10, label: '📄 เตรียมข้อมูล TOR…' },
  { pct: 25, label: '🤖 ส่งข้อมูลไปยัง Typhoon AI…' },
  { pct: 50, label: '🧠 วิเคราะห์สถาปัตยกรรมระบบ…' },
  { pct: 70, label: '📋 สร้าง Sprint Backlog รายวัน…' },
  { pct: 85, label: '💰 ประมาณการใบเสนอราคา…' },
  { pct: 95, label: '📊 แปลงผลลัพธ์เป็น Dashboard…' },
]

export default function Home() {
  const [page,     setPage]     = useState<NavPage>('upload')
  const [result,   setResult]   = useState<TorAnalysisResult | null>(null)
  const [status,   setStatus]   = useState<AnalysisStatus>('idle')
  const [progress, setProgress] = useState({ pct: 0, label: '' })
  const [error,    setError]    = useState<string | null>(null)

  function reset() {
    setResult(null); setStatus('idle'); setError(null)
    setProgress({ pct: 0, label: '' }); setPage('upload')
  }

  async function handleAnalyze(fd: FormData) {
    setError(null); setStatus('loading')

    let stepIdx = 0
    setProgress(STEPS[0])
    const timer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1)
      setProgress(STEPS[stepIdx])
    }, 2200)

    try {
      const res  = await fetch('/api/analyze', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `API error ${res.status}`)
      clearInterval(timer)
      setProgress({ pct: 100, label: '✅ วิเคราะห์เสร็จสมบูรณ์!' })
      setResult(json.result)
      setStatus('success')
      setTimeout(() => setPage('overview'), 400)
    } catch (e) {
      clearInterval(timer)
      setStatus('error')
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
      setProgress({ pct: 0, label: '' })
    }
  }

  function handleLoadDemo(r: TorAnalysisResult) {
    setResult(r); setStatus('success'); setPage('overview')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar onReset={reset} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          page={page}
          onNavigate={setPage}
          hasResult={!!result}
          counts={{
            systems: result?.metrics.total_systems,
            apis:    result?.metrics.total_external_apis,
            sprints: result?.metrics.total_sprints,
          }}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-7 max-w-5xl mx-auto pb-20">
            {page === 'upload'    && (
              <PageUpload
                status={status}
                progress={progress}
                error={error}
                onAnalyze={handleAnalyze}
                onLoadDemo={handleLoadDemo}
              />
            )}
            {page === 'overview'  && result && <PageOverview  data={result} />}
            {page === 'systems'   && result && <PageSystems   systems={result.systems} />}
            {page === 'apis'      && result && <PageApis      apis={result.external_apis} />}
            {page === 'sprints'   && result && <PageSprints   sprints={result.sprint_backlog} />}
            {page === 'quotation' && result && <PageQuotation quotation={result.quotation} project={result.project_overview} />}
            {page === 'json'      && result && <PageJson      data={result} />}
          </div>
        </main>
      </div>
    </div>
  )
}
