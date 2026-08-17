import type { Aabb } from '../data/furniture'

export const HALL = {
  halfX: 2.45,
  minZ: -0.45,
  maxZ: 22.2,
  height: 3.05,
  doorHalf: 0.5,
  doorH: 2.2,
} as const

const DOOR_X = HALL.halfX

export const HALL_DOORS = {
  room11: { x: DOOR_X, z: 3.95, enterable: true as const, label: '11', id: 'room11' },
  room12: { x: DOOR_X, z: 7.35, enterable: true as const, label: '12', id: 'room12' },
  room13: { x: DOOR_X, z: 10.75, enterable: false as const, label: '', id: 'room13' },
  room14: { x: DOOR_X, z: 14.15, enterable: true as const, label: '14', id: 'room14' },
} as const

export const HALL_PROPS = {
  clock: { x: -HALL.halfX + 0.08, y: 2.18, z: 2.05 },
  mural: { x: HALL.halfX - 0.07, y: 1.48, z: 9.05 },
  fountain: { x: -HALL.halfX + 0.58, z: 17.35 },
  bin: { x: HALL.halfX - 0.58, z: 17.55 },
  windowZ: HALL.minZ + 0.04,
  windowSill: 0.88,
  windowH: 1.42,
  windowHalf: 0.72,
  sideWindows: [5.15, 12.85] as const,
  sideWindowHalf: 0.88,
  passageZ: HALL.maxZ - 0.08,
  darkFrom: 20.05,
} as const

export type HallDoorId = keyof typeof HALL_DOORS

export function doorOpening(z: number): Aabb {
  return {
    minX: -0.2,
    maxX: 0.2,
    minZ: z - HALL.doorHalf,
    maxZ: z + HALL.doorHalf,
  }
}

export function nearDoor(x: number, z: number, door: { x: number; z: number }, reach = 1.55) {
  return Math.hypot(x - door.x * 0.72, z - door.z) <= reach
}
