import { useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { getRoom } from '../data/rooms'
import { DOOR, doorColliders } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const room = getRoom('office')
const { width, depth, height } = room.size
const wallT = 0.12
const wall = { color: '#3a342e', roughness: 0.9 }
const DESK = { x: 0, z: -0.35, hx: 1.05, hz: 0.62 }

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
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[x, height / 2, (zC + zD) / 2]} receiveShadow>
        <boxGeometry args={[wallT, height, Math.max(0.08, zD - zC)]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[x, doorH + lintelH / 2, doorZ]} receiveShadow>
        <boxGeometry args={[wallT, lintelH, doorHalf * 2]} />
        <meshStandardMaterial {...wall} />
      </mesh>
    </group>
  )
}

export function OfficeRoom() {
  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: DOOR.z - DOOR.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: DOOR.z + DOOR.half, maxZ: depth / 2 },
      ...doorColliders(true),
      {
        minX: DESK.x - DESK.hx,
        maxX: DESK.x + DESK.hx,
        minZ: DESK.z - DESK.hz,
        maxZ: DESK.z + DESK.hz,
      },
    ]
    setRoomColliders('office', walls)
    return () => clearRoomColliders('office')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.06} color="#8a7a68" />
      <hemisphereLight args={['#3a342e', '#0c0a08', 0.14]} />
      <pointLight position={[0.2, 1.95, 0.4]} color="#d8c8a0" intensity={0.48} distance={5.4} decay={2} />

      <TexturedFloor
        src="/textura/piso_madeira.png"
        width={width}
        depth={depth}
        tile={1.45}
        color="#b7a898"
        roughness={0.78}
        metalness={0.05}
      />
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#161410" roughness={1} />
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
      <Examinable id="side-door-office">
        <HallwayDoor x={DOOR.wallX} z={DOOR.z} inward={-1} label="DIR" subtitle="DIRETORIA" open />
      </Examinable>

      <Examinable id="office-desk">
        <FurnitureModel
          url="/mesa_diretora.glb"
          position={[DESK.x, 0, DESK.z]}
          rotationY={Math.PI}
          targetWidth={2.05}
        />
      </Examinable>
    </group>
  )
}
