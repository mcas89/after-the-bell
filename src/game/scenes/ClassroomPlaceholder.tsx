import { Suspense, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playElectricityBurst, isAmbientHeld, preloadGameAudio } from '../audio/mixer'
import { lightMul, roomPulse } from '../atmosphere/roomPulse'
import { useGameStore } from '../state/useGameStore'
import { CLASSROOM_1 } from '../data/rooms'
import { isExaminableId } from '../data/examine'
import { ITEM_IDS } from '../data/items'
import { useInventoryStore } from '../state/useInventoryStore'
import { FURNITURE, CLASSROOM_PROPS, TEACHER_TOP } from '../data/furniture'
import { ClassroomDoor } from '../door/ClassroomDoor'
import { HallwayPeek } from '../door/HallwayPeek'
import { DOOR } from '../door/doorLayout'
import { Examinable } from '../examine/Examinable'
import { HangmanChalk } from '../examine/HangmanBoard'
import { WrittenSurfaces } from '../examine/WrittenSurfaces'
import { getWrittenTexture } from '../examine/paperTextures'
import { playerMotion } from '../player/playerMotion'
import { FurnitureModel } from './FurnitureModel'

const { width, depth, height } = CLASSROOM_1.size
const wallT = 0.12
const wallMat = { color: '#3f3a34', roughness: 0.9 }
const WINDOW_Z = [-1.85, 0, 1.85] as const
const WINDOW_HALF = 0.62
const SILL = 0.88
const WIN_H = 1.42

const CLOCK_HOUR = 3
const CLOCK_MINUTE = 17
const KEY_POS: [number, number, number] = [-0.64, TEACHER_TOP + 0.014, -2.82]
const KEY_SPIN_NEAR = 2.2

function ClassroomMuralPhoto() {
  const map = useTexture('/image/foto-turma-sala.png')
  map.colorSpace = THREE.SRGBColorSpace
  return (
    <mesh rotation={[0, -Math.PI / 2, 0]} position={[-0.016, 0, 0]}>
      <planeGeometry args={[1.6, 1.18]} />
      <meshStandardMaterial map={map} roughness={0.88} />
    </mesh>
  )
}

function clockAngle(hours: number, minutes: number, kind: 'hour' | 'minute') {
  const turn =
    kind === 'minute'
      ? minutes / 60
      : (hours % 12) / 12 + minutes / 60 / 12
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

function Clock() {
  const hourAngle = clockAngle(CLOCK_HOUR, CLOCK_MINUTE, 'hour')
  const minuteAngle = clockAngle(CLOCK_HOUR, CLOCK_MINUTE, 'minute')
  const chalkboardHalf = 1.8

  return (
    <group position={[chalkboardHalf + 0.28, 2.08, -depth / 2 + 0.07]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.01]}>
        <cylinderGeometry args={[0.2, 0.205, 0.028, 28]} />
        <meshStandardMaterial color="#1a1816" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.175, 32]} />
        <meshStandardMaterial color="#d8d0c4" roughness={0.7} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = Math.PI / 2 - (i / 12) * Math.PI * 2
        const major = i % 3 === 0
        const r = 0.15
        return (
          <mesh
            key={`tick-${i}`}
            rotation={[0, 0, a]}
            position={[Math.cos(a) * r, Math.sin(a) * r, 0.008]}
          >
            <boxGeometry args={[major ? 0.028 : 0.016, major ? 0.008 : 0.005, 0.006]} />
            <meshBasicMaterial color={major ? '#2a2420' : '#6a6158'} />
          </mesh>
        )
      })}
      <ClockHand angle={hourAngle} length={0.09} width={0.016} color="#2b2420" z={0.016} />
      <ClockHand angle={minuteAngle} length={0.13} width={0.01} color="#3a332e" z={0.02} />
      <mesh position={[0, 0, 0.024]}>
        <circleGeometry args={[0.014, 16]} />
        <meshBasicMaterial color="#1c1814" />
      </mesh>
    </group>
  )
}

const MOON = '#c8dcf2'
const BAG_LIGHT: [number, number, number] = [-3.62, 0.1, -3.06]

function NightOutside() {
  return (
    <group position={[-width / 2 - 0.85, 0, 0]}>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 1.5, 0]}>
        <planeGeometry args={[depth + 3, 6]} />
        <meshBasicMaterial color="#070b14" />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.08, 2.62, -1.92]}>
        <circleGeometry args={[0.32, 28]} />
        <meshBasicMaterial color="#eef4fb" />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.06, 2.62, -1.92]}>
        <circleGeometry args={[0.72, 28]} />
        <meshBasicMaterial color="#9bb4d4" transparent opacity={0.16} />
      </mesh>
    </group>
  )
}

function WallWithWindows() {
  const x = -width / 2
  const topH = height - SILL - WIN_H
  const openings = [-depth / 2, ...WINDOW_Z.flatMap((z) => [z - WINDOW_HALF, z + WINDOW_HALF]), depth / 2]

  return (
    <group>
      <mesh position={[x, SILL / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallT, SILL, depth]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      <mesh position={[x, SILL + WIN_H + topH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallT, topH, depth]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {Array.from({ length: openings.length / 2 }, (_, i) => {
        const a = openings[i * 2]
        const b = openings[i * 2 + 1]
        const span = b - a
        if (span < 0.08) return null
        return (
          <mesh key={`p-${i}`} position={[x, SILL + WIN_H / 2, (a + b) / 2]} castShadow receiveShadow>
            <boxGeometry args={[wallT, WIN_H, span]} />
            <meshStandardMaterial {...wallMat} />
          </mesh>
        )
      })}
    </group>
  )
}

function WallWithDoor() {
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
        <meshStandardMaterial color="#3d3832" roughness={0.9} />
      </mesh>
      <mesh position={[x, height / 2, (zC + zD) / 2]} receiveShadow>
        <boxGeometry args={[wallT, height, Math.max(0.08, zD - zC)]} />
        <meshStandardMaterial color="#3d3832" roughness={0.9} />
      </mesh>
      <mesh position={[x, doorH + lintelH / 2, doorZ]} receiveShadow>
        <boxGeometry args={[wallT, lintelH, doorHalf * 2]} />
        <meshStandardMaterial color="#3d3832" roughness={0.9} />
      </mesh>
    </group>
  )
}

function ClassroomLights() {
  const ambient = useRef<THREE.AmbientLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const moonDir = useRef<THREE.DirectionalLight>(null)
  const moonKey = useRef<THREE.SpotLight>(null)
  const moonWash = useRef<THREE.SpotLight>(null)
  const ceiling = useRef<THREE.PointLight>(null)
  const fluoA = useRef<THREE.PointLight>(null)
  const fluoB = useRef<THREE.PointLight>(null)
  const desk = useRef<THREE.PointLight>(null)
  const bounce = useRef<THREE.PointLight>(null)
  const doorLamp = useRef<THREE.PointLight>(null)
  const windows = useRef<(THREE.PointLight | null)[]>([])
  const warm = useRef(useGameStore.getState().flags.hangmanFriends ? 1 : 0)

  useLayoutEffect(() => {
    if (moonKey.current) {
      moonKey.current.target.position.set(...BAG_LIGHT)
      moonKey.current.target.updateMatrixWorld()
    }
    if (moonWash.current) {
      moonWash.current.target.position.set(-1.7, 0.35, -0.15)
      moonWash.current.target.updateMatrixWorld()
    }
    if (moonDir.current) {
      moonDir.current.target.position.set(-2.55, 0.18, -2.35)
      moonDir.current.target.updateMatrixWorld()
    }
  }, [])

  useFrame((_, delta) => {
    const k = lightMul()
    const want = useGameStore.getState().flags.hangmanFriends ? 1 : 0
    warm.current = THREE.MathUtils.damp(warm.current, want, 1.8, Math.min(delta, 0.05))
    const lift = warm.current
    if (ambient.current) ambient.current.intensity = (0.1 + 0.11 * lift) * k
    if (hemi.current) hemi.current.intensity = (0.2 + 0.09 * lift) * k
    if (moonDir.current) moonDir.current.intensity = 0.4 * k
    if (moonKey.current) moonKey.current.intensity = 7.1 * k
    if (moonWash.current) moonWash.current.intensity = 3.8 * k
    if (ceiling.current) ceiling.current.intensity = (0.08 + 0.46 * lift) * k
    if (fluoA.current) fluoA.current.intensity = 0.7 * lift * k
    if (fluoB.current) fluoB.current.intensity = 0.55 * lift * k
    if (desk.current) desk.current.intensity = (0.78 + 0.16 * lift) * k
    if (bounce.current) bounce.current.intensity = 1.12 * k
    const beat =
      useGameStore.getState().interactionState === 'door-beat' ||
      useGameStore.getState().interactionState === 'opening-door'
    if (doorLamp.current) {
      doorLamp.current.intensity = THREE.MathUtils.damp(
        doorLamp.current.intensity,
        beat ? 2.7 : 0,
        beat ? 11 : 4.2,
        Math.min(delta, 0.05),
      )
    }
    windows.current.forEach((lamp, i) => {
      if (!lamp) return
      lamp.intensity = (WINDOW_Z[i] < -1 ? 0.95 : 0.38) * k
    })
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={0.1} color="#7c8a9c" />
      <hemisphereLight ref={hemi} args={['#3d5a74', '#0e0c0a', 0.2]} />
      <directionalLight
        ref={moonDir}
        position={[-7.15, 3.95, -2.05]}
        intensity={0.4}
        color="#9bb8d4"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00035}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={22}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <spotLight
        ref={moonKey}
        position={[-5.22, 2.38, -1.78]}
        intensity={7.1}
        color={MOON}
        angle={0.58}
        penumbra={0.74}
        distance={8.6}
        decay={1.65}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00028}
        shadow-normalBias={0.03}
      />
      <spotLight
        ref={moonWash}
        position={[-5.35, 2.62, 0.2]}
        intensity={3.8}
        color="#a7c2dc"
        angle={0.92}
        penumbra={0.8}
        distance={11}
        decay={1.8}
      />
      <pointLight ref={ceiling} position={[0, 2.7, 0.3]} color="#c4b9a6" intensity={0.08} distance={7.2} decay={2} />
      <pointLight ref={fluoA} position={[-1.65, 2.68, -1.15]} color="#efe6d0" intensity={0} distance={6.4} decay={2} />
      <pointLight ref={fluoB} position={[1.55, 2.66, 1.05]} color="#e4dcc8" intensity={0} distance={6.1} decay={2} />
      <pointLight ref={desk} position={[0.25, 1.05, -2.45]} color="#ffc48a" intensity={0.78} distance={3.35} decay={2} />
      <pointLight
        ref={bounce}
        position={[-3.55, 0.38, -2.94]}
        color="#b9d0e6"
        intensity={1.12}
        distance={2.85}
        decay={2}
      />
      <pointLight
        ref={doorLamp}
        position={[DOOR.wallX - 1.08, 1.58, DOOR.z]}
        color="#f2e6cc"
        intensity={0}
        distance={4.2}
        decay={1.75}
      />
      {WINDOW_Z.map((z, i) => (
        <group key={`wlight-${z}`}>
          <pointLight
            ref={(node) => {
              windows.current[i] = node
            }}
            position={[-width / 2 + 0.38, 1.5, z]}
            color={z < -1 ? MOON : '#8eacc8'}
            intensity={z < -1 ? 0.95 : 0.38}
            distance={z < -1 ? 4.8 : 3.5}
            decay={2}
          />
          <mesh position={[-width / 2 - 0.03, SILL + WIN_H / 2, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[WINDOW_HALF * 2 - 0.1, WIN_H - 0.12]} />
            <meshBasicMaterial
              color="#c5d6ea"
              transparent
              opacity={z < -1 ? 0.2 : 0.11}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

function ClassroomFloor() {
  const map = useTexture('/textura/piso_madeira.png')

  useLayoutEffect(() => {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(width / 1.5, depth / 1.5)
    map.anisotropy = 8
    map.colorSpace = THREE.SRGBColorSpace
    map.needsUpdate = true
  }, [map])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={map} color="#8a7c6c" roughness={0.9} metalness={0} />
    </mesh>
  )
}

function EmergencyLight() {
  const lightRef = useRef<THREE.PointLight>(null)
  const boardRef = useRef<THREE.PointLight>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const t = useRef(0)
  const nextFlick = useRef(0.4)
  const on = useRef(1)

  useFrame((_, delta) => {
    if (roomPulse.dim > 0.04 || useGameStore.getState().interactionState === 'door-beat') {
      const k = lightMul()
      if (lightRef.current) lightRef.current.intensity = 0.58 * k
      if (boardRef.current) boardRef.current.intensity = 1.28 * k
      if (matRef.current) matRef.current.emissiveIntensity = 0.12 + 0.55 * k
      return
    }

    t.current += delta
    if (t.current >= nextFlick.current) {
      t.current = 0
      const roll = Math.random()
      if (roll < 0.07) {
        on.current = 0
        nextFlick.current = 0.08 + Math.random() * 0.18
        if (!isAmbientHeld() && useGameStore.getState().interactionState === 'gameplay') {
          playElectricityBurst()
        }
      } else if (roll < 0.28) {
        on.current = 0.15 + Math.random() * 0.25
        nextFlick.current = 0.04 + Math.random() * 0.07
      } else {
        on.current = 0.75 + Math.random() * 0.25
        nextFlick.current = 0.35 + Math.random() * 1.4
      }
    }

    const buzz = 0.92 + Math.sin(performance.now() * 0.062) * 0.08
    const level = on.current * buzz
    if (lightRef.current) lightRef.current.intensity = 0.58 * level
    if (boardRef.current) boardRef.current.intensity = 1.28 * level
    if (matRef.current) matRef.current.emissiveIntensity = 0.12 + 0.55 * level
  })

  return (
    <group position={[0, 2.62, -depth / 2 + 0.1]}>
      <mesh>
        <boxGeometry args={[0.42, 0.12, 0.08]} />
        <meshStandardMaterial
          ref={matRef}
          color="#2a2e24"
          emissive="#d7efb0"
          emissiveIntensity={0.35}
          roughness={0.45}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, -0.08, 0.12]}
        color="#cfe6b8"
        intensity={0.58}
        distance={5.4}
        decay={2}
      />
      <pointLight
        ref={boardRef}
        position={[0, -0.95, 0.28]}
        color="#d4e8c0"
        intensity={1.28}
        distance={2.6}
        decay={2}
      />
    </group>
  )
}

function KeyGlow({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const mats = useRef<THREE.MeshStandardMaterial[]>([])

  useLayoutEffect(() => {
    const root = group.current
    if (!root) return
    const collected: THREE.MeshStandardMaterial[] = []
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = false
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const next = list.map((mat) => {
        if (!mat || !('emissive' in mat)) return mat
        const std = (
          mat.userData._keyGlow ? mat : mat.clone()
        ) as THREE.MeshStandardMaterial
        std.userData._keyGlow = true
        std.userData._examineClone = true
        std.emissive = new THREE.Color('#f0d18a')
        std.emissiveIntensity = 0.62
        std.userData._examineEm = std.emissive.clone()
        std.userData._examineEmInt = 0.62
        collected.push(std)
        return std
      })
      mesh.material = Array.isArray(mesh.material) ? next : next[0]
    })
    mats.current = collected
  }, [])

  useFrame(({ clock }) => {
    const pulse = 0.58 + Math.sin(clock.elapsedTime * 2.4) * 0.42
    if (light.current) light.current.intensity = 0.55 + pulse * 0.95
    for (const mat of mats.current) {
      mat.emissiveIntensity = 0.38 + pulse * 0.72
      mat.userData._examineEmInt = mat.emissiveIntensity
    }
  })

  return (
    <group ref={group}>
      {children}
      <pointLight
        ref={light}
        color="#f0d4a0"
        intensity={0.9}
        distance={1.25}
        decay={2}
        position={[0, 0.07, 0]}
      />
    </group>
  )
}

function KeyCollectible() {
  const spin = useRef<THREE.Group>(null)
  const speed = useRef(0)
  const angle = useRef(0)

  useFrame((_, delta) => {
    const dist = Math.hypot(playerMotion.x - KEY_POS[0], playerMotion.z - KEY_POS[2])
    const want = dist < KEY_SPIN_NEAR ? 0.7 : 0
    speed.current = THREE.MathUtils.damp(speed.current, want, 2.8, delta)
    angle.current += speed.current * delta
    if (spin.current) spin.current.rotation.y = angle.current
  })

  return (
    <Examinable id="chave">
      <group position={KEY_POS}>
        <KeyGlow>
          <group ref={spin}>
            <FurnitureModel
              url="/chave.glb"
              position={[0, 0, 0]}
              rotationY={1.05}
              targetHeight={0.048}
            />
          </group>
        </KeyGlow>
      </group>
    </Examinable>
  )
}

export function ClassroomPlaceholder() {
  const keyTaken = useInventoryStore((s) => s.has(ITEM_IDS.key))
  return (
    <group>
      <ClassroomLights />
      <NightOutside />

      <Suspense
        fallback={
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#3a342e" roughness={0.92} />
          </mesh>
        }
      >
        <ClassroomFloor />
      </Suspense>

      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallT]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      <mesh position={[0, height / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallT]} />
        <meshStandardMaterial color="#3b3631" roughness={0.9} />
      </mesh>
      <WallWithWindows />
      <WallWithDoor />

      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1c1a18" roughness={1} />
      </mesh>

      <Examinable id="quadro-negro">
        <mesh position={[0, 1.45, -depth / 2 + 0.08]} receiveShadow>
          <planeGeometry args={[3.6, 1.35]} />
          <meshStandardMaterial
            map={getWrittenTexture('board')}
            roughness={0.86}
            emissive="#152018"
            emissiveIntensity={0.22}
          />
        </mesh>
        <HangmanChalk />
      </Examinable>

      <EmergencyLight />
      <HallwayPeek />
      <ClassroomDoor />
      <Examinable id="relogio">
        <Clock />
      </Examinable>
      <Examinable id="mural">
        <group position={[width / 2 - 0.065, 1.48, 0.45]}>
          <mesh position={[0.01, 0, 0]} receiveShadow>
            <boxGeometry args={[0.03, 1.26, 1.68]} />
            <meshStandardMaterial color="#a57b52" roughness={0.94} />
          </mesh>
          <Suspense fallback={null}>
            <ClassroomMuralPhoto />
          </Suspense>
        </group>
      </Examinable>
      <WrittenSurfaces />

      <Suspense fallback={null}>
        {WINDOW_Z.map((z, index) => (
          <Examinable key={`janela-${z}`} id={`janela-${index + 1}`}>
            <FurnitureModel
              url="/janela.glb"
              position={[-width / 2 + 0.02, SILL + WIN_H / 2, z]}
              rotationY={Math.PI / 2 + Math.PI + Math.PI / 4 + (55 * Math.PI) / 180}
              targetHeight={WIN_H - 0.06}
              anchor="center"
            />
          </Examinable>
        ))}
        {FURNITURE.map((item) => (
          <FurnitureModel
            key={`${item.kind}-${item.position[0]}-${item.position[2]}`}
            url={item.kind === 'desk' ? '/carteira_escola.glb' : '/mesa_professor.glb'}
            position={item.position}
            rotationY={item.rotationY}
            targetHeight={item.kind === 'desk' ? 0.86 : 0.76}
            kind={item.kind}
          />
        ))}
        {CLASSROOM_PROPS.map((prop) => {
          const model = (
            <FurnitureModel
              url={prop.url}
              position={prop.position}
              rotationY={prop.rotationY}
              targetHeight={prop.targetHeight}
              targetWidth={prop.targetWidth}
            />
          )
          return isExaminableId(prop.id) ? (
            <Examinable key={prop.id} id={prop.id}>
              {model}
            </Examinable>
          ) : (
            <group key={prop.id}>{model}</group>
          )
        })}
        {!keyTaken ? (
          <Suspense fallback={null}>
            <KeyCollectible />
          </Suspense>
        ) : null}
      </Suspense>
    </group>
  )
}

useTexture.preload('/textura/piso_madeira.png')
useTexture.preload('/image/foto-turma-sala.png')
preloadGameAudio()
