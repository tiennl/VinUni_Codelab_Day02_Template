export type Answers = Record<string, string | string[]>

export interface Option {
  value: string
  label: string
}

export interface Step {
  id: string
  type: 'single' | 'multi'
  question: string
  hint?: string | null
  options: Option[]
}

export interface Progress {
  current: number
  total: number
}

export interface QuestionResponse {
  type: 'question'
  progress: Progress
  step: Step
}

export interface Listing {
  id: string
  name: string
  subdivision: string
  price_label: string
  area_m2: number
  bedrooms: number
  bathrooms: number
  image_url: string | null
  match_score: number
  reasons: string[]
  detail_url: string | null
}

export interface ResultsResponse {
  type: 'results'
  summary: string
  listings: Listing[]
}

export type ChatResponse = QuestionResponse | ResultsResponse
