import type { CameraOverride } from '../data/cameras'

export type EndingSample = CameraOverride & {
  black: number
  blur: number
  clock: number
  subtitle: string | null
  card: number
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
  subtitle: string | null
  card?: number
  damp: number
  snap?: boolean
}

const KEYS: Key[] = [
  {
    t: 0,
    position: [0.04, 1.42, 2.38],
    lookAt: [0.06, 0.42, 1.55],
    fov: 52,
    roll: 0.1,
    black: 1,
    blur: 16,
    clock: 1,
    subtitle: null,
    damp: 8,
    snap: true,
  },
  {
    t: 1.6,
    position: [0.04, 1.42, 2.38],
    lookAt: [0.06, 0.42, 1.55],
    fov: 52,
    roll: 0.1,
    black: 1,
    blur: 16,
    clock: 1,
    subtitle: null,
    damp: 8,
    snap: true,
  },
  {
    t: 2.4,
    position: [0.05, 1.18, 2.12],
    lookAt: [0.08, 0.22, 1.28],
    fov: 50,
    roll: 0.08,
    black: 0.55,
    blur: 10,
    clock: 0.2,
    subtitle: null,
    damp: 1.7,
  },
  {
    t: 3.1,
    position: [0.05, 0.92, 1.88],
    lookAt: [0.1, 0.12, 1.05],
    fov: 49,
    roll: 0.06,
    black: 1,
    blur: 8,
    clock: 0,
    subtitle: null,
    damp: 8,
  },
  {
    t: 3.8,
    position: [0.04, 0.28, 1.55],
    lookAt: [0.12, 0.04, 0.72],
    fov: 48,
    roll: 0.05,
    black: 0.12,
    blur: 3.5,
    subtitle: null,
    damp: 1.6,
  },
  {
    t: 5.4,
    position: [0.04, 0.22, 1.48],
    lookAt: [0.18, 0.06, 0.42],
    fov: 47,
    roll: 0.04,
    black: 0.08,
    blur: 1.2,
    subtitle: null,
    damp: 1.5,
  },
  {
    t: 6.0,
    position: [0.04, 0.22, 1.48],
    lookAt: [0.18, 0.06, 0.42],
    fov: 47,
    roll: 0.04,
    black: 0.92,
    blur: 0.8,
    subtitle: null,
    damp: 8,
  },
  {
    t: 6.8,
    position: [0.05, 0.32, 1.35],
    lookAt: [0.16, 0.18, -0.85],
    fov: 46,
    roll: 0.02,
    black: 0.06,
    blur: 0.3,
    subtitle: null,
    damp: 1.55,
  },
  {
    t: 8.6,
    position: [0.06, 0.58, 1.12],
    lookAt: [0.18, 0.22, -3.4],
    fov: 46,
    roll: 0,
    black: 0.04,
    blur: 0,
    subtitle: 'Marina.',
    damp: 1.45,
  },
  {
    t: 11.4,
    position: [0.08, 0.62, 0.72],
    lookAt: [0.18, 0.16, -3.5],
    fov: 44,
    roll: -0.02,
    black: 0.05,
    blur: 8,
    subtitle: 'Não.',
    damp: 1.5,
  },
  {
    t: 12.2,
    position: [0.08, 0.62, 0.72],
    lookAt: [0.18, 0.16, -3.5],
    fov: 44,
    roll: -0.02,
    black: 0.78,
    blur: 3,
    subtitle: 'Não.',
    damp: 8,
  },
  {
    t: 13.2,
    position: [0.1, 0.52, 0.28],
    lookAt: [0.18, 0.12, -3.55],
    fov: 43,
    roll: 0.03,
    black: 0.06,
    blur: 0,
    subtitle: 'Levanta.',
    damp: 1.55,
  },
  {
    t: 14.8,
    position: [0.11, 0.5, 0.05],
    lookAt: [0.18, 0.11, -3.55],
    fov: 42.5,
    roll: 0.04,
    black: 0.14,
    blur: 9,
    subtitle: 'Por favor.',
    damp: 1.5,
  },
  {
    t: 16.4,
    position: [0.12, 0.48, -0.22],
    lookAt: [0.18, 0.1, -3.55],
    fov: 42,
    roll: 0.02,
    black: 0.05,
    blur: 0,
    subtitle: 'Eu te fiz ficar.',
    damp: 1.4,
  },
  {
    t: 20.2,
    position: [0.14, 0.46, -0.72],
    lookAt: [0.18, 0.08, -3.55],
    fov: 41,
    roll: 0,
    black: 0.08,
    blur: 0,
    subtitle: 'A gente ia embora.',
    damp: 1.45,
  },
  {
    t: 24.2,
    position: [0.15, 0.42, -1.18],
    lookAt: [0.18, 0.08, -3.55],
    fov: 40,
    roll: -0.03,
    black: 0.06,
    blur: 8,
    subtitle: 'Foi culpa minha.',
    damp: 1.5,
  },
  {
    t: 28.4,
    position: [0.16, 0.4, -1.55],
    lookAt: [0.18, 0.1, -3.52],
    fov: 39,
    roll: 0.02,
    black: 0.12,
    blur: 0.4,
    subtitle: 'Marina.',
    damp: 1.55,
  },
  {
    t: 32.6,
    position: [0.16, 0.38, -1.82],
    lookAt: [0.18, 0.12, -3.5],
    fov: 38,
    roll: 0,
    black: 0.18,
    blur: 7,
    subtitle: 'Eu não sei o que fazer.',
    damp: 1.6,
  },
  {
    t: 37.4,
    position: [0.16, 0.36, -1.95],
    lookAt: [0.18, 0.1, -3.48],
    fov: 38,
    roll: 0,
    black: 0.35,
    blur: 1.5,
    subtitle: 'Eu não sei o que fazer.',
    damp: 1.7,
  },
  {
    t: 41.2,
    position: [0.16, 0.34, -1.95],
    lookAt: [0.18, 0.08, -3.48],
    fov: 37,
    roll: 0,
    black: 1,
    blur: 2,
    subtitle: null,
    damp: 2.4,
  },
  {
    t: 43.4,
    position: [0.16, 0.34, -1.95],
    lookAt: [0.18, 0.08, -3.48],
    fov: 37,
    roll: 0,
    black: 1,
    blur: 0,
    subtitle: null,
    card: 1,
    damp: 8,
    snap: true,
  },
  {
    t: 52,
    position: [0.16, 0.34, -1.95],
    lookAt: [0.18, 0.08, -3.48],
    fov: 37,
    roll: 0,
    black: 1,
    blur: 0,
    subtitle: null,
    card: 1,
    damp: 8,
    snap: true,
  },
]

export const ENDING_END = 52.4
export const ENDING_INPUT = 45.2

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function ease(t: number) {
  return t * t * (3 - 2 * t)
}

function lerpVec(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

export function sampleEnding(time: number): EndingSample {
  if (time <= KEYS[0].t) {
    const k = KEYS[0]
    return { ...k, clock: k.clock ?? 0, card: k.card ?? 0 }
  }
  const last = KEYS[KEYS.length - 1]
  if (time >= last.t) {
    return { ...last, snap: false, clock: last.clock ?? 0, card: last.card ?? 1 }
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
    snap: Boolean(a.snap && time < 2.2),
    black: lerp(a.black, b.black, u),
    blur: lerp(a.blur, b.blur, u),
    clock: lerp(a.clock ?? 0, b.clock ?? 0, u),
    subtitle: u > 0.28 ? b.subtitle : a.subtitle,
    card: lerp(a.card ?? 0, b.card ?? 0, u),
  }
}

export const endingView = {
  black: 1,
  blur: 16,
  clock: 1,
  subtitle: null as string | null,
  card: 0,
  active: false,
  canSkip: false,
}
