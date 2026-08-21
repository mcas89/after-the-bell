import { useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { getRoom } from '../data/rooms'
import { doorCollidersAt, wallDoor } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const room = getRoom('office')
const { width, depth, height } = room.size
const door = wallDoor(width, depth)
const wallT = 0.12
const wall = { color: '#3a342e', roughness: 0.9 }
const DESK = { x: 0, z: -0.35, hx: 1.05, hz: 0.62 }
const FILES = { x: -2.15, z: 1.85, hx: 0.42, hz: 0.55 }
const CHAIR = { x: 0, z: 0.82, hx: 0.32, hz: 0.34 }
const WIN = { z: 0.18, half: 0.58, sill: 0.92, h: 1.32 }

function DoorWall() {
  const x = door.wallX
  const doorZ = door.z
  const doorHalf = door.half
  const doorH = door.height
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
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: door.z - door.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: door.z + door.half, maxZ: depth / 2 },
      ...doorCollidersAt(door.wallX, door.z, true),
      {
        minX: DESK.x - DESK.hx,
        maxX: DESK.x + DESK.hx,
        minZ: DESK.z - DESK.hz,
        maxZ: DESK.z + DESK.hz,
      },
      {
        minX: FILES.x - FILES.hx,
        maxX: FILES.x + FILES.hx,
        minZ: FILES.z - FILES.hz,
        maxZ: FILES.z + FILES.hz,
      },
      {
        minX: CHAIR.x - CHAIR.hx,
        maxX: CHAIR.x + CHAIR.hx,
        minZ: CHAIR.z - CHAIR.hz,
        maxZ: CHAIR.z + CHAIR.hz,
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

      <HallwayPeek wallX={door.wallX} z={door.z} />
      <Examinable id="side-door-office">
        <HallwayDoor x={door.wallX} z={door.z} inward={-1} label="DIR" subtitle="DIRETORIA" open />
      </Examinable>

      <Examinable id="office-desk">
        <FurnitureModel
          url="/mesa_diretora.glb"
          position={[DESK.x, 0, DESK.z]}
          rotationY={Math.PI}
          targetWidth={2.05}
        />
      </Examinable>
      <Examinable id="office-chair">
        <FurnitureModel url="/cadeira_madeira.glb" position={[CHAIR.x, 0, CHAIR.z]} rotationY={Math.PI} targetHeight={0.92} />
      </Examinable>
      <Examinable id="office-files">
        <FurnitureModel
          url="/armario_arquivos.glb"
          position={[FILES.x, 0, FILES.z]}
          rotationY={Math.PI / 2}
          targetHeight={1.42}
        />
      </Examinable>
      <Examinable id="office-folder">
        <FurnitureModel url="/pasta_arquivos.glb" position={[DESK.x + 0.52, 0.78, DESK.z + 0.08]} targetWidth={0.36} />
      </Examinable>
      <Examinable id="office-window">
        <group position={[-width / 2 + 0.04, WIN.sill + WIN.h / 2, WIN.z]}>
          <mesh position={[0.01, 0, 0]}>
            <boxGeometry args={[0.04, WIN.h + 0.1, WIN.half * 2 + 0.1]} />
            <meshStandardMaterial color="#2a2622" roughness={0.88} />
          </mesh>
          <mesh position={[-0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[WIN.half * 2 - 0.1, WIN.h - 0.1]} />
            <meshBasicMaterial color="#07090e" />
          </mesh>
          <mesh position={[0.12, 0.02, -0.22]} rotation={[0, 0.55, 0]}>
            <boxGeometry args={[0.018, WIN.h - 0.18, WIN.half * 0.92]} />
            <meshStandardMaterial color="#8aa0b0" roughness={0.18} metalness={0.22} transparent opacity={0.18} />
          </mesh>
        </group>
      </Examinable>
      <Examinable id="office-counter">
        <group position={[width / 2 - 0.04, 0, 0.55]}>
          <mesh position={[0, 1.48, 0]} receiveShadow>
            <boxGeometry args={[0.12, 1.08, 1.48]} />
            <meshStandardMaterial color="#4a4038" roughness={0.88} />
          </mesh>
          <mesh position={[-0.04, 1.48, 0]}>
            <boxGeometry args={[0.06, 0.86, 1.26]} />
            <meshStandardMaterial color="#3a5a68" roughness={0.28} metalness={0.22} emissive="#1a3040" emissiveIntensity={0.18} />
          </mesh>
          <mesh position={[-0.16, 1.04, 0]} receiveShadow>
            <boxGeometry args={[0.32, 0.1, 1.56]} />
            <meshStandardMaterial color="#6a5a48" roughness={0.82} />
          </mesh>
        </group>
      </Examinable>
    </group>
  )
}
