// app/lib/types.ts

export interface TorTimeline {
  kickoff_date: string
  duration_months: number
  total_installments: number
  go_live_target: string
}

export interface TorCompliance {
  security_requirements: string[]
  concurrent_users_target: string
}

export interface TorProjectOverview {
  project_name: string
  description: string
  budget_thb?: string
  objective: string
  scope: string
  stakeholders: string[]
  timeline: TorTimeline
  compliance_and_targets: TorCompliance
}

export interface TorMetrics {
  total_systems: number
  total_modules: number
  total_external_apis: number
  total_phases: number
  total_sprints: number
  total_tasks: number
  total_mandays?: number
  estimated_budget_thb?: string
}

export interface TorModule {
  module_code: string
  module_name: string
  tor_reference: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  estimated_days: number
  implementation_details: string[]
  acceptance_criteria: string[]
  risks: string[]
  dependencies: string[]
}

export interface TorSystem {
  system_id: string
  system_name: string
  system_type: 'Frontend' | 'Backend' | 'Database' | 'Infrastructure' | 'Integration' | 'Mobile'
  suggested_tech_stack: string
  architecture_pattern: string
  deployment_target: string
  modules: TorModule[]
}

export interface TorExternalApi {
  api_name: string
  purpose: string
  associated_module_code: string
  security_protocol: string
  integration_type: 'REST' | 'SOAP' | 'GraphQL' | 'WebSocket' | 'SDK' | 'Other'
  data_flow: string
  sla_requirement: string
}

export interface TorDailyTask {
  day: number
  date_offset: string  // e.g. "วันที่ 1 (สัปดาห์ที่ 1)"
  tasks: string[]
  deliverables: string[]
  assignee_role: string
}

export interface TorSprint {
  sprint_number: number
  duration_weeks: number
  start_week: number
  end_week: number
  focus: string
  goals: string[]
  associated_module_codes: string[]
  daily_schedule: TorDailyTask[]
  definition_of_done: string[]
  risks: string[]
}

export interface TorPhase {
  phase_number: number
  phase_name: string
  duration_weeks: number
  installment_number: number
  deliverables: string[]
  payment_percentage: number
  key_milestones: string[]
}

export interface TorRisk {
  risk_id: string
  description: string
  probability: 'High' | 'Medium' | 'Low'
  impact: 'High' | 'Medium' | 'Low'
  mitigation: string
}

export interface TorQuotationItem {
  item_code: string
  description: string
  category: 'Development' | 'Design' | 'Infrastructure' | 'License' | 'Training' | 'Support'
  quantity: number
  unit: string
  unit_price: number
  total_price: number
}

export interface TorQuotation {
  quotation_number: string
  quotation_date: string
  valid_until: string
  company_name: string
  project_name: string
  contact_person: string
  items: TorQuotationItem[]
  subtotal: number
  vat_percentage: number
  vat_amount: number
  grand_total: number
  payment_terms: string[]
  notes: string[]
}

export interface TorAnalysisResult {
  project_overview: TorProjectOverview
  metrics: TorMetrics
  systems: TorSystem[]
  external_apis: TorExternalApi[]
  sprint_backlog: TorSprint[]
  phases: TorPhase[]
  risks: TorRisk[]
  quotation: TorQuotation
}

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'
export type NavPage = 'upload' | 'overview' | 'systems' | 'apis' | 'sprints' | 'json' | 'quotation'
