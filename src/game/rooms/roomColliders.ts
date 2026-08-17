import type { Aabb } from '../data/furniture'
import { getColliders } from '../data/furniture'
import { doorColliders } from '../door/doorLayout'
import { useDoorStore } from '../door/useDoorStore'
import type { RoomId } from '../data/rooms'
import { useGameStore } from '../state/useGameStore'

const byRoom = new Map<RoomId, Aabb[]>()

export function setRoomColliders(room: RoomId, boxes: Aabb[]) {
  byRoom.set(room, boxes)
}

export function clearRoomColliders(room: RoomId) {
  byRoom.delete(room)
}

export function getActiveColliders(): Aabb[] {
  const room = useGameStore.getState().currentRoom
  if (room === 'classroom1') {
    return [...getColliders(), ...doorColliders(useDoorStore.getState().phase === 'open')]
  }
  return byRoom.get(room) ?? []
}
