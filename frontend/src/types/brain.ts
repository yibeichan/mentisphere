export type RegionCategory =
  | 'cortical'
  | 'subcortical'
  | 'white-matter'
  | 'cerebellar'
  | 'brainstem'

export type Hemisphere = 'left' | 'right' | 'bilateral' | 'midline'

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
