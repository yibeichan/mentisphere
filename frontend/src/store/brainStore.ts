import { create } from 'zustand'
import { brainRegions, regionById } from '@/data/regions'
import type { BrainRegion, BrainViewMode, CameraPreset, CameraPresetId, PanelMode, QuizFeedback } from '@/types/brain'

export const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, -4, -4]

export const cameraPresets: CameraPreset[] = [
  { id: 'free', label: 'Free', position: [0, 0, 145], target: DEFAULT_CAMERA_TARGET },
  { id: 'left', label: 'Left', position: [-145, 0, 10], target: DEFAULT_CAMERA_TARGET },
  { id: 'right', label: 'Right', position: [145, 0, 10], target: DEFAULT_CAMERA_TARGET },
  { id: 'superior', label: 'Top', position: [0, 145, 20], target: DEFAULT_CAMERA_TARGET },
  { id: 'anterior', label: 'Front', position: [0, 38, 145], target: DEFAULT_CAMERA_TARGET },
  { id: 'posterior', label: 'Back', position: [0, -120, 96], target: DEFAULT_CAMERA_TARGET },
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
  cameraTarget: DEFAULT_CAMERA_TARGET,
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
        cameraTarget: selectedRegion ? selectedRegion.position : DEFAULT_CAMERA_TARGET,
      }
    }),
  setHoveredRegionId: (hoveredRegionId) => set({ hoveredRegionId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setViewMode: (viewMode) => set({ viewMode }),
  setCameraPresetId: (cameraPresetId) => set({ cameraPresetId }),
  setPanelMode: (panelMode) =>
    // Quiz targets span every category, so force the full view to keep them clickable
    // regardless of the surface/deep filter the user last picked.
    set(panelMode === 'quiz' ? { panelMode, viewMode: 'both' } : { panelMode }),
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
        cameraTarget: DEFAULT_CAMERA_TARGET,
      }
    }),
  resetQuiz: () =>
    set({
      quizTargetRegionId: quizRegionIds[0],
      quizAnsweredCount: 0,
      quizCorrectCount: 0,
      quizFeedback: null,
      selectedRegionId: null,
      cameraTarget: DEFAULT_CAMERA_TARGET,
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
