// app/api/analyze/route.ts — รองรับ 3 AI providers + ส่ง PDF ตรงให้ AI อ่าน (รองรับ PDF สแกน)
import { NextRequest, NextResponse } from 'next/server'
import type { TorAnalysisResult } from '@/app/lib/types'

export const maxDuration = 300

const SYSTEM_PROMPT = `คุณคือ Senior Systems Analyst ผู้เชี่ยวชาญวิเคราะห์ TOR ราชการไทย

อ่านเอกสาร TOR ที่ได้รับ (อาจเป็นข้อความ หรือไฟล์ PDF ที่อาจเป็นภาพสแกน — ให้อ่านเนื้อหาจากภาพด้วย OCR ในตัวของคุณ)
แล้ววิเคราะห์และกรอกข้อมูลจริงจากเอกสารลงใน JSON
ห้ามใส่ค่า 0 หรือ "string" — ต้องเป็นข้อมูลจริงจากเอกสารเท่านั้น
ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่นนำหน้าหรือต่อท้าย ห้ามใส่ markdown fence

{
  "project_overview": {
    "project_name": "ชื่อโครงการจากเอกสาร",
    "description": "อธิบายโครงการ 2-3 ประโยค",
    "objective": "วัตถุประสงค์หลัก",
    "scope": "ขอบเขตงาน",
    "stakeholders": ["หน่วยงานผู้ว่าจ้าง", "ผู้ใช้งาน"],
    "budget_thb": "งบประมาณเป็นตัวเลข หรือ ไม่ระบุ",
    "timeline": { "kickoff_date": "วันเริ่มโครงการ", "duration_months": 12, "total_installments": 4, "go_live_target": "วัน Go Live" },
    "compliance_and_targets": { "security_requirements": ["ข้อกำหนดความปลอดภัย"], "concurrent_users_target": "จำนวน concurrent users" }
  },
  "metrics": { "total_systems": 3, "total_modules": 10, "total_external_apis": 4, "total_phases": 4, "total_sprints": 6, "total_tasks": 30, "total_mandays": 180, "estimated_budget_thb": "ประมาณงบรวม" },
  "systems": [
    {
      "system_id": "S1", "system_name": "ชื่อระบบ", "system_type": "Backend",
      "suggested_tech_stack": "Node.js + PostgreSQL", "architecture_pattern": "Microservices", "deployment_target": "Cloud / On-premise",
      "modules": [
        { "module_code": "M1.1", "module_name": "ชื่อ module จาก TOR", "tor_reference": "ข้อ 3.1", "priority": "High", "estimated_days": 10,
          "implementation_details": ["รายละเอียด 1", "รายละเอียด 2", "รายละเอียด 3"], "acceptance_criteria": ["เกณฑ์ 1", "เกณฑ์ 2"], "risks": ["ความเสี่ยง"], "dependencies": [] }
      ]
    }
  ],
  "external_apis": [
    { "api_name": "ชื่อ API", "purpose": "วัตถุประสงค์การใช้งาน", "associated_module_code": "M1.1", "security_protocol": "OAuth2.0", "integration_type": "REST", "data_flow": "ส่ง request รับ response", "sla_requirement": "uptime 99.9%" }
  ],
  "sprint_backlog": [
    {
      "sprint_number": 1, "duration_weeks": 2, "start_week": 1, "end_week": 2, "focus": "เป้าหมายหลัก sprint นี้",
      "goals": ["เป้าหมาย 1", "เป้าหมาย 2", "เป้าหมาย 3"], "associated_module_codes": ["M1.1"],
      "daily_schedule": [
        { "day": 1, "date_offset": "วันที่ 1 (จ. สัปดาห์ที่ 1)", "tasks": ["งาน 1", "งาน 2"], "deliverables": ["ผลงาน"], "assignee_role": "Developer" },
        { "day": 2, "date_offset": "วันที่ 2 (อ. สัปดาห์ที่ 1)", "tasks": ["งาน 1", "งาน 2"], "deliverables": ["ผลงาน"], "assignee_role": "Developer" },
        { "day": 3, "date_offset": "วันที่ 3 (พ. สัปดาห์ที่ 1)", "tasks": ["งาน 1", "งาน 2"], "deliverables": ["ผลงาน"], "assignee_role": "Developer" },
        { "day": 4, "date_offset": "วันที่ 4 (พฤ. สัปดาห์ที่ 1)", "tasks": ["งาน 1", "งาน 2"], "deliverables": ["ผลงาน"], "assignee_role": "Developer" },
        { "day": 5, "date_offset": "วันที่ 5 (ศ. สัปดาห์ที่ 1)", "tasks": ["งาน 1", "งาน 2"], "deliverables": ["ผลงาน"], "assignee_role": "Developer" }
      ],
      "definition_of_done": ["เกณฑ์เสร็จ 1", "เกณฑ์เสร็จ 2"], "risks": ["ความเสี่ยง sprint นี้"]
    }
  ],
  "phases": [
    { "phase_number": 1, "phase_name": "ชื่องวดงาน", "duration_weeks": 4, "installment_number": 1, "deliverables": ["สิ่งส่งมอบงวดนี้"], "payment_percentage": 25, "key_milestones": ["milestone สำคัญ"] }
  ],
  "risks": [
    { "risk_id": "R1", "description": "คำอธิบายความเสี่ยง", "probability": "Medium", "impact": "High", "mitigation": "แนวทางลดความเสี่ยง" }
  ],
  "quotation": {
    "quotation_number": "QT-2024-001", "quotation_date": "วันที่ปัจจุบัน", "valid_until": "30 วันจากวันนี้",
    "company_name": "บริษัท พัฒนาระบบ จำกัด", "project_name": "ชื่อโครงการ", "contact_person": "ผู้ติดต่อโครงการ",
    "items": [
      { "item_code": "DEV-001", "description": "พัฒนาระบบหลัก", "category": "Development", "quantity": 100, "unit": "MD", "unit_price": 3500, "total_price": 350000 },
      { "item_code": "INF-001", "description": "ติดตั้ง Infrastructure", "category": "Infrastructure", "quantity": 1, "unit": "ชุด", "unit_price": 50000, "total_price": 50000 }
    ],
    "subtotal": 400000, "vat_percentage": 7, "vat_amount": 28000, "grand_total": 428000,
    "payment_terms": ["งวดที่ 1 (25%): เมื่อลงนามสัญญา", "งวดที่ 2 (50%): เมื่อส่งมอบระบบ", "งวดที่ 3 (25%): เมื่อ go-live"],
    "notes": ["ราคานี้ยังไม่รวม VAT", "รับประกัน 1 ปีหลัง go-live"]
  }
}`

// ─────────────────────────────────────────────
// PDF text extraction (สำหรับ Typhoon ที่ไม่รองรับไฟล์โดยตรง)
// ─────────────────────────────────────────────
async function extractPdfText(buffer: Buffer): Promise<string> {
  const { extractText } = await import('unpdf')
  const uint8 = new Uint8Array(buffer)
  const { text } = await extractText(uint8, { mergePages: true })
  return (text ?? '').trim()
}

// ─────────────────────────────────────────────
// JSON repair (กรณีถูกตัดกลางทาง)
// ─────────────────────────────────────────────
function repairJson(raw: string): string {
  const s = raw.indexOf('{')
  if (s === -1) return raw
  let str = raw.slice(s)
  try { JSON.parse(str); return str } catch {}

  const opens: string[] = []
  let inString = false
  let escaped = false
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\' && inString) { escaped = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{' || ch === '[') opens.push(ch)
    if (ch === '}' || ch === ']') opens.pop()
  }
  str = str.trimEnd().replace(/,\s*$/, '')
  for (let i = opens.length - 1; i >= 0; i--) str += opens[i] === '{' ? '}' : ']'
  return str
}

function cleanJson(raw: string): string {
  raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  const s = raw.indexOf('{')
  const e = raw.lastIndexOf('}')
  if (s !== -1 && e !== -1) raw = raw.slice(s, e + 1)
  return repairJson(raw)
}

// ─────────────────────────────────────────────
// Provider callers
// แต่ละ provider รับ "input" ได้ 2 แบบ:
//   - { kind: 'text', content: string }
//   - { kind: 'pdf',  base64: string, filename: string }  ← Gemini/Claude อ่าน PDF ได้ตรงๆ (รองรับสแกน)
// ─────────────────────────────────────────────
type AiInput =
  | { kind: 'text'; content: string }
  | { kind: 'pdf'; base64: string; filename: string }

function buildUserText(extra?: string) {
  return `วิเคราะห์เอกสาร TOR ที่แนบมา (หรือข้อความด้านล่าง) และตอบเป็น JSON ให้ครบทุก field:\n${extra ?? ''}`
}

async function callTyphoon(apiKey: string, model: string, input: AiInput, maxTokens: number): Promise<string> {
  // Typhoon ไม่รองรับไฟล์โดยตรง — ต้องเป็น text เท่านั้น (caller ต้อง extract ข้อความมาก่อน)
  if (input.kind !== 'text') throw new Error('Typhoon ไม่รองรับการอ่านไฟล์ PDF โดยตรง')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 200_000)
  try {
    const res = await fetch('https://api.opentyphoon.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserText(input.content) },
        ],
        temperature: 0.1,
        max_tokens: maxTokens,
        stream: false,
      }),
    })
    if (!res.ok) throw new Error(`Typhoon API error ${res.status}: ${await res.text()}`)
    const json = await res.json()
    return json.choices?.[0]?.message?.content ?? ''
  } finally {
    clearTimeout(timeout)
  }
}

async function callGemini(apiKey: string, model: string, input: AiInput, maxTokens: number): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 200_000)
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const parts: any[] =
      input.kind === 'pdf'
        ? [
            { inline_data: { mime_type: 'application/pdf', data: input.base64 } },
            { text: buildUserText('(เอกสารแนบเป็น PDF ด้านบน อ่านเนื้อหารวมถึงข้อความในภาพสแกนด้วย)') },
          ]
        : [{ text: buildUserText(input.content) }]

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      }),
    })
    if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`)
    const json = await res.json()
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  } finally {
    clearTimeout(timeout)
  }
}

async function callClaude(apiKey: string, model: string, input: AiInput, maxTokens: number): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 200_000)
  try {
    const content: any[] =
      input.kind === 'pdf'
        ? [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: input.base64 } },
            { type: 'text', text: buildUserText('(เอกสารแนบเป็น PDF ด้านบน อ่านเนื้อหารวมถึงข้อความในภาพสแกนด้วย)') },
          ]
        : [{ type: 'text', text: buildUserText(input.content) }]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
        temperature: 0.1,
      }),
    })
    if (!res.ok) throw new Error(`Claude API error ${res.status}: ${await res.text()}`)
    const json = await res.json()
    return json.content?.[0]?.text ?? ''
  } finally {
    clearTimeout(timeout)
  }
}

async function callProvider(
  provider: string, apiKey: string, model: string,
  input: AiInput, maxTokens: number
): Promise<string> {
  switch (provider) {
    case 'typhoon': return callTyphoon(apiKey, model, input, maxTokens)
    case 'gemini':  return callGemini(apiKey, model, input, maxTokens)
    case 'claude':  return callClaude(apiKey, model, input, maxTokens)
    default: throw new Error(`ไม่รู้จัก provider: ${provider}`)
  }
}

// ─────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const text     = form.get('text') as string | null
    const file     = form.get('file') as File | null
    const provider = (form.get('provider') as string | null) ?? 'typhoon'
    const apiKey   = (form.get('apiKey') as string | null) ?? ''
    const model    = (form.get('model') as string | null) ?? ''

    if (!text && !file) {
      return NextResponse.json({ error: 'ไม่พบข้อมูล TOR กรุณาวางข้อความหรืออัปโหลดไฟล์' }, { status: 400 })
    }
    if (!apiKey.trim()) {
      return NextResponse.json(
        { error: 'กรุณาใส่ API Key ก่อนวิเคราะห์ — กดที่กล่องตั้งค่า AI Provider ด้านบน' },
        { status: 400 }
      )
    }

    const supportsNativePdf = provider === 'gemini' || provider === 'claude'

    let aiInput: AiInput
    let charCountForLog = 0

    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (supportsNativePdf) {
        // ส่ง PDF ดิบให้ AI อ่านเอง — รองรับทั้ง PDF ข้อความและ PDF ที่สแกนมาเป็นภาพ
        console.log(`[TOR] Sending PDF directly to ${provider} (native vision): ${file.name} (${buffer.length} bytes)`)
        const base64 = buffer.toString('base64')
        aiInput = { kind: 'pdf', base64, filename: file.name }
        charCountForLog = buffer.length
      } else {
        // Typhoon: ต้อง extract ข้อความก่อน (ใช้ไม่ได้กับ PDF สแกน)
        console.log(`[TOR] Extracting PDF text for Typhoon: ${file.name} (${buffer.length} bytes)`)
        let extracted = ''
        try {
          extracted = await extractPdfText(buffer)
        } catch (err) {
          console.error('[TOR] PDF text extraction failed:', err)
        }
        if (extracted.length < 50) {
          return NextResponse.json(
            {
              error:
                'Typhoon ไม่สามารถอ่านไฟล์ PDF นี้ได้ (อาจเป็น PDF ที่สแกนเป็นภาพ) ' +
                'กรุณาเปลี่ยนไปใช้ Gemini หรือ Claude ซึ่งอ่าน PDF สแกนได้โดยตรง หรือ copy ข้อความมาวางใน textarea แทนครับ',
            },
            { status: 400 }
          )
        }
        console.log(`[TOR] PDF text extracted: ${extracted.length} chars`)
        aiInput = { kind: 'text', content: extracted }
        charCountForLog = extracted.length
      }
    } else if (file) {
      // ไฟล์ .txt หรืออื่นๆ ที่ไม่ใช่ PDF
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const content = buffer.toString('utf-8')
      if (content.length < 50) {
        return NextResponse.json(
          { error: `เนื้อหาสั้นเกินไป (${content.length} ตัวอักษร) กรุณาวาง TOR ให้ครบถ้วนกว่านี้ครับ` },
          { status: 400 }
        )
      }
      aiInput = { kind: 'text', content }
      charCountForLog = content.length
    } else {
      const content = (text ?? '').trim()
      if (content.length < 50) {
        return NextResponse.json(
          { error: `เนื้อหาสั้นเกินไป (${content.length} ตัวอักษร) กรุณาวาง TOR ให้ครบถ้วนกว่านี้ครับ` },
          { status: 400 }
        )
      }
      aiInput = { kind: 'text', content }
      charCountForLog = content.length
    }

    console.log(`[TOR] Provider: ${provider}, Model: ${model}, Input kind: ${aiInput.kind}, size: ${charCountForLog}`)

    // ── เรียก AI พร้อม retry ──
    // ถ้าเป็น PDF native (Gemini/Claude) ลองครั้งเดียวด้วย token เต็ม เพราะตัดเนื้อหาไม่ได้
    // ถ้าเป็น text จะลด content+token ลงเรื่อยๆ เมื่อ timeout
    let raw = ''
    let lastError = ''

    if (aiInput.kind === 'pdf') {
      try {
        raw = await callProvider(provider, apiKey, model, aiInput, 8000)
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        if (lastError.includes('401') || lastError.includes('403') || lastError.includes('API_KEY_INVALID')) {
          return NextResponse.json({ error: `API Key ไม่ถูกต้องสำหรับ ${provider} กรุณาตรวจสอบ Key อีกครั้งครับ` }, { status: 401 })
        }
        throw err
      }
    } else {
      const fullText = aiInput.content
      const attempts = [
        { text: fullText.slice(0, 8_000), maxTokens: 8000 },
        { text: fullText.slice(0, 5_000), maxTokens: 6000 },
        { text: fullText.slice(0, 3_000), maxTokens: 4000 },
      ]
      for (const attempt of attempts) {
        try {
          console.log(`[TOR] Trying ${attempt.text.length} chars, ${attempt.maxTokens} tokens via ${provider}...`)
          raw = await callProvider(provider, apiKey, model, { kind: 'text', content: attempt.text }, attempt.maxTokens)
          if (raw) break
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err)
          console.warn(`[TOR] Attempt failed: ${lastError}`)
          if (lastError.includes('401') || lastError.includes('403') || lastError.includes('API_KEY_INVALID')) {
            return NextResponse.json({ error: `API Key ไม่ถูกต้องสำหรับ ${provider} กรุณาตรวจสอบ Key อีกครั้งครับ` }, { status: 401 })
          }
          if (!lastError.includes('408') && !lastError.includes('abort') && !lastError.includes('timed out') && !lastError.includes('429')) {
            throw err
          }
        }
      }
    }

    if (!raw) {
      throw new Error(`วิเคราะห์ไม่สำเร็จ: ${lastError}`)
    }

    raw = cleanJson(raw)

    let result: TorAnalysisResult
    try {
      result = JSON.parse(raw)
    } catch {
      console.error('[TOR] JSON parse failed. Raw (first 800):', raw.slice(0, 800))
      throw new Error('AI ตอบกลับ JSON ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
    }

    return NextResponse.json({ result })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[TOR Analyze Error]', message)

    if (message.includes('abort') || message.includes('timed out') || message.includes('408')) {
      return NextResponse.json({ error: 'AI ใช้เวลานานเกินไป กรุณาลองอีกครั้งครับ' }, { status: 408 })
    }
    if (message.includes('429')) {
      return NextResponse.json({ error: 'เกินโควต้าการใช้งาน (Rate Limit) กรุณารอสักครู่แล้วลองใหม่ครับ' }, { status: 429 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
