import { HALL, HALL_PROPS } from '../hallway/hallwayLayout'

export type HallwayShot = {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  damp: number
}

function smoothstep(x: number, min: number, max: number) {
  if (max <= min) return x >= max ? 1 : 0
  const t = Math.min(1, Math.max(0, (x - min) / (max - min)))
  return t * t * (3 - 2 * t)
}

function band(z: number, from: number, to: number, fade: number) {
  return smoothstep(z, from, from + fade) * (1 - smoothstep(z, to - fade, to))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

const INNER = 0.62

function keepInside(position: [number, number, number]): [number, number, number] {
  return [
    clamp(position[0], -HALL.halfX + INNER, HALL.halfX - INNER),
    clamp(position[1], 1.35, HALL.height - 0.42),
    clamp(position[2], HALL.minZ + INNER, HALL.maxZ - INNER),
  ]
}

type Pose = { position: [number, number, number]; lookAt: [number, number, number] }

function mixPose(a: Pose, b: Pose, t: number): Pose {
  return {
    position: keepInside([
      lerp(a.position[0], b.position[0], t),
      lerp(a.position[1], b.position[1], t),
      lerp(a.position[2], b.position[2], t),
    ]),
    lookAt: [
      lerp(a.lookAt[0], b.lookAt[0], t),
      lerp(a.lookAt[1], b.lookAt[1], t),
      lerp(a.lookAt[2], b.lookAt[2], t),
    ],
  }
}

type Zone = {
  id: 'windowEnd' | 'longHallway' | 'classroomDoors' | 'darkEnd'
  weight: (z: number) => number
  fov: number
  damp: number
  pose: (z: number, lookAhead: number, side: number) => Pose
}

function sideCamX(side: number) {
  return lerp(HALL.halfX - 1.2, -HALL.halfX + 1.2, (side + 1) / 2)
}

function sideLookX(side: number) {
  return lerp(-0.58, 0.58, (side + 1) / 2)
}

const ZONES: Zone[] = [
  {
    id: 'windowEnd',
    weight: (z) => band(z, HALL.minZ - 0.4, 1.7, 0.8),
    fov: 48,
    damp: 2.25,
    pose: (z, lookAhead, side) => {
      const back = z - lookAhead * 0.35
      return {
        position: keepInside([sideLookX(side) * 0.45, 1.9, Math.max(back, z + 2.1, 3.1)]),
        lookAt: [0.04, 1.4, HALL_PROPS.windowZ],
      }
    },
  },
  {
    id: 'longHallway',
    weight: (z) => band(z, 0.15, 5.85, 1.15),
    fov: 40,
    damp: 2.2,
    pose: (z, lookAhead, side) => {
      const forward = smoothstep(lookAhead, -1.15, 1.15)
      const establish: Pose = {
        position: keepInside([0.06, 1.68, 0.82]),
        lookAt: [0.02, 1.22, 16.4],
      }
      const returning: Pose = {
        position: keepInside([sideCamX(side), 1.72, z + 2.45]),
        lookAt: [sideLookX(side), 1.24, z - 4.5],
      }
      return mixPose(returning, establish, forward)
    },
  },
  {
    id: 'classroomDoors',
    weight: (z) => band(z, 4.15, 17.65, 1.2),
    fov: 44,
    damp: 2.15,
    pose: (z, lookAhead, side) => {
      const ahead = clamp(lookAhead, -1.85, 1.85)
      return {
        position: keepInside([sideCamX(side), 1.86, z - ahead * 0.95]),
        lookAt: [sideLookX(side), 1.16, z + ahead * 0.82],
      }
    },
  },
  {
    id: 'darkEnd',
    weight: (z) => band(z, 16.5, HALL.maxZ + 1.2, 1.15),
    fov: 40,
    damp: 2.2,
    pose: (z, lookAhead, side) => {
      const ahead = clamp(lookAhead, -1.4, 1.6)
      return {
        position: keepInside([sideCamX(side) * 0.35, 1.58, z - Math.max(1.35, ahead * 0.85)]),
        lookAt: [sideLookX(side) * 0.4, 1.2, z + clamp(ahead * 0.45, 0.4, 1.2)],
      }
    },
  },
]

export function blendHallwayCamera(z: number, lookAhead: number, side = 0): HallwayShot {
  let wSum = 0
  const position: [number, number, number] = [0, 0, 0]
  const lookAt: [number, number, number] = [0, 0, 0]
  let fov = 0
  let damp = 0

  for (const zone of ZONES) {
    const w = zone.weight(z)
    if (w <= 0.001) continue
    const pose = zone.pose(z, lookAhead, side)
    wSum += w
    position[0] += pose.position[0] * w
    position[1] += pose.position[1] * w
    position[2] += pose.position[2] * w
    lookAt[0] += pose.lookAt[0] * w
    lookAt[1] += pose.lookAt[1] * w
    lookAt[2] += pose.lookAt[2] * w
    fov += zone.fov * w
    damp += zone.damp * w
  }

  if (wSum <= 0.001) {
    const fallback = ZONES[1].pose(z, lookAhead, side)
    return { position: fallback.position, lookAt: fallback.lookAt, fov: 40, damp: 2.2 }
  }

  return {
    position: keepInside([position[0] / wSum, position[1] / wSum, position[2] / wSum]),
    lookAt: [lookAt[0] / wSum, lookAt[1] / wSum, lookAt[2] / wSum],
    fov: fov / wSum,
    damp: damp / wSum,
  }
}

export function silhouetteLongShot(playerZ: number, girlZ: number, fov = 24): HallwayShot {
  const gz = girlZ > 8 ? girlZ : HALL_PROPS.girlStand
  const camZ = clamp(playerZ - 0.62, HALL.minZ + 0.42, gz - 7.6)
  return {
    position: [0.02, 1.14, camZ],
    lookAt: [0.05, 1.3, gz],
    fov,
    damp: 7.2,
  }
}

export function frameLivia(
  shot: HallwayShot,
  px: number,
  pz: number,
  side: number,
): HallwayShot {
  const chestY = 0.94
  const lookAt: [number, number, number] = [
    lerp(shot.lookAt[0], px, 0.64),
    lerp(shot.lookAt[1], chestY, 0.48),
    lerp(shot.lookAt[2], pz, 0.64),
  ]

  let cx = shot.position[0]
  let cy = shot.position[1]
  let cz = shot.position[2]
  const MIN = 2.2
  const MAX = 3.45

  const separate = () => {
    let dx = px - cx
    let dz = pz - cz
    let dist = Math.hypot(dx, dz)
    if (dist < 0.25) {
      cx = px - Math.sign(side || -1) * 1.4
      cz = pz + 2.05
      dx = px - cx
      dz = pz - cz
      dist = Math.hypot(dx, dz)
    }
    if (dist < MIN) {
      const s = MIN / dist
      cx = px - dx * s
      cz = pz - dz * s
    } else if (dist > MAX) {
      const s = MAX / dist
      cx = px - dx * s
      cz = pz - dz * s
    }
  }

  separate()

  const fx = lookAt[0] - cx
  const fz = lookAt[2] - cz
  const fl = Math.hypot(fx, fz) || 1
  const along = ((px - cx) * fx + (pz - cz) * fz) / fl
  if (along < 1.05) {
    const sideOff = lerp(1.42, -1.42, (side + 1) / 2)
    cx = px + sideOff
    cz = pz - Math.sign(fz || 1) * 1.85
    lookAt[0] = px
    lookAt[2] = pz + Math.sign(fz || 1) * 0.28
    separate()
  }

  cy = clamp(lerp(cy, 1.58, 0.4), 1.48, 1.88)

  return {
    ...shot,
    position: keepInside([cx, cy, cz]),
    lookAt,
    fov: clamp(shot.fov + 3, 46, 52),
  }
}
