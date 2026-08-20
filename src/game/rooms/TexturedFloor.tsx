import { useLayoutEffect } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

type Props = {
  src: string
  width: number
  depth: number
  x?: number
  z?: number
  tile?: number
  color?: string
  roughness?: number
  metalness?: number
}

export function TexturedFloor({
  src,
  width,
  depth,
  x = 0,
  z = 0,
  tile = 1.45,
  color = '#c8c2b8',
  roughness = 0.86,
  metalness = 0.04,
}: Props) {
  const map = useTexture(src)

  useLayoutEffect(() => {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(width / tile, depth / tile)
    map.anisotropy = 8
    map.colorSpace = THREE.SRGBColorSpace
    map.needsUpdate = true
  }, [depth, map, tile, width])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={map} color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

useTexture.preload('/textura/piso_patio_interno.png')
useTexture.preload('/textura/piso_banheiro.png')
useTexture.preload('/textura/piso_madeira.png')
