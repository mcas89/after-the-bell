import type { Aabb } from '../data/furniture'
import { getActiveColliders } from '../rooms/roomColliders'

export const PLAYER_RADIUS = 0.34

function overlaps(x: number, z: number, radius: number, box: Aabb) {
  const nearestX = Math.min(box.maxX, Math.max(box.minX, x))
  const nearestZ = Math.min(box.maxZ, Math.max(box.minZ, z))
  const dx = x - nearestX
  const dz = z - nearestZ
  return dx * dx + dz * dz < radius * radius
}

function blocked(x: number, z: number, boxes: Aabb[]) {
  return boxes.some((box) => overlaps(x, z, PLAYER_RADIUS, box))
}

function pushOut(x: number, z: number, box: Aabb) {
  const nearestX = Math.min(box.maxX, Math.max(box.minX, x))
  const nearestZ = Math.min(box.maxZ, Math.max(box.minZ, z))
  let dx = x - nearestX
  let dz = z - nearestZ
  const distSq = dx * dx + dz * dz

  if (distSq >= PLAYER_RADIUS * PLAYER_RADIUS) return { x, z }

  if (distSq < 1e-8) {
    const left = x - box.minX + PLAYER_RADIUS
    const right = box.maxX - x + PLAYER_RADIUS
    const up = z - box.minZ + PLAYER_RADIUS
    const down = box.maxZ - z + PLAYER_RADIUS
    const min = Math.min(left, right, up, down)
    if (min === left) return { x: box.minX - PLAYER_RADIUS, z }
    if (min === right) return { x: box.maxX + PLAYER_RADIUS, z }
    if (min === up) return { x, z: box.minZ - PLAYER_RADIUS }
    return { x, z: box.maxZ + PLAYER_RADIUS }
  }

  const dist = Math.sqrt(distSq)
  const pent = PLAYER_RADIUS - dist
  return { x: x + (dx / dist) * pent, z: z + (dz / dist) * pent }
}

export function moveWithCollision(
  x: number,
  z: number,
  dx: number,
  dz: number,
) {
  const boxes = getActiveColliders()
  let nx = x + dx
  let nz = z

  if (blocked(nx, nz, boxes)) nx = x
  nz = z + dz
  if (blocked(nx, nz, boxes)) nz = z

  for (const box of boxes) {
    const next = pushOut(nx, nz, box)
    nx = next.x
    nz = next.z
  }

  return { x: nx, z: nz }
}
