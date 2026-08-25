import { useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { ITEM_IDS } from '../data/items'
import { getRoom } from '../data/rooms'
import { doorCollidersAt, wallDoor } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { useInventoryStore } from '../state/useInventoryStore'
import { ZEL_SKELETON_AIM } from './skeletonCabinet'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const room = getRoom('storage')
const { width, depth, height } = room.size
const door = wallDoor(width, depth)
const wallT = 0.12
const wall = { color: '#322e2a', roughness: 0.94 }
const LOCKER_Z = -0.92
const SKELETON_X = ZEL_SKELETON_AIM.x
const EMPTY_LOCKERS = [-0.35, 0.42, 1.19, 1.96] as const

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
  const lockerOpen = useInventoryStore((s) => s.has(ITEM_IDS.bibKey))

  useLayoutEffect(() => {
    const walls: Aabb[] = [
      { minX: -width / 2, maxX: width / 2, minZ: -depth / 2 - 0.12, maxZ: -depth / 2 },
      { minX: -width / 2 - 0.12, maxX: -width / 2, minZ: -depth / 2, maxZ: depth / 2 },
      { minX: -width / 2, maxX: width / 2, minZ: depth / 2, maxZ: depth / 2 + 0.12 },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: -depth / 2, maxZ: door.z - door.half },
      { minX: width / 2, maxX: width / 2 + 0.12, minZ: door.z + door.half, maxZ: depth / 2 },
      ...doorCollidersAt(door.wallX, door.z, true),
      { minX: -2.38, maxX: -1.92, minZ: 1.34, maxZ: 1.76 },
      { minX: 0.45, maxX: 1.35, minZ: depth / 2 - 0.95, maxZ: depth / 2 - 0.15 },
      { minX: -width / 2, maxX: -width / 2 + 0.48, minZ: LOCKER_Z - 0.24, maxZ: LOCKER_Z + 0.24 },
      { minX: SKELETON_X - 0.3, maxX: SKELETON_X + 0.3, minZ: -depth / 2, maxZ: -depth / 2 + 0.52 },
      ...EMPTY_LOCKERS.map((z) => ({
        minX: width / 2 - 0.48,
        maxX: width / 2,
        minZ: z - 0.24,
        maxZ: z + 0.24,
      })),
    ]
    setRoomColliders('storage', walls)
    return () => clearRoomColliders('storage')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.02} color="#6a7c90" />
      <hemisphereLight args={['#15202c', '#05060a', 0.08]} />
      <mesh position={[0.15, height - 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.28, 1.15]} />
        <meshBasicMaterial color="#1c1a14" fog={false} />
      </mesh>

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

      <Examinable id="zel-broom">
        <FurnitureModel url="/vassoura.glb" position={[-width / 2 + 0.28, 0, -1.85]} rotationY={0.35} targetHeight={1.22} />
      </Examinable>
      <Examinable id="zel-products">
        <FurnitureModel
          url="/produtos_limpeza.glb"
          position={[-2.15, 0, 1.55]}
          rotationY={Math.PI / 2}
          targetHeight={0.41}
        />
      </Examinable>
      <Examinable id="zel-vac">
        <FurnitureModel url="/aspirador.glb" position={[0.85, 0, depth / 2 - 0.55]} rotationY={Math.PI} targetHeight={0.72} />
      </Examinable>

      <group position={[-width / 2, 0, LOCKER_Z]}>
        <Examinable id="zel-locker">
          <FurnitureModel
            url={lockerOpen ? '/armario_aberto.glb' : '/armario_fechado.glb'}
            position={[0, 0, 0]}
            rotationY={0}
            targetHeight={1.72}
            pickable={false}
          />
          <mesh position={[0.14, 0.86, 0]}>
            <boxGeometry args={[0.36, 1.7, 0.34]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </Examinable>
      </group>

      {EMPTY_LOCKERS.map((z, i) => (
        <group key={`zel-empty-${z}`} position={[width / 2, 0, z]}>
          <Examinable id={`zel-empty-${i}`}>
            <FurnitureModel
              url="/armario_fechado.glb"
              position={[0, 0, 0]}
              rotationY={Math.PI}
              targetHeight={1.72}
              pickable={false}
            />
            <mesh position={[-0.14, 0.86, 0]}>
              <boxGeometry args={[0.36, 1.7, 0.34]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </Examinable>
        </group>
      ))}

      <group position={[SKELETON_X, 0, -depth / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <Examinable id="zel-skeleton">
          <FurnitureModel
            url="/armario_esqueleto.glb"
            position={[0, 0, 0]}
            rotationY={0}
            targetHeight={1.78}
            pickable={false}
          />
          <mesh position={[0.16, 0.9, 0]}>
            <boxGeometry args={[0.42, 1.78, 0.46]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </Examinable>
      </group>
    </group>
  )
}
