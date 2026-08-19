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
  distOverride?: number,
): OrbitShot {
  const inner = 0.55
  const span = Math.min(room.bounds.maxX - room.bounds.minX, room.bounds.maxZ - room.bounds.minZ)
  const dist = distOverride ?? clamp(span * 0.28, 1.55, 2.5)
  const sx = Math.sin(yaw)
  const cz = Math.cos(yaw)
  const y = clamp(1.52 + pitch * 0.34 + dist * 0.08, 1.28, room.size.height - 0.38)
  return {
    position: [
      clamp(px - sx * dist, room.bounds.minX + inner, room.bounds.maxX - inner),
      y,
      clamp(pz - cz * dist, room.bounds.minZ + inner, room.bounds.maxZ - inner),
    ],
    lookAt: [
      px + sx * 0.85,
      clamp(1.05 + pitch * 0.9, 0.42, 2.18),
      clamp(pz + cz * 0.85, room.bounds.minZ + 0.35, room.bounds.maxZ - 0.35),
    ],
    fov: clamp(58 - dist * 2.4, 42, 56),
    damp: 3.4,
  }
}
