import { useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { getRoom } from '../data/rooms'
import { doorCollidersAt, wallDoor } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { LOBBY_LIGHTS } from '../inventory/flashlight'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { useGameStore } from '../state/useGameStore'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const room = getRoom('storage')
const { width, depth, height } = room.size
const door = wallDoor(width, depth)
const wallT = 0.12
const wall = { color: '#322e2a', roughness: 0.94 }

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
  const lightsOn = useGameStore((s) => Boolean(s.flags[LOBBY_LIGHTS]))

  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: door.z - door.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: door.z + door.half, maxZ: depth / 2 },
      ...doorCollidersAt(door.wallX, door.z, true),
    ]
    setRoomColliders('storage', walls)
    return () => clearRoomColliders('storage')
  }, [])

  return (
    <group>
      {lightsOn ? (
        <>
          <ambientLight intensity={0.34} color="#b8c4bc" />
          <hemisphereLight args={['#4a5c68', '#161410', 0.42]} />
          <pointLight position={[0.1, 2.15, 0]} color="#f0e2c4" intensity={9.2} distance={10} decay={1.6} />
          <pointLight position={[-0.8, 2.05, 0.6]} color="#efe6d0" intensity={5.6} distance={8} decay={1.65} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.02} color="#6a7c90" />
          <hemisphereLight args={['#15202c', '#05060a', 0.08]} />
          <pointLight position={[-width / 2 + 0.28, 1.22, 0.35]} color="#c8b898" intensity={0.18} distance={1.6} decay={2} />
        </>
      )}
      <mesh position={[0.15, height - 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.28, 1.15]} />
        <meshBasicMaterial color={lightsOn ? '#f2ead4' : '#1c1a14'} fog={false} />
      </mesh>
      {lightsOn ? (
        <mesh position={[0.15, height - 0.08, 0]}>
          <boxGeometry args={[0.22, 0.08, 0.16]} />
          <meshStandardMaterial color="#f2ead4" emissive="#f0e2c4" emissiveIntensity={2.2} roughness={0.35} />
        </mesh>
      ) : null}

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

      <HallwayPeek wallX={door.wallX} z={door.z} />
      <Examinable id="side-door-storage">
        <HallwayDoor x={door.wallX} z={door.z} inward={-1} label="ZEL" subtitle="ZELADORIA" open />
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
