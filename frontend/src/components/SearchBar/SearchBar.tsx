import { searchRegions, useBrainStore } from '@/store/brainStore'

function SearchBar() {
  const query = useBrainStore((state) => state.searchQuery)
  const selectedRegionId = useBrainStore((state) => state.selectedRegionId)
  const setQuery = useBrainStore((state) => state.setSearchQuery)
  const setSelectedRegionId = useBrainStore((state) => state.setSelectedRegionId)
  const results = searchRegions(query).slice(0, 6)

  return (
    <div className="absolute top-4 left-4 z-10 w-[28rem] max-w-[calc(100vw-2rem)]">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search brain regions or functions..."
        className="w-full rounded border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      />
      {results.length > 0 && (
        <div className="mt-2 max-h-80 overflow-y-auto rounded border border-slate-200 bg-white shadow-lg">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              className={`block w-full px-4 py-3 text-left hover:bg-slate-100 ${
                selectedRegionId === result.id ? 'bg-sky-50' : ''
              }`}
              onClick={() => {
                setSelectedRegionId(result.id)
                setQuery(result.name)
              }}
            >
              <span className="block text-sm font-semibold text-slate-950">{result.name}</span>
              <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-600">{result.summary}</span>
            </button>
          ))}
        </div>
      )}
      {query.trim().length > 1 && results.length === 0 && (
        <div className="mt-2 rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-lg">
          No matching regions yet.
        </div>
      )}
    </div>
  )
}

export default SearchBar
