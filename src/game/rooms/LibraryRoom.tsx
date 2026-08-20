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

const westX = -width / 2 + 0.38
const southZ = -depth / 2 + 0.38
const northZ = depth / 2 - 0.38
const eastX = width / 2 - 0.38

const SHELVES = [
  { url: '/estante_livros1.glb', x: westX, z: -1.4, rot: -Math.PI / 2, hx: 0.34, hz: 1.08 },
  { url: '/estante_livros2.glb', x: westX, z: 0.8, rot: -Math.PI / 2, hx: 0.34, hz: 1.08 },
  { url: '/estante_livros1.glb', x: westX, z: 2.42, rot: -Math.PI / 2, hx: 0.34, hz: 1.08 },
  { url: '/estante_livros2.glb', x: -1.75, z: southZ, rot: 0, hx: 1.08, hz: 0.34 },
  { url: '/estante_livros1.glb', x: 0.5, z: southZ, rot: 0, hx: 1.08, hz: 0.34 },
  { url: '/estante_livros2.glb', x: -2.35, z: northZ, rot: Math.PI, hx: 1.08, hz: 0.34 },
  { url: '/estante_livros1.glb', x: 0.15, z: northZ, rot: Math.PI, hx: 1.08, hz: 0.34 },
  { url: '/estante_livros2.glb', x: eastX, z: 1.35, rot: Math.PI / 2, hx: 0.34, hz: 1.08 },
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

      {SHELVES.map((shelf, index) => (
        <Examinable key={`lib-shelf-${index}`} id="lib-shelf">
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
        <FurnitureModel url="/livro_aberto.glb" position={[TABLE.x + 0.1, 0.78, TABLE.z + 0.02]} targetWidth={0.4} />
      </Examinable>
      <Examinable id="lib-stack">
        <FurnitureModel url="/pilha_livros1.glb" position={[TABLE.x - 0.42, 0.78, TABLE.z - 0.12]} targetHeight={0.22} />
      </Examinable>
      <Examinable id="lib-pile">
        <FurnitureModel url="/livros_pilhado.glb" position={[TABLE.x - 0.36, 0.78, TABLE.z + 0.18]} targetHeight={0.16} />
      </Examinable>
      <Examinable id="lib-note">
        <mesh position={[TABLE.x - 0.08, 0.8, TABLE.z + 0.28]} rotation={[-Math.PI / 2, 0, -0.4]}>
          <boxGeometry args={[0.16, 0.22, 0.008]} />
          <meshStandardMaterial color="#cfc3a8" roughness={0.9} />
        </mesh>
      </Examinable>
      <Examinable id="lib-hours">
        <mesh position={[TABLE.x + 0.38, 0.8, TABLE.z - 0.16]} rotation={[-Math.PI / 2, 0, 0.22]}>
          <boxGeometry args={[0.18, 0.12, 0.006]} />
          <meshStandardMaterial color="#e6dcc4" roughness={0.88} />
        </mesh>
      </Examinable>
      <Examinable id="lib-card">
        <mesh position={[TABLE.x + 0.28, 0.798, TABLE.z + 0.26]} rotation={[-Math.PI / 2, 0, 0.5]}>
          <boxGeometry args={[0.11, 0.07, 0.004]} />
          <meshStandardMaterial color="#d2c4a4" roughness={0.86} />
        </mesh>
      </Examinable>
    </group>
  )
}
