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
const wall = { color: '#2f2c28', roughness: 0.92 }

const SHELVES = [
  { x: -2.55, z: -0.15, hx: 0.28, hz: 2.15 },
  { x: -0.35, z: -0.15, hx: 0.28, hz: 2.15 },
  { x: 1.85, z: -1.35, hx: 0.28, hz: 1.05 },
] as const

const TABLE = { x: 1.55, z: 1.35, hx: 0.62, hz: 0.38 }

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
        <meshStandardMaterial color="#32302c" roughness={0.9} />
      </mesh>
      <mesh position={[x, height / 2, (zC + zD) / 2]} receiveShadow>
        <boxGeometry args={[wallT, height, Math.max(0.08, zD - zC)]} />
        <meshStandardMaterial color="#32302c" roughness={0.9} />
      </mesh>
      <mesh position={[x, doorH + lintelH / 2, doorZ]} receiveShadow>
        <boxGeometry args={[wallT, lintelH, doorHalf * 2]} />
        <meshStandardMaterial color="#32302c" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Shelf({ x, z, hx, hz }: { x: number; z: number; hx: number; hz: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[hx * 2, 2.24, hz * 2]} />
        <meshStandardMaterial color="#3d342c" roughness={0.88} />
      </mesh>
      <mesh position={[hx + 0.01, 1.12, 0]}>
        <boxGeometry args={[0.04, 2.1, hz * 2 - 0.12]} />
        <meshStandardMaterial color="#1a1612" roughness={1} />
      </mesh>
    </group>
  )
}

export function LibraryRoom() {
  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: DOOR.z - DOOR.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: DOOR.z + DOOR.half, maxZ: depth / 2 },
      ...doorColliders(true),
      ...SHELVES.map((s) => ({ minX: s.x - s.hx, maxX: s.x + s.hx, minZ: s.z - s.hz, maxZ: s.z + s.hz })),
      {
        minX: TABLE.x - TABLE.hx,
        maxX: TABLE.x + TABLE.hx,
        minZ: TABLE.z - TABLE.hz,
        maxZ: TABLE.z + TABLE.hz,
      },
    ]
    setRoomColliders('library', walls)
    return () => clearRoomColliders('library')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.045} color="#7a6a58" />
      <hemisphereLight args={['#2a2420', '#0c0a08', 0.12]} />
      <pointLight position={[1.6, 1.85, 1.4]} color="#d8c8a0" intensity={0.55} distance={4.2} decay={2} />
      <pointLight position={[-2.4, 1.7, -1.6]} color="#6a5848" intensity={0.18} distance={3.4} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#3a342e" roughness={0.92} />
      </mesh>
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#141210" roughness={1} />
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
      <Examinable id="side-door-library">
        <HallwayDoor x={DOOR.wallX} z={DOOR.z} inward={-1} label="BIB" subtitle="BIBLIOTECA" open />
      </Examinable>

      {SHELVES.map((shelf) => (
        <Examinable key={`${shelf.x}-${shelf.z}`} id="lib-shelf">
          <Shelf {...shelf} />
        </Examinable>
      ))}

      <Examinable id="lib-ledger">
        <group position={[TABLE.x, 0, TABLE.z]}>
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[TABLE.hx * 2, 0.76, TABLE.hz * 2]} />
            <meshStandardMaterial color="#5a4a3c" roughness={0.82} />
          </mesh>
          <mesh position={[0.08, 0.78, 0.04]} rotation={[-Math.PI / 2, 0, 0.2]} castShadow>
            <boxGeometry args={[0.28, 0.36, 0.03]} />
            <meshStandardMaterial color="#d8cbb0" roughness={0.88} />
          </mesh>
        </group>
      </Examinable>

      <Examinable id="lib-note">
        <mesh position={[TABLE.x - 0.28, 0.79, TABLE.z - 0.08]} rotation={[-Math.PI / 2, 0, -0.4]}>
          <boxGeometry args={[0.16, 0.22, 0.02]} />
          <meshStandardMaterial color="#cfc3a8" roughness={0.9} />
        </mesh>
      </Examinable>
    </group>
  )
}
