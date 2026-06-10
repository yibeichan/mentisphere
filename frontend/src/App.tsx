import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import BrainViewer from './components/BrainViewer/BrainViewer'
import InfoPanel from './components/InfoPanel/InfoPanel'
import SearchBar from './components/SearchBar/SearchBar'
import { useBrainStore } from './store/brainStore'

function App() {
  const viewMode = useBrainStore((state) => state.viewMode)
  const setViewMode = useBrainStore((state) => state.setViewMode)
  const viewModes = [
    { id: 'both', label: 'Both' },
    { id: 'surface', label: 'Surface' },
    { id: 'deep', label: 'Deep' },
  ] as const

  return (
    <div className="w-full h-screen flex bg-slate-100 text-slate-950">
      <main className="flex-1 relative min-w-0">
        <SearchBar />
        <div className="absolute bottom-4 left-4 z-10 flex rounded border border-slate-300 bg-white p-1 shadow-sm">
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
        <Canvas camera={{ position: [0, 0, 145], fov: 45 }}>
          <color attach="background" args={['#eef2f7']} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[40, 50, 60]} intensity={1.1} />
          <directionalLight position={[-30, -20, 40]} intensity={0.35} />
          <BrainViewer />
          <OrbitControls enablePan enableZoom enableRotate minDistance={70} maxDistance={240} />
        </Canvas>
      </main>
      <InfoPanel />
    </div>
  )
}

export default App
