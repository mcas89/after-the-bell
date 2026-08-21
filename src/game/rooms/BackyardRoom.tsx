import { Suspense, useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { getRoom } from '../data/rooms'
import { Examinable } from '../examine/Examinable'
import { MarinaFallen } from '../player/MarinaFallen'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const room = getRoom('backyard')
const { width, depth, height } = room.size
const wallT = 0.16
const wall = { color: '#1a1816', roughness: 0.96 }

export function BackyardRoom() {
  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: -0.85, maxX: 0.85, minZ: 1.85, maxZ: 2.35 },
      { minX: -0.55, maxX: 0.55, minZ: -1.55, maxZ: -0.55 },
    ]
    setRoomColliders('backyard', walls)
    return () => clearRoomColliders('backyard')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.018} color="#6a7c90" />
      <hemisphereLight args={['#15202c', '#05060a', 0.08]} />
      <pointLight position={[0.1, 1.55, 0.8]} color="#8aa0b4" intensity={0.22} distance={4.2} decay={2} />
      <pointLight position={[0.15, 0.85, -0.95]} color="#9aa8b4" intensity={0.38} distance={2.8} decay={2} />

      <TexturedFloor
        src="/textura/piso_patio_interno.png"
        width={width}
        depth={depth}
        tile={4}
        color="#8a8884"
        roughness={0.94}
        metalness={0.03}
      />
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#0a0c10" roughness={1} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallT]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[wallT, height, depth]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[wallT, height, depth]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[0, height / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallT]} />
        <meshStandardMaterial {...wall} />
      </mesh>

      <FurnitureModel
        url="/escada_saida.glb"
        position={[0, 0, 2.05]}
        rotationY={0}
        targetWidth={1.35}
        pickable={false}
      />

      <Examinable id="yard-body">
        <group position={[0, 0.02, -1.05]}>
          <Suspense fallback={null}>
            <MarinaFallen />
          </Suspense>
          <mesh position={[0, 0.12, 0.1]}>
            <boxGeometry args={[0.7, 0.28, 1.35]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </Examinable>
    </group>
  )
}
