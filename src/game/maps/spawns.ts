import { DOOR } from '../door/doorLayout'
import { HALL, HALL_DOORS } from '../hallway/hallwayLayout'
import type { RoomId } from '../data/rooms'

export type SpawnPose = {
  x: number
  z: number
  yaw: number
}

export const MAP_SPAWNS: Record<string, Record<string, SpawnPose>> = {
  classroom1: {
    'from-hallway': { x: DOOR.wallX - 0.92, z: DOOR.z, yaw: -Math.PI / 2 },
  },
  hallway: {
    'from-classroom': { x: HALL.halfX - 0.85, z: HALL_DOORS.room11.z, yaw: Math.PI },
    'from-room11': { x: HALL.halfX - 0.85, z: HALL_DOORS.room11.z, yaw: -Math.PI / 2 },
    'from-room12': { x: HALL.halfX - 0.85, z: HALL_DOORS.room12.z, yaw: -Math.PI / 2 },
    'from-room14': { x: HALL.halfX - 0.85, z: HALL_DOORS.room14.z, yaw: -Math.PI / 2 },
    'from-teachers': { x: HALL.halfX - 0.85, z: HALL_DOORS.room13.z, yaw: -Math.PI / 2 },
    'from-dark-area': { x: 0, z: HALL.maxZ - 1.85, yaw: Math.PI },
    'from-passage': { x: 0, z: HALL.maxZ - 1.85, yaw: Math.PI },
  },
  room11: {
    'from-hallway': { x: 0, z: 1.85, yaw: Math.PI },
  },
  room12: {
    'from-hallway': { x: DOOR.wallX - 0.92, z: DOOR.z, yaw: -Math.PI / 2 },
  },
  room14: {
    'from-hallway': { x: DOOR.wallX - 0.92, z: DOOR.z, yaw: -Math.PI / 2 },
  },
  teachers: {
    'from-hallway': { x: DOOR.wallX - 0.92, z: DOOR.z, yaw: -Math.PI / 2 },
  },
  passage: {
    'from-hallway': { x: 0, z: 1.45, yaw: 0 },
  },
}

export function getSpawn(room: RoomId, entryPoint: string): SpawnPose {
  const spawn = MAP_SPAWNS[room]?.[entryPoint]
  if (spawn) return spawn
  const fallback = MAP_SPAWNS[room]
  if (fallback) {
    const first = Object.values(fallback)[0]
    if (first) return first
  }
  return { x: 0, z: 0, yaw: 0 }
}
