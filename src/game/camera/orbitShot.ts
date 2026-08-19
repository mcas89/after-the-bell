import type { RoomDef } from '../data/rooms'

export type OrbitShot = {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  damp: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function playerOrbitShot(
  px: number,
  pz: number,
  yaw: number,
  pitch: number,
  room: RoomDef,
): OrbitShot {
  const inner = 0.55
  const span = Math.min(room.bounds.maxX - room.bounds.minX, room.bounds.maxZ - room.bounds.minZ)
  const dist = clamp(span * 0.28, 1.55, 2.5)
  const sx = Math.sin(yaw)
  const cz = Math.cos(yaw)
  const y = clamp(1.58 + pitch * 0.34, 1.28, room.size.height - 0.42)
  return {
    position: [
      clamp(px - sx * dist, room.bounds.minX + inner, room.bounds.maxX - inner),
      y,
      clamp(pz - cz * dist, room.bounds.minZ + inner, room.bounds.maxZ - inner),
    ],
    lookAt: [
      px + sx * 1.2,
      clamp(1.1 + pitch * 1.05, 0.42, 2.28),
      clamp(pz + cz * 1.2, room.bounds.minZ + 0.35, room.bounds.maxZ - 0.35),
    ],
    fov: 52,
    damp: 3.4,
  }
}
