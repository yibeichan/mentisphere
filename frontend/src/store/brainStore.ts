import { create } from 'zustand'
import { brainRegions, regionById } from '@/data/regions'
import type { BrainRegion } from '@/types/brain'

type ViewMode = 'surface' | 'deep' | 'both'

interface BrainState {
  regions: BrainRegion[]
  selectedRegionId: string | null
  hoveredRegionId: string | null
  searchQuery: string
  viewMode: ViewMode
  setSelectedRegionId: (regionId: string | null) => void
  setHoveredRegionId: (regionId: string | null) => void
  setSearchQuery: (query: string) => void
  setViewMode: (viewMode: ViewMode) => void
}

export const useBrainStore = create<BrainState>((set) => ({
  regions: brainRegions,
  selectedRegionId: null,
  hoveredRegionId: null,
  searchQuery: '',
  viewMode: 'both',
  setSelectedRegionId: (selectedRegionId) => set({ selectedRegionId }),
  setHoveredRegionId: (hoveredRegionId) => set({ hoveredRegionId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setViewMode: (viewMode) => set({ viewMode }),
}))

export function getRegion(regionId: string | null): BrainRegion | null {
  if (!regionId) {
    return null
  }

  return regionById.get(regionId) ?? null
}

export function searchRegions(query: string): BrainRegion[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery.length < 2) {
    return []
  }

  return brainRegions.filter((region) => {
    const searchableText = [
      region.name,
      region.category,
      region.hemisphere,
      region.summary,
      ...region.functions,
      ...region.searchTerms,
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedQuery)
  })
}
