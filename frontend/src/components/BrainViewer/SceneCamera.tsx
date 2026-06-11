import { useEffect, useMemo, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Vector3 } from 'three'
import { cameraPresets, useBrainStore } from '@/store/brainStore'

// Distance the camera sits in front of the focused target when orbiting freely.
const FREE_FOCUS_OFFSET = new Vector3(0, 0, 92)

function SceneCamera() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const camera = useThree((state) => state.camera)
  const cameraPresetId = useBrainStore((state) => state.cameraPresetId)
  const cameraTarget = useBrainStore((state) => state.cameraTarget)
  const selectedTarget = useMemo(() => new Vector3(), [])
  const desiredPosition = useMemo(() => new Vector3(), [])
  const desiredTarget = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const preset = cameraPresets.find((candidate) => candidate.id === cameraPresetId) ?? cameraPresets[0]
    desiredPosition.fromArray(preset.position)
    desiredTarget.fromArray(cameraPresetId === 'free' ? cameraTarget : preset.target)
  }, [cameraPresetId, cameraTarget, desiredPosition, desiredTarget])

  useFrame((_, delta) => {
    const focusTarget = cameraPresetId === 'free' ? selectedTarget.fromArray(cameraTarget) : desiredTarget
    const nextPosition =
      cameraPresetId === 'free' ? desiredPosition.copy(focusTarget).add(FREE_FOCUS_OFFSET) : desiredPosition
    const lerpAmount = Math.min(1, delta * 3.6)

    camera.position.lerp(nextPosition, lerpAmount)

    if (controlsRef.current) {
      controlsRef.current.target.lerp(focusTarget, lerpAmount)
      controlsRef.current.update()
    }
  })

  return <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate minDistance={42} maxDistance={240} />
}

export default SceneCamera
