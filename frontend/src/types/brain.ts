export type RegionCategory =
  | 'cortical'
  | 'subcortical'
  | 'white-matter'
  | 'cerebellar'
  | 'brainstem'

export type Hemisphere = 'left' | 'right' | 'bilateral' | 'midline'
export type BrainViewMode = 'surface' | 'deep' | 'both'
export type CameraPresetId = 'free' | 'left' | 'right' | 'superior' | 'anterior' | 'posterior'
export type PanelMode = 'learn' | 'quiz'

export interface RegionCitation {
  id: string
  label: string
  sourceType: 'anatomy-reference' | 'review' | 'meta-analysis' | 'atlas-documentation'
}

export interface BrainRegion {
  id: string
  name: string
  category: RegionCategory
  hemisphere: Hemisphere
  summary: string
  functions: string[]
  nearbyRegionIds: string[]
  searchTerms: string[]
  citations: RegionCitation[]
  color: string
  position: [number, number, number]
  scale: [number, number, number]
}

export interface CameraPreset {
  id: CameraPresetId
  label: string
  position: [number, number, number]
  target: [number, number, number]
}

export interface QuizFeedback {
  selectedRegionId: string
  targetRegionId: string
  isCorrect: boolean
}
