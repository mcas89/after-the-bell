import { Suspense, useLayoutEffect, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { Aabb } from '../data/furniture'
import { CLASSROOM_1 } from '../data/rooms'
import { DOOR, doorColliders } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { getPixoFloorTexture, getWrittenTexture } from '../examine/paperTextures'
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

const SOFA_FRONT: Aabb = { minX: -4.08, maxX: -2.78, minZ: -3.02, maxZ: -1.22 }
const SOFA_BACK: Aabb = { minX: -4.08, maxX: -2.78, minZ: 1.22, maxZ: 3.02 }
const TABLE: Aabb = { minX: -0.97, maxX: 1.27, minZ: -0.9, maxZ: 1.1 }
const CHAIR_FRONT: Aabb = { minX: 2.08, maxX: 2.82, minZ: -3.52, maxZ: -2.8 }
const CHAIR_BACK: Aabb = { minX: -0.18, maxX: 0.56, minZ: 2.8, maxZ: 3.52 }
const CHAIR_DOOR: Aabb = { minX: 2.88, maxX: 3.6, minZ: -1.08, maxZ: -0.34 }
const CAB_A: Aabb = { minX: 3.42, maxX: 4.12, minZ: 0.42, maxZ: 1.28 }
const CAB_B: Aabb = { minX: 3.42, maxX: 4.12, minZ: 1.62, maxZ: 2.48 }
const TABLE_POS: [number, number, number] = [0.15, 0, 0.1]
const TABLE_WIDTH = 2.16
const MOON = '#c9d8ea'

const fitBox = new THREE.Box3()
const fitSize = new THREE.Vector3()
const fitCenter = new THREE.Vector3()
const down = new THREE.Vector3(0, -1, 0)
const ray = new THREE.Raycaster()

function tableSurfaceY(scene: THREE.Object3D, targetWidth: number) {
  fitBox.setFromObject(scene)
  fitBox.getSize(fitSize)
  fitBox.getCenter(fitCenter)
  const scale = targetWidth / Math.max(fitSize.x, 0.001)
  const root = new THREE.Group()
  const clone = scene.clone(true)
  clone.position.set(-fitCenter.x, -fitBox.min.y, -fitCenter.z)
  root.add(clone)
  root.scale.setScalar(scale)
  root.updateMatrixWorld(true)

  const samples: number[] = []
  for (const x of [-0.18, 0, 0.18]) {
    for (const z of [-0.18, 0, 0.18]) {
      ray.set(new THREE.Vector3(x, 4, z), down)
      const hit = ray.intersectObject(root, true).find((item) => item.point.y > 0.2 && item.point.y < 2.2)
      if (hit) samples.push(hit.point.y)
    }
  }
  samples.sort((a, b) => a - b)
  return samples[Math.floor(samples.length / 2)] ?? 0.74
}

function TableWithPapers() {
  const gltf = useGLTF('/mesa_cadeira.glb')
  const topY = useMemo(() => tableSurfaceY(gltf.scene, TABLE_WIDTH), [gltf.scene])

  return (
    <group position={TABLE_POS}>
      <Examinable id="teachers-table">
        <FurnitureModel url="/mesa_cadeira.glb" position={[0, 0, 0]} targetWidth={TABLE_WIDTH} />
        <mesh position={[0.02, topY + 0.012, 0.02]} rotation={[-Math.PI / 2, 0, 0.16]}>
          <planeGeometry args={[0.28, 0.36]} />
          <meshStandardMaterial map={getWrittenTexture('ronda')} roughness={0.88} />
        </mesh>
      </Examinable>
      <FurnitureModel
        url="/bloco_folhas.glb"
        position={[-0.08, topY + 0.004, -0.04]}
        rotationY={Math.PI - 0.12}
        targetWidth={0.22}
        pickable={false}
      />
      <FurnitureModel
        url="/prontuarios.glb"
        position={[0.16, topY + 0.004, 0.1]}
        rotationY={0.28}
        targetHeight={0.055}
        pickable={false}
      />
      <FurnitureModel
        url="/folhas%20jogadas.glb"
        position={[0.12, topY + 0.004, 0.06]}
        rotationY={0.4}
        targetWidth={0.32}
        pickable={false}
      />
    </group>
  )
}

function TeachersFloor() {
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
      <meshStandardMaterial map={map} color="#8a7c6c" roughness={0.9} metalness={0} />
    </mesh>
  )
}

function PixoFloor() {
  const map = getPixoFloorTexture()
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={map} transparent opacity={0.78} roughness={1} depthWrite={false} />
    </mesh>
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

export function TeachersRoom() {
  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: DOOR.z - DOOR.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: DOOR.z + DOOR.half, maxZ: depth / 2 },
      ...doorColliders(true),
      SOFA_FRONT,
      SOFA_BACK,
      TABLE,
      CHAIR_FRONT,
      CHAIR_BACK,
      CHAIR_DOOR,
      CAB_A,
      CAB_B,
    ]
    setRoomColliders('teachers', walls)
    return () => clearRoomColliders('teachers')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.1} color="#7c8a9c" />
      <hemisphereLight args={['#3d5a74', '#0e0c0a', 0.2]} />
      <WindowLight />
      <pointLight position={[0, 2.7, 0.3]} color="#c4b9a6" intensity={0.1} distance={7.2} decay={2} />
      <pointLight position={[0.2, 1.12, 0.1]} color="#ffc48a" intensity={0.32} distance={3.1} decay={2} />

      <NightOutside />

      <Suspense
        fallback={
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#3a342e" roughness={0.92} />
          </mesh>
        }
      >
        <TeachersFloor />
        <PixoFloor />
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

      <Examinable id="teachers-board">
        <mesh position={[0, 1.52, -depth / 2 + 0.07]} receiveShadow>
          <planeGeometry args={[3.35, 1.28]} />
          <meshStandardMaterial map={getWrittenTexture('teachers-board')} roughness={0.42} />
        </mesh>
      </Examinable>
      <mesh position={[0, 1.52, -depth / 2 + 0.065]}>
        <boxGeometry args={[3.48, 1.4, 0.04]} />
        <meshStandardMaterial color="#5a5048" roughness={0.82} />
      </mesh>
      <Examinable id="teachers-notice">
        <mesh position={[0.72, 1.48, -depth / 2 + 0.1]} rotation={[0, 0, -0.04]}>
          <planeGeometry args={[0.42, 0.56]} />
          <meshStandardMaterial map={getWrittenTexture('aviso')} roughness={0.88} />
        </mesh>
      </Examinable>

      <HallwayPeek />
      <Examinable id="side-door-teachers">
        <HallwayDoor x={DOOR.wallX} z={DOOR.z} inward={-1} label="13" subtitle="PROF." open />
      </Examinable>

      <Suspense fallback={null}>
        {WINDOW_Z.map((z, index) => (
          <Examinable key={`teachers-window-${index + 1}`} id={`teachers-window-${index + 1}`}>
            <FurnitureModel
              url="/janela.glb"
              position={[-width / 2 + 0.02, SILL + WIN_H / 2, z]}
              rotationY={Math.PI / 2 + Math.PI + Math.PI / 4 + (55 * Math.PI) / 180}
              targetHeight={WIN_H - 0.06}
              anchor="center"
            />
          </Examinable>
        ))}
        <Examinable id="teachers-sofa">
          <FurnitureModel
            url="/sofa.glb"
            position={[-3.42, 0, -2.12]}
            rotationY={Math.PI / 2}
            targetHeight={0.82}
            targetWidth={1.72}
          />
        </Examinable>
        <Examinable id="teachers-sofa-2">
          <FurnitureModel
            url="/sofa.glb"
            position={[-3.42, 0, 2.12]}
            rotationY={Math.PI / 2}
            targetHeight={0.82}
            targetWidth={1.72}
          />
        </Examinable>
        <TableWithPapers />
        <Examinable id="teachers-chair">
          <FurnitureModel
            url="/poltrona.glb"
            position={[2.45, 0, -3.16]}
            rotationY={0}
            targetHeight={0.9}
          />
        </Examinable>
        <Examinable id="teachers-chair-2">
          <FurnitureModel
            url="/poltrona.glb"
            position={[0.18, 0, 3.16]}
            rotationY={Math.PI}
            targetHeight={0.9}
          />
        </Examinable>
        <Examinable id="teachers-chair-3">
          <FurnitureModel
            url="/poltrona.glb"
            position={[3.22, 0, -0.72]}
            rotationY={-Math.PI / 2}
            targetHeight={0.9}
          />
        </Examinable>
        <Examinable id="teachers-cabinet">
          <FurnitureModel
            url="/armario_fechado.glb"
            position={[3.78, 0, 0.85]}
            rotationY={Math.PI}
            targetHeight={1.72}
          />
        </Examinable>
        <FurnitureModel
          url="/armario_fechado.glb"
          position={[3.78, 0, 2.05]}
          rotationY={Math.PI}
          targetHeight={1.72}
          pickable={false}
        />
      </Suspense>

      <mesh position={[0, 2.62, -depth / 2 + 0.1]}>
        <boxGeometry args={[0.42, 0.12, 0.08]} />
        <meshStandardMaterial color="#2a2e24" emissive="#d7efb0" emissiveIntensity={0.22} />
      </mesh>
    </group>
  )
}

useTexture.preload('/textura/piso_madeira.png')
