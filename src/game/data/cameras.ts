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
  room12: {
    ...CLASSROOM_SHOT,
    position: [-0.05, 2.32, 2.85],
  },
  room14: {
    ...CLASSROOM_SHOT,
    position: [-0.2, 2.32, 2.85],
  },
  room201: {
    ...CLASSROOM_SHOT,
    position: [0.15, 2.32, 2.85],
  },
  room202: {
    ...CLASSROOM_SHOT,
    position: [-0.2, 2.32, 2.85],
  },
  bathroom: {
    position: [1.8, 2.2, 4.6],
    lookAt: [0, 1.15, 0],
    fov: 42,
    follow: { x: 0.3, y: 0.05, z: 0.18 },
    lookFollow: 0.4,
    margin: { x: 1.1, y: 0.2, z: 0.8 },
    zoomByDepth: 0.1,
    damp: 2.4,
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
  teachers: {
    position: [-2.1, 2.45, 5.5],
    lookAt: [0.2, 1.1, -0.2],
    fov: 37,
    follow: { x: 0.34, y: 0.06, z: 0.2 },
    lookFollow: 0.32,
    margin: { x: 1.5, y: 0.22, z: 1.0 },
    zoomByDepth: 0.14,
    damp: 2.1,
  },
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
}
