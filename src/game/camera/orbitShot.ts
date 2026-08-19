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
  const span = Math.min(room.bounds.maxX - room.bounds.minX, room.bounds.maxZ - room.bounds.minZ)
  const dist = distOverride ?? clamp(span * 0.28, 1.55, 2.5)
  const sx = Math.sin(yaw)
  const cz = Math.cos(yaw)
  const phone = distOverride !== undefined
  const pad = phone ? Math.max(1.35, dist * 0.58) : 0
  const inner = phone ? 0.18 : 0.55
  const y = phone
    ? clamp(1.48 + pitch * 0.55 + dist * 0.34, 1.42, 6.4)
    : clamp(1.52 + pitch * 0.34 + dist * 0.08, 1.28, room.size.height - 0.38)
  const lookLift = phone ? clamp(0.92 + pitch * 0.7, 0.4, 2.1) : clamp(1.05 + pitch * 0.9, 0.42, 2.18)
  const lookFwd = phone ? 0.12 : 0.85
  return {
    position: [
      clamp(px - sx * dist, room.bounds.minX + inner - pad, room.bounds.maxX - inner + pad),
      y,
      clamp(pz - cz * dist, room.bounds.minZ + inner - pad, room.bounds.maxZ - inner + pad),
    ],
    lookAt: [
      px + sx * lookFwd,
      lookLift,
      pz + cz * lookFwd,
    ],
    fov: phone ? clamp(52 + dist * 0.7, 50, 60) : clamp(58 - dist * 2.4, 42, 56),
    damp: 3.4,
  }
}
