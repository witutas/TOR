// app/lib/providers.ts
export interface ModelOption {
  id: string
  label: string
  free: boolean
  note?: string
}

export interface ProviderConfig {
  id: 'typhoon' | 'gemini' | 'claude'
  name: string
  emoji: string
  models: ModelOption[]
  keyPlaceholder: string
  getKeyUrl: string
  color: string // accent color hex
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'typhoon',
    name: 'Typhoon AI',
    emoji: '🌪️',
    color: '#6c63ff',
    keyPlaceholder: 'sk-...',
    getKeyUrl: 'https://playground.opentyphoon.ai',
    models: [
      { id: 'typhoon-v2.5-30b-a3b-instruct', label: 'Typhoon v2.5 30B', free: true, note: 'แนะนำ · ภาษาไทยเก่ง' },
      { id: 'typhoon-v2.1-12b-instruct',     label: 'Typhoon v2.1 12B', free: true, note: 'เร็วกว่า' },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    emoji: '✨',
    color: '#4285f4',
    keyPlaceholder: 'AIza...',
    getKeyUrl: 'https://aistudio.google.com/apikey',
    models: [
      { id: 'gemini-2.0-flash',     label: 'Gemini 2.0 Flash',     free: true, note: 'ฟรี · เร็ว' },
      { id: 'gemini-1.5-flash',     label: 'Gemini 1.5 Flash',     free: true, note: 'ฟรี' },
      { id: 'gemini-1.5-pro',       label: 'Gemini 1.5 Pro',       free: true, note: 'ฟรี (จำกัดโควต้า)' },
    ],
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    emoji: '🤖',
    color: '#d97757',
    keyPlaceholder: 'sk-ant-...',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-sonnet-4-6',  label: 'Claude Sonnet 4.6', free: false, note: 'เก่งสุด' },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', free: false, note: 'เร็ว & ถูก' },
    ],
  },
]

export function getProvider(id: string) {
  return PROVIDERS.find(p => p.id === id) ?? PROVIDERS[0]
}

// localStorage keys
export const LS_PROVIDER = 'tor_analyzer_provider'
export const LS_API_KEY  = 'tor_analyzer_api_key_'  // + providerId
export const LS_MODEL    = 'tor_analyzer_model_'    // + providerId
