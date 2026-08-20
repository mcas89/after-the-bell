import { CLASSROOM_1, getRoom, type RoomId } from '../data/rooms'
import type { Aabb } from '../data/furniture'

const { width, depth } = CLASSROOM_1.size

export function wallDoor(roomWidth: number, roomDepth: number) {
  return {
    wallX: roomWidth / 2,
    z: -roomDepth / 2 + 1.0,
    half: 0.52,
    height: 2.2,
  }
}

export const DOOR = {
  ...wallDoor(width, depth),
  thickness: 0.048,
  closed: 0,
  ajar: -0.38,
  open: -1.72,
  reach: 2.25,
} as const

export function roomWallDoor(roomId: RoomId) {
  const { width, depth } = getRoom(roomId).size
  return wallDoor(width, depth)
}

export function doorDistance(x: number, z: number) {
  return Math.hypot(x - (DOOR.wallX - 0.35), z - DOOR.z)
}

export function doorKnockPosition(): [number, number, number] {
  return [DOOR.wallX + 0.55, 1.28, DOOR.z]
}

export function doorCollidersAt(wallX: number, z: number, open: boolean): Aabb[] {
  const h = DOOR.half
  if (!open) {
    return [{ minX: wallX - 0.14, maxX: wallX + 0.1, minZ: z - h, maxZ: z + h }]
  }
  return [
    { minX: wallX, maxX: wallX + 2.55, minZ: z - h - 0.16, maxZ: z - h },
    { minX: wallX, maxX: wallX + 2.55, minZ: z + h, maxZ: z + h + 0.16 },
    { minX: wallX + 2.4, maxX: wallX + 2.62, minZ: z - h, maxZ: z + h },
  ]
}

export function doorColliders(open: boolean): Aabb[] {
  return doorCollidersAt(DOOR.wallX, DOOR.z, open)
}

export function clampWithDoor(x: number, z: number, open: boolean) {
  const { minX, maxX, minZ, maxZ } = CLASSROOM_1.bounds
  if (!open) {
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      z: Math.min(maxZ, Math.max(minZ, z)),
    }
  }

  const inHall = x > maxX - 0.02
  const hallZ = DOOR.half - 0.14
  const nextX = Math.min(DOOR.wallX + 2.25, Math.max(minX, x))
  const nextZ = inHall
    ? Math.min(DOOR.z + hallZ, Math.max(DOOR.z - hallZ, z))
    : Math.min(maxZ, Math.max(minZ, z))
  const canEnter = Math.abs(nextZ - DOOR.z) <= hallZ
  return {
    x: canEnter ? nextX : Math.min(maxX, nextX),
    z: nextZ,
  }
}
