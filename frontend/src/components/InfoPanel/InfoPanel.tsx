import { getRegion, useBrainStore } from '@/store/brainStore'

function InfoPanel() {
  const regions = useBrainStore((state) => state.regions)
  const selectedRegionId = useBrainStore((state) => state.selectedRegionId)
  const setSelectedRegionId = useBrainStore((state) => state.setSelectedRegionId)
  const selectedRegion = getRegion(selectedRegionId)

  return (
    <aside className="w-96 bg-slate-50 border-l border-slate-200 p-6 overflow-y-auto">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interactive Atlas</p>
        <h2 className="text-2xl font-bold text-slate-950">Region Information</h2>
      </div>

      {selectedRegion ? (
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">{selectedRegion.name}</h3>
                <p className="mt-1 text-sm capitalize text-slate-500">
                  {selectedRegion.category.replace('-', ' ')} · {selectedRegion.hemisphere}
                </p>
              </div>
              <span
                className="mt-1 h-4 w-4 shrink-0 rounded-full border border-slate-300"
                style={{ backgroundColor: selectedRegion.color }}
                aria-label={`${selectedRegion.name} color swatch`}
              />
            </div>
            <p className="text-sm leading-6 text-slate-700 mt-4">{selectedRegion.summary}</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Associated Functions</h4>
            <ul className="space-y-2">
              {selectedRegion.functions.map((func) => (
                <li key={func} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  {func}
                </li>
              ))}
            </ul>
          </div>

          {selectedRegion.nearbyRegionIds.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Nearby / Related</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRegion.nearbyRegionIds.map((regionId) => {
                  const relatedRegion = regions.find((region) => region.id === regionId)

                  if (!relatedRegion) {
                    return null
                  }

                  return (
                    <button
                      key={regionId}
                      type="button"
                      className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-slate-500 hover:text-slate-950"
                      onClick={() => setSelectedRegionId(regionId)}
                    >
                      {relatedRegion.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Sources</h4>
            <ul className="space-y-2">
              {selectedRegion.citations.map((citation) => (
                <li key={citation.id} className="text-xs leading-5 text-slate-600">
                  <span className="font-medium text-slate-800">{citation.label}</span>
                  <span className="block capitalize text-slate-500">{citation.sourceType.replace('-', ' ')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded border border-dashed border-slate-300 bg-white p-4">
          <p className="text-sm leading-6 text-slate-600">
            Click a 3D region or choose a search result to inspect anatomy, associated functions, related regions, and
            citations.
          </p>
        </div>
      )}
    </aside>
  )
}

export default InfoPanel
