import { useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { getRoom } from '../data/rooms'
import { DOOR, doorColliders } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const room = getRoom('storage')
const { width, depth, height } = room.size
const wallT = 0.12
const wall = { color: '#322e2a', roughness: 0.94 }

function DoorWall() {
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
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[x, height / 2, (zC + zD) / 2]} receiveShadow>
        <boxGeometry args={[wallT, height, Math.max(0.08, zD - zC)]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[x, doorH + lintelH / 2, doorZ]} receiveShadow>
        <boxGeometry args={[wallT, lintelH, doorHalf * 2]} />
        <meshStandardMaterial {...wall} />
      </mesh>
    </group>
  )
}

export function StorageRoom() {
  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: DOOR.z - DOOR.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: DOOR.z + DOOR.half, maxZ: depth / 2 },
      ...doorColliders(true),
    ]
    setRoomColliders('storage', walls)
    return () => clearRoomColliders('storage')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.07} color="#8a7a68" />
      <hemisphereLight args={['#3a342e', '#0c0a08', 0.14]} />
      <pointLight position={[0.4, 1.85, 0.2]} color="#d4c4a4" intensity={0.38} distance={5.2} decay={2} />

      <TexturedFloor
        src="/textura/piso_patio_interno.png"
        width={width}
        depth={depth}
        tile={4}
        color="#d8d6d2"
        roughness={0.92}
        metalness={0.03}
      />
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#141210" roughness={1} />
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

      <HallwayPeek />
      <Examinable id="side-door-storage">
        <HallwayDoor x={DOOR.wallX} z={DOOR.z} inward={-1} label="ZEL" subtitle="ZELADORIA" open />
      </Examinable>

      <Examinable id="lobby-switch">
        <group position={[-width / 2 + 0.06, 1.22, 0.35]}>
          <FurnitureModel
            url="/interruptor_zeladoria.glb"
            position={[0, 0, 0]}
            rotationY={Math.PI / 2}
            targetHeight={0.22}
            pickable={false}
          />
          <mesh position={[0.04, 0.02, 0]}>
            <boxGeometry args={[0.12, 0.28, 0.18]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </Examinable>
    </group>
  )
}
