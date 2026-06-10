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

function RegionMesh({ region }: RegionMeshProps) {
  const meshRef = useRef<Mesh>(null)
  const selectedRegionId = useBrainStore((state) => state.selectedRegionId)
  const hoveredRegionId = useBrainStore((state) => state.hoveredRegionId)
  const setSelectedRegionId = useBrainStore((state) => state.setSelectedRegionId)
  const setHoveredRegionId = useBrainStore((state) => state.setHoveredRegionId)
  const isSelected = selectedRegionId === region.id
  const isHovered = hoveredRegionId === region.id

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
          emissive={isSelected || isHovered ? region.color : '#000000'}
          emissiveIntensity={isSelected ? 0.28 : isHovered ? 0.16 : 0}
          opacity={isSelected || isHovered ? 0.96 : 0.72}
          transparent
          roughness={0.52}
        />
      </mesh>
      {(isSelected || isHovered) && (
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
        setSelectedRegionId(null)
      }}
    >
      {visibleRegions.map((region) => (
        <RegionMesh key={region.id} region={region} />
      ))}
    </group>
  )
}

export default BrainViewer
