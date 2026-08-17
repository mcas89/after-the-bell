import { useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import type { RoomId } from '../data/rooms'
import { getRoom } from '../data/rooms'
import { Examinable } from '../examine/Examinable'
import { clearRoomColliders, setRoomColliders } from './roomColliders'

const wall = { color: '#3f3a34', roughness: 0.9 }

type Props = {
  roomId: Extract<RoomId, 'room11' | 'room12' | 'room14'>
  label: string
}

export function SideClassroom({ roomId, label }: Props) {
  const def = getRoom(roomId)
  const { width, depth, height } = def.size
  const doorZ = depth / 2
  const doorHalf = 0.5
  const doorH = 2.2

  useLayoutEffect(() => {
    const boxes: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: -doorHalf, minZ: doorZ, maxZ: doorZ + 0.12 },
      { minX: doorHalf, maxX: width / 2, minZ: doorZ, maxZ: doorZ + 0.12 },
      { minX: -1.15, maxX: -0.25, minZ: -0.55, maxZ: 0.35 },
      { minX: 0.25, maxX: 1.15, minZ: -0.55, maxZ: 0.35 },
    ]
    setRoomColliders(roomId, boxes)
    return () => clearRoomColliders(roomId)
  }, [roomId, width, depth, doorZ, doorHalf])

  return (
    <group>
      <ambientLight intensity={0.07} color="#a8927c" />
      <hemisphereLight args={['#2e4258', '#120f0c', 0.1]} />
      <directionalLight position={[-6, 4, 0.2]} intensity={0.28} color="#8eaccc" castShadow />
      <pointLight position={[0, 2.55, 0]} color="#c4b9a6" intensity={0.12} distance={7} decay={2} />
      <pointLight position={[-width / 2 + 0.4, 1.5, 0]} color="#7fa3c6" intensity={0.28} distance={4} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#3a342e" roughness={0.92} />
      </mesh>
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1c1a18" roughness={1} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.12]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, height, depth]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, height, depth]} />
        <meshStandardMaterial color="#3b3631" roughness={0.9} />
      </mesh>
      <mesh position={[(-width / 2 - doorHalf) / 2, height / 2, doorZ]} receiveShadow>
        <boxGeometry args={[width / 2 - doorHalf, height, 0.12]} />
        <meshStandardMaterial color="#3d3832" roughness={0.9} />
      </mesh>
      <mesh position={[(width / 2 + doorHalf) / 2, height / 2, doorZ]} receiveShadow>
        <boxGeometry args={[width / 2 - doorHalf, height, 0.12]} />
        <meshStandardMaterial color="#3d3832" roughness={0.9} />
      </mesh>
      <mesh position={[0, doorH + (height - doorH) / 2, doorZ]} receiveShadow>
        <boxGeometry args={[doorHalf * 2, height - doorH, 0.12]} />
        <meshStandardMaterial color="#3d3832" roughness={0.9} />
      </mesh>

      <mesh position={[0, 1.45, -depth / 2 + 0.08]}>
        <planeGeometry args={[2.8, 1.15]} />
        <meshStandardMaterial color="#243028" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.82, -depth / 2 + 0.09]}>
        <planeGeometry args={[0.42, 0.18]} />
        <meshStandardMaterial color="#d8cbb0" roughness={0.7} />
      </mesh>

      <mesh position={[-0.7, 0.43, -0.1]} castShadow>
        <boxGeometry args={[0.7, 0.86, 0.55]} />
        <meshStandardMaterial color="#4a4036" roughness={0.9} />
      </mesh>
      <mesh position={[0.7, 0.43, -0.1]} castShadow>
        <boxGeometry args={[0.7, 0.86, 0.55]} />
        <meshStandardMaterial color="#4a4036" roughness={0.9} />
      </mesh>

      <mesh position={[0, 2.62, -depth / 2 + 0.1]}>
        <boxGeometry args={[0.42, 0.12, 0.08]} />
        <meshStandardMaterial color="#2a2e24" emissive="#d7efb0" emissiveIntensity={0.35} />
      </mesh>

      <Examinable id={`side-door-${label}`}>
        <group position={[0, 0, doorZ]}>
          <mesh position={[0.04, doorH / 2, -0.12]} rotation={[0, -1.55, 0]} castShadow>
            <boxGeometry args={[0.05, doorH - 0.04, doorHalf * 2 - 0.06]} />
            <meshStandardMaterial color="#4a3c32" roughness={0.9} />
          </mesh>
        </group>
      </Examinable>
    </group>
  )
}
