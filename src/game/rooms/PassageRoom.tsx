import { useEffect, useLayoutEffect } from 'react'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import {
  LOBBY,
  LOBBY_DOORS,
  LOBBY_DOOR_LIST,
  LOBBY_EAST_OPEN_FROM,
  LOBBY_PLANTER,
  lobbyColliders,
} from './lobbyLayout'

const { width, depth, height, halfX, minZ, maxZ, doorH, doorHalf, entranceHalf } = LOBBY
const NEAR_Z = LOBBY_DOORS.library.z
const FAR_Z = LOBBY_DOORS.storage.z
const DIR_X = LOBBY_DOORS.office.x
const wallT = 0.38
const brick = { color: '#2c2a27', roughness: 0.94 }
const brickDark = { color: '#23211e', roughness: 0.96 }
const rail = { color: '#3a3d42', metalness: 0.55, roughness: 0.38 }
const MOON = '#c3d2e4'

type Opening = { at: number; half: number }

function WallAlongZ({
  x,
  from,
  to,
  openings,
}: {
  x: number
  from: number
  to: number
  openings: Opening[]
}) {
  const slots = [...openings].sort((a, b) => a.at - b.at)
  const parts: { z: number; span: number }[] = []
  let cursor = from
  for (const slot of slots) {
    const start = slot.at - slot.half
    if (start - cursor > 0.06) parts.push({ z: (cursor + start) / 2, span: start - cursor })
    cursor = slot.at + slot.half
  }
  if (to - cursor > 0.06) parts.push({ z: (cursor + to) / 2, span: to - cursor })

  return (
    <group>
      {parts.map((part) => (
        <mesh key={`${x}-${part.z}`} position={[x, height / 2, part.z]} receiveShadow>
          <boxGeometry args={[wallT, height, part.span]} />
          <meshStandardMaterial {...brick} />
        </mesh>
      ))}
      {slots.map((slot) => (
        <mesh key={`lintel-z-${x}-${slot.at}`} position={[x, doorH + (height - doorH) / 2, slot.at]} receiveShadow>
          <boxGeometry args={[wallT, height - doorH, slot.half * 2]} />
          <meshStandardMaterial {...brick} />
        </mesh>
      ))}
    </group>
  )
}

function WallAlongX({
  z,
  from,
  to,
  openings,
}: {
  z: number
  from: number
  to: number
  openings: Opening[]
}) {
  const slots = [...openings].sort((a, b) => a.at - b.at)
  const parts: { x: number; span: number }[] = []
  let cursor = from
  for (const slot of slots) {
    const start = slot.at - slot.half
    if (start - cursor > 0.06) parts.push({ x: (cursor + start) / 2, span: start - cursor })
    cursor = slot.at + slot.half
  }
  if (to - cursor > 0.06) parts.push({ x: (cursor + to) / 2, span: to - cursor })

  return (
    <group>
      {parts.map((part) => (
        <mesh key={`${z}-${part.x}`} position={[part.x, height / 2, z]} receiveShadow>
          <boxGeometry args={[part.span, height, wallT]} />
          <meshStandardMaterial {...brick} />
        </mesh>
      ))}
      {slots.map((slot) => (
        <mesh key={`lintel-x-${z}-${slot.at}`} position={[slot.at, doorH + (height - doorH) / 2, z]} receiveShadow>
          <boxGeometry args={[slot.half * 2, height - doorH, wallT]} />
          <meshStandardMaterial {...brick} />
        </mesh>
      ))}
    </group>
  )
}

function EmergencyLamp({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[0.22, 0.08, 0.1]} />
        <meshStandardMaterial color="#9a8a62" emissive="#e6d08a" emissiveIntensity={0.7} roughness={0.45} />
      </mesh>
      <pointLight position={[0, -0.12, 0]} color="#e8d6a0" intensity={0.72} distance={5.2} decay={2} />
    </group>
  )
}

function RoomMass({
  cx,
  cz,
  sx,
  sz,
}: {
  cx: number
  cz: number
  sx: number
  sz: number
}) {
  return (
    <mesh position={[cx, height / 2, cz]} receiveShadow>
      <boxGeometry args={[sx, height, sz]} />
      <meshStandardMaterial {...brickDark} />
    </mesh>
  )
}

function Parapet() {
  const z0 = LOBBY_EAST_OPEN_FROM
  const z1 = maxZ
  const span = z1 - z0
  const mid = (z0 + z1) / 2
  return (
    <group>
      <mesh position={[halfX, 0.42, mid]} receiveShadow>
        <boxGeometry args={[0.14, 0.84, span]} />
        <meshStandardMaterial {...rail} />
      </mesh>
      {[-1.6, -0.55, 0.55, 1.6].map((off) => (
        <mesh key={off} position={[halfX, 0.92, mid + off]} castShadow>
          <boxGeometry args={[0.06, 0.22, 0.06]} />
          <meshStandardMaterial {...rail} />
        </mesh>
      ))}
      <mesh position={[halfX, 1.04, mid]}>
        <boxGeometry args={[0.08, 0.05, span]} />
        <meshStandardMaterial color="#4a4e54" metalness={0.48} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Planter() {
  const { x, z, halfX: hx, halfZ: hz } = LOBBY_PLANTER
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[hx * 2, 0.36, hz * 2]} />
        <meshStandardMaterial color="#4a433c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.38, 0]} receiveShadow>
        <boxGeometry args={[hx * 2 - 0.18, 0.08, hz * 2 - 0.18]} />
        <meshStandardMaterial color="#2a221c" roughness={1} />
      </mesh>
      <FurnitureModel url="/estatua_patio_cima.glb" position={[0, 0.4, 0]} targetHeight={2.15} pickable={false} />
    </group>
  )
}

function PatioGate() {
  const door = LOBBY_DOORS.exit
  return (
    <group position={[door.x, 0, door.z]} rotation={[0, door.yaw, 0]}>
      <mesh position={[0, 1.12, 0]} receiveShadow>
        <boxGeometry args={[0.1, 2.24, 1.28]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.55} roughness={0.42} />
      </mesh>
      {[-0.46, -0.23, 0, 0.23, 0.46].map((bar) => (
        <mesh key={bar} position={[-0.02, 1.1, bar]} castShadow>
          <boxGeometry args={[0.04, 2.12, 0.045]} />
          <meshStandardMaterial color="#3a3d42" metalness={0.62} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[-0.02, 2.16, 0]}>
        <boxGeometry args={[0.06, 0.08, 1.22]} />
        <meshStandardMaterial color="#4a4e54" metalness={0.5} roughness={0.38} />
      </mesh>
    </group>
  )
}

function ExitStairs() {
  const door = LOBBY_DOORS.exit
  return (
    <group position={[door.x, 0, door.z + 0.55]}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0, -0.18 * i - 0.08, 0.32 * i]} receiveShadow>
          <boxGeometry args={[1.35, 0.16, 0.34]} />
          <meshStandardMaterial color="#2a2c28" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, -1.35, 2.15]}>
        <boxGeometry args={[2.4, 2.4, 1.6]} />
        <meshBasicMaterial color="#05060a" />
      </mesh>
    </group>
  )
}

export function PassageRoom() {
  useLayoutEffect(() => {
    setRoomColliders('passage', lobbyColliders())
    return () => clearRoomColliders('passage')
  }, [])

  useEffect(() => {
    const game = useGameStore.getState()
    const hall = useHallwayStore.getState()
    if (!game.flags.patioEntered) {
      game.addFlag('patioEntered')
      hall.setObjective('find-exit')
      saveManager.save()
    }
    const timer = window.setTimeout(() => {
      if (!useGameStore.getState().flags.patioLooked) {
        useGameStore.getState().addFlag('patioLooked')
        useHallwayStore.getState().speak('Tem que ter uma saída.', 2800)
      }
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [])

  const westOpen: Opening[] = [
    { at: LOBBY_DOORS.library.z, half: doorHalf },
    { at: LOBBY_DOORS.storage.z, half: doorHalf },
  ]
  const eastOpen: Opening[] = [{ at: LOBBY_DOORS.bathroom.z, half: doorHalf }]
  const northOpen: Opening[] = [
    { at: LOBBY_DOORS.office.x, half: doorHalf },
    { at: LOBBY_DOORS.exit.x, half: doorHalf + 0.12 },
  ]

  return (
    <group>
      <ambientLight intensity={0.055} color="#7a90a8" />
      <hemisphereLight args={[MOON, '#0a0c10', 0.42]} />
      <directionalLight
        position={[-6.2, 11, -4.5]}
        intensity={0.38}
        color={MOON}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 3.4, 6.4]} color={MOON} intensity={0.22} distance={14} decay={2} />

      <EmergencyLamp x={-halfX + 0.28} y={2.48} z={NEAR_Z} />
      <EmergencyLamp x={-halfX + 0.28} y={2.48} z={FAR_Z} />
      <EmergencyLamp x={halfX - 0.28} y={2.48} z={NEAR_Z} />
      <EmergencyLamp x={DIR_X} y={2.52} z={maxZ - 0.28} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (minZ + maxZ) / 2]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#3a3936" roughness={0.96} metalness={0.03} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, (minZ + maxZ) / 2]}>
        <planeGeometry args={[70, 70]} />
        <meshBasicMaterial color="#07090e" />
      </mesh>

      <RoomMass cx={-halfX - 2.15} cz={(minZ + 6.35) / 2} sx={4.3} sz={6.35 - minZ} />
      <RoomMass cx={-halfX - 2.15} cz={(6.35 + maxZ) / 2} sx={4.3} sz={maxZ - 6.35} />
      <RoomMass cx={halfX + 1.95} cz={(minZ + LOBBY_EAST_OPEN_FROM) / 2} sx={3.9} sz={LOBBY_EAST_OPEN_FROM - minZ} />
      <RoomMass cx={-3.55} cz={maxZ + 2.05} sx={7.4} sz={4.1} />

      <WallAlongZ x={-halfX} from={minZ} to={maxZ} openings={westOpen} />
      <WallAlongZ x={halfX} from={minZ} to={LOBBY_EAST_OPEN_FROM} openings={eastOpen} />
      <WallAlongX z={maxZ} from={-halfX} to={halfX} openings={northOpen} />
      <WallAlongX z={minZ} from={-halfX} to={halfX} openings={[{ at: 0, half: entranceHalf }]} />
      <Parapet />

      <mesh position={[0, 1.55, minZ - 2.4]}>
        <planeGeometry args={[width + 10, 8]} />
        <meshBasicMaterial color="#06080d" />
      </mesh>

      <Planter />
      <ExitStairs />

      {LOBBY_DOOR_LIST.filter((door) => door.kind === 'door').map((door) => (
        <Examinable key={door.id} id={door.examineId}>
          <HallwayDoor
            x={door.x}
            z={door.z}
            inward={door.inward}
            yaw={door.yaw}
            label={door.label}
            subtitle={door.subtitle}
            rattles={!door.open}
            open={door.open}
          />
        </Examinable>
      ))}

      <Examinable id="lobby-exit">
        <PatioGate />
      </Examinable>
    </group>
  )
}
