import { cameraPresets, useBrainStore } from '@/store/brainStore'
import type { BrainViewMode, PanelMode } from '@/types/brain'

const viewModes: Array<{ id: BrainViewMode; label: string }> = [
  { id: 'both', label: 'Both' },
  { id: 'surface', label: 'Surface' },
  { id: 'deep', label: 'Deep' },
]

const panelModes: Array<{ id: PanelMode; label: string }> = [
  { id: 'learn', label: 'Learn' },
  { id: 'quiz', label: 'Quiz' },
]

function AtlasControls() {
  const viewMode = useBrainStore((state) => state.viewMode)
  const cameraPresetId = useBrainStore((state) => state.cameraPresetId)
  const panelMode = useBrainStore((state) => state.panelMode)
  const setViewMode = useBrainStore((state) => state.setViewMode)
  const setCameraPresetId = useBrainStore((state) => state.setCameraPresetId)
  const setPanelMode = useBrainStore((state) => state.setPanelMode)

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
      <div className="flex flex-wrap gap-3 pointer-events-auto">
        <div className="rounded border border-slate-300 bg-white p-1 shadow-sm">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`rounded px-3 py-2 text-sm font-medium transition ${
                viewMode === mode.id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setViewMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="rounded border border-slate-300 bg-white p-1 shadow-sm">
          {panelModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`rounded px-3 py-2 text-sm font-medium transition ${
                panelMode === mode.id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setPanelMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-1 rounded border border-slate-300 bg-white p-1 shadow-sm pointer-events-auto">
        {cameraPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`rounded px-3 py-2 text-sm font-medium transition ${
              cameraPresetId === preset.id ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setCameraPresetId(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default AtlasControls
