import type { Aabb } from '../data/furniture'
import type { RoomId } from '../data/rooms'
import { hasDarkHallClues } from './darkProgress'

export const HALL = {
  halfX: 2.45,
  minZ: -0.45,
  maxZ: 22.2,
  height: 3.05,
  doorHalf: 0.5,
  doorH: 2.2,
} as const

const DOOR_X = HALL.halfX

export type HallDoorDef = {
  x: number
  z: number
  id: string
  label: string
  subtitle: string
  open: boolean
  dest: RoomId | null
  key: string | null
}

export const HALL_DOORS = {
  room11: {
    x: DOOR_X,
    z: 3.95,
    id: 'room11',
    label: '11',
    subtitle: '2º B',
    open: true,
    dest: 'classroom1' as const,
    key: null,
  },
  room12: {
    x: DOOR_X,
    z: 7.35,
    id: 'room12',
    label: '12',
    subtitle: 'INFO',
    open: false,
    dest: 'room12' as const,
    key: null,
  },
  room13: {
    x: DOOR_X,
    z: 10.75,
    id: 'room13',
    label: '13',
    subtitle: 'PROF.',
    open: false,
    dest: 'teachers' as const,
    key: 'item-key',
  },
  room14: {
    x: DOOR_X,
    z: 14.15,
    id: 'room14',
    label: '14',
    subtitle: 'ARTES',
    open: false,
    dest: 'room14' as const,
    key: 'item-key-diretoria',
  },
} as const satisfies Record<string, HallDoorDef>

export const HALL_PROPS = {
  clock: { x: HALL.halfX - 0.06, y: 2.24, z: 5.65 },
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
  girlStand: 17.55,
} as const

export const HALL_MURALS = [
  { id: 'hall-mural-1', z: 1.52, y: 1.52, w: 1.78, h: 1.22, kind: 'lost' as const },
  { id: 'hall-mural-2', z: 9.05, y: 1.5, w: 1.7, h: 1.16, kind: 'photos' as const },
  { id: 'hall-mural-3', z: 12.45, y: 1.48, w: 1.62, h: 1.1, kind: 'notes' as const },
] as const

/** Sem 10 fragmentos o fundo fica bloqueado. Ver darkProgress.ts. */
export function hallwayStopZ(seenGirl: boolean) {
  if (hasDarkHallClues()) return HALL.maxZ
  return seenGirl ? HALL_PROPS.girlStand : HALL_PROPS.darkFrom
}

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
