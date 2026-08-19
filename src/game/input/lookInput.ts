import { playerMotion } from '../player/playerMotion'

export const PITCH_MIN = -0.28
export const PITCH_MAX = 0.52

export const lookInput = {
  yaw: 0,
  pitch: 0.08,
  dragging: false,
  consumed: false,
  ready: false,
  pointerId: null as number | null,
  lastX: 0,
  lastY: 0,
  startX: 0,
  startY: 0,
}

export function resetLook() {
  lookInput.dragging = false
  lookInput.consumed = false
  lookInput.ready = false
  lookInput.pointerId = null
}

export function ensureLookReady() {
  if (lookInput.ready) return
  lookInput.yaw = playerMotion.yaw
  lookInput.pitch = 0.08
  lookInput.ready = true
}

export function applyLookDelta(dx: number, dy: number, yawSens = 0.0052, pitchSens = 0.0034) {
  lookInput.yaw -= dx * yawSens
  lookInput.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, lookInput.pitch + dy * pitchSens))
  lookInput.ready = true
}
