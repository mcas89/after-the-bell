import { CLASSROOM_1 } from '../data/rooms'
import type { Aabb } from '../data/furniture'

const { width, depth } = CLASSROOM_1.size

export const DOOR = {
  wallX: width / 2,
  z: -depth / 2 + 1.0,
  half: 0.52,
  height: 2.2,
  thickness: 0.048,
  closed: 0,
  ajar: -0.38,
  open: -1.72,
  reach: 2.25,
} as const

export function doorDistance(x: number, z: number) {
  return Math.hypot(x - (DOOR.wallX - 0.35), z - DOOR.z)
}

export function doorKnockPosition(): [number, number, number] {
  return [DOOR.wallX + 0.55, 1.28, DOOR.z]
}

export function doorColliders(open: boolean): Aabb[] {
  const x = DOOR.wallX
  const z = DOOR.z
  const h = DOOR.half
  if (!open) {
    return [{ minX: x - 0.14, maxX: x + 0.1, minZ: z - h, maxZ: z + h }]
  }
  return [
    { minX: x, maxX: x + 2.55, minZ: z - h - 0.16, maxZ: z - h },
    { minX: x, maxX: x + 2.55, minZ: z + h, maxZ: z + h + 0.16 },
    { minX: x + 2.4, maxX: x + 2.62, minZ: z - h, maxZ: z + h },
  ]
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
