import { useLayoutEffect } from 'react'
import * as THREE from 'three'
import type { Aabb } from '../data/furniture'
import { getRoom } from '../data/rooms'
import { doorCollidersAt, wallDoor } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { getWrittenTexture } from '../examine/paperTextures'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const room = getRoom('office')
const { width, depth, height } = room.size
const door = wallDoor(width, depth)
const wallT = 0.12
const wall = { color: '#3a342e', roughness: 0.9 }
const DESK = { x: 0, z: -0.2, hx: 0.74, hz: 0.44 }
const DESK_SCALE = 0.7
const FILES = { x: -2.15, z: 1.85, hx: 0.42, hz: 0.55 }
const CHAIR = { x: 0, z: 0.56, hx: 0.32, hz: 0.34 }
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

function Paper({
  position,
  rotation,
  size,
  kind,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  kind: 'chao' | 'prontuario' | 'aviso' | 'saida'
}) {
  return (
    <mesh position={position} rotation={rotation} renderOrder={2}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={getWrittenTexture(kind)}
        roughness={0.88}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
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
        <group position={[DESK.x, 0, DESK.z]} scale={[DESK_SCALE, 1, DESK_SCALE]}>
          <FurnitureModel url="/mesa_diretora.glb" position={[0, 0, 0]} rotationY={Math.PI} targetWidth={2.05} />
        </group>
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
        <FurnitureModel url="/pasta_arquivos.glb" position={[DESK.x + 0.28, 0.78, DESK.z + 0.04]} targetWidth={0.32} />
      </Examinable>
      <Examinable id="office-papers-files">
        <Paper
          kind="prontuario"
          position={[FILES.x + 0.02, 1.44, FILES.z + 0.06]}
          rotation={[-Math.PI / 2, 0, 0.22]}
          size={[0.22, 0.28]}
        />
      </Examinable>
      <Examinable id="office-papers-floor">
        <Paper kind="chao" position={[1.28, 0.012, -1.48]} rotation={[-Math.PI / 2, 0, 0.62]} size={[0.42, 0.3]} />
        <Paper kind="chao" position={[1.42, 0.014, -1.28]} rotation={[-Math.PI / 2, 0, -0.35]} size={[0.24, 0.18]} />
      </Examinable>
      <Examinable id="office-papers-window">
        <Paper kind="aviso" position={[-2.48, 0.012, 0.72]} rotation={[-Math.PI / 2, 0, -0.48]} size={[0.3, 0.22]} />
      </Examinable>
      <Examinable id="office-exit-note">
        <group position={[width / 2 - 0.08, 1.48, door.z + 1.18]}>
          <mesh position={[0.004, 0, 0]}>
            <boxGeometry args={[0.012, 0.42, 0.32]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
          </mesh>
          <Paper kind="saida" position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} size={[0.3, 0.4]} />
        </group>
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
        <group position={[width / 2 - 0.12, 0, 0.55]}>
          <mesh position={[0.02, 1.52, 0]} receiveShadow>
            <boxGeometry args={[0.1, 1.24, 1.66]} />
            <meshStandardMaterial color="#3a342e" roughness={0.9} />
          </mesh>
          <mesh position={[-0.04, 1.5, -0.34]}>
            <boxGeometry args={[0.05, 0.94, 0.6]} />
            <meshStandardMaterial color="#5c4c3a" roughness={0.78} />
          </mesh>
          <mesh position={[-0.04, 1.5, 0.34]}>
            <boxGeometry args={[0.05, 0.94, 0.6]} />
            <meshStandardMaterial color="#534634" roughness={0.78} />
          </mesh>
          <mesh position={[-0.055, 1.5, 0]}>
            <boxGeometry args={[0.06, 0.94, 0.04]} />
            <meshStandardMaterial color="#2e2822" roughness={0.7} metalness={0.18} />
          </mesh>
          <mesh position={[-0.08, 1.48, 0.08]}>
            <boxGeometry args={[0.03, 0.04, 0.08]} />
            <meshStandardMaterial color="#8a7a58" roughness={0.45} metalness={0.35} />
          </mesh>
          <mesh position={[-0.14, 1.02, 0]} receiveShadow>
            <boxGeometry args={[0.3, 0.08, 1.72]} />
            <meshStandardMaterial color="#6a5a48" roughness={0.82} />
          </mesh>
        </group>
      </Examinable>
    </group>
  )
}
