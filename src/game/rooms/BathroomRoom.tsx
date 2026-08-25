import { Suspense, useLayoutEffect } from 'react'
import type { Aabb } from '../data/furniture'
import { getRoom } from '../data/rooms'
import { doorCollidersAt, wallDoor } from '../door/doorLayout'
import { HallwayPeek } from '../door/HallwayPeek'
import { Examinable } from '../examine/Examinable'
import { HallwayDoor } from '../hallway/HallwayDoor'
import { LiviaReflection } from '../player/LiviaReflection'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { clearRoomColliders, setRoomColliders } from './roomColliders'
import { TexturedFloor } from './TexturedFloor'

const room = getRoom('bathroom')
const { width, depth, height } = room.size
const door = wallDoor(width, depth)
const wallT = 0.12
const wall = { color: '#6a6864', roughness: 0.88 }

const STALLS = [{ z: -0.42 }, { z: 0.72 }] as const

const MIRROR_X = 0.82
const MIRROR_Y = 1.42
const MIRROR_GLASS_Z = depth / 2 - 0.057
const GLASS_W = 0.843
const GLASS_H = 1.349
const CAVITY = 4.4
const MIRROR_HIDE = ['metal'] as const
const MIRROR_HIDE_NODES = ['bathroomMirror_1'] as const

function NorthWall() {
  const z = depth / 2
  const holeMinX = MIRROR_X - GLASS_W / 2
  const holeMaxX = MIRROR_X + GLASS_W / 2
  const holeMinY = MIRROR_Y - GLASS_H / 2
  const holeMaxY = MIRROR_Y + GLASS_H / 2
  const leftW = holeMinX - -width / 2
  const rightW = width / 2 - holeMaxX
  const midW = holeMaxX - holeMinX
  const botH = holeMinY
  const topH = height - holeMaxY
  return (
    <group>
      <mesh position={[(-width / 2 + holeMinX) / 2, height / 2, z]} receiveShadow>
        <boxGeometry args={[leftW, height, wallT]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[(holeMaxX + width / 2) / 2, height / 2, z]} receiveShadow>
        <boxGeometry args={[rightW, height, wallT]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[MIRROR_X, botH / 2, z]} receiveShadow>
        <boxGeometry args={[midW, botH, wallT]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[MIRROR_X, holeMaxY + topH / 2, z]} receiveShadow>
        <boxGeometry args={[midW, topH, wallT]} />
        <meshStandardMaterial {...wall} />
      </mesh>
    </group>
  )
}

function MirrorCavity() {
  const zWall = depth / 2
  const zMid = zWall + CAVITY / 2
  const hw = GLASS_W / 2 + 0.1
  const hh = GLASS_H / 2 + 0.1
  const dark = { color: '#161b20', roughness: 1, metalness: 0, fog: false }
  return (
    <group>
      <mesh position={[MIRROR_X, MIRROR_Y, zWall + CAVITY]} receiveShadow>
        <boxGeometry args={[hw * 2 + 0.08, hh * 2 + 0.08, 0.08]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      <mesh position={[MIRROR_X - hw, MIRROR_Y, zMid]} receiveShadow>
        <boxGeometry args={[0.08, hh * 2, CAVITY]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      <mesh position={[MIRROR_X + hw, MIRROR_Y, zMid]} receiveShadow>
        <boxGeometry args={[0.08, hh * 2, CAVITY]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      <mesh position={[MIRROR_X, MIRROR_Y - hh, zMid]} receiveShadow>
        <boxGeometry args={[hw * 2, 0.08, CAVITY]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      <mesh position={[MIRROR_X, MIRROR_Y + hh, zMid]} receiveShadow>
        <boxGeometry args={[hw * 2, 0.08, CAVITY]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      <pointLight
        position={[MIRROR_X, MIRROR_Y + 0.08, zWall + 0.55]}
        color="#e8f0f4"
        intensity={0.35}
        distance={3.4}
        decay={2}
      />
      <pointLight
        position={[MIRROR_X, MIRROR_Y, zWall + 1.85]}
        color="#d5dee4"
        intensity={0.18}
        distance={5.2}
        decay={2}
      />
    </group>
  )
}

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
      { minX: 2.12, maxX: 2.52, minZ: 0.22, maxZ: 0.68 },
    ]
    setRoomColliders('bathroom', walls)
    return () => clearRoomColliders('bathroom')
  }, [])

  return (
    <group>
      <ambientLight intensity={0.035} color="#6a7880" />
      <hemisphereLight args={['#2a343c', '#08090c', 0.1]} />
      <pointLight position={[0.72, 2.32, 1.42]} color="#c8d4dc" intensity={0.28} distance={4.2} decay={2} />
      <pointLight position={[-0.15, 2.22, -0.15]} color="#8a9aa4" intensity={0.16} distance={3.4} decay={2} />

      <Suspense fallback={null}>
        <TexturedFloor
          src="/textura/piso_banheiro.png"
          width={width}
          depth={depth}
          tile={0.85}
          color="#d4d8dc"
          roughness={0.55}
          metalness={0.08}
        />
      </Suspense>
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
      <NorthWall />
      <MirrorCavity />
      <LiviaReflection planeZ={MIRROR_GLASS_Z} />
      <DoorWall />

      <HallwayPeek wallX={door.wallX} z={door.z} />
      <Examinable id="side-door-bathroom">
        <HallwayDoor x={door.wallX} z={door.z} inward={-1} label="WC" subtitle="BANHEIRO" open />
      </Examinable>

      <Suspense fallback={null}>
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
            <Examinable id={i === 0 ? 'bath-stall' : 'bath-stall-empty'}>
              <FurnitureModel
                url="/privada.glb"
                position={[-0.55, 0, 0]}
                rotationY={-Math.PI / 2}
                targetHeight={0.72}
              />
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
          <FurnitureModel
            url="/espelho.glb"
            position={[MIRROR_X, MIRROR_Y, depth / 2 - 0.28]}
            targetWidth={1.12}
            anchor="center"
            hideMaterials={MIRROR_HIDE}
            hideNodes={MIRROR_HIDE_NODES}
          />
          <mesh position={[MIRROR_X, MIRROR_Y, MIRROR_GLASS_Z - 0.006]} rotation={[0, Math.PI, 0]} renderOrder={2}>
            <planeGeometry args={[GLASS_W - 0.04, GLASS_H - 0.04]} />
            <meshStandardMaterial
              color="#b9c8d0"
              metalness={0.22}
              roughness={0.06}
              transparent
              opacity={0.11}
              depthWrite={false}
            />
          </mesh>
        </Examinable>
        <Examinable id="bath-elastic">
          <mesh position={[-1.18, 0.02, STALLS[0].z + 0.16]} rotation={[-Math.PI / 2, 0.4, 0]}>
            <torusGeometry args={[0.055, 0.013, 8, 18]} />
            <meshStandardMaterial color="#6a2032" roughness={0.52} />
          </mesh>
        </Examinable>
        <Examinable id="bath-bin">
          <FurnitureModel url="/lixeira.glb" position={[2.32, 0, 0.45]} targetHeight={0.58} />
        </Examinable>
      </Suspense>
    </group>
  )
}
