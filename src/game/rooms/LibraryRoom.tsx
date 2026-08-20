import { useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { CLASSROOM_1 } from '../data/rooms'
import { DOOR, doorColliders } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const { width, depth, height } = CLASSROOM_1.size
const wallT = 0.12
const wall = { color: '#2f2c28', roughness: 0.92 }

const SHELVES = [
  { url: '/estante_livros1.glb', x: -3.58, z: -1.2, rot: Math.PI / 2, hx: 0.34, hz: 1.12 },
  { url: '/estante_livros2.glb', x: -3.58, z: 1.28, rot: Math.PI / 2, hx: 0.34, hz: 1.12 },
  { url: '/estante_livros1.glb', x: 0.2, z: -2.88, rot: 0, hx: 1.12, hz: 0.34 },
] as const

const TABLE = { x: 1.72, z: 1.22, hx: 0.72, hz: 0.42 }
const CHAIR = { x: 1.72, z: 2.12, hx: 0.28, hz: 0.32 }

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
      {
        minX: CHAIR.x - CHAIR.hx,
        maxX: CHAIR.x + CHAIR.hx,
        minZ: CHAIR.z - CHAIR.hz,
        maxZ: CHAIR.z + CHAIR.hz,
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

      <TexturedFloor
        src="/textura/piso_madeira.png"
        width={width}
        depth={depth}
        tile={1.45}
        color="#b7a898"
        roughness={0.82}
        metalness={0.04}
      />
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
          <FurnitureModel
            url={shelf.url}
            position={[shelf.x, 0, shelf.z]}
            rotationY={shelf.rot}
            targetHeight={2.18}
          />
        </Examinable>
      ))}

      <FurnitureModel
        url="/mesa_madeiracomgavetas.glb"
        position={[TABLE.x, 0, TABLE.z]}
        rotationY={Math.PI}
        targetWidth={TABLE.hx * 2}
        pickable={false}
      />
      <Examinable id="lib-chair">
        <FurnitureModel url="/cadeira_madeira.glb" position={[CHAIR.x, 0, CHAIR.z]} rotationY={Math.PI} targetHeight={0.92} />
      </Examinable>
      <Examinable id="lib-ledger">
        <FurnitureModel url="/livro_aberto.glb" position={[TABLE.x + 0.08, 0.78, TABLE.z + 0.04]} targetWidth={0.42} />
      </Examinable>
      <FurnitureModel url="/pilha_livros1.glb" position={[TABLE.x - 0.38, 0.78, TABLE.z - 0.08]} targetHeight={0.22} pickable={false} />
      <Examinable id="lib-note">
        <mesh position={[TABLE.x - 0.12, 0.8, TABLE.z + 0.22]} rotation={[-Math.PI / 2, 0, -0.4]}>
          <boxGeometry args={[0.16, 0.22, 0.02]} />
          <meshStandardMaterial color="#cfc3a8" roughness={0.9} />
        </mesh>
      </Examinable>
    </group>
  )
}
