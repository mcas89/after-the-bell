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

export type HallWall = 'west' | 'east'

const FACE_IN = 0.4
const FACE_OUT = 0.26
const WALL_IN = 1.58
const WALL_OUT = 1.9

/** west = lockers, east = doors and murals. Hysteresis via `held`. */
export function hallwayWallSide(
  px: number,
  yaw: number,
  held: HallWall | null,
): HallWall | null {
  const faceX = Math.sin(yaw)
  const distWest = px + HALL.halfX
  const distEast = HALL.halfX - px
  const faceWest = held === 'west' ? faceX < -FACE_OUT : faceX < -FACE_IN
  const faceEast = held === 'east' ? faceX > FACE_OUT : faceX > FACE_IN
  const nearWest = held === 'west' ? distWest < WALL_OUT : distWest < WALL_IN
  const nearEast = held === 'east' ? distEast < WALL_OUT : distEast < WALL_IN
  const west = faceWest && nearWest
  const east = faceEast && nearEast
  if (west && east) return distWest <= distEast ? 'west' : 'east'
  if (west) return 'west'
  if (east) return 'east'
  return null
}

/** Camera behind Lívia, looking at the wall she is facing. */
export function hallwayWallShot(side: HallWall, pz: number, lead: number): HallwayShot {
  const along = clamp(lead, -1, 1)
  const camZ = pz - along * 0.7
  const lookZ = clamp(pz + along * 0.28, HALL.minZ + 0.35, HALL.maxZ - 0.35)
  if (side === 'west') {
    return {
      position: keepInside([1.52, 1.64, camZ]),
      lookAt: [-HALL.halfX + 0.2, 1.16, lookZ],
      fov: 46,
      damp: 2.22,
    }
  }
  return {
    position: keepInside([-1.48, 1.64, camZ]),
    lookAt: [HALL.halfX - 0.2, 1.2, lookZ],
    fov: 46,
    damp: 2.22,
  }
}

export function mixHallwayShot(from: HallwayShot, to: HallwayShot, t: number): HallwayShot {
  const k = clamp(t, 0, 1)
  return {
    position: [
      from.position[0] + (to.position[0] - from.position[0]) * k,
      from.position[1] + (to.position[1] - from.position[1]) * k,
      from.position[2] + (to.position[2] - from.position[2]) * k,
    ],
    lookAt: [
      from.lookAt[0] + (to.lookAt[0] - from.lookAt[0]) * k,
      from.lookAt[1] + (to.lookAt[1] - from.lookAt[1]) * k,
      from.lookAt[2] + (to.lookAt[2] - from.lookAt[2]) * k,
    ],
    fov: from.fov + (to.fov - from.fov) * k,
    damp: from.damp + (to.damp - from.damp) * k,
  }
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
  const camZ = clamp(playerZ - 0.62, HALL.minZ + 0.42, gz - 7.6)
  return {
    position: [0.02, 1.14, camZ],
    lookAt: [0.05, 1.3, gz],
    fov,
    damp: 3.4,
  }
}
