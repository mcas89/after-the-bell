import type { RoomId } from './rooms'

export type CameraMode = 'explore' | 'focus' | 'cutscene' | 'firstPerson' | 'examine'

export type CameraOverride = {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  roll?: number
  damp?: number
  snap?: boolean
}

export type CameraShot = {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  follow: { x: number; y: number; z: number }
  lookFollow: number
  margin: { x: number; y: number; z: number }
  zoomByDepth: number
  damp: number
}

const CLASSROOM_SHOT: CameraShot = {
  position: [0.22, 2.38, 3.12],
  lookAt: [0, 0.82, 0.08],
  fov: 51,
  follow: { x: 0.52, y: 0.04, z: 0.16 },
  lookFollow: 0.52,
  margin: { x: 3.05, y: 0.1, z: 0.72 },
  zoomByDepth: 0.035,
  damp: 2.2,
}

export const ROOM_SHOTS: Record<RoomId, CameraShot> = {
  classroom1: CLASSROOM_SHOT,
  classroom2: {
    ...CLASSROOM_SHOT,
    position: [-0.8, 2.7, 3.4],
  },
  hallway: {
    position: [0.06, 1.68, 0.82],
    lookAt: [0.02, 1.22, 16.4],
    fov: 40,
    follow: { x: 0.08, y: 0.04, z: 0.22 },
    lookFollow: 0.45,
    margin: { x: 0.8, y: 0.16, z: 2.2 },
    zoomByDepth: 0.01,
    damp: 2.15,
  },
  room11: {
    ...CLASSROOM_SHOT,
    position: [0.15, 2.32, 2.85],
  },
  room12: CLASSROOM_SHOT,
  room14: CLASSROOM_SHOT,
  room201: {
    ...CLASSROOM_SHOT,
    position: [0.15, 2.32, 2.85],
  },
  room202: {
    ...CLASSROOM_SHOT,
    position: [-0.2, 2.32, 2.85],
  },
  library: {
    ...CLASSROOM_SHOT,
    position: [0.35, 2.28, 3.05],
    fov: 48,
  },
  bathroom: {
    position: [0.72, 1.92, 2.35],
    lookAt: [0, 1.02, 0.05],
    fov: 50,
    follow: { x: 0.28, y: 0.04, z: 0.12 },
    lookFollow: 0.48,
    margin: { x: 1.35, y: 0.14, z: 0.48 },
    zoomByDepth: 0.05,
    damp: 2.3,
  },
  office: {
    position: [2.2, 2.5, 5.8],
    lookAt: [0, 1.1, -0.4],
    fov: 35,
    follow: { x: 0.32, y: 0.06, z: 0.2 },
    lookFollow: 0.3,
    margin: { x: 1.4, y: 0.22, z: 1.0 },
    zoomByDepth: 0.14,
    damp: 2.1,
  },
  teachers: CLASSROOM_SHOT,
  storage: {
    position: [1.4, 2.05, 3.8],
    lookAt: [0, 1.0, -0.6],
    fov: 44,
    follow: { x: 0.22, y: 0.04, z: 0.12 },
    lookFollow: 0.45,
    margin: { x: 0.8, y: 0.15, z: 0.55 },
    zoomByDepth: 0.08,
    damp: 2.6,
  },
  backyard: {
    position: [3.2, 2.8, 8.2],
    lookAt: [0, 1.2, -1.2],
    fov: 38,
    follow: { x: 0.4, y: 0.08, z: 0.24 },
    lookFollow: 0.3,
    margin: { x: 2.6, y: 0.3, z: 1.8 },
    zoomByDepth: 0.2,
    damp: 1.9,
  },
  passage: {
    position: [0.12, 2.42, 1.05],
    lookAt: [0, 0.98, 3.45],
    fov: 48,
    follow: { x: 0.28, y: 0.04, z: 0.18 },
    lookFollow: 0.48,
    margin: { x: 2.85, y: 0.16, z: 2.15 },
    zoomByDepth: 0.03,
    damp: 2.05,
  },
}
