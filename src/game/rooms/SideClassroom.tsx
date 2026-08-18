import { Suspense, useLayoutEffect } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { Aabb } from '../data/furniture'
import { CLASSROOM_1 } from '../data/rooms'
import { DOOR, doorColliders } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { ComputerDesk } from '../scenes/ComputerDesk'
import { LAB_ON_PC_ID } from '../computer/computerStore'
import { clearRoomColliders, setRoomColliders } from './roomColliders'

const wall = { color: '#3f3a34', roughness: 0.9 }
const wallT = 0.12

const LAB_DESKS = [
  { id: 'lab-pc-1', x: -3.05, z: 1.55, yaw: -Math.PI / 2 },
  { id: 'lab-pc-2', x: -3.05, z: 0.05, yaw: -Math.PI / 2 },
  { id: 'lab-pc-3', x: -3.05, z: -1.45, yaw: -Math.PI / 2 },
  { id: 'lab-pc-4', x: -1.45, z: -2.45, yaw: 0 },
  { id: LAB_ON_PC_ID, x: 0.1, z: -2.45, yaw: 0, on: true },
  { id: 'lab-pc-6', x: 1.6, z: -2.45, yaw: 0 },
] as const

function deskCollider(x: number, z: number, yaw: number): Aabb {
  const alongX = Math.abs(Math.cos(yaw)) > 0.65
  const hx = alongX ? 0.58 : 0.46
  const hz = alongX ? 0.46 : 0.58
  return { minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz }
}

function LabFloor({ width, depth }: { width: number; depth: number }) {
  const map = useTexture('/textura/piso_madeira.png')

  useLayoutEffect(() => {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(width / 1.45, depth / 1.45)
    map.anisotropy = 8
    map.colorSpace = THREE.SRGBColorSpace
    map.needsUpdate = true
  }, [map, width, depth])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={map} color="#b7a898" roughness={0.78} metalness={0.05} />
    </mesh>
  )
}

function LabSet() {
  return (
    <group>
      {LAB_DESKS.map((desk) => (
        <ComputerDesk
          key={desk.id}
          id={desk.id}
          position={[desk.x, 0, desk.z]}
          rotationY={desk.yaw}
          on={'on' in desk}
        />
      ))}
    </group>
  )
}

function LabDoorWall({ width, depth, height }: { width: number; depth: number; height: number }) {
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

export function SideClassroom() {
  const { width, depth, height } = CLASSROOM_1.size

  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: DOOR.z - DOOR.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: DOOR.z + DOOR.half, maxZ: depth / 2 },
      ...doorColliders(true),
      ...LAB_DESKS.map((desk) => deskCollider(desk.x, desk.z, desk.yaw)),
    ]
    setRoomColliders('room12', walls)
    return () => clearRoomColliders('room12')
  }, [width, depth])

  return (
    <group>
      <ambientLight intensity={0.2} color="#a8b8b0" />
      <hemisphereLight args={['#3a4c58', '#12100e', 0.28]} />
      <pointLight position={[0, 2.22, 0.15]} color="#d8c8a8" intensity={0.46} distance={8} decay={2} />
      <pointLight position={[-2.1, 1.72, -0.4]} color="#8fb6d6" intensity={0.38} distance={6.4} decay={2} />

      <Suspense
        fallback={
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#3a342e" roughness={0.92} />
          </mesh>
        }
      >
        <LabFloor width={width} depth={depth} />
      </Suspense>
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1c1a18" roughness={1} />
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
        <meshStandardMaterial color="#3d3832" roughness={0.9} />
      </mesh>
      <LabDoorWall width={width} depth={depth} height={height} />

      <HallwayPeek />
      <Examinable id="side-door-12">
        <HallwayDoor x={DOOR.wallX} z={DOOR.z} inward={-1} label="12" subtitle="INFO" open />
      </Examinable>

      <Suspense fallback={null}>
        <LabSet />
      </Suspense>

      <mesh position={[0, 2.62, -depth / 2 + 0.1]}>
        <boxGeometry args={[0.42, 0.12, 0.08]} />
        <meshStandardMaterial color="#2a2e24" emissive="#d7efb0" emissiveIntensity={0.22} />
      </mesh>
    </group>
  )
}

useTexture.preload('/textura/piso_madeira.png')
