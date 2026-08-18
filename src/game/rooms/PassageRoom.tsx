import { Suspense, useLayoutEffect } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import {
  LOBBY,
  LOBBY_COUNTER,
  LOBBY_DOORS,
  LOBBY_DOOR_LIST,
  lobbyColliders,
} from './lobbyLayout'

const { width, depth, height, halfX, minZ, maxZ, doorH, doorHalf, entranceHalf } = LOBBY
const wallT = 0.12
const wall = { color: '#2c2926', roughness: 0.94 }
const wood = { color: '#5c4a3c', roughness: 0.82, metalness: 0.04 }
const MOON = '#c9d8ea'

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

function PassageFloor() {
  const map = useTexture('/textura/piso_madeira.png')

  useLayoutEffect(() => {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(width / 1.45, depth / 1.45)
    map.anisotropy = 8
    map.colorSpace = THREE.SRGBColorSpace
    map.needsUpdate = true
  }, [map])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (minZ + maxZ) / 2]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={map} color="#b7a898" roughness={0.78} metalness={0.05} />
    </mesh>
  )
}

function LobbyLight({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, height - 0.06, z]}>
      <mesh>
        <boxGeometry args={[0.52, 0.05, 0.52]} />
        <meshStandardMaterial color="#d8c8a0" emissive="#efe6d0" emissiveIntensity={0.32} roughness={0.55} />
      </mesh>
      <pointLight position={[0, -0.22, 0]} color="#efe6d0" intensity={1.05} distance={7.4} decay={2} />
    </group>
  )
}

function OfficeCounter() {
  const { x, z, halfX: hx, halfZ: hz } = LOBBY_COUNTER
  return (
    <group>
      <Examinable id="lobby-counter">
        <group position={[x, 0, z]}>
          <mesh position={[0.04, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[hx * 2, 1.0, hz * 2]} />
            <meshStandardMaterial {...wood} />
          </mesh>
          <mesh position={[-0.04, 1.04, 0]} castShadow>
            <boxGeometry args={[hx * 2 + 0.18, 0.08, hz * 2 + 0.12]} />
            <meshStandardMaterial color="#6e5a48" roughness={0.7} metalness={0.05} />
          </mesh>
          <mesh position={[-hx + 0.02, 1.16, 0]} receiveShadow>
            <boxGeometry args={[0.07, 0.24, hz * 2]} />
            <meshStandardMaterial color="#3a322c" roughness={0.88} />
          </mesh>
        </group>
      </Examinable>

      <mesh position={[halfX - 0.05, 1.58, z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.28, 1.12]} />
        <meshStandardMaterial color="#2a2824" roughness={0.55} metalness={0.22} />
      </mesh>
      <mesh position={[halfX - 0.04, 1.58, z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.08, 0.92]} />
        <meshStandardMaterial color="#9aa8b4" transparent opacity={0.18} roughness={0.2} metalness={0.08} />
      </mesh>
    </group>
  )
}

export function PassageRoom() {
  useLayoutEffect(() => {
    setRoomColliders('passage', lobbyColliders())
    return () => clearRoomColliders('passage')
  }, [])

  const westOpen: Opening[] = [
    { at: LOBBY_DOORS.library.z, half: doorHalf },
    { at: LOBBY_DOORS.storage.z, half: doorHalf },
  ]
  const eastOpen: Opening[] = [
    { at: LOBBY_DOORS.office.z, half: doorHalf },
    { at: LOBBY_DOORS.exit.z, half: doorHalf },
  ]

  return (
    <group>
      <ambientLight intensity={0.15} color="#a8b8c4" />
      <hemisphereLight args={['#3d5a74', '#0e0c0a', 0.22]} />
      <pointLight position={[0, 1.7, 0.35]} color={MOON} intensity={0.55} distance={5.4} decay={2} />

      <LobbyLight x={-2.15} z={3.15} />
      <LobbyLight x={2.15} z={3.15} />
      <LobbyLight x={-2.15} z={7.35} />
      <LobbyLight x={2.15} z={7.35} />

      <Suspense
        fallback={
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, depth / 2]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#3a342e" roughness={0.92} />
          </mesh>
        }
      >
        <PassageFloor />
      </Suspense>

      <mesh position={[0, height, (minZ + maxZ) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#141210" roughness={1} />
      </mesh>

      <WallAlongZ x={-halfX} openings={westOpen} />
      <WallAlongZ x={halfX} openings={eastOpen} />
      <WallAlongX z={maxZ} openings={[{ at: 0, half: doorHalf }]} />
      <WallAlongX z={minZ} openings={[{ at: 0, half: entranceHalf }]} />

      <mesh position={[0, 1.35, minZ - 0.82]}>
        <planeGeometry args={[width + 4, 6]} />
        <meshBasicMaterial color="#070b14" />
      </mesh>

      <OfficeCounter />

      {LOBBY_DOOR_LIST.map((door) => (
        <Examinable key={door.id} id={door.examineId}>
          <HallwayDoor
            x={door.x}
            z={door.z}
            inward={door.inward}
            yaw={door.yaw}
            label={door.label}
            subtitle={door.subtitle}
            rattles
          />
        </Examinable>
      ))}
    </group>
  )
}

useTexture.preload('/textura/piso_madeira.png')
