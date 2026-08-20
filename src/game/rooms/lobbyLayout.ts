import type { Aabb } from '../data/furniture'
import type { RoomId } from '../data/rooms'
import { HALL } from '../hallway/hallwayLayout'

export const LOBBY = {
  width: 9.2,
  depth: 7.2,
  height: 3.15,
  halfX: 4.6,
  minZ: -0.25,
  maxZ: 6.95,
  doorHalf: HALL.doorHalf,
  doorH: HALL.doorH,
  entranceHalf: 1.42,
} as const

const NEAR_Z = 1.85
const FAR_Z = 4.95
const DIR_X = -1.75
const GATE_X = 2.45

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
  dest: RoomId | null
  open: boolean
  kind: 'door' | 'gate'
}

export const LOBBY_DOORS: Record<LobbyDoorId, LobbyDoorDef> = {
  library: {
    id: 'library',
    x: -LOBBY.halfX,
    z: NEAR_Z,
    wall: 'west',
    inward: 1,
    yaw: 0,
    label: 'BIB',
    subtitle: 'BIBLIOTECA',
    examineId: 'lobby-library',
    lockedLine: 'Biblioteca. Fechada.',
    dest: 'library',
    open: false,
    kind: 'door',
  },
  storage: {
    id: 'storage',
    x: -LOBBY.halfX,
    z: FAR_Z,
    wall: 'west',
    inward: 1,
    yaw: 0,
    label: 'ZEL',
    subtitle: 'ZELADORIA',
    examineId: 'lobby-storage',
    lockedLine: 'Zeladoria. Fechada.',
    dest: 'storage',
    open: false,
    kind: 'door',
  },
  bathroom: {
    id: 'bathroom',
    x: LOBBY.halfX,
    z: NEAR_Z,
    wall: 'east',
    inward: -1,
    yaw: 0,
    label: 'WC',
    subtitle: 'BANHEIRO',
    examineId: 'lobby-bathroom',
    lockedLine: 'Banheiro.',
    dest: 'bathroom',
    open: true,
    kind: 'door',
  },
  office: {
    id: 'office',
    x: DIR_X,
    z: LOBBY.maxZ,
    wall: 'north',
    inward: -1,
    yaw: Math.PI / 2,
    label: 'DIR',
    subtitle: 'DIRETORIA',
    examineId: 'lobby-office',
    lockedLine: 'Diretoria. Trancada.',
    dest: 'office',
    open: false,
    kind: 'door',
  },
  exit: {
    id: 'exit',
    x: GATE_X,
    z: LOBBY.maxZ,
    wall: 'north',
    inward: -1,
    yaw: Math.PI / 2,
    label: '',
    subtitle: undefined,
    examineId: 'lobby-exit',
    lockedLine: 'Não abre.',
    dest: null,
    open: false,
    kind: 'gate',
  },
}

export const LOBBY_PLANTER = {
  x: 0,
  z: 3.4,
  halfX: 0.78,
  halfZ: 0.78,
} as const

export const LOBBY_DOOR_LIST = Object.values(LOBBY_DOORS)

export function nearLobbyDoor(px: number, pz: number, door: LobbyDoorDef, reach = 1.55) {
  if (door.wall === 'north') {
    return Math.hypot(px - door.x, pz - (door.z - 1.12)) <= reach
  }
  const standX = door.x + door.inward * 1.08
  return Math.hypot(px - standX, pz - door.z) <= reach
}

export function nearLobbyEntrance(px: number, pz: number) {
  return pz < 1.45 && Math.abs(px) < 1.85
}

export function inLobbyDoorway(px: number, pz: number, door: LobbyDoorDef) {
  const h = LOBBY.doorHalf + 0.1
  if (door.wall === 'west') return px < door.x + 0.48 && Math.abs(pz - door.z) < h
  if (door.wall === 'east') return px > door.x - 0.48 && Math.abs(pz - door.z) < h
  return pz > door.z - 0.48 && Math.abs(px - door.x) < h
}

function doorBlock(door: LobbyDoorDef): Aabb {
  const h = LOBBY.doorHalf
  if (door.wall === 'west') {
    return { minX: door.x - 0.18, maxX: door.x + 0.28, minZ: door.z - h, maxZ: door.z + h }
  }
  if (door.wall === 'east') {
    return { minX: door.x - 0.28, maxX: door.x + 0.18, minZ: door.z - h, maxZ: door.z + h }
  }
  return { minX: door.x - h, maxX: door.x + h, minZ: door.z - 0.28, maxZ: door.z + 0.12 }
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
  const tIn = 0.16
  const tOut = 0.22
  const westOpen = [
    { at: LOBBY_DOORS.library.z, half: LOBBY.doorHalf },
    { at: LOBBY_DOORS.storage.z, half: LOBBY.doorHalf },
  ]
  const eastOpen = [{ at: LOBBY_DOORS.bathroom.z, half: LOBBY.doorHalf }]
  const northOpen = [
    { at: LOBBY_DOORS.office.x, half: LOBBY.doorHalf },
    { at: LOBBY_DOORS.exit.x, half: LOBBY.doorHalf + 0.12 },
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
  const north = wallRuns(-h, h, northOpen).map((part) => ({
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
  const bed = LOBBY_PLANTER
  return [
    ...west,
    ...east,
    ...north,
    ...south,
    ...LOBBY_DOOR_LIST.filter((door) => !door.open).map(doorBlock),
    {
      minX: bed.x - bed.halfX,
      maxX: bed.x + bed.halfX,
      minZ: bed.z - bed.halfZ,
      maxZ: bed.z + bed.halfZ,
    },
  ]
}
