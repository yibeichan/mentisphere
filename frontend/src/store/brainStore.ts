import { create } from 'zustand'
import { brainRegions, regionById } from '@/data/regions'
import type { BrainRegion, BrainViewMode, CameraPreset, CameraPresetId, PanelMode, QuizFeedback } from '@/types/brain'

export const cameraPresets: CameraPreset[] = [
  { id: 'free', label: 'Free', position: [0, 0, 145], target: [0, -4, -4] },
  { id: 'left', label: 'Left', position: [-145, 0, 10], target: [0, -4, -4] },
  { id: 'right', label: 'Right', position: [145, 0, 10], target: [0, -4, -4] },
  { id: 'superior', label: 'Top', position: [0, 145, 20], target: [0, -4, -4] },
  { id: 'anterior', label: 'Front', position: [0, 38, 145], target: [0, -4, -4] },
  { id: 'posterior', label: 'Back', position: [0, -120, 96], target: [0, -4, -4] },
]

const quizRegionIds = ['hippocampus', 'amygdala', 'thalamus', 'basal-ganglia', 'insula', 'cerebellum']

interface BrainState {
  regions: BrainRegion[]
  selectedRegionId: string | null
  hoveredRegionId: string | null
  searchQuery: string
  viewMode: BrainViewMode
  cameraPresetId: CameraPresetId
  cameraTarget: [number, number, number]
  panelMode: PanelMode
  quizTargetRegionId: string
  quizAnsweredCount: number
  quizCorrectCount: number
  quizFeedback: QuizFeedback | null
  setSelectedRegionId: (regionId: string | null) => void
  setHoveredRegionId: (regionId: string | null) => void
  setSearchQuery: (query: string) => void
  setViewMode: (viewMode: BrainViewMode) => void
  setCameraPresetId: (cameraPresetId: CameraPresetId) => void
  setPanelMode: (panelMode: PanelMode) => void
  answerQuiz: (selectedRegionId: string) => void
  nextQuizPrompt: () => void
  resetQuiz: () => void
}

export const useBrainStore = create<BrainState>((set) => ({
  regions: brainRegions,
  selectedRegionId: null,
  hoveredRegionId: null,
  searchQuery: '',
  viewMode: 'both',
  cameraPresetId: 'free',
  cameraTarget: [0, -4, -4],
  panelMode: 'learn',
  quizTargetRegionId: quizRegionIds[0],
  quizAnsweredCount: 0,
  quizCorrectCount: 0,
  quizFeedback: null,
  setSelectedRegionId: (selectedRegionId) =>
    set(() => {
      const selectedRegion = getRegion(selectedRegionId)

      return {
        selectedRegionId,
        cameraTarget: selectedRegion ? selectedRegion.position : [0, -4, -4],
      }
    }),
  setHoveredRegionId: (hoveredRegionId) => set({ hoveredRegionId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setViewMode: (viewMode) => set({ viewMode }),
  setCameraPresetId: (cameraPresetId) => set({ cameraPresetId }),
  setPanelMode: (panelMode) => set({ panelMode }),
  answerQuiz: (selectedRegionId) =>
    set((state) => {
      if (state.quizFeedback) {
        return {}
      }

      const isCorrect = selectedRegionId === state.quizTargetRegionId
      const selectedRegion = getRegion(selectedRegionId)

      return {
        selectedRegionId,
        cameraTarget: selectedRegion ? selectedRegion.position : state.cameraTarget,
        quizAnsweredCount: state.quizAnsweredCount + 1,
        quizCorrectCount: state.quizCorrectCount + (isCorrect ? 1 : 0),
        quizFeedback: {
          selectedRegionId,
          targetRegionId: state.quizTargetRegionId,
          isCorrect,
        },
      }
    }),
  nextQuizPrompt: () =>
    set((state) => {
      const currentIndex = quizRegionIds.indexOf(state.quizTargetRegionId)
      const nextIndex = (currentIndex + 1) % quizRegionIds.length

      return {
        quizTargetRegionId: quizRegionIds[nextIndex],
        quizFeedback: null,
        selectedRegionId: null,
        cameraTarget: [0, -4, -4],
      }
    }),
  resetQuiz: () =>
    set({
      quizTargetRegionId: quizRegionIds[0],
      quizAnsweredCount: 0,
      quizCorrectCount: 0,
      quizFeedback: null,
      selectedRegionId: null,
      cameraTarget: [0, -4, -4],
    }),
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
