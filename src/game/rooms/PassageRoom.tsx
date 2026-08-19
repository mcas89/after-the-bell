import { useEffect, useLayoutEffect } from 'react'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import {
  LOBBY,
  LOBBY_DOORS,
  LOBBY_DOOR_LIST,
  LOBBY_PLANTER,
  lobbyColliders,
} from './lobbyLayout'

const { width, depth, height, halfX, minZ, maxZ, doorH, doorHalf, entranceHalf } = LOBBY
const wallT = 0.32
const wall = { color: '#2a2926', roughness: 0.94 }
const MOON = '#c3d2e4'

type Opening = { at: number; half: number }

function WallAlongZ({ x, openings }: { x: number; openings: Opening[] }) {
  const slots = [...openings].sort((a, b) => a.at - b.at)
  const parts: { z: number; span: number }[] = []
  let cursor = minZ
  for (const slot of slots) {
    const start = slot.at - slot.half
    if (start - cursor > 0.06) {
      parts.push({ z: (cursor + start) / 2, span: start - cursor })
    }
    cursor = slot.at + slot.half
  }
  if (maxZ - cursor > 0.06) {
    parts.push({ z: (cursor + maxZ) / 2, span: maxZ - cursor })
  }

  return (
    <group>
      {parts.map((part) => (
        <mesh key={`${x}-${part.z}`} position={[x, height / 2, part.z]} receiveShadow>
          <boxGeometry args={[wallT, height, part.span]} />
          <meshStandardMaterial {...wall} />
        </mesh>
      ))}
      {slots.map((slot) => (
        <mesh key={`lintel-z-${x}-${slot.at}`} position={[x, doorH + (height - doorH) / 2, slot.at]} receiveShadow>
          <boxGeometry args={[wallT, height - doorH, slot.half * 2]} />
          <meshStandardMaterial {...wall} />
        </mesh>
      ))}
    </group>
  )
}

function WallAlongX({ z, openings }: { z: number; openings: Opening[] }) {
  const slots = [...openings].sort((a, b) => a.at - b.at)
  const parts: { x: number; span: number }[] = []
  let cursor = -halfX
  for (const slot of slots) {
    const start = slot.at - slot.half
    if (start - cursor > 0.06) {
      parts.push({ x: (cursor + start) / 2, span: start - cursor })
    }
    cursor = slot.at + slot.half
  }
  if (halfX - cursor > 0.06) {
    parts.push({ x: (cursor + halfX) / 2, span: halfX - cursor })
  }

  return (
    <group>
      {parts.map((part) => (
        <mesh key={`${z}-${part.x}`} position={[part.x, height / 2, z]} receiveShadow>
          <boxGeometry args={[part.span, height, wallT]} />
          <meshStandardMaterial {...wall} />
        </mesh>
      ))}
      {slots.map((slot) => (
        <mesh key={`lintel-x-${z}-${slot.at}`} position={[slot.at, doorH + (height - doorH) / 2, z]} receiveShadow>
          <boxGeometry args={[slot.half * 2, height - doorH, wallT]} />
          <meshStandardMaterial {...wall} />
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
      <pointLight position={[0, -0.12, 0]} color="#e8d6a0" intensity={0.85} distance={5.4} decay={2} />
    </group>
  )
}

function Planter() {
  const { x, z, halfX: hx, halfZ: hz } = LOBBY_PLANTER
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[hx * 2, 0.44, hz * 2]} />
        <meshStandardMaterial color="#4a433c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.46, 0]} receiveShadow>
        <boxGeometry args={[hx * 2 - 0.16, 0.08, hz * 2 - 0.16]} />
        <meshStandardMaterial color="#2c241c" roughness={1} />
      </mesh>
      <mesh position={[-0.35, 0.78, 0.12]} castShadow>
        <sphereGeometry args={[0.38, 8, 6]} />
        <meshStandardMaterial color="#1c2418" roughness={0.92} />
      </mesh>
      <mesh position={[0.42, 0.7, -0.18]} castShadow>
        <sphereGeometry args={[0.32, 8, 6]} />
        <meshStandardMaterial color="#182016" roughness={0.92} />
      </mesh>
      <mesh position={[0.08, 0.58, 0.36]} castShadow>
        <sphereGeometry args={[0.24, 8, 6]} />
        <meshStandardMaterial color="#22281c" roughness={0.92} />
      </mesh>
      <mesh position={[hx + 0.38, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.44, 1.28]} />
        <meshStandardMaterial color="#5a5046" roughness={0.82} />
      </mesh>
    </group>
  )
}

function PatioGate() {
  const door = LOBBY_DOORS.exit
  const hall = door.inward
  return (
    <group position={[door.x, 0, door.z]} rotation={[0, door.yaw, 0]}>
      <mesh position={[0, 1.15, 0]} receiveShadow>
        <boxGeometry args={[0.12, 2.3, 1.22]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.55} roughness={0.42} />
      </mesh>
      {[-0.42, -0.21, 0, 0.21, 0.42].map((bar) => (
        <mesh key={bar} position={[hall * 0.02, 1.12, bar]} castShadow>
          <boxGeometry args={[0.04, 2.16, 0.045]} />
          <meshStandardMaterial color="#3a3d42" metalness={0.62} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[hall * 0.02, 2.18, 0]}>
        <boxGeometry args={[0.06, 0.08, 1.16]} />
        <meshStandardMaterial color="#4a4e54" metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh position={[hall * 0.08, 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.12, 1.28]} />
        <meshStandardMaterial color="#1a1c16" roughness={1} />
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
  const eastOpen: Opening[] = [
    { at: LOBBY_DOORS.bathroom.z, half: doorHalf },
    { at: LOBBY_DOORS.exit.z, half: doorHalf },
  ]

  return (
    <group>
      <ambientLight intensity={0.07} color="#8aa0b4" />
      <hemisphereLight args={['#243044', '#0c0c0a', 0.32]} />
      <directionalLight position={[-4.2, 8.5, -3.2]} intensity={0.22} color={MOON} />
      <pointLight position={[0, 2.4, 6.2]} color={MOON} intensity={0.38} distance={11} decay={2} />

      <EmergencyLamp x={-halfX + 0.22} y={2.42} z={6.35} />
      <EmergencyLamp x={halfX - 0.22} y={2.42} z={6.35} />
      <EmergencyLamp x={-2.4} y={2.48} z={maxZ - 0.22} />
      <EmergencyLamp x={2.4} y={2.48} z={maxZ - 0.22} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (minZ + maxZ) / 2]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#3f3e3b" roughness={0.94} metalness={0.04} />
      </mesh>

      <WallAlongZ x={-halfX} openings={westOpen} />
      <WallAlongZ x={halfX} openings={eastOpen} />
      <WallAlongX z={maxZ} openings={[{ at: 0, half: doorHalf }]} />
      <WallAlongX z={minZ} openings={[{ at: 0, half: entranceHalf }]} />

      <mesh position={[0, 1.4, minZ - 1.15]}>
        <planeGeometry args={[width + 6, 7]} />
        <meshBasicMaterial color="#070b14" />
      </mesh>

      <Planter />

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
