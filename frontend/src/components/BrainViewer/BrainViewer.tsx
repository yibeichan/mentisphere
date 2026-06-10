import { useMemo, useRef } from 'react'
import { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useBrainStore } from '@/store/brainStore'
import type { BrainRegion } from '@/types/brain'

interface BrainViewerProps {
  atlasId?: string
}

interface RegionMeshProps {
  region: BrainRegion
}

function BrainContextShell() {
  return (
    <group>
      <mesh position={[-18, -4, 0]} scale={[38, 55, 30]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial color="#dbe4ee" opacity={0.13} transparent roughness={0.8} />
      </mesh>
      <mesh position={[18, -4, 0]} scale={[38, 55, 30]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial color="#dbe4ee" opacity={0.13} transparent roughness={0.8} />
      </mesh>
      <mesh position={[0, -50, -22]} scale={[24, 13, 12]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color="#c9c4e2" opacity={0.18} transparent roughness={0.8} />
      </mesh>
      <Text position={[0, 48, 38]} fontSize={4} color="#475569" anchorX="center">
        Anterior
      </Text>
      <Text position={[0, -66, 38]} fontSize={4} color="#475569" anchorX="center">
        Posterior
      </Text>
      <Text position={[-52, -4, 34]} fontSize={3.8} color="#64748b" anchorX="center">
        Left
      </Text>
      <Text position={[52, -4, 34]} fontSize={3.8} color="#64748b" anchorX="center">
        Right
      </Text>
    </group>
  )
}

function RegionMesh({ region }: RegionMeshProps) {
  const meshRef = useRef<Mesh>(null)
  const selectedRegionId = useBrainStore((state) => state.selectedRegionId)
  const hoveredRegionId = useBrainStore((state) => state.hoveredRegionId)
  const panelMode = useBrainStore((state) => state.panelMode)
  const quizFeedback = useBrainStore((state) => state.quizFeedback)
  const setSelectedRegionId = useBrainStore((state) => state.setSelectedRegionId)
  const setHoveredRegionId = useBrainStore((state) => state.setHoveredRegionId)
  const answerQuiz = useBrainStore((state) => state.answerQuiz)
  const isSelected = selectedRegionId === region.id
  const isHovered = hoveredRegionId === region.id
  const isQuizTarget = quizFeedback?.targetRegionId === region.id
  const isWrongQuizSelection = quizFeedback?.selectedRegionId === region.id && !quizFeedback.isCorrect
  const emissiveColor = isWrongQuizSelection ? '#ef4444' : isQuizTarget ? '#22c55e' : region.color

  useFrame((_, delta) => {
    if (meshRef.current && (isSelected || isHovered)) {
      meshRef.current.rotation.y += delta * 0.35
    }
  })

  return (
    <group>
      <mesh
        ref={meshRef}
        position={region.position}
        scale={region.scale}
        onClick={(event) => {
          event.stopPropagation()
          if (panelMode === 'quiz') {
            answerQuiz(region.id)
            return
          }

          setSelectedRegionId(region.id)
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHoveredRegionId(region.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHoveredRegionId(null)
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[1, 32, 18]} />
        <meshStandardMaterial
          color={region.color}
          emissive={isSelected || isHovered || isQuizTarget || isWrongQuizSelection ? emissiveColor : '#000000'}
          emissiveIntensity={isQuizTarget || isWrongQuizSelection ? 0.44 : isSelected ? 0.28 : isHovered ? 0.16 : 0}
          opacity={isSelected || isHovered || isQuizTarget || isWrongQuizSelection ? 0.96 : 0.72}
          transparent
          roughness={0.52}
        />
      </mesh>
      {(isSelected || isHovered || isQuizTarget || isWrongQuizSelection) && (
        <Text
          position={[region.position[0], region.position[1], region.position[2] + region.scale[2] + 5]}
          fontSize={4.5}
          color="#111827"
          anchorX="center"
          anchorY="middle"
          outlineColor="#ffffff"
          outlineWidth={0.18}
        >
          {region.name}
        </Text>
      )}
    </group>
  )
}

function BrainViewer({ atlasId = 'starter' }: BrainViewerProps) {
  const regions = useBrainStore((state) => state.regions)
  const viewMode = useBrainStore((state) => state.viewMode)
  const panelMode = useBrainStore((state) => state.panelMode)
  const setSelectedRegionId = useBrainStore((state) => state.setSelectedRegionId)

  const visibleRegions = useMemo(() => {
    if (viewMode === 'surface') {
      return regions.filter((region) => region.category === 'cortical')
    }

    if (viewMode === 'deep') {
      return regions.filter((region) => region.category !== 'cortical')
    }

    return regions
  }, [regions, viewMode])

  return (
    <group
      name={atlasId}
      onClick={() => {
        if (panelMode !== 'quiz') {
          setSelectedRegionId(null)
        }
      }}
    >
      <BrainContextShell />
      {visibleRegions.map((region) => (
        <RegionMesh key={region.id} region={region} />
      ))}
    </group>
  )
}

export default BrainViewer
