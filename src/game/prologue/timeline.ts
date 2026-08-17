import { ROOM_SHOTS } from '../data/cameras'
import type { CameraOverride } from '../data/cameras'

export type PrologueSample = CameraOverride & {
  black: number
  blur: number
  clock: number
  liviaVisible: boolean
  subtitle: string | null
}

type Key = {
  t: number
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  roll: number
  black: number
  blur: number
  clock?: number
  liviaVisible: boolean
  subtitle: string | null
  damp: number
  snap?: boolean
}

const shot = ROOM_SHOTS.classroom1

const KEYS: Key[] = [
  {
    t: 0,
    position: [0.1, 0.14, 1.38],
    lookAt: [0.42, 0.05, 0.55],
    fov: 52,
    roll: 0.12,
    black: 1,
    blur: 14,
    clock: 1,
    liviaVisible: false,
    subtitle: null,
    damp: 8,
    snap: true,
  },
  {
    t: 0.7,
    position: [0.1, 0.14, 1.38],
    lookAt: [0.42, 0.05, 0.55],
    fov: 52,
    roll: 0.12,
    black: 1,
    blur: 14,
    clock: 1,
    liviaVisible: false,
    subtitle: null,
    damp: 8,
    snap: true,
  },
  {
    t: 1.3,
    position: [0.1, 0.14, 1.38],
    lookAt: [0.42, 0.05, 0.55],
    fov: 52,
    roll: 0.12,
    black: 1,
    blur: 14,
    clock: 0,
    liviaVisible: false,
    subtitle: null,
    damp: 8,
    snap: true,
  },
  {
    t: 2.2,
    position: [0.12, 0.15, 1.36],
    lookAt: [0.48, 0.06, 0.48],
    fov: 50,
    roll: 0.1,
    black: 0.5,
    blur: 11,
    clock: 0,
    liviaVisible: false,
    subtitle: null,
    damp: 1.6,
  },
  {
    t: 4.0,
    position: [0.14, 0.16, 1.34],
    lookAt: [0.5, 0.08, 0.4],
    fov: 48,
    roll: 0.08,
    black: 0.12,
    blur: 8,
    clock: 0,
    liviaVisible: false,
    subtitle: null,
    damp: 1.4,
  },
  {
    t: 4.7,
    position: [0.14, 0.16, 1.34],
    lookAt: [0.5, 0.08, 0.4],
    fov: 48,
    roll: 0.08,
    black: 1,
    blur: 6,
    clock: 0,
    liviaVisible: false,
    subtitle: null,
    damp: 8,
  },
  {
    t: 5.3,
    position: [0.14, 0.17, 1.32],
    lookAt: [0.46, 0.1, 0.28],
    fov: 47,
    roll: 0.05,
    black: 0.08,
    blur: 5,
    clock: 0,
    liviaVisible: false,
    subtitle: null,
    damp: 1.8,
  },
  {
    t: 11.2,
    position: [0.13, 0.18, 1.3],
    lookAt: [0.2, 0.12, 0.15],
    fov: 46,
    roll: 0.04,
    black: 0.06,
    blur: 3.2,
    liviaVisible: false,
    subtitle: null,
    damp: 1.5,
  },
  {
    t: 12.0,
    position: [0.13, 0.18, 1.3],
    lookAt: [0.2, 0.12, 0.15],
    fov: 46,
    roll: 0.04,
    black: 0.92,
    blur: 2.4,
    liviaVisible: false,
    subtitle: null,
    damp: 8,
  },
  {
    t: 12.8,
    position: [0.12, 0.2, 1.28],
    lookAt: [-0.15, 0.22, 0.7],
    fov: 45,
    roll: 0.02,
    black: 0.05,
    blur: 1.6,
    liviaVisible: false,
    subtitle: null,
    damp: 1.7,
  },
  {
    t: 15.2,
    position: [0.12, 0.22, 1.28],
    lookAt: [-1.15, 0.28, 1.05],
    fov: 46,
    roll: -0.03,
    black: 0.04,
    blur: 1.1,
    liviaVisible: false,
    subtitle: null,
    damp: 1.35,
  },
  {
    t: 17.6,
    position: [0.14, 0.24, 1.3],
    lookAt: [1.35, 0.32, 0.85],
    fov: 46,
    roll: 0.04,
    black: 0.04,
    blur: 0.8,
    liviaVisible: false,
    subtitle: null,
    damp: 1.35,
  },
  {
    t: 19.8,
    position: [0.12, 0.28, 1.32],
    lookAt: [0.1, 2.05, 1.15],
    fov: 48,
    roll: 0,
    black: 0.03,
    blur: 0.5,
    liviaVisible: false,
    subtitle: null,
    damp: 1.4,
  },
  {
    t: 22.2,
    position: [0.1, 0.32, 1.3],
    lookAt: [0.05, 0.55, -0.85],
    fov: 47,
    roll: 0,
    black: 0.02,
    blur: 0.2,
    liviaVisible: false,
    subtitle: 'Onde eu estou?',
    damp: 1.5,
  },
  {
    t: 25.4,
    position: [0.18, 0.72, 1.48],
    lookAt: [0.02, 0.7, -0.4],
    fov: 50,
    roll: 0,
    black: 0,
    blur: 0,
    liviaVisible: false,
    subtitle: 'Onde eu estou?',
    damp: 1.55,
  },
  {
    t: 27.2,
    position: [0.28, 1.35, 1.95],
    lookAt: [0, 0.85, 0.4],
    fov: 52,
    roll: 0,
    black: 0,
    blur: 0,
    liviaVisible: false,
    subtitle: 'Onde eu estou?',
    damp: 1.7,
  },
  {
    t: 30.2,
    position: [0.32, 2.15, 2.55],
    lookAt: [0, 0.78, 0.2],
    fov: 54,
    roll: 0,
    black: 0,
    blur: 0,
    liviaVisible: false,
    subtitle: null,
    damp: 1.9,
  },
  {
    t: 33.4,
    position: [...shot.position],
    lookAt: [...shot.lookAt],
    fov: shot.fov,
    roll: 0,
    black: 0,
    blur: 0,
    liviaVisible: false,
    subtitle: null,
    damp: 2.2,
  },
  {
    t: 34.1,
    position: [...shot.position],
    lookAt: [...shot.lookAt],
    fov: shot.fov,
    roll: 0,
    black: 0,
    blur: 0,
    liviaVisible: true,
    subtitle: null,
    damp: 3.2,
  },
  {
    t: 36.0,
    position: [...shot.position],
    lookAt: [...shot.lookAt],
    fov: shot.fov,
    roll: 0,
    black: 0,
    blur: 0,
    liviaVisible: true,
    subtitle: null,
    damp: 2.4,
  },
]

export const PROLOGUE_END = 36.4

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function ease(t: number) {
  return t * t * (3 - 2 * t)
}

function lerpVec(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

export function samplePrologue(time: number): PrologueSample {
  if (time <= KEYS[0].t) {
    const k = KEYS[0]
    return { ...k, clock: k.clock ?? 0 }
  }
  const last = KEYS[KEYS.length - 1]
  if (time >= last.t) {
    return { ...last, snap: false, clock: last.clock ?? 0 }
  }

  let i = 0
  while (i < KEYS.length - 1 && time > KEYS[i + 1].t) i += 1
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const u = ease((time - a.t) / Math.max(0.0001, b.t - a.t))

  return {
    position: lerpVec(a.position, b.position, u),
    lookAt: lerpVec(a.lookAt, b.lookAt, u),
    fov: lerp(a.fov, b.fov, u),
    roll: lerp(a.roll, b.roll, u),
    damp: lerp(a.damp, b.damp, u),
    snap: Boolean(a.snap && time < 2.4),
    black: lerp(a.black, b.black, u),
    blur: lerp(a.blur, b.blur, u),
    clock: lerp(a.clock ?? 0, b.clock ?? 0, u),
    liviaVisible: u > 0.5 ? b.liviaVisible : a.liviaVisible,
    subtitle: u > 0.35 ? b.subtitle : a.subtitle,
  }
}

export const prologueView = {
  black: 1,
  blur: 14,
  clock: 1,
  subtitle: null as string | null,
  active: true,
}

export const liveOverride: { current: CameraOverride | null } = { current: null }
