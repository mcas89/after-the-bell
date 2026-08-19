import { useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { CLASSROOM_1 } from '../data/rooms'
import { DOOR, doorColliders } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { clearRoomColliders, setRoomColliders } from './roomColliders'

const { width, depth, height } = CLASSROOM_1.size
const wallT = 0.12
const wall = { color: '#3a3836', roughness: 0.9 }
const tile = { color: '#5a5854', roughness: 0.55, metalness: 0.08 }

const STALLS = [
  { z: -1.85 },
  { z: -0.35 },
  { z: 1.15 },
] as const

function DoorWall() {
  const x = width / 2
  const doorZ = DOOR.z
  const doorHalf = DOOR.half
  const doorH = DOOR.height
  const lintelH = height - doorH
  const zA = -depth / 2
  const zB = doorZ - doorHalf
  const zC = doorZ + doorHalf
  const zD = depth / 2
  return (
    <group>
      <mesh position={[x, height / 2, (zA + zB) / 2]} receiveShadow>
        <boxGeometry args={[wallT, height, Math.max(0.08, zB - zA)]} />
        <meshStandardMaterial color="#3d3b38" roughness={0.9} />
      </mesh>
      <mesh position={[x, height / 2, (zC + zD) / 2]} receiveShadow>
        <boxGeometry args={[wallT, height, Math.max(0.08, zD - zC)]} />
        <meshStandardMaterial color="#3d3b38" roughness={0.9} />
      </mesh>
      <mesh position={[x, doorH + lintelH / 2, doorZ]} receiveShadow>
        <boxGeometry args={[wallT, lintelH, doorHalf * 2]} />
        <meshStandardMaterial color="#3d3b38" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function BathroomRoom() {
  useLayoutEffect(() => {
    const stallBoxes: Aabb[] = STALLS.flatMap((stall) => [
      { minX: -4.05, maxX: -2.15, minZ: stall.z - 0.62, maxZ: stall.z - 0.52 },
      { minX: -4.05, maxX: -2.15, minZ: stall.z + 0.52, maxZ: stall.z + 0.62 },
      { minX: -4.05, maxX: -3.92, minZ: stall.z - 0.52, maxZ: stall.z + 0.52 },
    ])
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: DOOR.z - DOOR.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: DOOR.z + DOOR.half, maxZ: depth / 2 },
      ...doorColliders(true),
      ...stallBoxes,
      { minX: 0.85, maxX: 2.55, minZ: 2.55, maxZ: 3.05 },
    ]
    setRoomColliders('bathroom', walls)
    return () => clearRoomColliders('bathroom')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.08} color="#8a9aa4" />
      <hemisphereLight args={['#3a4850', '#12100e', 0.16]} />
      <pointLight position={[0.4, 2.15, 0.2]} color="#c8d0d4" intensity={0.42} distance={6.2} decay={2} />
      <pointLight position={[-2.4, 1.7, -0.4]} color="#6a7880" intensity={0.16} distance={3.2} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial {...tile} />
      </mesh>
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1c1c1a" roughness={1} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallT]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[wallT, height, depth]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[0, height / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallT]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <DoorWall />

      <HallwayPeek />
      <Examinable id="side-door-bathroom">
        <HallwayDoor x={DOOR.wallX} z={DOOR.z} inward={-1} label="WC" subtitle="BANHEIRO" open />
      </Examinable>

      {STALLS.map((stall, i) => (
        <group key={stall.z} position={[-3.05, 0, stall.z]}>
          <mesh position={[0, 1.05, -0.58]} receiveShadow>
            <boxGeometry args={[1.85, 2.1, 0.06]} />
            <meshStandardMaterial color="#6a6864" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.05, 0.58]} receiveShadow>
            <boxGeometry args={[1.85, 2.1, 0.06]} />
            <meshStandardMaterial color="#6a6864" roughness={0.7} />
          </mesh>
          <Examinable id={i === 1 ? 'bath-stall' : 'bath-stall-empty'}>
            <mesh position={[0.82, 1.05, 0]} castShadow>
              <boxGeometry args={[0.06, 2.1, 1.1]} />
              <meshStandardMaterial color="#5c5a56" roughness={0.62} metalness={0.12} />
            </mesh>
          </Examinable>
        </group>
      ))}

      <Examinable id="bath-sink">
        <group position={[1.7, 0, 2.72]}>
          <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.55, 0.14, 0.48]} />
            <meshStandardMaterial color="#d8d4cc" roughness={0.35} metalness={0.08} />
          </mesh>
          <mesh position={[0, 0.42, 0]} receiveShadow>
            <boxGeometry args={[1.5, 0.84, 0.42]} />
            <meshStandardMaterial color="#8a8680" roughness={0.7} />
          </mesh>
          <mesh position={[-0.28, 0.9, 0]} >
            <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
            <meshStandardMaterial color="#c8c4bc" roughness={0.3} />
          </mesh>
          <mesh position={[0.32, 0.9, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
            <meshStandardMaterial color="#c8c4bc" roughness={0.3} />
          </mesh>
        </group>
      </Examinable>

      <Examinable id="bath-mirror">
        <mesh position={[1.7, 1.55, depth / 2 - 0.08]}>
          <boxGeometry args={[1.42, 0.92, 0.04]} />
          <meshStandardMaterial color="#9aa8b0" roughness={0.12} metalness={0.35} />
        </mesh>
      </Examinable>
    </group>
  )
}
