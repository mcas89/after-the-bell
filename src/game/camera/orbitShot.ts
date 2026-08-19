import type { RoomDef } from '../data/rooms'
import { ZOOM_MIN } from '../input/lookInput'

export type OrbitShot = {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  damp: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const INNER = 0.52

export function phoneZoomMax(room: RoomDef) {
  if (room.id === 'passage') return 4.15
  if (room.id === 'hallway') return 2.8
  const span = Math.min(room.bounds.maxX - room.bounds.minX, room.bounds.maxZ - room.bounds.minZ)
  return clamp(span * 0.36, 2.05, 3.05)
}

function maxDistInside(px: number, pz: number, yaw: number, room: RoomDef) {
  const minX = room.bounds.minX + INNER
  const maxX = room.bounds.maxX - INNER
  const minZ = room.bounds.minZ + INNER
  const maxZ = room.bounds.maxZ - INNER
  const sx = Math.sin(yaw)
  const cz = Math.cos(yaw)
  let maxD = 12
  if (sx > 1e-4) maxD = Math.min(maxD, (px - minX) / sx)
  else if (sx < -1e-4) maxD = Math.min(maxD, (px - maxX) / sx)
  if (cz > 1e-4) maxD = Math.min(maxD, (pz - minZ) / cz)
  else if (cz < -1e-4) maxD = Math.min(maxD, (pz - maxZ) / cz)
  return Math.max(ZOOM_MIN, maxD)
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
  const phone = distOverride !== undefined
  const wanted = distOverride ?? clamp(span * 0.28, 1.55, 2.5)
  const dist = phone
    ? clamp(wanted, ZOOM_MIN, Math.min(phoneZoomMax(room), maxDistInside(px, pz, yaw, room)))
    : wanted
  const sx = Math.sin(yaw)
  const cz = Math.cos(yaw)
  const inner = phone ? INNER : 0.55
  const yMax = room.id === 'passage' ? 2.95 : room.size.height - 0.4
  const y = phone
    ? clamp(1.48 + pitch * 0.34 + dist * 0.1, 1.38, yMax)
    : clamp(1.52 + pitch * 0.34 + dist * 0.08, 1.28, room.size.height - 0.38)
  const lookLift = phone ? clamp(0.92 + pitch * 0.7, 0.4, 2.1) : clamp(1.05 + pitch * 0.9, 0.42, 2.18)
  const lookFwd = phone ? 0.12 : 0.85
  return {
    position: [
      clamp(px - sx * dist, room.bounds.minX + inner, room.bounds.maxX - inner),
      y,
      clamp(pz - cz * dist, room.bounds.minZ + inner, room.bounds.maxZ - inner),
    ],
    lookAt: [
      px + sx * lookFwd,
      lookLift,
      pz + cz * lookFwd,
    ],
    fov: phone ? clamp(52 + dist * 0.7, 50, 58) : clamp(58 - dist * 2.4, 42, 56),
    damp: 3.4,
  }
}
