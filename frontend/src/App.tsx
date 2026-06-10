import { Canvas } from '@react-three/fiber'
import BrainViewer from './components/BrainViewer/BrainViewer'
import SceneCamera from './components/BrainViewer/SceneCamera'
import AtlasControls from './components/Controls/AtlasControls'
import InfoPanel from './components/InfoPanel/InfoPanel'
import QuizPanel from './components/QuizPanel/QuizPanel'
import SearchBar from './components/SearchBar/SearchBar'
import { useBrainStore } from './store/brainStore'

function App() {
  const panelMode = useBrainStore((state) => state.panelMode)

  return (
    <div className="w-full h-screen flex bg-slate-100 text-slate-950">
      <main className="flex-1 relative min-w-0">
        <SearchBar />
        <AtlasControls />
        <Canvas camera={{ position: [0, 0, 145], fov: 45 }}>
          <color attach="background" args={['#eef2f7']} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[40, 50, 60]} intensity={1.1} />
          <directionalLight position={[-30, -20, 40]} intensity={0.35} />
          <BrainViewer />
          <SceneCamera />
        </Canvas>
      </main>
      {panelMode === 'learn' ? <InfoPanel /> : <QuizPanel />}
    </div>
  )
}

export default App
