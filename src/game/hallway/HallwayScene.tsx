import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { Aabb } from '../data/furniture'
import { Examinable } from '../examine/Examinable'
import { clearRoomColliders, setRoomColliders } from '../rooms/roomColliders'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { HallwayDoor } from './HallwayDoor'
import { HALL, HALL_DOORS, HALL_MURALS, HALL_PROPS } from './hallwayLayout'
import { hasDarkHallClues } from './darkProgress'
import { HALL_LOCKERS, hallwayLockerZs, lockerPlateName, LOCKER_WALL_X } from './lockers'
import { useHallwayStore } from './useHallwayStore'
import { useLockerPinStore } from './useLockerPin'
import { getHallBoardTexture } from '../examine/paperTextures'
import { useFragmentsStore } from '../state/useFragmentsStore'

const wall = { color: '#2c2926', roughness: 0.94 }
const BAYS = [2.05, 6.25, 10.45, 14.65, 18.85]

type Opening = { z: number; half: number }

function clockAngle(hours: number, minutes: number, kind: 'hour' | 'minute') {
  const turn =
    kind === 'minute' ? minutes / 60 : (hours % 12) / 12 + minutes / 60 / 12
  return Math.PI / 2 - turn * Math.PI * 2
}

function ClockHand({
  angle,
  length,
  width,
  color,
  z,
}: {
  angle: number
  length: number
  width: number
  color: string
  z: number
}) {
  return (
    <mesh
      rotation={[0, 0, angle]}
      position={[(Math.cos(angle) * length) / 2, (Math.sin(angle) * length) / 2, z]}
    >
      <boxGeometry args={[length, width, 0.008]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function HallClock({ map }: { map: THREE.CanvasTexture | null }) {
  const hourAngle = clockAngle(3, 17, 'hour')
  const minuteAngle = clockAngle(3, 17, 'minute')
  const { x, y, z } = HALL_PROPS.clock
  return (
    <Examinable id="hall-clock">
      <group position={[x, y, z]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.012]}>
          <cylinderGeometry args={[0.33, 0.345, 0.036, 28]} />
          <meshStandardMaterial color="#1a1816" roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.008]}>
          <circleGeometry args={[0.3, 32]} />
          <meshStandardMaterial map={map} color="#d8d0c4" roughness={0.7} />
        </mesh>
        <ClockHand angle={hourAngle} length={0.14} width={0.022} color="#2b2420" z={0.02} />
        <ClockHand angle={minuteAngle} length={0.21} width={0.014} color="#3a332e" z={0.024} />
        <mesh position={[0, 0, 0.028]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color="#1c1814" />
        </mesh>
      </group>
    </Examinable>
  )
}

const HALL_MURAL_PHOTO = {
  lost: '/image/foto-achados.png',
  photos: '/image/foto-turma-corredor.png',
} as const

function HallPhotoPlane({ src, w, h }: { src: string; w: number; h: number }) {
  const map = useTexture(src)
  map.colorSpace = THREE.SRGBColorSpace
  return (
    <mesh position={[0, 0, 0.002]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={map} roughness={0.88} />
    </mesh>
  )
}

function HallMural({
  id,
  z,
  y,
  w,
  h,
  kind,
}: (typeof HALL_MURALS)[number]) {
  const map = useMemo(() => getHallBoardTexture(kind), [kind])
  const photo = kind === 'notes' ? null : HALL_MURAL_PHOTO[kind]
  return (
    <Examinable id={id}>
      <group position={[HALL.halfX - 0.065, y, z]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, -0.025]} receiveShadow>
          <boxGeometry args={[w + 0.1, h + 0.1, 0.05]} />
          <meshStandardMaterial color="#5c4634" roughness={0.92} />
        </mesh>
        {photo ? (
          <Suspense fallback={null}>
            <HallPhotoPlane src={photo} w={w} h={h} />
          </Suspense>
        ) : (
          <>
            <mesh position={[0, 0, 0.002]}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial map={map} roughness={0.88} />
            </mesh>
            <mesh position={[-w * 0.28, h * 0.18, 0.03]} rotation={[0, 0, 0.12]} castShadow>
              <planeGeometry args={[0.28, 0.34]} />
              <meshStandardMaterial color="#efe6d4" roughness={0.82} />
            </mesh>
            <mesh position={[w * 0.22, -h * 0.16, 0.028]} rotation={[0, 0, -0.08]} castShadow>
              <planeGeometry args={[0.32, 0.22]} />
              <meshStandardMaterial color="#fff3b0" roughness={0.8} />
            </mesh>
            <mesh position={[w * 0.32, h * 0.28, 0.032]} rotation={[0, 0, 0.06]}>
              <circleGeometry args={[0.018, 10]} />
              <meshBasicMaterial color="#c43c3c" />
            </mesh>
          </>
        )}
      </group>
    </Examinable>
  )
}

function clockFaceTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#e8e0d4'
  ctx.beginPath()
  ctx.arc(256, 256, 248, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#2a2420'
  ctx.lineWidth = 10
  ctx.stroke()
  ctx.fillStyle = '#1c1814'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 52px Georgia, serif'
  for (let i = 1; i <= 12; i += 1) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2
    ctx.fillText(String(i), 256 + Math.cos(a) * 185, 256 + Math.sin(a) * 185)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function WallRun({ x, openings }: { x: number; openings: Opening[] }) {
  const slots = [...openings].sort((a, b) => a.z - b.z)
  const parts: { z: number; span: number }[] = []
  let cursor = HALL.minZ
  for (const slot of slots) {
    const start = slot.z - slot.half
    if (start - cursor > 0.06) {
      parts.push({ z: (cursor + start) / 2, span: start - cursor })
    }
    cursor = slot.z + slot.half
  }
  if (HALL.maxZ - cursor > 0.06) {
    parts.push({ z: (cursor + HALL.maxZ) / 2, span: HALL.maxZ - cursor })
  }

  return (
    <group>
      {parts.map((part) => (
        <mesh key={`${x}-${part.z}`} position={[x, HALL.height / 2, part.z]} receiveShadow>
          <boxGeometry args={[0.12, HALL.height, part.span]} />
          <meshStandardMaterial {...wall} />
        </mesh>
      ))}
      {slots.map((slot) => (
        <mesh key={`lintel-${x}-${slot.z}`} position={[x, HALL.doorH + (HALL.height - HALL.doorH) / 2, slot.z]} receiveShadow>
          <boxGeometry args={[0.12, HALL.height - HALL.doorH, slot.half * 2]} />
          <meshStandardMaterial {...wall} />
        </mesh>
      ))}
    </group>
  )
}

function WestWindowWall() {
  const x = -HALL.halfX
  const sill = HALL_PROPS.windowSill
  const winH = HALL_PROPS.windowH
  const half = HALL_PROPS.sideWindowHalf
  const zs = HALL_PROPS.sideWindows
  const topH = HALL.height - sill - winH
  const winY = sill + winH / 2
  const midZ = (HALL.minZ + HALL.maxZ) / 2
  const len = HALL.maxZ - HALL.minZ
  const rotationY = Math.PI / 2 + Math.PI + Math.PI / 4 + (55 * Math.PI) / 180
  const edges = [HALL.minZ, ...zs.flatMap((z) => [z - half, z + half]), HALL.maxZ]

  return (
    <group>
      <mesh position={[x, sill / 2, midZ]} receiveShadow>
        <boxGeometry args={[0.12, sill, len]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[x, sill + winH + topH / 2, midZ]} receiveShadow>
        <boxGeometry args={[0.12, topH, len]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {Array.from({ length: edges.length / 2 }, (_, i) => {
        const a = edges[i * 2]
        const b = edges[i * 2 + 1]
        const span = b - a
        if (span < 0.08) return null
        return (
          <mesh key={`pier-${i}`} position={[x, winY, (a + b) / 2]} receiveShadow>
            <boxGeometry args={[0.12, winH, span]} />
            <meshStandardMaterial {...wall} />
          </mesh>
        )
      })}
      <mesh position={[x - 1.15, 1.55, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[len + 4, 7.2]} />
        <meshBasicMaterial color="#070b14" />
      </mesh>
      {zs.map((z, index) => (
        <group key={`side-win-${z}`}>
          <mesh position={[x - 0.08, winY, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[half * 2 - 0.08, winH - 0.08]} />
            <meshBasicMaterial color="#8fb4d2" transparent opacity={0.18} />
          </mesh>
          <mesh position={[x - 1.05, 2.58, z - 0.4]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[0.3, 28]} />
            <meshBasicMaterial color="#e7eef8" />
          </mesh>
          <mesh position={[x - 1.04, 2.58, z - 0.4]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[0.68, 28]} />
            <meshBasicMaterial color="#9bb4d4" transparent opacity={0.14} />
          </mesh>
          <pointLight position={[x + 0.38, winY, z]} color="#7fa3c6" intensity={0.85} distance={5.6} decay={2} />
          <Examinable id={`hall-window-side-${index + 1}`}>
            <Suspense fallback={null}>
              <FurnitureModel
                url="/janela.glb"
                position={[x + 0.03, winY, z]}
                rotationY={rotationY}
                targetHeight={winH - 0.06}
                anchor="center"
              />
            </Suspense>
          </Examinable>
        </group>
      ))}
    </group>
  )
}

function Pendant({ z, dim = false }: { z: number; dim?: boolean }) {
  const color = dim ? '#c47a6a' : '#f0e2c4'
  return (
    <group position={[0, HALL.height, z]}>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.16, 8]} />
        <meshStandardMaterial color="#1a1816" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.28, 12]} />
        <meshStandardMaterial color="#2a2622" roughness={0.55} metalness={0.18} />
      </mesh>
      <mesh position={[0, -0.56, 0]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#f2ead4" emissive={color} emissiveIntensity={dim ? 0.45 : 1.8} />
      </mesh>
      <pointLight position={[0, -0.85, 0]} color={color} intensity={dim ? 0.45 : 1.75} distance={dim ? 6 : 8.4} decay={2} />
    </group>
  )
}

function CeilingBay({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, HALL.height - 0.18, 0]} receiveShadow>
        <boxGeometry args={[HALL.halfX * 2 - 0.08, 0.14, 0.22]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>
      <mesh position={[-HALL.halfX + 0.1, HALL.height - 0.52, 0]} receiveShadow>
        <boxGeometry args={[0.16, 0.82, 0.22]} />
        <meshStandardMaterial color="#1c1a18" roughness={0.9} />
      </mesh>
      <mesh position={[HALL.halfX - 0.1, HALL.height - 0.52, 0]} receiveShadow>
        <boxGeometry args={[0.16, 0.82, 0.22]} />
        <meshStandardMaterial color="#1c1a18" roughness={0.9} />
      </mesh>
    </group>
  )
}

function HallwayFloor() {
  const map = useTexture('/textura/piso_madeira.png')
  const midZ = (HALL.minZ + HALL.maxZ) / 2
  const len = HALL.maxZ - HALL.minZ
  const width = HALL.halfX * 2

  useLayoutEffect(() => {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(width / 1.45, len / 1.45)
    map.anisotropy = 8
    map.colorSpace = THREE.SRGBColorSpace
    map.needsUpdate = true
  }, [map, width, len])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, midZ]} receiveShadow>
      <planeGeometry args={[width, len]} />
      <meshStandardMaterial map={map} color="#b7a898" roughness={0.78} metalness={0.05} />
    </mesh>
  )
}

function EndWindowWall() {
  const z = HALL.minZ
  const sill = HALL_PROPS.windowSill
  const winH = HALL_PROPS.windowH
  const half = HALL_PROPS.windowHalf
  const topH = HALL.height - sill - winH
  const pier = HALL.halfX - half
  const winY = sill + winH / 2
  const rotationY = Math.PI + Math.PI / 4 + (55 * Math.PI) / 180
  const moon = useRef<THREE.SpotLight>(null)
  const sun = useRef<THREE.DirectionalLight>(null)

  useLayoutEffect(() => {
    if (moon.current) {
      moon.current.target.position.set(0, 0.7, 8.5)
      moon.current.target.updateMatrixWorld()
    }
    if (sun.current) {
      sun.current.target.position.set(0, 1.05, 6.2)
      sun.current.target.updateMatrixWorld()
    }
  }, [])

  return (
    <group>
      <mesh position={[0, sill / 2, z]} receiveShadow>
        <boxGeometry args={[HALL.halfX * 2, sill, 0.12]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[0, sill + winH + topH / 2, z]} receiveShadow>
        <boxGeometry args={[HALL.halfX * 2, topH, 0.12]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[(-HALL.halfX - half) / 2, winY, z]} receiveShadow>
        <boxGeometry args={[pier, winH, 0.12]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[(HALL.halfX + half) / 2, winY, z]} receiveShadow>
        <boxGeometry args={[pier, winH, 0.12]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <group position={[0, 0, z - 0.95]}>
        <mesh position={[0, 1.55, 0]}>
          <planeGeometry args={[HALL.halfX * 2 + 5, 7.2]} />
          <meshBasicMaterial color="#070b14" />
        </mesh>
        <mesh position={[0.48, 2.58, 0.02]}>
          <circleGeometry args={[0.3, 28]} />
          <meshBasicMaterial color="#e7eef8" />
        </mesh>
        <mesh position={[0.48, 2.58, 0.01]}>
          <circleGeometry args={[0.68, 28]} />
          <meshBasicMaterial color="#9bb4d4" transparent opacity={0.14} />
        </mesh>
      </group>
      <mesh position={[0, winY, z - 0.05]}>
        <planeGeometry args={[half * 2 - 0.06, winH - 0.06]} />
        <meshBasicMaterial color="#8fb4d2" transparent opacity={0.2} />
      </mesh>
      <directionalLight ref={sun} position={[0.35, 3.15, z - 4.2]} intensity={0.62} color="#9ec5e8" />
      <spotLight
        ref={moon}
        position={[0.2, winY + 0.55, z - 1.85]}
        intensity={9.2}
        color="#c4dcf0"
        angle={0.82}
        penumbra={0.58}
        distance={18}
        decay={1.65}
      />
      <pointLight position={[0, winY, z + 0.55]} color="#c5ddf0" intensity={2.55} distance={12} decay={2} />
      <pointLight position={[0, 1.08, z + 2.35]} color="#a8c8e0" intensity={1.2} distance={9.5} decay={2} />
      <Examinable id="hall-window">
        <Suspense fallback={null}>
          <FurnitureModel
            url="/janela.glb"
            position={[0, winY, HALL_PROPS.windowZ]}
            rotationY={rotationY}
            targetHeight={winH - 0.06}
            anchor="center"
          />
        </Suspense>
      </Examinable>
    </group>
  )
}

function lockerPlateTexture(name: string, number: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 160
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#efe6d0'
  ctx.fillRect(0, 0, 512, 160)
  ctx.strokeStyle = '#3a322c'
  ctx.lineWidth = 10
  ctx.strokeRect(8, 8, 496, 144)
  ctx.fillStyle = '#5a4a3a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 28px Georgia, "Times New Roman", serif'
  ctx.fillText(String(number), 256, 42)
  if (!name) {
    ctx.fillStyle = 'rgba(28, 24, 20, 0.22)'
    ctx.font = 'bold 54px Georgia, "Times New Roman", serif'
    ctx.fillText('••••••', 256, 104)
    ctx.strokeStyle = '#2a221c'
    ctx.lineCap = 'round'
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.moveTo(78, 72)
    ctx.lineTo(434, 128)
    ctx.moveTo(92, 132)
    ctx.lineTo(420, 70)
    ctx.moveTo(70, 98)
    ctx.lineTo(442, 112)
    ctx.moveTo(118, 64)
    ctx.lineTo(388, 138)
    ctx.moveTo(156, 140)
    ctx.lineTo(360, 68)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(18, 14, 12, 0.55)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(96, 88)
    ctx.lineTo(400, 120)
    ctx.moveTo(130, 124)
    ctx.lineTo(390, 86)
    ctx.stroke()
  } else {
    ctx.fillStyle = '#1c1814'
    let size = 62
    ctx.font = `bold ${size}px Georgia, "Times New Roman", serif`
    while (size > 36 && ctx.measureText(name).width > 440) {
      size -= 2
      ctx.font = `bold ${size}px Georgia, "Times New Roman", serif`
    }
    ctx.fillText(name, 256, 102)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function LockerNamePlate({ name, number }: { name: string; number: number }) {
  const map = useMemo(() => lockerPlateTexture(name, number), [name, number])
  useEffect(() => () => map?.dispose(), [map])
  if (!map) return null
  return (
    <group position={[0.268, 1.18, 0]}>
      <mesh>
        <boxGeometry args={[0.006, 0.1, 0.26]} />
        <meshBasicMaterial color="#cfc3a8" />
      </mesh>
      <mesh position={[0.0035, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.24, 0.088]} />
        <meshBasicMaterial map={map} />
      </mesh>
    </group>
  )
}

function HallLocker({
  locker,
  z,
  number,
}: {
  locker: (typeof HALL_LOCKERS)[number]
  z: number
  number: number
}) {
  const open = useLockerPinStore((s) => s.openIds.includes(locker.id))
  return (
    <group position={[LOCKER_WALL_X, 0, z]}>
      <Examinable id={locker.id}>
        <FurnitureModel
          url={open ? '/armario_aberto.glb' : '/armario_fechado.glb'}
          position={[0, 0, 0]}
          rotationY={0}
          targetHeight={1.72}
          pickable={false}
        />
        <mesh position={[0.14, 0.86, 0]}>
          <boxGeometry args={[0.36, 1.7, 0.34]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <LockerNamePlate name={lockerPlateName(locker)} number={number} />
      </Examinable>
    </group>
  )
}

function HallLockers() {
  const zs = useMemo(() => hallwayLockerZs(), [])
  return (
    <Suspense fallback={null}>
      <group>
        {HALL_LOCKERS.map((locker, index) => (
          <HallLocker key={locker.id} locker={locker} z={zs[index]} number={index + 1} />
        ))}
      </group>
    </Suspense>
  )
}

function OpenEndPassage() {
  const z0 = HALL.maxZ
  const opening = 1.92
  const pier = (HALL.halfX * 2 - opening) / 2

  return (
    <group>
      <mesh position={[-(opening / 2 + pier / 2), HALL.height / 2, z0]} receiveShadow>
        <boxGeometry args={[pier, HALL.height, 0.14]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[opening / 2 + pier / 2, HALL.height / 2, z0]} receiveShadow>
        <boxGeometry args={[pier, HALL.height, 0.14]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[0, HALL.doorH + (HALL.height - HALL.doorH) / 2, z0]} receiveShadow>
        <boxGeometry args={[opening, HALL.height - HALL.doorH, 0.14]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[0, 1.15, z0 + 1.15]}>
        <planeGeometry args={[HALL.halfX * 2 + 2.4, 5.4]} />
        <meshBasicMaterial color="#c5d4e4" />
      </mesh>
      <mesh position={[0, 0.01, z0 + 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[opening + 0.35, 1.2]} />
        <meshStandardMaterial color="#b7a898" roughness={0.82} />
      </mesh>
      <pointLight position={[0, 2.05, z0 + 0.35]} color="#efe6d0" intensity={1.35} distance={7.2} decay={2} />
      <spotLight
        position={[0, 2.4, z0 + 0.15]}
        intensity={5.2}
        color="#c9d8ea"
        angle={0.7}
        penumbra={0.72}
        distance={8.5}
        decay={1.7}
      />
    </group>
  )
}

function DarkEndMist() {
  const z0 = HALL.maxZ
  const w = HALL.halfX * 2 + 0.35
  const h = HALL.height + 0.35
  const layers = [
    { z: z0 - 1.35, opacity: 0.12 },
    { z: z0 - 0.72, opacity: 0.22 },
    { z: z0 - 0.22, opacity: 0.4 },
    { z: z0 + 0.08, opacity: 0.72 },
  ] as const

  return (
    <group>
      {layers.map((layer) => (
        <mesh key={layer.z} position={[0, HALL.height / 2, layer.z]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#0b0d12" transparent opacity={layer.opacity} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[0, HALL.height / 2, z0 + 0.18]}>
        <boxGeometry args={[w + 0.2, h + 0.2, 0.36]} />
        <meshBasicMaterial color="#0b0d12" />
      </mesh>
    </group>
  )
}

function doorBlock(z: number, side: 1 | -1): Aabb {
  const x = HALL.halfX * side
  const intoHall = 0.24
  return {
    minX: side > 0 ? x - intoHall : x - 0.1,
    maxX: side > 0 ? x + 0.1 : x + intoHall,
    minZ: z - HALL.doorHalf,
    maxZ: z + HALL.doorHalf,
  }
}

function hallSideWalls(): Aabb[] {
  const h = HALL.halfX
  const inward = 0.08
  const outward = 0.55
  const doors = [HALL_DOORS.room11, HALL_DOORS.room12, HALL_DOORS.room13, HALL_DOORS.room14]
  const east: Aabb[] = []
  let cursor = HALL.minZ
  for (const door of doors) {
    const start = door.z - HALL.doorHalf
    if (start - cursor > 0.04) {
      east.push({ minX: h - inward, maxX: h + outward, minZ: cursor, maxZ: start })
    }
    cursor = door.z + HALL.doorHalf
  }
  if (HALL.maxZ - cursor > 0.04) {
    east.push({ minX: h - inward, maxX: h + outward, minZ: cursor, maxZ: HALL.maxZ })
  }
  return [
    { minX: -h - outward, maxX: -h + inward, minZ: HALL.minZ - 0.2, maxZ: HALL.maxZ + 0.2 },
    ...east,
  ]
}

export function HallwayScene() {
  const clockMap = useMemo(() => clockFaceTexture(), [])
  const labOpen = useHallwayStore((s) => s.labDoor === 'open')
  const hallOpen = useFragmentsStore((s) => hasDarkHallClues(s.entries))

  useEffect(() => {
    return () => {
      clockMap?.dispose()
    }
  }, [clockMap])

  useLayoutEffect(() => {
    const h = HALL.halfX
    const lockers = hallwayLockerZs().map((z) => ({
      minX: -h,
      maxX: -h + 0.3,
      minZ: z - 0.28,
      maxZ: z + 0.28,
    }))
    const boxes: Aabb[] = [
      { minX: -h, maxX: h, minZ: HALL.minZ - 0.18, maxZ: HALL.minZ + 0.1 },
      ...(hallOpen
        ? [
            { minX: -h, maxX: -0.96, minZ: HALL.maxZ - 0.1, maxZ: HALL.maxZ + 0.18 },
            { minX: 0.96, maxX: h, minZ: HALL.maxZ - 0.1, maxZ: HALL.maxZ + 0.18 },
          ]
        : [{ minX: -h, maxX: h, minZ: HALL_PROPS.darkFrom, maxZ: HALL.maxZ + 0.22 }]),
      { minX: -h + 0.08, maxX: -h + 0.62, minZ: 16.85, maxZ: 17.85 },
      { minX: h - 0.62, maxX: h - 0.08, minZ: 17.15, maxZ: 17.9 },
      ...hallSideWalls(),
      ...(labOpen ? [] : [doorBlock(HALL_DOORS.room12.z, 1)]),
      doorBlock(HALL_DOORS.room13.z, 1),
      doorBlock(HALL_DOORS.room14.z, 1),
      ...lockers,
    ]
    setRoomColliders('hallway', boxes)
    return () => clearRoomColliders('hallway')
  }, [labOpen, hallOpen])

  const midZ = (HALL.minZ + HALL.maxZ) / 2
  const len = HALL.maxZ - HALL.minZ
  const eastOpen: Opening[] = [
    { z: HALL_DOORS.room11.z, half: HALL.doorHalf },
    { z: HALL_DOORS.room12.z, half: HALL.doorHalf },
    { z: HALL_DOORS.room13.z, half: HALL.doorHalf },
    { z: HALL_DOORS.room14.z, half: HALL.doorHalf },
  ]

  return (
    <group>
      <ambientLight intensity={0.2} color="#a8b8b0" />
      <hemisphereLight args={['#3a4c58', '#12100e', 0.28]} />
      <pointLight position={[0, 1.75, HALL.minZ + 0.55]} color="#8fb6d6" intensity={1.15} distance={7.4} decay={2} />
      <pointLight position={[0, 2.2, 8.3]} color="#d8c8a8" intensity={0.45} distance={8} decay={2} />
      <pointLight
        position={[0.1, 1.25, HALL.maxZ - 1.15]}
        color={hallOpen ? '#efe6d0' : '#6a1c1c'}
        intensity={hallOpen ? 1.05 : 0.22}
        distance={hallOpen ? 6.4 : 4.2}
        decay={2}
      />

      {BAYS.map((z, i) => (
        <group key={z}>
          <CeilingBay z={z} />
          <Pendant z={z} dim={!hallOpen && i === BAYS.length - 1} />
        </group>
      ))}

      <Suspense
        fallback={
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, midZ]} receiveShadow>
            <planeGeometry args={[HALL.halfX * 2, len]} />
            <meshStandardMaterial color="#4a4038" roughness={0.92} />
          </mesh>
        }
      >
        <HallwayFloor />
      </Suspense>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HALL.height, midZ]}>
        <planeGeometry args={[HALL.halfX * 2, len]} />
        <meshStandardMaterial color="#141210" roughness={1} />
      </mesh>

      <WestWindowWall />
      <HallLockers />
      <WallRun x={HALL.halfX} openings={eastOpen} />

      {hallOpen ? <OpenEndPassage /> : <DarkEndMist />}

      <EndWindowWall />

      <Examinable id="hall-passage">
        <mesh position={[0, 1.35, HALL_PROPS.passageZ]}>
          <boxGeometry args={[2.4, 2.6, 0.32]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </Examinable>

      <Examinable id="hall-door-11">
        <HallwayDoor
          x={HALL_DOORS.room11.x}
          z={HALL_DOORS.room11.z}
          inward={-1}
          label={HALL_DOORS.room11.label}
          subtitle={HALL_DOORS.room11.subtitle}
          open
        />
      </Examinable>
      <Examinable id="hall-door-12">
        <HallwayDoor
          x={HALL_DOORS.room12.x}
          z={HALL_DOORS.room12.z}
          inward={-1}
          label={HALL_DOORS.room12.label}
          subtitle={HALL_DOORS.room12.subtitle}
          lab
        />
      </Examinable>
      <Examinable id="hall-door-13">
        <HallwayDoor
          x={HALL_DOORS.room13.x}
          z={HALL_DOORS.room13.z}
          inward={-1}
          label={HALL_DOORS.room13.label}
          subtitle={HALL_DOORS.room13.subtitle}
          rattles
        />
      </Examinable>
      <Examinable id="hall-door-14">
        <HallwayDoor
          x={HALL_DOORS.room14.x}
          z={HALL_DOORS.room14.z}
          inward={-1}
          label={HALL_DOORS.room14.label}
          subtitle={HALL_DOORS.room14.subtitle}
          rattles
        />
      </Examinable>

      <HallClock map={clockMap} />
      {HALL_MURALS.map((board) => (
        <HallMural key={board.id} {...board} />
      ))}

      <Examinable id="hall-fountain">
        <mesh position={[HALL_PROPS.fountain.x, 0.52, HALL_PROPS.fountain.z]} castShadow>
          <boxGeometry args={[0.38, 1.04, 0.32]} />
          <meshStandardMaterial color="#6a6e72" roughness={0.45} metalness={0.2} />
        </mesh>
      </Examinable>
      <mesh position={[HALL_PROPS.bin.x, 0.32, HALL_PROPS.bin.z]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.64, 12]} />
        <meshStandardMaterial color="#2c2a28" roughness={0.7} />
      </mesh>
    </group>
  )
}

useTexture.preload('/textura/piso_madeira.png')
useTexture.preload('/image/foto-achados.png')
useTexture.preload('/image/foto-turma-corredor.png')
