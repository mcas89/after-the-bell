import { playerMotion } from '../player/playerMotion'

export const PITCH_MIN = -0.28
export const PITCH_MAX = 0.52
export const ZOOM_MIN = 1.38
export const ZOOM_MAX = 4.4
export const ZOOM_DEFAULT = 2.42

export const lookInput = {
  yaw: 0,
  pitch: 0.08,
  zoom: ZOOM_DEFAULT,
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

export function applyZoom(delta: number) {
  lookInput.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, lookInput.zoom + delta))
}

export function setZoom(value: number) {
  lookInput.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value))
}
