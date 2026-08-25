import { Component, Suspense, useLayoutEffect, type ErrorInfo, type ReactNode } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { type Aabb } from '../data/furniture'
import { CLASSROOM_1 } from '../data/rooms'
import { DOOR, doorColliders } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'

const { width, depth, height } = CLASSROOM_1.size
const wallT = 0.12
const wall = { color: '#3f3a34', roughness: 0.9 }
const WINDOW_Z = [-1.85, 0, 1.85] as const
const WINDOW_HALF = 0.62
const SILL = 0.88
const WIN_H = 1.42
const MOON = '#c9d8ea'
const FRAME_HALF = { x: 0.32, z: 0.16 }
const DRAWINGS = ['vases', 'hall', 'tree', 'faces', 'window', 'shapes'] as const
const ART_IMAGES = {
  vases: '/image/arte-natureza-morta.png',
  hall: '/image/arte-corredor.png',
  tree: '/image/arte-arvore.png',
  faces: '/image/arte-retratos.png',
  window: '/image/arte-fachada.png',
  shapes: '/image/arte-composicao.png',
} as const
const FRAME_URLS = ['/quadro_pintura.glb', '/quadro_pintura2.glb'] as const
const ART_ROWS = [-0.25, 1.15, 2.5] as const
const ART_COLS = [-2.05, 2.05] as const

const ARTS_FRAMES = ART_ROWS.flatMap((z, row) =>
  ART_COLS.map((x, col) => {
    const index = row * ART_COLS.length + col
    return {
      id: `arts-frame-${index + 1}`,
      url: FRAME_URLS[index % 2],
      drawing: DRAWINGS[index],
      x,
      z,
      yaw: Math.PI,
    }
  }),
)

class ModelGuard extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function ArtsFloor() {
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={map} color="#b7a898" roughness={0.78} metalness={0.05} />
    </mesh>
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
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[x, SILL + WIN_H + topH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallT, topH, depth]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {Array.from({ length: openings.length / 2 }, (_, i) => {
        const a = openings[i * 2]
        const b = openings[i * 2 + 1]
        const span = b - a
        if (span < 0.08) return null
        return (
          <mesh key={`p-${i}`} position={[x, SILL + WIN_H / 2, (a + b) / 2]} castShadow receiveShadow>
            <boxGeometry args={[wallT, WIN_H, span]} />
            <meshStandardMaterial {...wall} />
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
    </group>
  )
}

function WindowLight() {
  return (
    <>
      <directionalLight position={[-7.15, 3.95, -0.4]} intensity={0.4} color="#9bb8d4" />
      <spotLight
        position={[-5.22, 2.38, -1.78]}
        intensity={6.4}
        color={MOON}
        angle={0.58}
        penumbra={0.74}
        distance={8.6}
        decay={1.65}
      />
      <spotLight
        position={[-5.35, 2.62, 0.35]}
        intensity={3.6}
        color="#a7c2dc"
        angle={0.92}
        penumbra={0.8}
        distance={11}
        decay={1.8}
      />
      {WINDOW_Z.map((z) => (
        <group key={`wlight-${z}`}>
          <pointLight
            position={[-width / 2 + 0.42, 1.52, z]}
            color={z < -1 ? MOON : '#8eacc8'}
            intensity={z < -1 ? 1.05 : 0.48}
            distance={z < -1 ? 5.2 : 3.8}
            decay={2}
          />
          <mesh position={[-width / 2 - 0.03, SILL + WIN_H / 2, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[WINDOW_HALF * 2 - 0.1, WIN_H - 0.12]} />
            <meshBasicMaterial
              color="#c5d6ea"
              transparent
              opacity={z < -1 ? 0.22 : 0.12}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

function WoodFrame() {
  return (
    <mesh position={[0, 0.45, 0]} castShadow>
      <boxGeometry args={[0.64, 0.9, 0.05]} />
      <meshStandardMaterial color="#3a2c22" roughness={0.88} />
    </mesh>
  )
}

function ArtPainting({
  url,
  image,
}: {
  url: string
  image: string
}) {
  const map = useTexture(image)
  map.colorSpace = THREE.SRGBColorSpace
  return (
    <group>
      <ModelGuard fallback={<WoodFrame />}>
        <Suspense fallback={<WoodFrame />}>
          <FurnitureModel url={url} position={[0, 0, 0]} targetHeight={0.95} pickable={false} />
        </Suspense>
      </ModelGuard>
      <mesh position={[0, 0.48, 0.04]}>
        <planeGeometry args={[0.5, 0.68]} />
        <meshStandardMaterial map={map} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function ArtsRoom() {
  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: DOOR.z - DOOR.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: DOOR.z + DOOR.half, maxZ: depth / 2 },
      ...doorColliders(true),
      ...ARTS_FRAMES.map((frame) => ({
        minX: frame.x - FRAME_HALF.x,
        maxX: frame.x + FRAME_HALF.x,
        minZ: frame.z - FRAME_HALF.z,
        maxZ: frame.z + FRAME_HALF.z,
      })),
    ]
    setRoomColliders('room14', walls)
    return () => clearRoomColliders('room14')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.1} color="#7c8a9c" />
      <hemisphereLight args={['#3d5a74', '#0e0c0a', 0.2]} />
      <WindowLight />
      <pointLight position={[0, 2.7, 0.3]} color="#c4b9a6" intensity={0.1} distance={7.2} decay={2} />

      <NightOutside />

      <Suspense
        fallback={
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#3a342e" roughness={0.92} />
          </mesh>
        }
      >
        <ArtsFloor />
      </Suspense>

      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1c1a18" roughness={1} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallT]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[0, height / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallT]} />
        <meshStandardMaterial color="#3d3832" roughness={0.9} />
      </mesh>
      <WallWithWindows />
      <WallWithDoor />

      <HallwayPeek />
      <Examinable id="side-door-14">
        <HallwayDoor x={DOOR.wallX} z={DOOR.z} inward={-1} label="14" subtitle="ARTES" open />
      </Examinable>

      <Suspense fallback={null}>
        {WINDOW_Z.map((z, index) => (
          <Examinable key={`arts-window-${index + 1}`} id={`arts-window-${index + 1}`}>
            <FurnitureModel
              url="/janela.glb"
              position={[-width / 2 + 0.02, SILL + WIN_H / 2, z]}
              rotationY={Math.PI / 2 + Math.PI + Math.PI / 4 + (55 * Math.PI) / 180}
              targetHeight={WIN_H - 0.06}
              anchor="center"
            />
          </Examinable>
        ))}
        {ARTS_FRAMES.map((frame) => (
          <Examinable key={frame.id} id={frame.id}>
            <group position={[frame.x, 0, frame.z]} rotation={[0, frame.yaw, 0]}>
              <ArtPainting url={frame.url} image={ART_IMAGES[frame.drawing]} />
            </group>
          </Examinable>
        ))}
      </Suspense>

      <mesh position={[0, 2.62, -depth / 2 + 0.1]}>
        <boxGeometry args={[0.42, 0.12, 0.08]} />
        <meshStandardMaterial color="#2a2e24" emissive="#d7efb0" emissiveIntensity={0.22} />
      </mesh>
    </group>
  )
}

useTexture.preload('/textura/piso_madeira.png')
for (const src of Object.values(ART_IMAGES)) useTexture.preload(src)
