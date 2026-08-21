import { useEffect, useLayoutEffect } from 'react'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { LOBBY_LIGHTS } from '../inventory/flashlight'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import {
  LOBBY,
  LOBBY_DOORS,
  LOBBY_DOOR_LIST,
  LOBBY_PLANTER,
  LOBBY_COUNTER,
  LOBBY_BENCHES,
  LOBBY_BIN,
  LOBBY_EXTINGUISHER,
  lobbyColliders,
} from './lobbyLayout'
import { TexturedFloor } from './TexturedFloor'

const { width, depth, height, halfX, minZ, maxZ, doorH, doorHalf, entranceHalf } = LOBBY
const NEAR_Z = LOBBY_DOORS.library.z
const FAR_Z = LOBBY_DOORS.storage.z
const DIR_X = LOBBY_DOORS.office.x
const wallT = 0.38
const brick = { color: '#2c2a27', roughness: 0.94 }
const brickDark = { color: '#23211e', roughness: 0.96 }

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

function EmergencyLamp({ x, y, z, on }: { x: number; y: number; z: number; on: boolean }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[0.28, 0.1, 0.14]} />
        {on ? (
          <meshStandardMaterial color="#f2ead4" emissive="#f0e2c4" emissiveIntensity={2.2} roughness={0.35} />
        ) : (
          <meshStandardMaterial color="#3a3428" emissive="#e6d08a" emissiveIntensity={0.04} roughness={0.45} />
        )}
      </mesh>
      {on ? (
        <pointLight position={[0, -0.55, 0]} color="#f0e2c4" intensity={5.2} distance={10} decay={1.65} />
      ) : null}
    </group>
  )
}

function CeilingStrip({ x, z, span, on }: { x: number; z: number; span: number; on: boolean }) {
  return (
    <mesh position={[x, height - 0.04, z]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.16, span]} />
      <meshBasicMaterial color={on ? '#f2ead4' : '#1c1a14'} fog={false} />
    </mesh>
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

function Planter() {
  const { x, z, halfX: hx } = LOBBY_PLANTER
  return (
    <group position={[x, 0, z]}>
      <FurnitureModel url="/canteiro.glb" position={[0, 0, 0]} targetWidth={hx * 2} pickable={false} />
      <FurnitureModel url="/estatua_patio_cima.glb" position={[0, 0.32, 0]} targetHeight={1.72} pickable={false} />
    </group>
  )
}

function PatioGate() {
  const door = LOBBY_DOORS.exit
  return (
    <group position={[door.x, 0, door.z + 0.08]} rotation={[0, door.yaw + Math.PI / 2, 0]}>
      <FurnitureModel url="/portao_saida.glb" position={[0, 0, 0]} targetHeight={2.05} pickable={false} />
    </group>
  )
}

function ExitStairs() {
  const door = LOBBY_DOORS.exit
  return (
    <group position={[door.x, -1.12, door.z + 0.72]}>
      <FurnitureModel url="/escada_saida.glb" position={[0, 0, 0.18]} rotationY={Math.PI} targetWidth={1.42} pickable={false} />
      <mesh position={[0, -0.55, 1.85]}>
        <boxGeometry args={[2.2, 2.2, 1.5]} />
        <meshBasicMaterial color="#05060a" />
      </mesh>
    </group>
  )
}

function PatioCounter() {
  const { x, z, half } = LOBBY_COUNTER
  return (
    <group position={[x, 0, z - 0.02]}>
      <mesh position={[0, 1.48, 0]} receiveShadow>
        <boxGeometry args={[half * 2, 1.08, 0.12]} />
        <meshStandardMaterial color="#4a4038" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.48, -0.04]}>
        <boxGeometry args={[half * 2 - 0.22, 0.86, 0.06]} />
        <meshStandardMaterial color="#3a5a68" roughness={0.28} metalness={0.22} emissive="#1a3040" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 1.04, -0.16]} receiveShadow>
        <boxGeometry args={[half * 2 + 0.08, 0.1, 0.32]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.82} />
      </mesh>
    </group>
  )
}

export function PassageRoom() {
  const lightsOn = useGameStore((s) => Boolean(s.flags[LOBBY_LIGHTS]))
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
      {lightsOn ? (
        <>
          <ambientLight intensity={0.32} color="#b8c4bc" />
          <hemisphereLight args={['#4a5c68', '#161410', 0.4]} />
          <pointLight position={[0, 2.35, 2.45]} color="#f0e2c4" intensity={8.4} distance={11} decay={1.6} />
          <pointLight position={[0, 2.35, 5.05]} color="#f0e2c4" intensity={8.4} distance={11} decay={1.6} />
          <pointLight position={[0, 2.2, 3.55]} color="#efe6d0" intensity={6.8} distance={12} decay={1.6} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.012} color="#6a7c90" />
          <hemisphereLight args={['#15202c', '#05060a', 0.07]} />
          <directionalLight position={[-3.4, 8.5, -2.2]} intensity={0.06} color="#8aa6bc" />
        </>
      )}

      <CeilingStrip x={-1.65} z={3.4} span={4.6} on={lightsOn} />
      <CeilingStrip x={1.65} z={3.4} span={4.6} on={lightsOn} />
      <EmergencyLamp x={-halfX + 0.28} y={2.48} z={NEAR_Z} on={lightsOn} />
      <EmergencyLamp x={-halfX + 0.28} y={2.48} z={FAR_Z} on={lightsOn} />
      <EmergencyLamp x={halfX - 0.28} y={2.48} z={NEAR_Z} on={lightsOn} />
      <EmergencyLamp x={DIR_X} y={2.52} z={maxZ - 0.28} on={lightsOn} />

      <TexturedFloor
        src="/textura/piso_patio_interno.png"
        width={width}
        depth={depth}
        z={(minZ + maxZ) / 2}
        tile={4}
        color="#d8d6d2"
        roughness={0.92}
        metalness={0.03}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, (minZ + maxZ) / 2]}>
        <planeGeometry args={[70, 70]} />
        <meshBasicMaterial color="#07090e" />
      </mesh>

      <RoomMass cx={-halfX - 1.95} cz={(minZ + maxZ) / 2} sx={3.9} sz={maxZ - minZ} />
      <RoomMass cx={halfX + 1.85} cz={(minZ + maxZ) / 2} sx={3.7} sz={maxZ - minZ} />
      <RoomMass cx={DIR_X} cz={maxZ + 1.85} sx={5.4} sz={3.7} />

      <WallAlongZ x={-halfX} from={minZ} to={maxZ} openings={westOpen} />
      <WallAlongZ x={halfX} from={minZ} to={maxZ} openings={eastOpen} />
      <WallAlongX z={maxZ} from={-halfX} to={halfX} openings={northOpen} />
      <WallAlongX z={minZ} from={-halfX} to={halfX} openings={[{ at: 0, half: entranceHalf }]} />

      <mesh position={[0, 1.55, minZ - 2.4]}>
        <planeGeometry args={[width + 10, 8]} />
        <meshBasicMaterial color="#06080d" />
      </mesh>

      <Planter />
      <ExitStairs />

      <Examinable id="lobby-counter">
        <PatioCounter />
      </Examinable>
      {LOBBY_BENCHES.map((bench) => (
        <Examinable key={`lobby-bench-${bench.x}-${bench.z}`} id="lobby-bench">
          <FurnitureModel
            url="/banco_patio.glb"
            position={[bench.x, 0, bench.z]}
            rotationY={bench.rot}
            targetHeight={bench.height}
            targetWidth={bench.width}
          />
        </Examinable>
      ))}
      <Examinable id="lobby-bin">
        <FurnitureModel url="/lixeira.glb" position={[LOBBY_BIN.x, 0, LOBBY_BIN.z]} targetHeight={0.62} />
      </Examinable>
      <Examinable id="lobby-extinguisher">
        <FurnitureModel
          url="/extintor.glb"
          position={[LOBBY_EXTINGUISHER.x, 0, LOBBY_EXTINGUISHER.z]}
          rotationY={Math.PI / 2}
          targetHeight={0.72}
        />
      </Examinable>

      {LOBBY_DOOR_LIST.filter((door) => door.kind === 'door').map((door) => (
        <Examinable key={door.id} id={door.examineId}>
          <HallwayDoor
            x={door.wall === 'west' ? door.x - 0.16 : door.x}
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
