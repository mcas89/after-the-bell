import { HALL, HALL_PROPS } from '../hallway/hallwayLayout'

export type HallwayShot = {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  damp: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const INNER = 0.62
const CAM_Y = 1.72
const LOOK_Y = 1.08
const BACK = 1.9
const AHEAD = 2.25
const WINDOW_X = -1.28

function keepInside(position: [number, number, number]): [number, number, number] {
  return [
    clamp(position[0], -HALL.halfX + INNER, HALL.halfX - INNER),
    clamp(position[1], 1.48, HALL.height - 0.42),
    clamp(position[2], HALL.minZ + INNER, HALL.maxZ - INNER),
  ]
}

/** +1 toward the dark end, -1 toward the patio. X stays on the window wall. */
export function hallwayLookAhead(px: number, pz: number, lead: number): HallwayShot {
  const along = clamp(lead, -1, 1)
  const camX = clamp(WINDOW_X + px * 0.16, -HALL.halfX + INNER, -0.55)
  const camZ = pz - along * BACK
  const lookX = px * 0.38
  const lookZ = pz + along * AHEAD

  return {
    position: keepInside([camX, CAM_Y, camZ]),
    lookAt: [lookX, LOOK_Y, clamp(lookZ, HALL.minZ + 0.35, HALL.maxZ - 0.35)],
    fov: 48,
    damp: 2.15,
  }
}

export function silhouetteLongShot(playerZ: number, girlZ: number, fov = 24): HallwayShot {
  const gz = girlZ > 8 ? girlZ : HALL_PROPS.girlStand
  const camZ = clamp(Math.max(playerZ - 0.4, gz - 6.2), HALL.minZ + 0.42, gz - 4.6)
  return {
    position: [0.02, 1.22, camZ],
    lookAt: [0.05, 1.18, gz],
    fov,
    damp: 7.2,
  }
}
