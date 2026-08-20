import { useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { getRoom } from '../data/rooms'
import { doorCollidersAt, wallDoor } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const room = getRoom('bathroom')
const { width, depth, height } = room.size
const door = wallDoor(width, depth)
const wallT = 0.12
const wall = { color: '#3a3836', roughness: 0.9 }

const STALLS = [{ z: -0.42 }, { z: 0.72 }] as const

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
        <meshStandardMaterial color="#3d3b38" roughness={0.9} />
      </mesh>
      <mesh position={[x, height / 2, (zC + zD) / 2]} receiveShadow>
        <boxGeometry args={[wallT, height, Math.max(0.08, zD - zC)]} />
        <meshStandardMaterial color="#3d3b38" roughness={0.9} />
      </mesh>
      <mesh position={[x, doorH + lintelH / 2, doorZ]} receiveShadow>
        <boxGeometry args={[wallT, lintelH, doorHalf * 2]} />
        <meshStandardMaterial color="#3d3b38" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function BathroomRoom() {
  useLayoutEffect(() => {
    const stallBoxes: Aabb[] = STALLS.flatMap((stall) => [
      { minX: -2.45, maxX: -0.85, minZ: stall.z - 0.52, maxZ: stall.z - 0.44 },
      { minX: -2.45, maxX: -0.85, minZ: stall.z + 0.44, maxZ: stall.z + 0.52 },
      { minX: -2.45, maxX: -2.32, minZ: stall.z - 0.44, maxZ: stall.z + 0.44 },
    ])
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: door.z - door.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: door.z + door.half, maxZ: depth / 2 },
      ...doorCollidersAt(door.wallX, door.z, true),
      ...stallBoxes,
      { minX: 0.15, maxX: 1.85, minZ: 1.62, maxZ: 2.18 },
    ]
    setRoomColliders('bathroom', walls)
    return () => clearRoomColliders('bathroom')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.08} color="#8a9aa4" />
      <hemisphereLight args={['#3a4850', '#12100e', 0.16]} />
      <pointLight position={[0.2, 2.05, 0.1]} color="#c8d0d4" intensity={0.4} distance={5.2} decay={2} />
      <pointLight position={[-1.4, 1.62, 0.15]} color="#6a7880" intensity={0.14} distance={2.6} decay={2} />

      <TexturedFloor
        src="/textura/piso_banheiro.png"
        width={width}
        depth={depth}
        tile={0.85}
        color="#d4d8dc"
        roughness={0.55}
        metalness={0.08}
      />
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1c1c1a" roughness={1} />
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
      <Examinable id="side-door-bathroom">
        <HallwayDoor x={door.wallX} z={door.z} inward={-1} label="WC" subtitle="BANHEIRO" open />
      </Examinable>

      {STALLS.map((stall, i) => (
        <group key={stall.z} position={[-1.62, 0, stall.z]}>
          <mesh position={[0, 1.0, -0.48]} receiveShadow>
            <boxGeometry args={[1.55, 2.0, 0.05]} />
            <meshStandardMaterial color="#6a6864" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.0, 0.48]} receiveShadow>
            <boxGeometry args={[1.55, 2.0, 0.05]} />
            <meshStandardMaterial color="#6a6864" roughness={0.7} />
          </mesh>
          <FurnitureModel url="/privada.glb" position={[-0.42, 0, 0]} rotationY={Math.PI / 2} targetHeight={0.72} pickable={false} />
          <Examinable id={i === 0 ? 'bath-stall' : 'bath-stall-empty'}>
            <mesh position={[0.72, 1.0, 0]} castShadow>
              <boxGeometry args={[0.05, 2.0, 0.92]} />
              <meshStandardMaterial color="#5c5a56" roughness={0.62} metalness={0.12} />
            </mesh>
          </Examinable>
        </group>
      ))}

      <Examinable id="bath-sink">
        <group position={[0.35, 0, 1.78]}>
          <FurnitureModel url="/pia.glb" position={[0, 0, 0]} targetHeight={0.86} pickable={false} />
        </group>
      </Examinable>
      <FurnitureModel url="/pia.glb" position={[1.28, 0, 1.78]} targetHeight={0.86} pickable={false} />

      <Examinable id="bath-mirror">
        <mesh position={[0.82, 1.42, depth / 2 - 0.07]}>
          <boxGeometry args={[1.18, 0.72, 0.04]} />
          <meshStandardMaterial color="#9aa8b0" roughness={0.12} metalness={0.35} />
        </mesh>
      </Examinable>
    </group>
  )
}
