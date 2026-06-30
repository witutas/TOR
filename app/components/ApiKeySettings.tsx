'use client'
// app/components/ApiKeySettings.tsx — เลือก Provider + ใส่ API Key เอง
import { useState, useEffect } from 'react'
import { Key, Eye, EyeOff, ExternalLink, Check, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { PROVIDERS, getProvider, LS_PROVIDER, LS_API_KEY, LS_MODEL } from '../lib/providers'

interface Props {
  providerId: string
  apiKey: string
  model: string
  onChange: (providerId: string, apiKey: string, model: string) => void
}

export function ApiKeySettings({ providerId, apiKey, model, onChange }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showKey, setShowKey]   = useState(false)
  const provider = getProvider(providerId)

  function selectProvider(id: string) {
    const p = getProvider(id)
    const savedKey   = localStorage.getItem(LS_API_KEY + id) ?? ''
    const savedModel = localStorage.getItem(LS_MODEL + id) ?? p.models[0].id
    localStorage.setItem(LS_PROVIDER, id)
    onChange(id, savedKey, savedModel)
  }

  function selectModel(m: string) {
    localStorage.setItem(LS_MODEL + providerId, m)
    onChange(providerId, apiKey, m)
  }

  function updateKey(k: string) {
    localStorage.setItem(LS_API_KEY + providerId, k)
    onChange(providerId, k, model)
  }

  const hasKey = apiKey.trim().length > 0

  return (
    <div className="bg-bg-surface border border-white/[0.07] rounded-xl overflow-hidden mb-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
          style={{ background: `${provider.color}18`, border: `1px solid ${provider.color}30` }}>
          {provider.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[12px] font-semibold text-gray-200">{provider.name}</p>
            {hasKey ? (
              <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald/15 text-emerald">
                <Check size={9} /> พร้อมใช้
              </span>
            ) : (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber/15 text-amber">
                ยังไม่ใส่ Key
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-600 truncate">
            {provider.models.find(m => m.id === model)?.label ?? provider.models[0].label}
          </p>
        </div>
        <ChevronDown size={14} className={clsx('text-gray-600 transition-transform flex-shrink-0', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] animate-fade-in space-y-4">

          {/* เลือก Provider */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600 mb-2">เลือก AI Provider</p>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectProvider(p.id)}
                  className={clsx(
                    'flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-center transition-all',
                    p.id === providerId
                      ? 'border-2'
                      : 'border-white/[0.08] hover:border-white/[0.15] bg-bg-raised'
                  )}
                  style={p.id === providerId ? { borderColor: p.color, background: `${p.color}10` } : undefined}
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span className="text-[10px] font-semibold text-gray-300">{p.name.split(' ')[0]}</span>
                  {p.models.some(m => m.free) && (
                    <span className="text-[8px] font-bold text-emerald">ฟรี</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* เลือก Model */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600 mb-2">เลือกโมเดล</p>
            <div className="flex flex-col gap-1.5">
              {provider.models.map(m => (
                <button
                  key={m.id}
                  onClick={() => selectModel(m.id)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all',
                    m.id === model
                      ? 'bg-white/[0.04]'
                      : 'border-white/[0.06] hover:border-white/[0.12] bg-bg-raised'
                  )}
                  style={m.id === model ? { borderColor: provider.color } : undefined}
                >
                  <div>
                    <p className="text-[11px] font-medium text-gray-200">{m.label}</p>
                    {m.note && <p className="text-[9px] text-gray-600">{m.note}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.free && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald/15 text-emerald">FREE</span>
                    )}
                    {m.id === model && <Check size={12} style={{ color: provider.color }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600">API Key ของคุณ</p>
              <a
                href={provider.getKeyUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[9px] font-semibold hover:underline"
                style={{ color: provider.color }}
              >
                รับ API Key ฟรี <ExternalLink size={9} />
              </a>
            </div>
            <div className="relative">
              <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => updateKey(e.target.value)}
                placeholder={provider.keyPlaceholder}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-bg-raised border border-white/[0.08] text-[12px] font-mono text-gray-200 placeholder-gray-700 outline-none focus:border-brand/40 transition-colors"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <p className="text-[9px] text-gray-700 mt-1.5">
              🔒 Key ถูกเก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น ไม่ส่งไปเก็บที่เซิร์ฟเวอร์อื่น
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
