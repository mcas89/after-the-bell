import { Suspense, useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { getRoom } from '../data/rooms'
import { MarinaFallen } from '../player/MarinaFallen'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'

const room = getRoom('backyard')
const { width, depth } = room.size

function Tree({ x, z, h }: { x: number; z: number; h: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h * 0.28, 0]}>
        <cylinderGeometry args={[0.12, 0.18, h * 0.55, 6]} />
        <meshStandardMaterial color="#14120f" roughness={1} />
      </mesh>
      <mesh position={[0, h * 0.72, 0]}>
        <coneGeometry args={[h * 0.28, h * 0.7, 7]} />
        <meshStandardMaterial color="#0c100e" roughness={1} />
      </mesh>
    </group>
  )
}

export function BackyardRoom() {
  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2 - 0.4, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: width / 2, maxX: width / 2 + 0.4, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.4, maxZ: -depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.4 },
      { minX: -2.6, maxX: 2.6, minZ: 3.2, maxZ: 4.4 },
    ]
    setRoomColliders('backyard', walls)
    return () => clearRoomColliders('backyard')
  }, [])

  return (
    <group>
      <color attach="background" args={['#070b12']} />
      <ambientLight intensity={0.045} color="#6a7c94" />
      <hemisphereLight args={['#1a2838', '#05060a', 0.24]} />
      <directionalLight position={[-8, 11, -6]} intensity={0.2} color="#c8d6e8" />
      <pointLight position={[1.55, 2.35, -1.6]} color="#d8c8a4" intensity={0.32} distance={8} decay={2} />
      <pointLight position={[0.2, 0.55, -3.45]} color="#9aa8b8" intensity={0.16} distance={3.2} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -3]} receiveShadow>
        <planeGeometry args={[48, 52]} />
        <meshStandardMaterial color="#2e322c" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -2.4]} receiveShadow>
        <planeGeometry args={[4.6, 18]} />
        <meshStandardMaterial color="#3a3c38" roughness={0.94} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -4.1]} receiveShadow>
        <circleGeometry args={[6.8, 28]} />
        <meshStandardMaterial color="#45473f" roughness={0.98} />
      </mesh>

      <mesh position={[-10, 7.2, -14]}>
        <sphereGeometry args={[0.62, 16, 16]} />
        <meshBasicMaterial color="#e8eef6" />
      </mesh>
      <mesh position={[-10, 7.2, -14]}>
        <sphereGeometry args={[1.35, 16, 16]} />
        <meshBasicMaterial color="#c5d2e4" transparent opacity={0.08} depthWrite={false} />
      </mesh>

      <group position={[0, 0, 4.5]}>
        <mesh position={[0, 4.2, 0.4]} receiveShadow>
          <boxGeometry args={[22, 8.4, 2.2]} />
          <meshStandardMaterial color="#171614" roughness={0.96} />
        </mesh>
        <mesh position={[0, 1.7, -0.78]}>
          <boxGeometry args={[2.35, 3.35, 0.2]} />
          <meshStandardMaterial color="#0b0d11" roughness={1} />
        </mesh>
        <mesh position={[-4.4, 3.1, -0.82]}>
          <boxGeometry args={[1.7, 1.25, 0.08]} />
          <meshBasicMaterial color="#081018" />
        </mesh>
        <mesh position={[4.4, 3.1, -0.82]}>
          <boxGeometry args={[1.7, 1.25, 0.08]} />
          <meshBasicMaterial color="#081018" />
        </mesh>
        <mesh position={[-8.2, 3.15, -0.82]}>
          <boxGeometry args={[1.5, 1.15, 0.08]} />
          <meshBasicMaterial color="#081018" />
        </mesh>
        <mesh position={[8.2, 3.15, -0.82]}>
          <boxGeometry args={[1.5, 1.15, 0.08]} />
          <meshBasicMaterial color="#081018" />
        </mesh>
      </group>

      <FurnitureModel
        url="/escada_saida.glb"
        position={[0, 0, 2.18]}
        rotationY={0}
        targetWidth={1.42}
        pickable={false}
      />

      <mesh position={[1.55, 1.15, -1.6]}>
        <cylinderGeometry args={[0.045, 0.05, 2.3, 8]} />
        <meshStandardMaterial color="#2a2c28" roughness={0.86} metalness={0.2} />
      </mesh>
      <mesh position={[1.55, 2.28, -1.6]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#f0e0b8" emissive="#f0e0b8" emissiveIntensity={0.7} />
      </mesh>

      <Tree x={-6.4} z={-7.2} h={4.2} />
      <Tree x={-8.1} z={-4.4} h={5.1} />
      <Tree x={7.2} z={-6.6} h={4.6} />
      <Tree x={9.4} z={-3.2} h={5.4} />
      <Tree x={-11} z={-9.5} h={6} />
      <Tree x={11.2} z={-8.8} h={5.8} />

      <mesh position={[0, 0.9, -14.5]}>
        <boxGeometry args={[28, 1.8, 0.4]} />
        <meshStandardMaterial color="#121410" roughness={1} />
      </mesh>

      <group position={[0.18, 0.02, -3.55]}>
        <Suspense fallback={null}>
          <MarinaFallen />
        </Suspense>
      </group>
    </group>
  )
}
