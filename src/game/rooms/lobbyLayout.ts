import type { Aabb } from '../data/furniture'
import { HALL } from '../hallway/hallwayLayout'

export const LOBBY = {
  width: 10.4,
  depth: 10.4,
  height: 3.05,
  halfX: 5.2,
  minZ: -0.2,
  maxZ: 10.2,
  doorHalf: HALL.doorHalf,
  doorH: HALL.doorH,
  entranceHalf: 0.96,
} as const

export type LobbyDoorId = 'library' | 'storage' | 'bathroom' | 'office' | 'exit'

export type LobbyWall = 'west' | 'east' | 'north'

export type LobbyDoorDef = {
  id: LobbyDoorId
  x: number
  z: number
  wall: LobbyWall
  inward: 1 | -1
  yaw: number
  label: string
  subtitle?: string
  examineId: string
  lockedLine: string
}

export const LOBBY_DOORS: Record<LobbyDoorId, LobbyDoorDef> = {
  library: {
    id: 'library',
    x: -LOBBY.halfX,
    z: 2.85,
    wall: 'west',
    inward: 1,
    yaw: 0,
    label: 'BIB',
    subtitle: 'BIBLIOTECA',
    examineId: 'lobby-library',
    lockedLine: 'Biblioteca. Trancada.',
  },
  storage: {
    id: 'storage',
    x: -LOBBY.halfX,
    z: 7.35,
    wall: 'west',
    inward: 1,
    yaw: 0,
    label: 'ZEL',
    subtitle: 'ZELADORIA',
    examineId: 'lobby-storage',
    lockedLine: 'Zeladoria. Trancada.',
  },
  bathroom: {
    id: 'bathroom',
    x: 0,
    z: LOBBY.maxZ,
    wall: 'north',
    inward: -1,
    yaw: Math.PI / 2,
    label: 'WC',
    subtitle: 'BANHEIRO',
    examineId: 'lobby-bathroom',
    lockedLine: 'Banheiro. Trancada.',
  },
  office: {
    id: 'office',
    x: LOBBY.halfX,
    z: 2.85,
    wall: 'east',
    inward: -1,
    yaw: 0,
    label: 'DIR',
    subtitle: 'DIRETORIA',
    examineId: 'lobby-office',
    lockedLine: 'Diretoria. Trancada.',
  },
  exit: {
    id: 'exit',
    x: LOBBY.halfX,
    z: 7.35,
    wall: 'east',
    inward: -1,
    yaw: 0,
    label: 'S',
    subtitle: 'SAÍDA',
    examineId: 'lobby-exit',
    lockedLine: 'Saída. Trancada por fora.',
  },
}

export const LOBBY_COUNTER = {
  x: LOBBY.halfX - 0.92,
  z: 5.1,
  halfX: 0.74,
  halfZ: 1.18,
} as const

export const LOBBY_DOOR_LIST = Object.values(LOBBY_DOORS)

export function nearLobbyDoor(px: number, pz: number, door: LobbyDoorDef, reach = 1.55) {
  if (door.wall === 'north') {
    return Math.hypot(px - door.x, pz - (door.z - 1.18)) <= reach
  }
  return Math.hypot(px - door.x * 0.78, pz - door.z) <= reach
}

export function nearLobbyEntrance(px: number, pz: number) {
  return pz < 1.55 && Math.abs(px) < 1.22
}

function doorBlock(door: LobbyDoorDef): Aabb {
  const h = LOBBY.doorHalf
  if (door.wall === 'west') {
    return { minX: door.x - 0.1, maxX: door.x + 0.24, minZ: door.z - h, maxZ: door.z + h }
  }
  if (door.wall === 'east') {
    return { minX: door.x - 0.24, maxX: door.x + 0.1, minZ: door.z - h, maxZ: door.z + h }
  }
  return { minX: door.x - h, maxX: door.x + h, minZ: door.z - 0.24, maxZ: door.z + 0.1 }
}

function wallRuns(min: number, max: number, openings: { at: number; half: number }[]) {
  const slots = [...openings].sort((a, b) => a.at - b.at)
  const parts: { start: number; end: number }[] = []
  let cursor = min
  for (const slot of slots) {
    const start = slot.at - slot.half
    if (start - cursor > 0.04) parts.push({ start: cursor, end: start })
    cursor = slot.at + slot.half
  }
  if (max - cursor > 0.04) parts.push({ start: cursor, end: max })
  return parts
}

export function lobbyColliders(): Aabb[] {
  const h = LOBBY.halfX
  const tIn = 0.1
  const tOut = 0.14
  const westOpen = [
    { at: LOBBY_DOORS.library.z, half: LOBBY.doorHalf },
    { at: LOBBY_DOORS.storage.z, half: LOBBY.doorHalf },
  ]
  const eastOpen = [
    { at: LOBBY_DOORS.office.z, half: LOBBY.doorHalf },
    { at: LOBBY_DOORS.exit.z, half: LOBBY.doorHalf },
  ]
  const west = wallRuns(LOBBY.minZ, LOBBY.maxZ, westOpen).map((part) => ({
    minX: -h - tOut,
    maxX: -h + tIn,
    minZ: part.start,
    maxZ: part.end,
  }))
  const east = wallRuns(LOBBY.minZ, LOBBY.maxZ, eastOpen).map((part) => ({
    minX: h - tIn,
    maxX: h + tOut,
    minZ: part.start,
    maxZ: part.end,
  }))
  const north = wallRuns(-h, h, [{ at: LOBBY_DOORS.bathroom.x, half: LOBBY.doorHalf }]).map((part) => ({
    minX: part.start,
    maxX: part.end,
    minZ: LOBBY.maxZ - tIn,
    maxZ: LOBBY.maxZ + tOut,
  }))
  const south = wallRuns(-h, h, [{ at: 0, half: LOBBY.entranceHalf }]).map((part) => ({
    minX: part.start,
    maxX: part.end,
    minZ: LOBBY.minZ - tOut,
    maxZ: LOBBY.minZ + tIn + 0.16,
  }))
  const counter = LOBBY_COUNTER
  return [
    ...west,
    ...east,
    ...north,
    ...south,
    ...LOBBY_DOOR_LIST.map(doorBlock),
    {
      minX: counter.x - counter.halfX,
      maxX: counter.x + counter.halfX + 0.08,
      minZ: counter.z - counter.halfZ,
      maxZ: counter.z + counter.halfZ,
    },
  ]
}
