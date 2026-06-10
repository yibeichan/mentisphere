import { useEffect, useMemo, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Vector3 } from 'three'
import { cameraPresets, useBrainStore } from '@/store/brainStore'

function SceneCamera() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const camera = useThree((state) => state.camera)
  const cameraPresetId = useBrainStore((state) => state.cameraPresetId)
  const cameraTarget = useBrainStore((state) => state.cameraTarget)
  const targetVector = useMemo(() => new Vector3(), [])
  const desiredPosition = useMemo(() => new Vector3(), [])
  const desiredTarget = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const preset = cameraPresets.find((candidate) => candidate.id === cameraPresetId) ?? cameraPresets[0]
    desiredPosition.fromArray(preset.position)
    desiredTarget.fromArray(cameraPresetId === 'free' ? cameraTarget : preset.target)
  }, [cameraPresetId, cameraTarget, desiredPosition, desiredTarget])

  useFrame((_, delta) => {
    const selectedTarget = cameraPresetId === 'free' ? targetVector.fromArray(cameraTarget) : desiredTarget
    const focusOffset = cameraPresetId === 'free' ? targetVector.fromArray([0, 0, 92]) : desiredPosition
    const nextPosition =
      cameraPresetId === 'free' ? desiredPosition.copy(selectedTarget).add(focusOffset) : desiredPosition
    const lerpAmount = Math.min(1, delta * 3.6)

    camera.position.lerp(nextPosition, lerpAmount)

    if (controlsRef.current) {
      controlsRef.current.target.lerp(selectedTarget, lerpAmount)
      controlsRef.current.update()
    }
  })

  return <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate minDistance={42} maxDistance={240} />
}

export default SceneCamera
