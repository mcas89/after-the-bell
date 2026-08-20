export type RoomId =
  | 'classroom1'
  | 'hallway'
  | 'room11'
  | 'room12'
  | 'room14'
  | 'room201'
  | 'room202'
  | 'classroom2'
  | 'library'
  | 'bathroom'
  | 'office'
  | 'teachers'
  | 'storage'
  | 'backyard'
  | 'passage'

export type RoomBounds = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export type RoomDef = {
  id: RoomId
  size: { width: number; depth: number; height: number }
  spawn: [number, number, number]
  bounds: RoomBounds
}

export const CLASSROOM_1: RoomDef = {
  id: 'classroom1',
  size: { width: 9.2, depth: 7.2, height: 3.05 },
  spawn: [0, 0, 1.55],
  bounds: { minX: -4.2, maxX: 4.2, minZ: -3.2, maxZ: 3.2 },
}

export const HALLWAY: RoomDef = {
  id: 'hallway',
  size: { width: 5.1, depth: 22.65, height: 3.05 },
  spawn: [-0.2, 0, 1.72],
  bounds: { minX: -2.45, maxX: 2.45, minZ: -0.45, maxZ: 22.2 },
}

const SIDE_CLASSROOM: Omit<RoomDef, 'id'> = {
  size: { width: 7.4, depth: 6.4, height: 3.05 },
  spawn: [0, 0, 2.35],
  bounds: { minX: -3.4, maxX: 3.4, minZ: -2.9, maxZ: 2.9 },
}

export const ROOM_11: RoomDef = { ...SIDE_CLASSROOM, id: 'room11' }
export const ROOM_12: RoomDef = { ...CLASSROOM_1, id: 'room12' }
export const ROOM_14: RoomDef = { ...CLASSROOM_1, id: 'room14' }
export const TEACHERS: RoomDef = { ...CLASSROOM_1, id: 'teachers' }
export const BATHROOM: RoomDef = {
  id: 'bathroom',
  size: { width: 5.5, depth: 4.6, height: 2.85 },
  spawn: [0.4, 0, -0.35],
  bounds: { minX: -2.55, maxX: 2.55, minZ: -2.1, maxZ: 2.1 },
}

export const PASSAGE: RoomDef = {
  id: 'passage',
  size: { width: 9.2, depth: 7.2, height: 3.15 },
  spawn: [0, 0, 1.05],
  bounds: { minX: -4.4, maxX: 4.4, minZ: -0.1, maxZ: 6.75 },
}

export const ROOMS: Record<RoomId, RoomDef> = {
  classroom1: CLASSROOM_1,
  hallway: HALLWAY,
  room11: ROOM_11,
  room12: ROOM_12,
  room14: ROOM_14,
  room201: { ...ROOM_11, id: 'room201' },
  room202: { ...ROOM_14, id: 'room202' },
  classroom2: { ...SIDE_CLASSROOM, id: 'classroom2' },
  library: { ...CLASSROOM_1, id: 'library' },
  bathroom: BATHROOM,
  office: { ...SIDE_CLASSROOM, id: 'office' },
  teachers: TEACHERS,
  storage: { ...SIDE_CLASSROOM, id: 'storage' },
  backyard: { ...HALLWAY, id: 'backyard' },
  passage: PASSAGE,
}

export function migrateRoomId(id: string): RoomId {
  if (id === 'room201') return 'room11'
  if (id === 'room202') return 'room14'
  return id as RoomId
}

export function getRoom(id: RoomId) {
  return ROOMS[migrateRoomId(id)]
}
